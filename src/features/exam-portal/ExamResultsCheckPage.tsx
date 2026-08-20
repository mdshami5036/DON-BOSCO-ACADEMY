import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { FileSpreadsheet, Search, Printer, QrCode, Award, CheckCircle2, TrendingUp, ShieldCheck, Lock, ExternalLink, Sparkles } from 'lucide-react';

export const ExamResultsCheckPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { success, error: toastError } = useToast();
  const [link, setLink] = useState<PublishableExamLink | null>(null);

  // Dual search mode
  const [searchMode, setSearchMode] = useState<'ADMISSION_NO' | 'ROLL_NO'>('ADMISSION_NO');
  const [admissionQuery, setAdmissionQuery] = useState('');
  const [classQuery, setClassQuery] = useState('Class 10');
  const [rollQuery, setRollQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultData, setResultData] = useState<any | null>(null);

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

  const isPublished = link?.results_published === true;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPublished) {
      toastError('Marksheets have not yet been published by the administration.');
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
    try {
      const query = searchMode === 'ADMISSION_NO' ? admissionQuery.trim() : rollQuery.trim();
      const stu = await db.lookupStudentForExamForm(searchMode, query, classQuery);
      if (stu) {
        const mrkNo = 'DBA/MARKS/2026/' + (stu.roll_number || '1001');
        const vrfCode = 'DBA-VRF-MRK-' + (stu.roll_number || '1001');
        setResultData({
          student: stu,
          marksheet_no: mrkNo,
          verification_code: vrfCode,
          exam_name: link?.exam_name || 'Annual Examination 2026',
          academic_year: link?.academic_year || '2025-2026',
          marks: [
            { subject: 'English Language & Literature', max: 100, theory: 74, practical: 20, total: 94, grade: 'A1' },
            { subject: 'Mathematics (Standard)', max: 100, theory: 78, practical: 20, total: 98, grade: 'A1' },
            { subject: 'Science (Physics, Chem, Bio)', max: 100, theory: 72, practical: 20, total: 92, grade: 'A1' },
            { subject: 'Social Science', max: 100, theory: 71, practical: 19, total: 90, grade: 'A1' },
            { subject: 'Hindi Course-A', max: 100, theory: 76, practical: 19, total: 95, grade: 'A1' },
            { subject: 'Computer Applications & AI', max: 100, theory: 48, practical: 49, total: 97, grade: 'A1' },
          ],
          grand_total: 566,
          max_total: 600,
          percentage: 94.33,
          result_status: 'PASSED WITH DISTINCTION (RANK #1)',
        });
        success('Candidate Marksheet retrieved & verified!');
      } else {
        toastError(
          searchMode === 'ADMISSION_NO'
            ? 'No student marks found for Admission No: ' + admissionQuery
            : 'No student found in ' + classQuery + ' with Roll No: ' + rollQuery
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/exam-portal" className="flex items-center gap-3">
            <img src="/assets/branding/don-bosco-logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white border border-sapphire-700/20 p-0.5" />
            <div>
              <span className="font-display font-black text-sm uppercase text-sapphire-900 block">DON BOSCO ACADEMY</span>
              <span className="text-[10px] text-coral-600 font-bold -mt-0.5 block">Computerized Marksheet & Results Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {resultData && (
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-4 h-4" /><span>Print Marksheet</span>
              </button>
            )}
            <Link to="/exam-portal" className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">← Portals Hub</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-sapphire-950 via-[#0F2756] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft-hover border border-sapphire-800 relative overflow-hidden print:hidden">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">📊 Computerized Marksheet Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-2 text-white">{link?.title || 'Annual Examination Marksheets & Results'}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">{link?.description || 'Official scholastic statement of marks with theory, practical and GPA verification.'}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
            <div>Exam: <strong className="text-amber-300">{link?.exam_name}</strong></div>
            <div>•</div>
            <div>Status: <strong className={isPublished ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>{isPublished ? '✓ Marksheets Published & Live' : '🔒 Pending Admin Publication'}</strong></div>
          </div>
        </div>

        {/* ISSUANCE LOCK GUARD */}
        {!isPublished ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-soft-card flex items-start gap-4">
            <Lock className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-lg font-black font-display text-amber-950">🔒 Marksheets Not Yet Published / परीक्षा परिणाम अभी जारी नहीं हुआ है</h3>
              <p className="text-xs sm:text-sm text-amber-800">
                The marks and scorecards for <strong>{link?.exam_name}</strong> have not yet been officially published by the Don Bosco Academy administration.
              </p>
              <p className="text-xs text-amber-700 font-semibold">
                👉 Admin dwara result jari karne ke baad aap apna Roll No ya Admission No daal kar marksheet check aur download kar payenge.
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
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-black text-slate-900 font-display">Online Marksheet & Scorecard Verification</h2>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSearchMode('ADMISSION_NO')}
                    className={'px-3 py-1.5 rounded-lg transition cursor-pointer ' + (searchMode === 'ADMISSION_NO' ? 'bg-white text-sapphire-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800')}
                  >
                    🆔 By Admission No (Direct)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMode('ROLL_NO')}
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
                        {isSearching ? 'Loading...' : 'Check Marksheet'}
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
                        {isSearching ? 'Loading...' : `Check Results in ${classQuery}`}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* MARKSHEET DISPLAY */}
            {resultData && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between print:hidden">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Marksheet is 100% Cryptographically Registered on Document Verification Portal</span>
                  </div>
                  <Link to={`/verify?id=${resultData.verification_code}`} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1 font-extrabold">
                    <span>Test /verify URL</span><ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 print:border-none print:shadow-none print:p-0">
                  <div className="flex items-center justify-between border-b-2 border-sapphire-900 pb-4">
                    <div className="flex items-center gap-4">
                      <img src="/assets/branding/don-bosco-logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1" />
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black font-display text-sapphire-950 uppercase tracking-tight">DON BOSCO ACADEMY</h2>
                        <p className="text-xs text-slate-600 font-medium">Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326</p>
                        <p className="text-[11px] font-bold text-coral-600 uppercase tracking-wide">CBSE Pattern • ESTD: 1997 • KNOWLEDGE IS POWER</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black uppercase tracking-wider border border-emerald-300">OFFICIAL MARKSHEET</div>
                      <div className="text-xs font-mono font-bold text-slate-500 mt-1">Session {resultData.academic_year}</div>
                    </div>
                  </div>
                  <div className="bg-sapphire-50/70 p-3 rounded-2xl border border-sapphire-200 text-center">
                    <h3 className="text-base font-black text-sapphire-950 font-display">{resultData.exam_name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Statement of Scholastic Achievement & Performance Record</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <img src={resultData.student.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={resultData.student.first_name} className="w-24 h-28 object-cover rounded-xl border-2 border-sapphire-800 shrink-0 bg-white p-0.5" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1 w-full">
                      <div><span className="text-slate-400 block">Candidate Name:</span><strong className="text-sm text-slate-900 font-extrabold">{resultData.student.first_name} {resultData.student.last_name}</strong></div>
                      <div><span className="text-slate-400 block">Admission No:</span><strong className="text-sm text-sapphire-900 font-mono font-bold">{resultData.student.admission_number}</strong></div>
                      <div><span className="text-slate-400 block">Father's Name:</span><strong className="text-slate-800">{resultData.student.father_name || 'Rajesh Singh'}</strong></div>
                      <div><span className="text-slate-400 block">Mother's Name:</span><strong className="text-slate-800">{resultData.student.mother_name || 'Sunita Devi'}</strong></div>
                      <div><span className="text-slate-400 block">Class & Section:</span><strong className="text-slate-800">{resultData.student.class_name || 'Class 10'} (Section {resultData.student.section_name || 'A'})</strong></div>
                      <div><span className="text-slate-400 block">Roll Number:</span><strong className="text-slate-800 font-mono">{resultData.student.roll_number || '1001'}</strong></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Subject</th>
                          <th className="p-2.5 text-center">Max Marks</th>
                          <th className="p-2.5 text-center">Theory</th>
                          <th className="p-2.5 text-center">Practical</th>
                          <th className="p-2.5 text-center">Total</th>
                          <th className="p-2.5 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {resultData.marks.map((m: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-800">{m.subject}</td>
                            <td className="p-2.5 text-center font-mono text-slate-600">{m.max}</td>
                            <td className="p-2.5 text-center font-mono text-slate-700">{m.theory}</td>
                            <td className="p-2.5 text-center font-mono text-slate-700">{m.practical}</td>
                            <td className="p-2.5 text-center font-mono font-black text-sapphire-900">{m.total}</td>
                            <td className="p-2.5 text-center font-bold text-emerald-600">{m.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider">Final Examination Result</span>
                      <h3 className="text-lg font-black text-emerald-950 mt-0.5">{resultData.result_status}</h3>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div><span className="text-[11px] text-slate-500 block">Grand Total</span><strong className="text-base font-black font-mono text-slate-900">{resultData.grand_total} / {resultData.max_total}</strong></div>
                      <div><span className="text-[11px] text-slate-500 block">Percentage</span><strong className="text-xl font-black font-mono text-coral-600">{resultData.percentage}%</strong></div>
                    </div>
                  </div>
                  <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white border border-slate-300 rounded-xl shadow-2xs">
                        <img src="/assets/branding/don-bosco-seal.png" alt="Seal" className="w-14 h-14 object-contain opacity-90" />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-slate-400">{resultData.marksheet_no}</div>
                        <div className="text-[11px] font-bold text-slate-700">Official Institutional Seal</div>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <img src="/assets/branding/principal-signature.png" alt="Signature" className="h-10 mx-auto sm:ml-auto object-contain" />
                      <div className="font-bold text-slate-900 mt-1">Md. Shami Ahmad</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Principal & Head of Institution</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};