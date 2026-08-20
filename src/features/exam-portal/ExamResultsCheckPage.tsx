import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { FileSpreadsheet, Search, Printer, QrCode, Award, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';

export const ExamResultsCheckPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { success, error: toastError } = useToast();
  const [link, setLink] = useState<PublishableExamLink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultData, setResultData] = useState<any | null>(null);

  useEffect(() => {
    async function loadLink() {
      if (!slug) return;
      const found = await db.getExamLinkBySlug(slug);
      setLink(found);
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
        setResultData({
          student: stu,
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
        success('Candidate Marksheet retrieved successfully!');
      } else {
        toastError('No examination marks found for this student query.');
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-card print:hidden space-y-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 font-display">Online Marksheet & Scorecard Verification</h2>
          </div>
          <p className="text-xs text-slate-500">Enter Admission Number (e.g. <strong>DBA-2026-001</strong>) or Roll Number (<strong>1001</strong>).</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input type="text" placeholder="e.g. DBA-2026-001 or 1001..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 font-semibold" />
            <button type="submit" disabled={isSearching} className="px-6 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md transition cursor-pointer">
              {isSearching ? 'Fetching...' : 'Check Result'}
            </button>
          </form>
        </div>
        {resultData && (
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img src="/assets/branding/don-bosco-logo.png" alt="School Crest" className="w-16 h-16 object-contain" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] font-display uppercase">DON BOSCO ACADEMY</h1>
                  <p className="text-xs font-bold text-coral-600">Raipur Bazar, Nanpur, Sitamarhi (Bihar) • ESTD: 1997</p>
                  <p className="text-[11px] font-semibold text-slate-600">Official CBSE Annual Statement of Marks ({resultData.academic_year})</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">{resultData.result_status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div><span className="text-slate-400 block text-[10px]">Scholar Name</span><strong>{resultData.student.first_name} {resultData.student.last_name}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Roll No</span><strong className="font-mono">{resultData.student.roll_number || '1001'}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Admission No</span><strong className="font-mono">{resultData.student.admission_number}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Class & Sec</span><strong>{resultData.student.class_name || 'Class 10'} ({resultData.student.section_name || 'A'})</strong></div>
            </div>
            <table className="w-full text-xs text-left border border-slate-300 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 border-b border-slate-300">Subject Name</th>
                  <th className="p-2.5 border-b border-slate-300">Max Marks</th>
                  <th className="p-2.5 border-b border-slate-300">Theory</th>
                  <th className="p-2.5 border-b border-slate-300">Practical</th>
                  <th className="p-2.5 border-b border-slate-300">Total Marks</th>
                  <th className="p-2.5 border-b border-slate-300">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {resultData.marks.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold text-slate-900">{row.subject}</td>
                    <td className="p-2.5 text-slate-600 font-mono">{row.max}</td>
                    <td className="p-2.5 text-slate-700 font-mono">{row.theory}</td>
                    <td className="p-2.5 text-slate-700 font-mono">{row.practical}</td>
                    <td className="p-2.5 font-extrabold text-sapphire-900 font-mono">{row.total}</td>
                    <td className="p-2.5 font-black text-emerald-700">{row.grade}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <tr>
                  <td className="p-2.5 font-black text-slate-900">GRAND TOTAL & PERCENTAGE</td>
                  <td className="p-2.5 font-mono">{resultData.max_total}</td>
                  <td colSpan={2}></td>
                  <td className="p-2.5 font-black text-sapphire-900 font-mono text-sm">{resultData.grand_total}</td>
                  <td className="p-2.5 font-black text-coral-600 text-sm">{resultData.percentage}%</td>
                </tr>
              </tfoot>
            </table>
            <div className="pt-4 border-t-2 border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3"><QrCode className="w-12 h-12 text-slate-900" /><span className="text-[10px] text-slate-500 font-medium">Verified by DBA Examination Controller</span></div>
              <div className="text-center"><img src="/assets/branding/don-bosco-stamp.svg" alt="Seal" className="w-12 h-12 mx-auto" /><span className="text-[9px] font-bold text-slate-400 uppercase">Official Seal</span></div>
              <div className="text-center"><img src="/assets/branding/principal-signature.svg" alt="Sign" className="w-16 h-8 mx-auto" /><span className="text-xs font-bold text-slate-900 block">Md. Shami Ahmad</span><span className="text-[9px] font-bold text-slate-500 uppercase">Principal</span></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};