import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink, School } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/UI';
import {
  GraduationCap,
  FileBadge,
  FileSpreadsheet,
  QrCode,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  Building2,
  Layers,
  FileCheck,
} from 'lucide-react';

export const ExamPortalHubPage: React.FC = () => {
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();
  const [isReceiptLookupOpen, setIsReceiptLookupOpen] = useState(false);
  const [receiptLookupQuery, setReceiptLookupQuery] = useState('');
  const [isReceiptSearching, setIsReceiptSearching] = useState(false);

  const [school, setSchool] = useState<School | null>(null);
  const [links, setLinks] = useState<PublishableExamLink[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ADMIT_CARD_FORM' | 'ADMIT_CARD_DOWNLOAD' | 'RESULT_PORTAL' | 'CERTIFICATE_RECORDS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, lList] = await Promise.all([
          db.getPrimarySchool(),
          db.getExamLinks('sch-don-bosco'),
        ]);
        setSchool(s);
        setLinks(lList);
      } catch (err) {
        console.error('Error loading exam portal hub:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate).getTime() < Date.now();
  };

  const getDaysRemaining = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleReceiptLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptLookupQuery.trim()) {
      toastError('Please enter Admission Number, Roll Number, or Application Number.');
      return;
    }
    setIsReceiptSearching(true);
    try {
      const q = receiptLookupQuery.trim();
      const app = await db.getExamApplicationByNumber(q);
      if (app) {
        setIsReceiptLookupOpen(false);
        navigate(`/exam-portal/receipt/${app.application_no}`);
        return;
      }

      // Check in all applications
      const apps = await db.getExamApplications();
      const matched = apps.find(
        (a) =>
          a.admission_number.toLowerCase() === q.toLowerCase() ||
          a.roll_number.toLowerCase() === q.toLowerCase() ||
          (a.receipt_no && a.receipt_no.toLowerCase() === q.toLowerCase())
      );

      if (matched) {
        setIsReceiptLookupOpen(false);
        navigate(`/exam-portal/receipt/${matched.application_no}`);
        return;
      }

      toastError('No submitted examination form found for: ' + q + '. Please submit the form first.');
    } finally {
      setIsReceiptSearching(false);
    }
  };

  const filteredLinks = links.filter((item) => {
    const matchTab = activeTab === 'ALL' || item.link_type === activeTab;
    const matchSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exam_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.academic_year.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-[#0F2756] text-white text-xs py-2.5 px-4 sticky top-0 z-50 border-b border-sapphire-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-md bg-coral-500 text-white font-extrabold text-[10px] uppercase tracking-wider animate-pulse">
              Official Portal
            </span>
            <span className="text-slate-200 text-xs font-semibold hidden sm:inline">
              DON BOSCO ACADEMY • Autonomous Examination &amp; ERP Gateway
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReceiptLookupOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>📄 Check Submitted Receipt</span>
            </button>
            <Link
              to="/verify"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-bold transition flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Verify Documents</span>
            </Link>
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Main Website
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0B192C] via-[#0F2756] to-[#1E3E7B] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>Academic Session 2025–2026 &amp; 2026–2027</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Examination, Admit Card &amp; Results Portal
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Fill CBSE registration forms, download official admit cards, view verified marksheets, and retrieve submitted form receipts with institutional security.
          </p>

          {/* Quick Stats Grid */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xl font-black text-amber-400">1-Tap</div>
              <div className="text-[11px] text-slate-300 font-semibold">Auto-Fill Form</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xl font-black text-emerald-400">A4 PDF</div>
              <div className="text-[11px] text-slate-300 font-semibold">Instant Receipt</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xl font-black text-coral-400">QR Verify</div>
              <div className="text-[11px] text-slate-300 font-semibold">Single-Route Verify</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xl font-black text-indigo-300">Admin Lock</div>
              <div className="text-[11px] text-slate-300 font-semibold">Authorized Release</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Published Links Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft-card">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exams, forms, results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Portals' },
              { id: 'ADMIT_CARD_FORM', label: '📝 Exam Forms' },
              { id: 'ADMIT_CARD_DOWNLOAD', label: '🎟️ Admit Cards' },
              { id: 'RESULT_PORTAL', label: '📊 Marksheets' },
              { id: 'CERTIFICATE_RECORDS', label: '📜 Certificates' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ' + (activeTab === tab.id ? 'bg-sapphire-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Links Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-bold">Loading portals...</div>
        ) : filteredLinks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No active portal links found matching your criteria.</h3>
            <p className="text-xs text-slate-400">Please check back later or contact the administration.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => {
              const expired = isExpired(link.expiry_date);
              const days = getDaysRemaining(link.expiry_date);

              let targetUrl = `/exam-portal/form/${link.slug}`;
              if (link.link_type === 'ADMIT_CARD_DOWNLOAD') targetUrl = `/exam-portal/admit-card/${link.slug}`;
              if (link.link_type === 'RESULT_PORTAL') targetUrl = `/exam-portal/results/${link.slug}`;
              if (link.link_type === 'CERTIFICATE_RECORDS') targetUrl = `/exam-portal/certificate/${link.slug}`;

              return (
                <div
                  key={link.id}
                  className={'bg-white rounded-3xl border p-6 shadow-soft-card flex flex-col justify-between space-y-4 hover:shadow-soft-hover transition-all duration-300 ' + (expired ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200')}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-sapphire-50 text-sapphire-900 border border-sapphire-200">
                        {link.academic_year} • {link.link_type.replace(/_/g, ' ')}
                      </span>
                      {expired ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> CLOSED
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" /> {days} Days Left
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 font-display line-clamp-2">{link.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{link.description}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Exam:</span>
                        <strong className="text-slate-800 font-medium">{link.exam_name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deadline:</span>
                        <span className="font-mono font-bold text-slate-700">{formatDDMMYYYY(link.expiry_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={targetUrl}
                      className={'w-full py-3 rounded-xl text-center font-extrabold text-xs flex items-center justify-center gap-2 transition ' + (expired ? 'bg-slate-200 text-slate-600 cursor-not-allowed' : 'bg-sapphire-900 text-white shadow-md hover:bg-sapphire-800')}
                    >
                      <span>
                        {link.link_type === 'ADMIT_CARD_FORM' && 'Fill Examination Form'}
                        {link.link_type === 'ADMIT_CARD_DOWNLOAD' && 'Download Admit Card'}
                        {link.link_type === 'RESULT_PORTAL' && 'View Marksheet & Result'}
                        {link.link_type === 'CERTIFICATE_RECORDS' && 'Download Certificate'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Check Submitted Receipt */}
        <Modal
          isOpen={isReceiptLookupOpen}
          onClose={() => setIsReceiptLookupOpen(false)}
          title="📄 Check Examination Form Submission Receipt"
          size="md"
        >
          <form onSubmit={handleReceiptLookup} className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Instant A4 Submission Receipt Retrieval</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Enter your <strong>Admission Number</strong> (e.g. <code>DBA-2026-001</code>), <strong>Roll Number</strong> (e.g. <code>1001</code>), or <strong>Application Number</strong> (e.g. <code>DBA-EXAM-2026-0001</code>) to directly view, print, or download your official receipt.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enter Student Admission No / Roll No / Application No *</label>
              <input
                type="text"
                placeholder="e.g. DBA-2026-001 or 1001 or DBA-EXAM-2026-0001"
                value={receiptLookupQuery}
                onChange={(e) => setReceiptLookupQuery(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sapphire-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReceiptLookupOpen(false)}
                className="px-4 py-2 font-bold text-slate-600 text-xs hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isReceiptSearching}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-900 cursor-pointer"
              >
                <span>{isReceiptSearching ? 'Searching...' : 'Find & Open Receipt (A4)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </Modal>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} DON BOSCO ACADEMY, Sitamarhi (Bihar). Autonomous Examination Wing.</p>
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <Link to="/verify" className="hover:text-indigo-600">Verify QR</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-indigo-600">Principal ERP</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
