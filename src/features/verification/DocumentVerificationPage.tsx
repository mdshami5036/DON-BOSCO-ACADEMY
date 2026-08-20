import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { GeneratedDocument, School, Student } from '../../types/database';
import {
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Award,
  ExternalLink,
  Lock,
  ChevronLeft,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/common/UI';

export const DocumentVerificationPage: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const [searchInput, setSearchInput] = useState(code || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [docResult, setDocResult] = useState<{
    found: boolean;
    status?: 'VALID' | 'REVOKED';
    document?: GeneratedDocument;
    school?: School;
    student?: Student;
  }>({ found: false });

  const performVerification = async (verifyCode: string) => {
    if (!verifyCode.trim()) return;
    setIsLoading(true);
    try {
      const res = await db.verifyDocumentByCode(verifyCode.trim());
      setDocResult(res);
      setSearchDone(true);
    } catch (err) {
      console.error(err);
      setDocResult({ found: false });
      setSearchDone(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      performVerification(code);
    }
  }, [code]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      performVerification(searchInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-slate-900 group">
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Don Bosco Academy Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-sapphire-700/20 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-display font-black text-base tracking-tight uppercase text-sapphire-900">
                DON BOSCO ACADEMY
              </span>
              <span className="text-[10px] text-coral-600 font-bold block -mt-0.5">
                Official Document Verification Gateway
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition">
              School Website
            </Link>
            <Link to="/login">
              <Button size="sm" variant="primary" className="bg-[#0F2756] hover:bg-sapphire-900 text-white font-bold">
                Portal Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-sapphire-50 border border-sapphire-200 text-sapphire-800 flex items-center justify-center mx-auto mb-3 shadow-soft-card">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] font-display">
            Official Document Verification
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Scan the QR code on your certificate/marksheet or enter the unique verification string below.
          </p>
        </div>

        {/* Verification Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-10 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. VERIFY-CERT-DBA-CLASS10-2026-101"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sapphire-500 shadow-soft-card"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="font-extrabold px-6 bg-gradient-to-r from-sapphire-900 to-indigo-700 text-white rounded-2xl shadow-md cursor-pointer"
          >
            Verify
          </Button>
        </form>

        {/* Result Card */}
        {searchDone && (
          <div className="max-w-2xl mx-auto animate-in fade-in-50 duration-300">
            {docResult.found && docResult.document ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-hover relative overflow-hidden space-y-6">
                
                {/* Status Banner */}
                {docResult.status === 'VALID' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-emerald-900 font-black text-sm font-display">
                          AUTHENTIC &amp; VERIFIED DOCUMENT
                        </div>
                        <div className="text-emerald-700 text-xs font-semibold">
                          Official record confirmed in Don Bosco Academy institutional registry
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                      VALID
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-rose-900 font-black text-sm">DOCUMENT RECORD SUSPENDED</div>
                        <div className="text-rose-700 text-xs">Please contact Don Bosco Academy office.</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black">
                      REVOKED
                    </span>
                  </div>
                )}

                {/* Details Table */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Document Title</span>
                    <strong className="text-slate-900 font-display text-sm">{docResult.document.title}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Document Serial No</span>
                    <strong className="text-slate-900 font-mono text-sm">{docResult.document.certificate_no || 'DBA-2026-CERT'}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Issuing Institution</span>
                    <strong className="text-slate-900">{docResult.school?.name || 'DON BOSCO ACADEMY'}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Date of Issue</span>
                    <strong className="text-slate-900">
                      {formatDDMMYYYY(docResult.document.created_at || docResult.document.issued_at || Date.now())}
                    </strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sapphire-50 border border-sapphire-200 text-center">
                  <span className="text-xs font-bold text-sapphire-900">
                    Signed &amp; Authenticated by Head of Institution (Md. Shami Ahmad)
                  </span>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-soft-card space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 font-display">No Record Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  The verification code "{searchInput}" does not match any official credential issued by Don Bosco Academy.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        DON BOSCO ACADEMY, Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326
      </footer>
    </div>
  );
};
