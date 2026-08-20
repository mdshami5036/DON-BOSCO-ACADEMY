import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink, Student } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { BookOpen, Search, CheckCircle2, Lock, Sparkles, Send } from 'lucide-react';

export const ExamFormFillPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { success, error: toastError } = useToast();
  const [link, setLink] = useState<PublishableExamLink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    student_name: '',
    father_name: '',
    mother_name: '',
    dob: '2010-04-15',
    gender: 'Male',
    class_name: 'Class 10',
    section_name: 'A',
    roll_number: '',
    admission_number: '',
    contact_phone: '',
    address: 'Raipur Bazar, Nanpur, Sitamarhi',
    photo_url: '',
  });

  useEffect(() => {
    async function loadLink() {
      if (!slug) return;
      try {
        const found = await db.getExamLinkBySlug(slug);
        setLink(found);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLink();
  }, [slug]);

  const isExpired = link ? new Date(link.expiry_date).getTime() < Date.now() : false;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const stu = await db.lookupStudentForExamForm(searchQuery.trim());
      if (stu) {
        setMatchedStudent(stu);
        setFormData({
          student_name: stu.first_name + ' ' + stu.last_name,
          father_name: stu.father_name || 'Rajesh Singh',
          mother_name: stu.mother_name || 'Sunita Devi',
          dob: stu.date_of_birth || '2010-04-15',
          gender: stu.gender || 'Male',
          class_name: stu.class_name || 'Class 10',
          section_name: stu.section_name || 'A',
          roll_number: stu.roll_number || '1001',
          admission_number: stu.admission_number || searchQuery.toUpperCase(),
          contact_phone: stu.parent_phone || '+91 98765 43210',
          address: stu.address || 'Raipur Bazar, Nanpur, Sitamarhi',
          photo_url: stu.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        });
        success('Student records auto-loaded from Don Bosco Academy register!');
      } else {
        toastError('No registered student record found. Please enter details manually.');
        setFormData((prev) => ({ ...prev, admission_number: searchQuery.toUpperCase() }));
      }
    } finally {
      setIsSearching(false);
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
    setIsSubmitting(true);
    try {
      const app = await db.submitExamApplication({
        link_id: link.id,
        school_id: link.school_id,
        student_id: matchedStudent?.id,
        ...formData,
      });
      setSubmissionReceipt(app);
      success('Examination Registration Form submitted successfully!');
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
        <div className="bg-gradient-to-r from-sapphire-950 via-[#0F2756] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft-hover border border-sapphire-800 relative overflow-hidden">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">★ Session {link?.academic_year || '2025-2026'}</span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-2 text-white">{link?.title || 'Examination Registration & Admit Card Form'}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">{link?.description || 'Verify and submit candidate particulars for admit card generation.'}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
            <div>Exam: <strong className="text-amber-300">{link?.exam_name}</strong></div>
            <div>•</div>
            <div>Deadline: <strong className="text-white font-mono">{link ? new Date(link.expiry_date).toLocaleDateString('en-GB') : ''}</strong></div>
          </div>
        </div>
        {isExpired && (
          <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-soft-card flex items-start gap-3">
            <Lock className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-black font-display text-rose-950">Registration Window Closed</h3>
              <p className="text-xs text-rose-800 mt-0.5">The deadline for this examination form was <strong>{link ? new Date(link.expiry_date).toLocaleDateString('en-GB') : ''}</strong>. Submissions are no longer accepted online. Please visit Don Bosco Academy Administrative Office or contact the Principal.</p>
            </div>
          </div>
        )}
        {submissionReceipt ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-9 h-9" /></div>
            <h2 className="text-2xl font-black text-slate-900 font-display">Form Submitted Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Your candidate registration particulars have been saved. Keep your Application Number for tracking.</p>
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Application Number:</span><strong className="text-sapphire-900 font-mono text-sm">{submissionReceipt.application_no}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Candidate Name:</span><strong className="text-slate-900">{submissionReceipt.student_name}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Class & Roll:</span><strong className="text-slate-900">{submissionReceipt.class_name} • Roll #{submissionReceipt.roll_number}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Admission No:</span><strong className="text-slate-900">{submissionReceipt.admission_number}</strong></div>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/exam-portal" className="px-5 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md">Back to Exam Portals</Link>
            </div>
          </div>
        ) : (!isExpired && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sapphire-900">
                <Sparkles className="w-4 h-4 text-coral-500" /><span>1-Tap Student Auto-Load (Enter Admission / Roll No)</span>
              </div>
              <form onSubmit={handleLookup} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="e.g. DBA-2026-001 or 1001 or Student Name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500" />
                </div>
                <button type="submit" disabled={isSearching} className="px-5 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-sm hover:bg-sapphire-800 transition cursor-pointer">
                  {isSearching ? 'Loading...' : 'Auto-Fill Records'}
                </button>
              </form>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card space-y-6">
              <h3 className="text-base font-black text-slate-900 font-display border-b border-slate-100 pb-3">Candidate & Academic Particulars</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div><label className="block font-bold text-slate-700 mb-1">Student Full Name *</label><input type="text" required value={formData.student_name} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sapphire-500" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Admission Number *</label><input type="text" required value={formData.admission_number} onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sapphire-500" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Father's Name</label><input type="text" value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Mother's Name</label><input type="text" value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Class</label><input type="text" value={formData.class_name} onChange={(e) => setFormData({ ...formData, class_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Roll Number</label><input type="text" value={formData.roll_number} onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label><input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Date of Birth</label><input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900" /></div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">By submitting, you certify all candidate particulars are accurate as per CBSE records.</span>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-gradient-to-r from-coral-500 to-[#EB3C16] text-white font-extrabold text-xs shadow-md shadow-coral-500/20 hover:shadow-coral-glow transition flex items-center gap-1.5 cursor-pointer">
                  <Send className="w-4 h-4" /><span>{isSubmitting ? 'Submitting...' : 'Submit Examination Form'}</span>
                </button>
              </div>
            </form>
          </div>
        ))}
      </main>
    </div>
  );
};