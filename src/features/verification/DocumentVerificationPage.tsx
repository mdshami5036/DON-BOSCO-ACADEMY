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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-white">
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Don Bosco Academy Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-amber-500/30"
            />
            <div>
              <span className="font-serif font-bold text-base tracking-wide uppercase">DON BOSCO ACADEMY</span>
              <span className="text-[10px] text-amber-400 font-mono block -mt-1">Official Document Verification</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
              Home
            </Link>
            <Link to="/login">
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                Staff Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Official Document Verification</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Verify the authenticity and integrity of marksheets, academic certificates, and student credentials.
          </p>
        </div>

        {/* Verification Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-10 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Document Verification Code (e.g. VERIFY-XAV-9901-78A)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="font-semibold px-5">
            Verify
          </Button>
        </form>

        {/* Result Card */}
        {searchDone && (
          <div className="max-w-2xl mx-auto animate-in fade-in-50 duration-300">
            {docResult.found && docResult.document ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Top Status Banner */}
                {docResult.status === 'VALID' ? (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-emerald-400 font-bold text-sm">AUTHENTIC & VERIFIED DOCUMENT</div>
                        <div className="text-emerald-200/70 text-xs">Official record confirmed in school database</div>
                      </div>
                    </div>
                    <Badge variant="success" size="md">STATUS: VALID</Badge>
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-rose-400 font-bold text-sm">DOCUMENT HAS BEEN REVOKED</div>
                        <div className="text-rose-200/70 text-xs">
                          {docResult.document.revocation_reason || 'This document is no longer valid or authorized.'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="danger" size="md">STATUS: REVOKED</Badge>
                  </div>
                )}

                {/* Issuing School Identity */}
                <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                  <img
                    src={docResult.school?.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150'}
                    alt="School Logo"
                    className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-slate-700"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-white">{docResult.school?.name || 'Authorized Educational Institution'}</h2>
                    <p className="text-xs text-slate-400">{docResult.school?.city}, {docResult.school?.state} ({docResult.school?.country})</p>
                    <p className="text-[11px] text-indigo-400 mt-0.5">{docResult.school?.email}</p>
                  </div>
                </div>

                {/* Verified Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Document Type</span>
                    <span className="font-bold text-sm text-slate-200">{docResult.document.doc_type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Certificate / Document No</span>
                    <span className="font-mono font-bold text-sm text-indigo-400">{docResult.document.certificate_no}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Recipient Student Name</span>
                    <span className="font-bold text-sm text-slate-200">
                      {docResult.document.metadata?.student_name || docResult.student?.first_name + ' ' + docResult.student?.last_name || 'Enrolled Student'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Issue Date</span>
                    <span className="font-bold text-slate-200">
                      {new Date(docResult.document.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {docResult.document.metadata?.exam_name && (
                    <div>
                      <span className="text-slate-400 block mb-1">Examination / Term</span>
                      <span className="font-semibold text-slate-200">{docResult.document.metadata.exam_name}</span>
                    </div>
                  )}
                  {docResult.document.metadata?.grade && (
                    <div>
                      <span className="text-slate-400 block mb-1">Final Result / Grade</span>
                      <span className="font-bold text-indigo-400">{docResult.document.metadata.grade} ({docResult.document.metadata.percentage}%)</span>
                    </div>
                  )}
                </div>

                {/* Privacy Safeguard Notice */}
                <div className="mt-6 flex items-start gap-2.5 text-[11px] text-slate-500 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Data Privacy Guaranteed:</strong> In compliance with educational student privacy laws, private personal contact numbers and residential addresses are safeguarded and excluded from public verification queries.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
                <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Verification Code Not Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  No registered document was found with the verification code <strong>"{searchInput}"</strong>. Please check the code printed beneath the QR code and try again.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        EduCloud Cryptographic Trust Engine &bull; Multi-Tenant Document Security
      </footer>
    </div>
  );
};
