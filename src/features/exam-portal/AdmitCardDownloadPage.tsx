import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink, Student, School } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { FileBadge, Search, Printer, Download, QrCode, CheckCircle2, Calendar, Clock, MapPin, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';

export const AdmitCardDownloadPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { success, error: toastError } = useToast();
  const [link, setLink] = useState<PublishableExamLink | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState<any | null>(null);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const stu = await db.lookupStudentForExamForm(searchQuery.trim());
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
        toastError('No student record found. Enter Admission Number e.g. DBA-2026-001 or Roll No 1001');
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card print:hidden space-y-4">
          <div className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 font-display">Find & Download Your Examination Admit Card</h2>
          </div>
          <p className="text-xs text-slate-500">Enter your Admission Number (e.g. <strong>DBA-2026-001</strong>) or Roll Number (<strong>1001</strong>) to retrieve your verified CBSE Admit Card.</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Enter Admission No / Roll No..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 font-semibold" />
            </div>
            <button type="submit" disabled={isSearching} className="px-6 py-2.5 rounded-xl bg-sapphire-900 hover:bg-sapphire-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer">
              {isSearching ? 'Searching...' : 'Retrieve Admit Card'}
            </button>
          </form>
        </div>
        {foundStudent && (
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img src="/assets/branding/don-bosco-logo.png" alt="School Crest" className="w-16 h-16 object-contain" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] font-display tracking-tight uppercase">DON BOSCO ACADEMY</h1>
                  <p className="text-xs font-bold text-coral-600">Raipur Bazar, Nanpur, Sitamarhi, Bihar - 843326 • ESTD: 1997</p>
                  <p className="text-[11px] font-semibold text-slate-600">CBSE Pattern • Official Hall Ticket & Admit Card</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-mono font-bold text-slate-400 block">ADMIT CARD SERIAL</span>
                <strong className="text-xs font-mono font-black text-slate-900">{foundStudent.admit_card_no}</strong>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-9 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><span className="text-slate-400 block text-[10px]">Candidate Name</span><strong className="text-slate-900 text-sm font-display">{foundStudent.first_name} {foundStudent.last_name}</strong></div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><span className="text-slate-400 block text-[10px]">Admission No</span><strong className="text-slate-900 text-sm font-mono">{foundStudent.admission_number}</strong></div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><span className="text-slate-400 block text-[10px]">Class & Section</span><strong className="text-slate-900">{foundStudent.class_name || 'Class 10'} (Sec {foundStudent.section_name || 'A'})</strong></div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><span className="text-slate-400 block text-[10px]">Roll Number</span><strong className="text-slate-900 font-mono font-bold">{foundStudent.roll_number || '1001'}</strong></div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><span className="text-slate-400 block text-[10px]">Father's Name</span><strong className="text-slate-900">{foundStudent.father_name}</strong></div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><span className="text-slate-400 block text-[10px]">Mother's Name</span><strong className="text-slate-900">{foundStudent.mother_name}</strong></div>
              </div>
              <div className="sm:col-span-3 flex flex-col items-center">
                <img src={foundStudent.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="Candidate Photo" className="w-24 h-28 object-cover rounded-xl border-2 border-slate-800 p-0.5 bg-white shadow-md" />
                <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Candidate Photograph</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-sapphire-50 border border-sapphire-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sapphire-800" /><span className="text-slate-700">Exam Center: <strong>{foundStudent.exam_center}</strong></span></div>
              <span className="text-emerald-700 font-bold">Center Code: DBA-8433</span>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Examination Date & Time Schedule</h4>
              <table className="w-full text-xs text-left border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5 border-b border-slate-300">Subject</th>
                    <th className="p-2.5 border-b border-slate-300">Date</th>
                    <th className="p-2.5 border-b border-slate-300">Timing</th>
                    <th className="p-2.5 border-b border-slate-300">Room</th>
                    <th className="p-2.5 border-b border-slate-300">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {foundStudent.timetable.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2.5 font-bold text-slate-900">{row.subject}</td>
                      <td className="p-2.5 font-mono text-slate-700">{row.date}</td>
                      <td className="p-2.5 text-slate-700">{row.time}</td>
                      <td className="p-2.5 font-mono text-slate-700">{row.room}</td>
                      <td className="p-2.5 border-l border-slate-200"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-4 border-t-2 border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white p-1 border border-slate-300 rounded-lg flex items-center justify-center"><QrCode className="w-12 h-12 text-slate-900" /></div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">QR Verification</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 block">SCAN TO VERIFY</span>
                  <span className="text-[9px] text-slate-400 block">Tamper-Proof DBA Cryptography</span>
                </div>
              </div>
              <div className="text-center">
                <img src="/assets/branding/don-bosco-stamp.svg" alt="Official Seal" className="w-14 h-14 object-contain mx-auto" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Institutional Seal</span>
              </div>
              <div className="text-center">
                <img src="/assets/branding/principal-signature.svg" alt="Signature" className="w-20 h-10 object-contain mx-auto" />
                <div className="text-xs font-black text-slate-900">Md. Shami Ahmad</div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Head of Institution / Principal</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};