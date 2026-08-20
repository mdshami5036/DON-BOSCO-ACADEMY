import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink, Student, School } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { FileBadge, Search, Printer, Download, CheckCircle2, Calendar, Clock, MapPin, ShieldCheck, AlertTriangle, Lock, Sparkles } from 'lucide-react';

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
    try {
      const query = searchMode === 'ADMISSION_NO' ? admissionQuery.trim() : rollQuery.trim();
      const stu = await db.lookupStudentForExamForm(searchMode, query, classQuery);
      if (stu) {
        setFoundStudent({
          ...stu,
          father_name: stu.father_name || 'Rajesh Singh',
          mother_name: stu.mother_name || 'Sunita Devi',
          admit_card_no: 'DBA/ADMIT/2026/' + (stu.roll_number || '1001'),
          exam_center: link?.exam_center || 'Don Bosco Academy Main Examination Hall, Sitamarhi',
          timetable: [
            { subject: 'Mathematics', date: '02/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
            { subject: 'Science & Physics Lab', date: '05/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
            { subject: 'Social Science', date: '08/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
            { subject: 'English Language', date: '11/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
            { subject: 'Hindi Literature', date: '14/03/2026', time: '10:00 AM - 01:00 PM', room: 'Hall 1' },
            { subject: 'Computer Applications & AI', date: '17/03/2026', time: '10:00 AM - 12:30 PM', room: 'Lab 2' },
          ],
        });
        success('Official Admit Card loaded successfully!');
      } else {
        toastError(
          searchMode === 'ADMISSION_NO'
            ? 'No student found with Admission No: ' + admissionQuery
            : 'No student found in ' + classQuery + ' with Roll No: ' + rollQuery
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/exam-portal" className="flex items-center gap-3">
            <img src="/assets/branding/don-bosco-logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white border border-sapphire-700/20 p-0.5" />
            <div>
              <span className="font-display font-black text-sm uppercase text-sapphire-900 block">DON BOSCO ACADEMY</span>
              <span className="text-[10px] text-coral-600 font-bold -mt-0.5 block">Official Admit Card & Hall Ticket Gateway</span>
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
            <div>Exam: <strong className="text-amber-300">{link?.exam_name}</strong></div>
            <div>•</div>
            <div>Status: <strong className={isIssued ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>{isIssued ? '✓ Released & Available for Download' : '🔒 Pending Admin Approval'}</strong></div>
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
                👉 Admin / Principal dwara admit card approve & release karne ke baad aap apna Roll No ya Admission No daal kar admit card download kar payenge.
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
                  <h2 className="text-base font-black text-slate-900 font-display">Find & Download Your Examination Admit Card</h2>
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

            {/* OFFICIAL ADMIT CARD RENDER */}
            {foundStudent && (
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
                    <div className="inline-block px-3 py-1 bg-sapphire-900 text-white rounded-lg text-xs font-black uppercase tracking-wider">OFFICIAL ADMIT CARD</div>
                    <div className="text-xs font-mono font-bold text-slate-500 mt-1">Session {link?.academic_year || '2025-2026'}</div>
                  </div>
                </div>
                <div className="bg-sapphire-50/70 p-3 rounded-2xl border border-sapphire-200 text-center">
                  <h3 className="text-base font-black text-sapphire-950 font-display">{link?.exam_name || 'CBSE Board Examination 2026'}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Center: <strong>{foundStudent.exam_center}</strong></p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <img src={foundStudent.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={foundStudent.first_name} className="w-24 h-28 object-cover rounded-xl border-2 border-sapphire-800 shrink-0 bg-white p-0.5" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1 w-full">
                    <div><span className="text-slate-400 block">Candidate Name:</span><strong className="text-sm text-slate-900 font-extrabold">{foundStudent.first_name} {foundStudent.last_name}</strong></div>
                    <div><span className="text-slate-400 block">Admission No:</span><strong className="text-sm text-sapphire-900 font-mono font-bold">{foundStudent.admission_number}</strong></div>
                    <div><span className="text-slate-400 block">Father's Name:</span><strong className="text-slate-800">{foundStudent.father_name}</strong></div>
                    <div><span className="text-slate-400 block">Mother's Name:</span><strong className="text-slate-800">{foundStudent.mother_name}</strong></div>
                    <div><span className="text-slate-400 block">Class & Section:</span><strong className="text-slate-800">{foundStudent.class_name || 'Class 10'} (Section {foundStudent.section_name || 'A'})</strong></div>
                    <div><span className="text-slate-400 block">Roll Number:</span><strong className="text-slate-800 font-mono">{foundStudent.roll_number}</strong></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Exam Schedule & Timetable</div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Subject</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Timing</th>
                          <th className="p-2.5 text-center">Sign of Invigilator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {foundStudent.timetable.map((t: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-800">{t.subject}</td>
                            <td className="p-2.5 font-mono text-slate-600">{t.date}</td>
                            <td className="p-2.5 font-mono text-slate-600">{t.time}</td>
                            <td className="p-2.5 text-center"><div className="w-24 h-6 border-b border-slate-300 mx-auto"></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white border border-slate-300 rounded-xl shadow-2xs">
                      <img src="/assets/branding/don-bosco-seal.png" alt="Seal" className="w-14 h-14 object-contain opacity-90" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-slate-400">DBA-HALL-TICKET-{foundStudent.roll_number}</div>
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
            )}
          </>
        )}
      </main>
    </div>
  );
};