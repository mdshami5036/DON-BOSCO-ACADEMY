import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink, Student, School, ExamApplication } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { FixedOfficialAdmitCard } from '../documents/FixedOfficialAdmitCard';
import {
  FileBadge,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowLeft,
  FileX,
  Send,
} from 'lucide-react';

export const AdmitCardDownloadPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { success, error: toastError } = useToast();
  const [link, setLink] = useState<PublishableExamLink | null>(null);
  const [school, setSchool] = useState<School | null>(null);

  // Dual search mode
  const [searchMode, setSearchMode] = useState<'ADMISSION_NO' | 'ROLL_NO'>('ADMISSION_NO');
  const [admissionQuery, setAdmissionQuery] = useState('');
  const [classQuery, setClassQuery] = useState('Class 10');
  const [rollQuery, setRollQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState<any | null>(null);
  const [notSubmittedError, setNotSubmittedError] = useState<{ studentName?: string; identifier: string } | null>(null);

  const classOptions = [
    'Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6',
    'Class 5', 'Class 4', 'Class 3', 'Class 2', 'Class 1',
    'UKG', 'LKG', 'Nursery', 'Play Group'
  ];

  useEffect(() => {
    async function loadLink() {
      if (!slug) return;
      try {
        const [found, s] = await Promise.all([
          db.getExamLinkBySlug(slug),
          db.getPrimarySchool(),
        ]);
        setLink(found);
        setSchool(s);
      } catch (err) {
        console.error(err);
      }
    }
    loadLink();
  }, [slug]);

  const isIssued = link?.admit_cards_issued === true;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIssued) {
      toastError('Admit cards have not yet been approved or released by the administration.');
      return;
    }
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
    setNotSubmittedError(null);
    setFoundStudent(null);

    try {
      const query = searchMode === 'ADMISSION_NO' ? admissionQuery.trim() : rollQuery.trim();
      
      // 1. Check if application was actually submitted for this exam
      const allApps = await db.getExamApplications();
      let appData: ExamApplication | null = null;

      if (link) {
        appData = await db.checkStudentAlreadySubmitted(link.id, query);
      }
      
      if (!appData) {
        appData = allApps.find(
          (a) =>
            (link ? a.link_id === link.id : true) &&
            (a.admission_number.toLowerCase() === query.toLowerCase() ||
              a.roll_number.toLowerCase() === query.toLowerCase() ||
              (a.application_no && a.application_no.toLowerCase() === query.toLowerCase()))
        ) || null;
      }

      // STRICT VALIDATION: If student did NOT submit the exam form, block admit card download
      if (!appData) {
        const stu = await db.lookupStudentForExamForm(searchMode, query, classQuery);
        setNotSubmittedError({
          studentName: stu ? `${stu.first_name} ${stu.last_name}` : undefined,
          identifier: query,
        });
        toastError('Aapka is exam ke liye Examination Form jama nahi mila hai. Admit Card keval unhi students ka download hoga jinhone pariksha form submit kiya hai.');
        return;
      }

      // 2. Compile Official Admit Card from stored exam application + timetable
      const defaultTimetable = [
        { subject: 'Mathematics', date: '02/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
        { subject: 'Science & Physics Lab', date: '05/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
        { subject: 'Social Science', date: '08/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
        { subject: 'English Language', date: '11/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
        { subject: 'Hindi Literature', date: '14/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
        { subject: 'Computer Applications & AI', date: '17/03/2026', time: '10:00 AM - 12:30 PM', room: 'Lab 2' },
      ];

            // 2. Resolve Class-Wise Subjects for this student (LKG gets LKG subjects, UKG gets UKG subjects, etc.)
      const studentClass = appData.class_name || 'Class 10';
      const allClassList = await db.getClasses(school?.id || 'sch-don-bosco');
      const matchedClassObj = allClassList.find((c) => c.name.toLowerCase() === studentClass.toLowerCase());

      let timetableToUse: Array<{ subject: string; date: string; time: string; room: string }> = [];

      // Check if admin set class-specific timetable
      if (link?.class_timetables && link.class_timetables[studentClass] && link.class_timetables[studentClass].length > 0) {
        timetableToUse = link.class_timetables[studentClass].map((t) => ({
          subject: t.subject,
          date: formatDDMMYYYY(t.date),
          time: t.time,
          room: t.room || 'Hall 1',
        }));
      } else if (matchedClassObj && matchedClassObj.assigned_subjects && matchedClassObj.assigned_subjects.length > 0) {
        // Use EXACT subjects configured for this class in Academics
        timetableToUse = matchedClassObj.assigned_subjects.map((sub, i) => {
          const matchedTEntry = link?.timetable?.find((t) => t.subject.toLowerCase() === sub.subject_name.toLowerCase());
          return {
            subject: sub.subject_name,
            date: matchedTEntry ? formatDDMMYYYY(matchedTEntry.date) : `0${2 + i * 3}/03/2026`,
            time: matchedTEntry ? matchedTEntry.time : '10:00 AM - 01:00 PM',
            room: matchedTEntry?.room || 'Hall 1',
          };
        });
      } else if (link?.timetable && link.timetable.length > 0) {
        timetableToUse = link.timetable.map((t) => ({
          subject: t.subject,
          date: formatDDMMYYYY(t.date),
          time: t.time,
          room: t.room || 'Hall 1',
        }));
      } else {
        timetableToUse = defaultTimetable;
      }

      setFoundStudent({
        first_name: appData.student_name.split(' ')[0],
        last_name: appData.student_name.split(' ').slice(1).join(' '),
        father_name: appData.father_name || 'Rajesh Singh',
        mother_name: appData.mother_name || 'Sunita Devi',
        photo_url: appData.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        roll_number: appData.roll_number || '1001',
        admission_number: appData.admission_number || 'DBA-2026-001',
        class_name: appData.class_name || 'Class 10',
        section_name: appData.section_name || 'A',
        application_no: appData.application_no,
        admit_card_no: appData.admit_card_no || ('DBA/ADMIT/2026/' + appData.roll_number),
        exam_center: link?.exam_center || 'Don Bosco Academy Main Examination Hall, Sitamarhi',
        timetable: timetableToUse,
      });

      success('Official Examination Admit Card loaded successfully!');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans">
      {/* PRINT-SPECIFIC CSS INJECTION: STRICT 1-PAGE A4 PORTRAIT */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0mm;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }
          .no-print, header, nav, footer, .print-hide {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 210mm !important;
            background: transparent !important;
          }
          .admit-card-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          .fixed-admit-card-root {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .a4-admit-card-canvas {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 auto !important;
            padding: 8mm 10mm 8mm 10mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/exam-portal" className="flex items-center gap-3">
            <img src="/assets/branding/don-bosco-logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white border border-sapphire-700/20 p-0.5" />
            <div>
              <span className="font-display font-black text-sm uppercase text-sapphire-900 block">DON BOSCO ACADEMY</span>
              <span className="text-[10px] text-coral-600 font-bold -mt-0.5 block">Official Admit Card &amp; Hall Ticket Gateway</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {foundStudent && (
              <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-4 h-4" /><span>Print Admit Card</span>
              </button>
            )}
            <Link to="/exam-portal" className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">← All Portals</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-sapphire-950 via-[#0F2756] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft-hover border border-sapphire-800 relative overflow-hidden print:hidden">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">🎟️ Official Examination Pass</span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-2 text-white">{link?.title || 'Admit Card & Hall Ticket Portal'}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">{link?.description || 'Download and print verified CBSE Examination Hall Tickets & Admit Cards.'}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
            <div>Exam: <strong className="text-amber-300">{link?.exam_name || 'CBSE Annual Examination 2026'}</strong></div>
            <div>•</div>
            <div>Status: <strong className={isIssued ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>{isIssued ? '✓ Released & Available for Download' : '🔒 Pending Admin Release'}</strong></div>
          </div>
        </div>

        {/* ISSUANCE LOCK GUARD */}
        {!isIssued ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-soft-card flex items-start gap-4">
            <Lock className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-lg font-black font-display text-amber-950">🔒 Admit Cards Not Yet Released / एडमिट कार्ड अभी जारी नहीं हुआ है</h3>
              <p className="text-xs sm:text-sm text-amber-800">
                The official admit cards for <strong>{link?.exam_name}</strong> have not yet been approved and released by the Don Bosco Academy administration.
              </p>
              <p className="text-xs text-amber-700 font-semibold">
                👉 Admin / Principal dwara admit card approve &amp; release karne ke baad aap apna Roll No ya Admission No daal kar admit card download kar payenge.
              </p>
              <div className="pt-2">
                <Link to="/exam-portal" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-900 text-white text-xs font-bold">← Return to Portals Hub</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* DUAL LOOKUP CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft-card print:hidden space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-black text-slate-900 font-display">Find &amp; Download Your Examination Admit Card</h2>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setSearchMode('ADMISSION_NO'); setNotSubmittedError(null); }}
                    className={'px-3 py-1.5 rounded-lg transition cursor-pointer ' + (searchMode === 'ADMISSION_NO' ? 'bg-white text-sapphire-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800')}
                  >
                    🆔 By Admission No (Direct)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchMode('ROLL_NO'); setNotSubmittedError(null); }}
                    className={'px-3 py-1.5 rounded-lg transition cursor-pointer ' + (searchMode === 'ROLL_NO' ? 'bg-white text-sapphire-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800')}
                  >
                    📋 By Roll No (Select Class)
                  </button>
                </div>
              </div>

              <form onSubmit={handleSearch} className="space-y-3">
                {searchMode === 'ADMISSION_NO' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Enter Student Admission Number *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. DBA-2026-001 or DBA-2026-002..."
                          value={admissionQuery}
                          onChange={(e) => setAdmissionQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 font-semibold"
                        />
                      </div>
                      <button type="submit" disabled={isSearching} className="px-6 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md transition cursor-pointer">
                        {isSearching ? 'Loading...' : 'Find Admit Card'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Select Class * (Mandatory)</label>
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
                      <button type="submit" disabled={isSearching} className="px-6 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md transition cursor-pointer">
                        {isSearching ? 'Loading...' : `Find in ${classQuery}`}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* NOT SUBMITTED EXAM FORM REJECTION BANNER */}
            {notSubmittedError && (
              <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-soft-card space-y-3 animate-in fade-in duration-200 print:hidden">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileX className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-rose-950 font-display">
                      ❌ Examination Form Not Submitted / परीक्षा फॉर्म नहीं भरा गया है!
                    </h3>
                    <p className="text-xs text-rose-800 mt-1">
                      {notSubmittedError.studentName ? (
                        <>Candidate <strong>{notSubmittedError.studentName}</strong> (Identifier: <strong>{notSubmittedError.identifier}</strong>)</>
                      ) : (
                        <>Student with Identifier <strong>{notSubmittedError.identifier}</strong></>
                      )}{' '}
                      ne is pariksha (<strong>{link?.exam_name || 'Annual Exam 2026'}</strong>) ke liye online examination form submit nahi kiya hai.
                    </p>
                    <div className="mt-2 p-3 rounded-xl bg-white border border-rose-200 text-xs text-slate-700 font-semibold">
                      📢 Note: Admit Card keval unhi students ka prapt hoga jinhone pariksha form bhara hai. Yadi aapne form nahi bhara hai toh kripya pehle exam form bharein.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/exam-portal/form/${slug}`}
                        className="px-4 py-2 rounded-xl bg-coral-600 text-white font-extrabold text-xs shadow-sm hover:bg-coral-700 transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /><span>📝 Fill Examination Form Now</span>
                      </Link>
                      <Link
                        to="/exam-portal"
                        className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                      >
                        Back to Portals Hub
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OFFICIAL ADMIT CARD RENDER */}
            {foundStudent && (
              <div className="admit-card-wrapper bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 print:border-none print:shadow-none print:p-0">
                <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">Official Examination Hall Ticket Preview (1-Page A4)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-5 py-2 rounded-xl bg-sapphire-900 hover:bg-sapphire-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>Print Official Admit Card (A4)</span>
                  </button>
                </div>

                {/* Pixel-Perfect Fixed 1-Page A4 Admit Card */}
                <FixedOfficialAdmitCard
                  data={{
                    school_name: school?.name || 'DON BOSCO ACADEMY',
                    school_address: 'Raipur Bazar, PS Nanpur, District Sitamarhi, Bihar - Pin Code 843326',
                    school_affiliation: 'Affiliated to CBSE (Affiliation No. 1234567)',
                    school_code: '12345',
                    udise_code: '12345678901',
                    academic_session: link?.academic_year || '2025-2026',
                    exam_name: link?.exam_name || 'Annual Examination 2026',
                    admit_card_no: foundStudent.admit_card_no,
                    student_name: `${foundStudent.first_name} ${foundStudent.last_name || ''}`.trim(),
                    father_name: foundStudent.father_name,
                    mother_name: foundStudent.mother_name,
                    dob: foundStudent.dob,
                    gender: foundStudent.gender,
                    class_name: foundStudent.class_name,
                    section_name: foundStudent.section_name,
                    roll_number: foundStudent.roll_number,
                    admission_no: foundStudent.admission_number,
                    photo_url: foundStudent.photo_url,
                    exam_center: foundStudent.exam_center,
                    timetable: foundStudent.timetable,
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
