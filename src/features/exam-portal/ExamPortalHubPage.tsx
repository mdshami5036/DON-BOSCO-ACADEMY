import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { PublishableExamLink, School } from '../../types/database';
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
} from 'lucide-react';

export const ExamPortalHubPage: React.FC = () => {
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

          <div className="flex items-center gap-3">
            <Link
              to="/verify"
              className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold hover:bg-amber-400/30 transition flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Verify Docs</span>
            </Link>
            <Link
              to="/login"
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1"
            >
              <span>Staff Login</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-10 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Logo"
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl object-contain bg-white border border-sapphire-700/20 p-0.5 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#0B192C] font-display tracking-tight uppercase">
                DON BOSCO ACADEMY
              </h1>
              <div className="text-[10px] sm:text-xs text-coral-600 font-bold -mt-0.5">
                ★ ERP / EXAMINATION &amp; ADMISSION PORTAL ★
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              ← Back to Main Website
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-sapphire-950 via-[#0F2756] to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Examination Session 2025-2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight">
            Institutional Exam &amp; Credentials Portal
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Fill online examination forms, download authenticated admit cards with exam center schedules, check computerized marksheets, and access verified digital certificates.
          </p>

          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exam name, academic year, or admit card link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder-slate-400 rounded-2xl border border-white/20 focus:border-indigo-500 focus:outline-none transition text-xs sm:text-sm font-semibold shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 w-full">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'ALL', label: 'All Published Portals', icon: Layers },
            { id: 'ADMIT_CARD_FORM', label: '📝 Exam & Admit Card Forms', icon: BookOpen },
            { id: 'ADMIT_CARD_DOWNLOAD', label: '🎟️ Download Admit Cards', icon: FileBadge },
            { id: 'RESULT_PORTAL', label: '📊 Marksheets & Results', icon: FileSpreadsheet },
            { id: 'CERTIFICATE_RECORDS', label: '📜 Certificate Records', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ' + (isActive ? 'bg-sapphire-900 text-white shadow-sm font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200')}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Published Links Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-xs font-bold">
            Loading Examination Portals...
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-soft-card">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-900 font-display">No Examination Links Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no published exam portals under this category right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((item) => {
              const expired = isExpired(item.expiry_date);
              const daysLeft = getDaysRemaining(item.expiry_date);

              return (
                <div
                  key={item.id}
                  className={'bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-soft-card hover:shadow-soft-hover hover:-translate-y-1 ' + (expired ? 'border-rose-200/80 bg-slate-50/50' : 'border-slate-200')}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-sapphire-50 text-sapphire-900 border border-sapphire-200">
                        {item.academic_year} • {item.link_type.replace(/_/g, ' ')}
                      </span>

                      {expired ? (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          <Lock className="w-3 h-3" />
                          <span>EXPIRED</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{daysLeft} Days Left</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#0B192C] font-display leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.description || 'Official institutional examination portal for Don Bosco Academy.'}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Exam:</span>
                        <strong className="text-slate-800">{item.exam_name}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Classes:</span>
                        <strong className="text-indigo-700">{item.target_classes?.join(', ') || 'All Classes'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Deadline:</span>
                        <span className="font-mono font-bold text-slate-700">
                          {new Date(item.expiry_date).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>

                    {expired && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Portal Window Closed:</strong> Registration/Download deadline expired. Please contact School Principal / Administrative Office.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    {expired ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Window Closed</span>
                      </button>
                    ) : item.link_type === 'ADMIT_CARD_FORM' ? (
                      <Link
                        to={'/exam-portal/form/' + item.slug}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-coral-500 to-[#EB3C16] text-white font-extrabold text-xs shadow-md hover:shadow-coral-glow hover:-translate-y-0.5 transition flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Fill Exam Form →</span>
                      </Link>
                    ) : item.link_type === 'ADMIT_CARD_DOWNLOAD' ? (
                      <Link
                        to={'/exam-portal/admit-card/' + item.slug}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sapphire-900 to-indigo-700 text-white font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition flex items-center justify-center gap-1.5"
                      >
                        <FileBadge className="w-3.5 h-3.5 text-amber-300" />
                        <span>Download Admit Card 🎟️</span>
                      </Link>
                    ) : item.link_type === 'RESULT_PORTAL' ? (
                      <Link
                        to={'/exam-portal/results/' + item.slug}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition flex items-center justify-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Check Results 📊</span>
                      </Link>
                    ) : (
                      <Link
                        to="/verify"
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Verify Records 📜</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
