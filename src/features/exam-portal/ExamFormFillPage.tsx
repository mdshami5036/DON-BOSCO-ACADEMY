import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink, Student, ExamApplication } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { FileText, Search, Send, CheckCircle2, User, Phone, MapPin, Calendar, Clock, AlertTriangle, Lock, Sparkles, ShieldCheck } from 'lucide-react';

export const ExamFormFillPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [link, setLink] = useState<PublishableExamLink | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<ExamApplication | null>(null);
  const [alreadySubmittedApp, setAlreadySubmittedApp] = useState<ExamApplication | null>(null);

  // Dual search mode
  const [searchMode, setSearchMode] = useState<'ADMISSION_NO' | 'ROLL_NO'>('ADMISSION_NO');
  const [admissionQuery, setAdmissionQuery] = useState('');
  const [classQuery, setClassQuery] = useState('Class 10');
  const [rollQuery, setRollQuery] = useState('');
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);
  const [classSubjects, setClassSubjects] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    student_name: '',
    father_name: '',
    mother_name: '',
    dob: '2010-01-01',
    gender: 'Male',
    class_name: 'Class 10',
    section_name: 'A',
    roll_number: '',
    admission_number: '',
    contact_phone: '',
    address: '',
    photo_url: '',
  });

  const classOptions = [
    'Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6',
    'Class 5', 'Class 4', 'Class 3', 'Class 2', 'Class 1',
    'UKG', 'LKG', 'Nursery', 'Play Group'
  ];

  useEffect(() => {
    async function loadLink() {
      if (!slug) return;
      const found = await db.getExamLinkBySlug(slug);
      setLink(found);
    }
    loadLink();
  }, [slug]);

  const isExpired = link ? new Date(link.expiry_date).getTime() < Date.now() : false;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'ADMISSION_NO' && !admissionQuery.trim()) {
      toastError('Please enter Student Admission Number.');
      return;
    }
    if (searchMode === 'ROLL_NO') {
      if (!classQuery) {
        toastError('Please select Class first.');
        return;
      }
      if (!rollQuery.trim()) {
        toastError('Please enter Roll Number.');
        return;
      }
    }

    setIsSearching(true);
    setAlreadySubmittedApp(null);
    try {
      const query = searchMode === 'ADMISSION_NO' ? admissionQuery.trim() : rollQuery.trim();
      const stu = await db.lookupStudentForExamForm(searchMode, query, classQuery);

      if (stu) {
        setMatchedStudent(stu);
        setFormData({
          student_name: `${stu.first_name} ${stu.last_name}`,
          father_name: stu.father_name || '',
          mother_name: stu.mother_name || '',
          dob: stu.date_of_birth || '2010-01-01',
          gender: stu.gender || 'Male',
          class_name: stu.class_name || classQuery || 'Class 10',
          section_name: stu.section_name || 'A',
          roll_number: stu.roll_number || rollQuery,
          admission_number: stu.admission_number || admissionQuery,
          contact_phone: (stu as any).emergency_contact || (stu as any).parent_phone || '+91 98765 43210',
          address: stu.address || 'Raipur Bazar, Sitamarhi',
          photo_url: stu.photo_url || '',
        });

        // Dynamically resolve subjects for this student's class
        const stuClass = stu.class_name || classQuery || 'Class 10';
        const allClasses = await db.getClasses('sch-don-bosco');
        const matchedClassObj = allClasses.find((c) => c.name.toLowerCase() === stuClass.toLowerCase());
        if (matchedClassObj && matchedClassObj.assigned_subjects && matchedClassObj.assigned_subjects.length > 0) {
          setClassSubjects(matchedClassObj.assigned_subjects.map((s) => s.subject_name));
        }

        if (link) {
          const already = await db.checkStudentAlreadySubmitted(link.id, stu.admission_number || stu.id);
          if (already) {
            setAlreadySubmittedApp(already);
          }
        }
        success('Student profile auto-loaded successfully!');
      } else {
        toastError(
          searchMode === 'ADMISSION_NO'
            ? 'No registered student found with Admission No: ' + admissionQuery
            : 'No student found in ' + classQuery + ' with Roll No: ' + rollQuery
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  // When class name changes in form, update subjects list
  const handleFormClassChange = async (newClassName: string) => {
    setFormData((prev) => ({ ...prev, class_name: newClassName }));
    const allClasses = await db.getClasses('sch-don-bosco');
    const matched = allClasses.find((c) => c.name.toLowerCase() === newClassName.toLowerCase());
    if (matched && matched.assigned_subjects && matched.assigned_subjects.length > 0) {
      setClassSubjects(matched.assigned_subjects.map((s) => s.subject_name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;
    if (isExpired) {
      toastError('Registration window has expired. Submission rejected.');
      return;
    }
    if (!formData.student_name || !formData.admission_number) {
      toastError('Candidate Name and Admission Number are required.');
      return;
    }

    const existing = await db.checkStudentAlreadySubmitted(link.id, formData.admission_number);
    if (existing) {
      setAlreadySubmittedApp(existing);
      toastError('This student has already submitted their examination form.');
      return;
    }

        setIsSubmitting(true);
    try {
      const app = await db.submitExamApplication({
        link_id: link.id,
        school_id: link.school_id,
        student_id: matchedStudent?.id,
        subjects: classSubjects.length > 0 ? classSubjects : undefined,
        ...formData,
      });
      success('Examination Registration Form submitted successfully! Generating official receipt...');
      setTimeout(() => {
        navigate(`/exam-portal/receipt/${app.application_no}`);
      }, 500);
    } catch (err: any) {
      toastError(err.message || 'Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/exam-portal" className="flex items-center gap-3">
            <img src="/assets/branding/don-bosco-logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white border border-sapphire-700/20 p-0.5" />
            <div>
              <span className="font-display font-black text-sm uppercase text-sapphire-900 block">DON BOSCO ACADEMY</span>
              <span className="text-[10px] text-coral-600 font-bold -mt-0.5 block">Online Examination Registration Form</span>
            </div>
          </Link>
          <Link to="/exam-portal" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">← Portals Hub</Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-sapphire-950 via-[#0F2756] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft-hover border border-sapphire-800 relative overflow-hidden">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">★ Session {link?.academic_year || '2025-2026'}</span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-2 text-white">{link?.title || 'Examination Registration & Admit Card Form'}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">{link?.description || 'Verify and submit candidate particulars for admit card generation.'}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
            <div>Exam: <strong className="text-amber-300">{link?.exam_name}</strong></div>
            <div>•</div>
            <div>Deadline: <strong className="text-white font-mono">{link ? formatDDMMYYYY(link.expiry_date) : ''}</strong></div>
          </div>
        </div>

        {isExpired && (
          <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-soft-card flex items-start gap-3">
            <Lock className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-black font-display text-rose-950">Registration Window Closed</h3>
              <p className="text-xs text-rose-800 mt-0.5">The deadline for this examination form was <strong>{link ? formatDDMMYYYY(link.expiry_date) : ''}</strong>. Submissions are no longer accepted online. Please visit Don Bosco Academy Administrative Office or contact the Principal.</p>
            </div>
          </div>
        )}

        {/* SUCCESS RECEIPT */}
        {submissionReceipt ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-9 h-9" /></div>
            <h2 className="text-2xl font-black text-slate-900 font-display">✓ Form Submitted Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Aapka Pariksha Form safaltapoorvak jama ho chuka hai. Application Number ko dhyan se note kar lein.</p>
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Application Number:</span><strong className="text-sapphire-900 font-mono text-sm">{submissionReceipt.application_no}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Candidate Name:</span><strong className="text-slate-900">{submissionReceipt.student_name}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Class & Roll:</span><strong className="text-slate-900">{submissionReceipt.class_name} • Roll #{submissionReceipt.roll_number}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Admission No:</span><strong className="text-slate-900 font-mono">{submissionReceipt.admission_number}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Submission Date:</span><strong className="text-slate-900 font-mono">{formatDDMMYYYY(submissionReceipt.submitted_at)}</strong></div>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-semibold max-w-md mx-auto">
              📢 Note: Admit Card School Administration / Principal dwara approve aur release kiye jane ke baad ERP Portal par prapt hoga.
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/exam-portal" className="px-6 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md">← Back to ERP / Exam Portals Hub</Link>
            </div>
          </div>
        ) : (!isExpired && (
          <div className="space-y-6">
            {/* 1-TAP AUTO LOAD CONTAINER WITH DUAL TABS */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sapphire-900">
                  <Sparkles className="w-4 h-4 text-coral-500" /><span>1-Tap Student Auto-Load Particulars</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setSearchMode('ADMISSION_NO'); setAlreadySubmittedApp(null); }}
                    className={'px-3 py-1.5 rounded-lg transition cursor-pointer ' + (searchMode === 'ADMISSION_NO' ? 'bg-white text-sapphire-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800')}
                  >
                    🆔 By Admission No (Direct / Unique)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchMode('ROLL_NO'); setAlreadySubmittedApp(null); }}
                    className={'px-3 py-1.5 rounded-lg transition cursor-pointer ' + (searchMode === 'ROLL_NO' ? 'bg-white text-sapphire-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800')}
                  >
                    📋 By Roll No (Select Class First)
                  </button>
                </div>
              </div>

              <form onSubmit={handleLookup} className="space-y-3">
                {searchMode === 'ADMISSION_NO' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Enter Student Admission Number (Unique across School) *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. DBA-2026-001 or DBA-2026-002..."
                          value={admissionQuery}
                          onChange={(e) => setAdmissionQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 font-semibold"
                        />
                      </div>
                      <button type="submit" disabled={isSearching} className="px-5 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-sm hover:bg-sapphire-800 transition cursor-pointer">
                        {isSearching ? 'Loading...' : 'Fetch Student Data'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Admission Number is unique per student. No class selection required.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Select Class * (Mandatory for Roll No Lookup)</label>
                        <select
                          value={classQuery}
                          onChange={(e) => setClassQuery(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-sapphire-500"
                        >
                          {classOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Enter Student Roll Number *</label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="e.g. 1001, 1002, 1, 2..."
                            value={rollQuery}
                            onChange={(e) => setRollQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={isSearching} className="px-6 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-sm hover:bg-sapphire-800 transition cursor-pointer">
                        {isSearching ? 'Fetching...' : `Fetch Student in ${classQuery}`}
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      ⚠️ Har class me roll number 1 se shuru ho sakta hai, isliye pehle sahi Class chunein phir Roll Number dalein.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* ALREADY SUBMITTED ALERT BANNER (WITH GREEN CHECKMARK) */}
            {alreadySubmittedApp && (
              <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 shadow-soft-card space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-emerald-950 font-display flex items-center gap-2">
                      <span>✓ Already Submitted / फॉर्म पहले ही सफलतापूर्वक सबमिट हो चुका है!</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[10px]">SUBMITTED</span>
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1">
                      Candidate <strong>{alreadySubmittedApp.student_name}</strong> (Adm No: <strong>{alreadySubmittedApp.admission_number}</strong>, {alreadySubmittedApp.class_name} Roll #{alreadySubmittedApp.roll_number}) ka form <strong>{formatDDMMYYYY(alreadySubmittedApp.submitted_at)}</strong> ko successfully jama ho chuka hai.
                    </p>
                    <div className="mt-3 p-3.5 rounded-xl bg-white border border-emerald-200 text-xs space-y-1.5 text-slate-700">
                      <div className="flex justify-between"><span className="text-slate-400">Application Number:</span><strong className="font-mono text-sapphire-900">{alreadySubmittedApp.application_no}</strong></div>
                      <div className="flex justify-between"><span className="text-slate-400">Submission Status:</span><span className="font-bold text-emerald-700">{alreadySubmittedApp.status}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Admit Card Status:</span><span className="font-bold text-amber-700">Pending Admin Approval / Release</span></div>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                      📢 School Administration / Principal dwara approve hone ke baad is session ka Admit Card ERP Portal par live ho jayega.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/exam-portal/receipt/${alreadySubmittedApp.application_no}`}
                        className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white font-extrabold text-xs hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <span>📄 View / Print Official Submission Receipt (A4)</span>
                      </Link>
                      <Link
                        to="/exam-portal"
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                      >
                        Back to Portals
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATION FORM */}
            {!alreadySubmittedApp && (
              <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 font-display">Candidate Examination Particulars</h2>
                  <p className="text-xs text-slate-500">Review auto-filled information before confirming submission.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name of Candidate *</label>
                    <input type="text" required value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admission Number * (Unique)</label>
                    <input type="text" required value={formData.admission_number} onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sapphire-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father's Name *</label>
                    <input type="text" required value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
                    <input type="text" value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Class & Section</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.class_name} onChange={(e) => handleFormClassChange(e.target.value)} className="w-2/3 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900" />
                      <input type="text" value={formData.section_name} onChange={(e) => setFormData({ ...formData, section_name: e.target.value })} className="w-1/3 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-center" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Roll Number *</label>
                    <input type="text" required value={formData.roll_number} onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                    <input type="text" required value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900" />
                  </div>
                </div>

                                {/* Live Class Subjects Strip */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Confirmed Examination Papers for {formData.class_name || 'Selected Class'} ({classSubjects.length > 0 ? classSubjects.length : 4} Subjects):</span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                      Auto-Loaded from Academics
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(classSubjects.length > 0
                      ? classSubjects
                      : ['English (Oral & Rhymes)', 'Hindi (Kavita & Akshar)', 'Mathematics (Numbers & Counting)', 'Drawing, Art & Coloring']
                    ).map((sub, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white text-slate-800 text-xs font-bold rounded-lg border border-indigo-200 shadow-2xs">
                        {idx + 1}. {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to="/exam-portal" className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">Cancel</Link>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-gradient-to-r from-coral-500 to-[#EB3C16] text-white font-extrabold text-xs shadow-md shadow-coral-500/20 hover:shadow-coral-glow transition flex items-center gap-2 cursor-pointer">
                    {isSubmitting ? <span>Submitting...</span> : <><span>Confirm & Submit Exam Form</span><Send className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};