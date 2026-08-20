import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Download,
  ExternalLink,
  RotateCcw,
  Lock,
  Building2,
  Calendar,
  User,
  GraduationCap,
  QrCode,
  Sparkles,
  BookOpen,
  FileText,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const VerificationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  // Inputs for the two cards
  const [certInput, setCertInput] = useState('');
  const [markInput, setMarkInput] = useState('');

  // Verification state
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingCard, setVerifyingCard] = useState<'CERTIFICATE' | 'MARKSHEET' | 'AUTO' | null>(null);
  const [result, setResult] = useState<{
    type: 'CERTIFICATE' | 'MARKSHEET';
    verificationId: string;
    status: 'VALID' | 'REVOKED';
    data: any;
    school?: any;
    student?: any;
  } | null>(null);
  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);
  const [notFoundType, setNotFoundType] = useState<'CERTIFICATE' | 'MARKSHEET' | 'DOCUMENT'>('DOCUMENT');

  const runVerification = async (queryId: string, expectedType?: 'CERTIFICATE' | 'MARKSHEET') => {
    if (!queryId.trim()) return;
    setIsLoading(true);
    setNotFoundQuery(null);
    setResult(null);

    try {
      const res = await db.verifyDocument(queryId.trim());
      if (res) {
        setResult(res);
        success(`Official ${res.type === 'CERTIFICATE' ? 'Certificate' : 'Marksheet'} verified successfully!`);
      } else {
        setNotFoundQuery(queryId.trim());
        setNotFoundType(expectedType || (queryId.toLowerCase().includes('cert') ? 'CERTIFICATE' : queryId.toLowerCase().includes('mark') ? 'MARKSHEET' : 'DOCUMENT'));
      }
    } catch (err) {
      console.error(err);
      setNotFoundQuery(queryId.trim());
      setNotFoundType(expectedType || 'DOCUMENT');
    } finally {
      setIsLoading(false);
      setVerifyingCard(null);
    }
  };

  // Check URL query on mount and when changed
  useEffect(() => {
    const idFromQuery = searchParams.get('id') || searchParams.get('code') || code;
    if (idFromQuery) {
      setVerifyingCard('AUTO');
      runVerification(idFromQuery);
    }
  }, [searchParams, code]);

  const handleVerifyCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) {
      toastError('Please enter a Certificate Number or Verification ID.');
      return;
    }
    setVerifyingCard('CERTIFICATE');
    setSearchParams({ id: certInput.trim() });
    runVerification(certInput.trim(), 'CERTIFICATE');
  };

  const handleVerifyMarksheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markInput.trim()) {
      toastError('Please enter a Marksheet Number or Verification ID.');
      return;
    }
    setVerifyingCard('MARKSHEET');
    setSearchParams({ id: markInput.trim() });
    runVerification(markInput.trim(), 'MARKSHEET');
  };

  const handleReset = () => {
    setResult(null);
    setNotFoundQuery(null);
    setCertInput('');
    setMarkInput('');
    setSearchParams({});
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* HEADER */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-slate-900 dark:text-white group">
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Don Bosco Academy Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-sapphire-700/20 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-display font-black text-sm sm:text-base tracking-tight uppercase text-sapphire-900 dark:text-sapphire-200 block">
                DON BOSCO ACADEMY
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block -mt-0.5">
                Official Document Verification Gateway
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/exam-portal" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition hidden sm:inline-block">
              🎓 ERP / Exam Portal
            </Link>
            <Link to="/" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">
              School Website
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* HERO SECTION */}
        <div className="text-center space-y-4 relative print:hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-gradient-to-r from-sapphire-600/10 via-indigo-600/10 to-amber-600/10 blur-3xl -z-10 rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sapphire-50 dark:bg-sapphire-950/60 border border-sapphire-200 dark:border-sapphire-800 text-sapphire-900 dark:text-sapphire-200 text-xs font-black tracking-widest uppercase shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>OFFICIAL DOCUMENT VERIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0B192C] dark:text-white font-display tracking-tight leading-tight max-w-2xl mx-auto">
            Verify Your Academic Documents
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
            Instantly verify the authenticity of certificates and marksheets issued by Don Bosco Academy.
          </p>
        </div>

        {/* LOADING EXPERIENCE */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-soft-hover max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-indigo-glow/20 animate-bounce">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">Verifying document...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Checking official Don Bosco Academy records & institutional ledger.</p>
            </div>
          </div>
        )}

        {/* NOT FOUND ERROR EXPERIENCE */}
        {!isLoading && notFoundQuery && !result && (
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 sm:p-8 text-center shadow-soft-card max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider">✕ {notFoundType} NOT FOUND</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">Document Not Found</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                The document with ID <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-600">{notFoundQuery}</code> could not be verified in the official records.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Please check the number and try again or contact the school administration / Principal office.
              </p>
            </div>
            <div className="pt-2">
              <button onClick={handleReset} className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:scale-105 transition cursor-pointer flex items-center gap-1.5 mx-auto">
                <RotateCcw className="w-3.5 h-3.5" /><span>Try Again / Clear Search</span>
              </button>
            </div>
          </div>
        )}

        {/* 2 VERIFICATION CARDS ON THE SAME PAGE (SHOWN WHEN NOT IN VERIFIED RESULT STATE) */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 print:hidden">
            {/* CARD 1 — CERTIFICATE VERIFICATION */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-soft-card hover:shadow-soft-hover hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">📜 Official Award</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">Certificate Verification</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verify an official certificate of merit or distinction issued by Don Bosco Academy.</p>
                </div>
                <form onSubmit={handleVerifyCertificate} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">Certificate Number / Verification ID</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Enter Certificate Number (e.g. DBA-CERT-2026-0103)"
                        value={certInput}
                        onChange={(e) => setCertInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 hover:shadow-amber-glow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading && verifyingCard === 'CERTIFICATE' ? (
                      <span>VERIFYING...</span>
                    ) : (
                      <><span>✓ VERIFY CERTIFICATE</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Try Sample ID:</span>
                <button
                  type="button"
                  onClick={() => { setCertInput('DBA-CERT-2026-0103'); }}
                  className="font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  DBA-CERT-2026-0103
                </button>
              </div>
            </div>

            {/* CARD 2 — MARKSHEET VERIFICATION */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-soft-card hover:shadow-soft-hover hover:border-indigo-400/50 transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">📊 CBSE Marksheet</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">Marksheet Verification</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verify official CBSE marksheet and academic performance records.</p>
                </div>
                <form onSubmit={handleVerifyMarksheet} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">Marksheet Number / Verification ID</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Enter Marksheet Number (e.g. DBA-MARK-2026-0103)"
                        value={markInput}
                        onChange={(e) => setMarkInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sapphire-900 via-indigo-800 to-indigo-900 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-900/20 hover:shadow-indigo-glow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading && verifyingCard === 'MARKSHEET' ? (
                      <span>VERIFYING...</span>
                    ) : (
                      <><span>✓ VERIFY MARKSHEET</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Try Sample ID:</span>
                <button
                  type="button"
                  onClick={() => { setMarkInput('DBA-MARK-2026-0103'); }}
                  className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  DBA-MARK-2026-0103
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CERTIFICATE VERIFICATION RESULT */}
        {/* ========================================================================= */}
        {!isLoading && result && result.type === 'CERTIFICATE' && (
          <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-300">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
              <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" /><span>Verify Another Document</span>
              </button>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-sapphire-900 text-white text-xs font-bold shadow-sm hover:bg-sapphire-800 transition flex items-center gap-1.5 cursor-pointer">
                  <Printer className="w-3.5 h-3.5 text-amber-300" /><span>Print Certificate Record</span>
                </button>
              </div>
            </div>

            {/* Status Card */}
            {result.status === 'VALID' ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between flex-wrap gap-4 shadow-soft-card">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-emerald-950 dark:text-emerald-200 font-black text-base font-display flex items-center gap-2">
                      <span>✓ CERTIFICATE VERIFIED</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-black uppercase">VALID</span>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      This certificate has been successfully verified in the official records of Don Bosco Academy.
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-700 dark:text-emerald-400 font-mono hidden sm:block">
                  Official Verification ID: <strong>{result.verificationId}</strong>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-700 flex items-center justify-between flex-wrap gap-4 shadow-soft-card">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-rose-950 dark:text-rose-200 font-black text-base font-display flex items-center gap-2">
                      <span>⚠ CERTIFICATE REVOKED</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 text-[10px] font-black uppercase">REVOKED</span>
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                      {result.data.revocation_reason || 'This document has been revoked by administration and is no longer considered valid.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verified Certificate Card Layout */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-amber-300 dark:border-amber-600/60 shadow-2xl p-6 sm:p-10 space-y-6 text-slate-900 dark:text-slate-100 relative overflow-hidden print:border-none print:shadow-none print:p-0">
              <img src="/assets/branding/don-bosco-logo.png" alt="Watermark" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.03] dark:opacity-[0.06] pointer-events-none object-contain" />

              <div className="text-center space-y-2 border-b-2 border-amber-400/40 pb-6">
                <img src="/assets/branding/don-bosco-logo.png" alt="Logo" className="w-16 h-16 object-contain mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-black font-display text-sapphire-950 dark:text-sapphire-200 tracking-tight uppercase">DON BOSCO ACADEMY</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326</p>
                <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 uppercase tracking-widest">
                  CBSE Pattern • ESTD: 1997 • KNOWLEDGE IS POWER
                </div>
              </div>

              <div className="text-center space-y-1 py-1">
                <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block">{result.data.certificate_title || 'CERTIFICATE OF MERIT'}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">This is to certify that</p>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white underline decoration-amber-400 decoration-2 underline-offset-8 py-2">
                  {result.data.student_name}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div><span className="text-slate-400 block">Father's Name:</span><strong className="text-slate-900 dark:text-white font-bold">{result.data.father_name}</strong></div>
                <div><span className="text-slate-400 block">Mother's Name:</span><strong className="text-slate-900 dark:text-white font-bold">{result.data.mother_name || 'Sunita Devi'}</strong></div>
                <div><span className="text-slate-400 block">Class & Section:</span><strong className="text-slate-900 dark:text-white font-bold">{result.data.class_name} (Section {result.data.section_name})</strong></div>
                <div><span className="text-slate-400 block">Roll Number / Adm No:</span><strong className="text-slate-900 dark:text-white font-mono font-bold">{result.data.roll_number} / {result.data.admission_number}</strong></div>
                <div><span className="text-slate-400 block">Course / Certificate Type:</span><strong className="text-slate-900 dark:text-white font-bold">{result.data.course_type}</strong></div>
                <div><span className="text-slate-400 block">Academic Session:</span><strong className="text-slate-900 dark:text-white font-bold">{result.data.academic_year}</strong></div>
                <div><span className="text-slate-400 block">Date of Issue:</span><strong className="text-slate-900 dark:text-white font-mono font-bold">{result.data.issue_date}</strong></div>
                <div><span className="text-slate-400 block">Certificate Status:</span><span className={'font-black px-2 py-0.5 rounded text-[10px] ' + (result.status === 'VALID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' : 'bg-rose-100 text-rose-800')}>{result.status}</span></div>
              </div>

              <p className="text-xs sm:text-sm text-center text-slate-700 dark:text-slate-300 leading-relaxed italic max-w-xl mx-auto">
                {result.data.body}
              </p>

              <div className="pt-6 border-t-2 border-amber-400/40 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs">
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400"><span className="text-slate-400">Certificate No:</span> <strong className="font-mono text-slate-800 dark:text-slate-200">{result.data.certificate_number}</strong></div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400"><span className="text-slate-400">Verification Hash:</span> <strong className="font-mono text-slate-800 dark:text-slate-200">{result.verificationId}</strong></div>
                  <div className="pt-1 flex items-center gap-2">
                    <div className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xs inline-block">
                      <QrCode className="w-10 h-10 text-slate-900 dark:text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 block leading-tight">Official Cryptographic QR Verified</span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <img src="/assets/branding/don-bosco-seal.png" alt="Seal" className="w-16 h-16 object-contain mx-auto opacity-95" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Institutional Seal</span>
                </div>
                <div className="text-right space-y-1">
                  <img src="/assets/branding/principal-signature.png" alt="Signature" className="h-10 ml-auto object-contain" />
                  <strong className="text-xs font-black text-slate-900 dark:text-white block">Md. Shami Ahmad</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Principal & Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. MARKSHEET VERIFICATION RESULT */}
        {/* ========================================================================= */}
        {!isLoading && result && result.type === 'MARKSHEET' && (
          <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-300">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
              <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" /><span>Verify Another Document</span>
              </button>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-sapphire-900 text-white text-xs font-bold shadow-sm hover:bg-sapphire-800 transition flex items-center gap-1.5 cursor-pointer">
                  <Printer className="w-3.5 h-3.5 text-amber-300" /><span>Print Marksheet Record</span>
                </button>
              </div>
            </div>

            {/* Status Card */}
            {result.status === 'VALID' ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between flex-wrap gap-4 shadow-soft-card">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-emerald-950 dark:text-emerald-200 font-black text-base font-display flex items-center gap-2">
                      <span>✓ MARKSHEET VERIFIED</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-black uppercase">VALID</span>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      This marksheet has been successfully verified in the official records of Don Bosco Academy.
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-700 dark:text-emerald-400 font-mono hidden sm:block">
                  Marksheet No: <strong>{result.data.marksheet_number}</strong>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-700 flex items-center justify-between flex-wrap gap-4 shadow-soft-card">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-rose-950 dark:text-rose-200 font-black text-base font-display flex items-center gap-2">
                      <span>⚠ MARKSHEET REVOKED</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 text-[10px] font-black uppercase">REVOKED</span>
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                      {result.data.revocation_reason || 'This marksheet has been revoked by administration and is no longer valid.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verified Marksheet Result Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 print:border-none print:shadow-none print:p-0">
              <div className="flex items-center justify-between border-b-2 border-sapphire-900 dark:border-sapphire-600 pb-4">
                <div className="flex items-center gap-4">
                  <img src="/assets/branding/don-bosco-logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-slate-200 dark:border-slate-700 p-1" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-sapphire-950 dark:text-sapphire-200 uppercase tracking-tight">DON BOSCO ACADEMY</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326</p>
                    <p className="text-[11px] font-bold text-coral-600 dark:text-coral-400 uppercase tracking-wide">CBSE Pattern • ESTD: 1997 • KNOWLEDGE IS POWER</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 rounded-lg text-xs font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">OFFICIAL MARKSHEET RECORD</div>
                  <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">Session {result.data.academic_year}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <div><span className="text-slate-400 block">Student Name:</span><strong className="text-slate-900 dark:text-white font-extrabold text-sm">{result.data.student_name}</strong></div>
                <div><span className="text-slate-400 block">Father's Name:</span><strong className="text-slate-800 dark:text-slate-200">{result.data.father_name}</strong></div>
                <div><span className="text-slate-400 block">Class / Course:</span><strong className="text-slate-800 dark:text-slate-200">{result.data.class_name} (Sec {result.data.section_name})</strong></div>
                <div><span className="text-slate-400 block">Roll Number:</span><strong className="text-slate-800 dark:text-slate-200 font-mono font-bold">{result.data.roll_number}</strong></div>
                <div><span className="text-slate-400 block">Admission Number:</span><strong className="text-slate-800 dark:text-slate-200 font-mono font-bold">{result.data.admission_number}</strong></div>
                <div><span className="text-slate-400 block">Examination Name:</span><strong className="text-slate-800 dark:text-slate-200">{result.data.exam_name}</strong></div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700 uppercase">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3 text-center">Full Marks</th>
                      <th className="p-3 text-center">Passing Marks</th>
                      <th className="p-3 text-center">Theory</th>
                      <th className="p-3 text-center">Practical</th>
                      <th className="p-3 text-center font-black text-indigo-700 dark:text-indigo-400">Marks Obtained</th>
                      <th className="p-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {result.data.marks.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{m.subject}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{m.max}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{m.pass_marks || 33}</td>
                        <td className="p-3 text-center font-mono text-slate-700 dark:text-slate-300">{m.theory}</td>
                        <td className="p-3 text-center font-mono text-slate-700 dark:text-slate-300">{m.practical}</td>
                        <td className="p-3 text-center font-mono font-black text-sapphire-900 dark:text-indigo-300 text-sm">{m.total}</td>
                        <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{m.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-extrabold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">Final Examination Result</span>
                  <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-200 mt-0.5">{result.data.result}</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Division: <strong>{result.data.division}</strong></p>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-right">
                  <div><span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Marks</span><strong className="text-base font-black font-mono text-slate-900 dark:text-white">{result.data.marks_obtained} / {result.data.total_marks}</strong></div>
                  <div><span className="text-[11px] text-slate-500 dark:text-slate-400 block">Percentage</span><strong className="text-xl font-black font-mono text-coral-600 dark:text-coral-400">{result.data.percentage}%</strong></div>
                  <div><span className="text-[11px] text-slate-500 dark:text-slate-400 block">Overall Grade</span><strong className="text-xl font-black text-emerald-700 dark:text-emerald-400">{result.data.grade}</strong></div>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xs">
                    <img src="/assets/branding/don-bosco-seal.png" alt="Seal" className="w-14 h-14 object-contain opacity-90" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-slate-400">{result.data.marksheet_number}</div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Official Institutional Stamp</div>
                    <div className="text-[10px] text-slate-400">Date of Issue: {result.data.issue_date}</div>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <img src="/assets/branding/principal-signature.png" alt="Signature" className="h-10 mx-auto sm:ml-auto object-contain" />
                  <div className="font-bold text-slate-900 dark:text-white mt-1">Md. Shami Ahmad</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Principal & Head of Institution</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
