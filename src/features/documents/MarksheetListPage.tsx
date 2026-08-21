import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../services/db';
import { FixedOfficialMarksheet, MarksheetData } from './FixedOfficialMarksheet';
import { useToast } from '../../components/common/Toast';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  ExternalLink,
  Filter,
  ShieldCheck,
  Award,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { Modal } from '../../components/common/UI';

export const MarksheetListPage: React.FC = () => {
  const { currentSchool } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [marksheets, setMarksheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const loadList = async () => {
    try {
      const list = await db.getIssuedMarksheets(currentSchool?.id || 'sch-don-bosco');
      setMarksheets(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [currentSchool]);

  const filtered = marksheets.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      q === '' ||
      m.student_name?.toLowerCase().includes(q) ||
      m.admission_no?.toLowerCase().includes(q) ||
      m.roll_no?.toLowerCase().includes(q) ||
      m.marksheet_number?.toLowerCase().includes(q) ||
      m.verification_id?.toLowerCase().includes(q);

    const matchSession = sessionFilter === 'ALL' || m.academic_session === sessionFilter;
    const matchClass = classFilter === 'ALL' || m.class_name === classFilter;
    const matchResult = resultFilter === 'ALL' || m.result === resultFilter;

    return matchSearch && matchSession && matchClass && matchResult;
  });

  const handlePrintItem = (item: any) => {
    setPreviewItem(item);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sapphire-50 text-sapphire-900 border border-sapphire-200">
              <FileSpreadsheet className="w-5 h-5 text-indigo-700" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] font-display">Issued Marksheet Records</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete institutional archive of verified CBSE student marksheets. Fixed security design with instant QR validation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/verify"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Public Verification Desk</span>
          </Link>
          <Link
            to="/school/documents/marksheets/issue"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 via-coral-600 to-[#EB3C16] text-white font-extrabold text-xs shadow-md shadow-coral-500/20 hover:shadow-coral-glow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Issue New Marksheet</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft-card flex flex-col md:flex-row items-center justify-between gap-3 text-xs no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll, adm no, marksheet no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500 font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800">
            <option value="ALL">All Sessions</option>
            <option value="2025-2026">2025–2026</option>
            <option value="2026-2027">2026–2027</option>
          </select>

          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800">
            <option value="ALL">All Classes</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 8">Class 8</option>
          </select>

          <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800">
            <option value="ALL">All Results</option>
            <option value="PASS">PASS Only</option>
            <option value="FAIL">FAIL Only</option>
          </select>
        </div>
      </div>

      {/* Marksheet Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-card overflow-hidden no-print">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading marksheet records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No marksheet records found</h3>
            <p className="text-xs text-slate-400">Click "+ Issue New Marksheet" above to issue an official CBSE marksheet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Marksheet No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Admission / Roll</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Examination</th>
                  <th className="p-3.5 text-center">Score / %</th>
                  <th className="p-3.5 text-center">Result</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <strong className="font-mono text-[#0F2756] block">{item.marksheet_number}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{item.verification_id}</span>
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900 font-bold block">{item.student_name}</strong>
                      <span className="text-[10px] text-slate-400">{item.academic_session}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-slate-800 font-semibold">{item.admission_no}</div>
                      <div className="font-mono text-slate-500 text-[10px]">Roll #{item.roll_no}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">
                      {item.class_name} ({item.section_name})
                    </td>
                    <td className="p-3.5 font-medium text-slate-600 truncate max-w-[150px]">
                      {item.exam_name}
                    </td>
                    <td className="p-3.5 text-center">
                      <strong className="font-mono text-emerald-700 font-extrabold block">
                        {typeof item.percentage === 'number' ? item.percentage.toFixed(2) + '%' : item.percentage}
                      </strong>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Grade {item.overall_grade}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={'px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ' + (item.result === 'PASS' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300')}>
                        {item.result}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                      {formatDDMMYYYY(item.issue_date)}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        title="Preview Marksheet"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-700" />
                      </button>
                      <button
                        onClick={() => handlePrintItem(item)}
                        className="p-1.5 rounded-lg bg-sapphire-50 hover:bg-sapphire-100 text-sapphire-900 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        title="Print A4"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={`/verify?id=${item.verification_id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition inline-flex items-center gap-1"
                        title="Verify Public Record"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <Modal isOpen={!!previewItem} onClose={() => setPreviewItem(null)} title={`Marksheet: ${previewItem.student_name} (${previewItem.marksheet_number})`} size="xl">
          <div className="space-y-4">
            <div className="flex justify-end gap-2 border-b border-slate-100 pb-2">
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-sapphire-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-4 h-4" /><span>Print A4 Marksheet</span>
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] p-4 bg-slate-200 rounded-2xl flex justify-center">
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                <FixedOfficialMarksheet
                  data={{
                    school_name: currentSchool?.name || 'DON BOSCO ACADEMY',
                    school_address: currentSchool?.address || 'Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326',
                    affiliation_text: 'Affiliated to CBSE, New Delhi • School Code: 65001 • UDISE Code: 100204001',
                    marksheet_title: 'ANNUAL EXAMINATION MARKSHEET',
                    marksheet_no: previewItem.marksheet_number,
                    verification_id: previewItem.verification_id,
                    academic_session: previewItem.academic_session,
                    exam_name: previewItem.exam_name,
                    issue_date: previewItem.issue_date,
                    student_name: previewItem.student_name,
                    father_name: previewItem.father_name || 'Rajesh Singh',
                    mother_name: previewItem.mother_name || 'Sunita Devi',
                    admission_no: previewItem.admission_no,
                    registration_no: 'DBA/REG/' + previewItem.roll_no,
                    roll_no: previewItem.roll_no,
                    dob: previewItem.dob || '2010-04-15',
                    gender: previewItem.gender || 'Male',
                    class_name: previewItem.class_name,
                    section_name: previewItem.section_name,
                    photo_url: previewItem.photo_url,
                    subjects: previewItem.subjects || [],
                    total_full_marks: previewItem.total_full_marks || 600,
                    total_marks_obtained: previewItem.total_marks_obtained || 566,
                    percentage: previewItem.percentage || 94.33,
                    overall_grade: previewItem.overall_grade || 'A1',
                    division: previewItem.division || '1st Division',
                    result: previewItem.result || 'PASS',
                    attendance: '214 / 225 Days',
                    class_rank: '1st Position',
                    remarks: 'Outstanding academic performance.',
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
