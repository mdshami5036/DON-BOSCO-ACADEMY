import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { ExamApplication, PublishableExamLink } from '../../types/database';
import { useToast } from '../../components/common/Toast';
import {
  Printer,
  Download,
  CheckCircle2,
  FileCheck,
  Building2,
  Calendar,
  Clock,
  Lock,
  ArrowLeft,
  Share2,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';

export const ExamFormReceiptPage: React.FC = () => {
  const { applicationNo } = useParams<{ applicationNo: string }>();
  const { success, error: toastError } = useToast();
  const [app, setApp] = useState<ExamApplication | null>(null);
  const [link, setLink] = useState<PublishableExamLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      if (!applicationNo) return;
      setIsLoading(true);
      try {
        const found = await db.getExamApplicationByNumber(applicationNo);
        if (found) {
          setApp(found);
          if (found.link_id) {
            const l = await db.getExamLinks('sch-don-bosco');
            const matchedLink = l.find((item) => item.id === found.link_id);
            if (matchedLink) setLink(matchedLink);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReceipt();
  }, [applicationNo]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* PRINT-SPECIFIC CSS INJECTION */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0mm;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-receipt-canvas {
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 auto !important;
            padding: 12mm 14mm 10mm 14mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* TOP PREVIEW ACTION BAR (WEB ONLY) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <Link to="/exam-portal" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sapphire-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to ERP / Exam Portals Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-sapphire-900 text-white font-extrabold text-xs shadow-md hover:bg-sapphire-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>🖨 Print Official Receipt (A4)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow-sm hover:bg-emerald-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>⬇ Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex justify-center py-6 sm:py-10 px-2 sm:px-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-bold">
            Loading Official Submission Receipt...
          </div>
        ) : !app ? (
          <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-soft-card text-center max-w-md my-auto space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">Receipt Record Not Found</h2>
            <p className="text-xs text-slate-600">
              No examination form submission found with Application No: <code className="font-mono font-bold text-rose-600">{applicationNo}</code>
            </p>
            <Link to="/exam-portal" className="inline-block px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold mt-2">
              Return to Portal Hub
            </Link>
          </div>
        ) : (
          /* ========================================================================= */
          /* FIXED 1-PAGE A4 RECEIPT CANVAS (210mm x 297mm) */
          /* ========================================================================= */
          <div
            className="a4-receipt-canvas bg-white text-slate-900 shadow-2xl flex flex-col justify-between box-border rounded-xl print:rounded-none relative overflow-hidden"
            style={{
              width: '210mm',
              minWidth: '210mm',
              maxWidth: '210mm',
              height: '297mm',
              minHeight: '297mm',
              maxHeight: '297mm',
              padding: '12mm 14mm 10mm 14mm',
            }}
          >
            {/* Background Watermark */}
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Watermark"
              style={{ width: '220px', height: '220px' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none object-contain select-none"
            />

            <div className="space-y-3.5 relative z-10">
              {/* ========================================================================= */}
              {/* A. HEADER — TOP SECTION */}
              {/* ========================================================================= */}
              <div className="border-b-2 border-sapphire-900 pb-2.5 flex items-start justify-between gap-4">
                {/* Left: School Crest */}
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/branding/don-bosco-logo.png"
                    alt="Don Bosco Academy Crest"
                    style={{ width: '56px', height: '56px', minWidth: '56px', maxWidth: '56px' }}
                    className="object-contain rounded-xl border border-slate-200 p-0.5 shrink-0 bg-white"
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-display text-sapphire-950 uppercase tracking-tight leading-none">
                      DON BOSCO ACADEMY
                    </h1>
                    <p className="text-[11px] font-bold text-amber-700 tracking-wide uppercase mt-0.5">
                      EXAMINATION FORM SUBMISSION RECEIPT
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326 &bull; ESTD 1997
                    </p>
                    <div className="text-[9.5px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                      Academic Session: {app.academic_year || '2025–2026'}
                    </div>
                  </div>
                </div>

                {/* Right: Receipt Identification Meta */}
                <div className="text-right text-[10.5px] space-y-1 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400">Receipt No:</span> <strong className="font-mono text-sapphire-900">{app.receipt_no || 'DBA-REC-2026-0001'}</strong></div>
                  <div><span className="text-slate-400">Application No:</span> <strong className="font-mono text-indigo-700">{app.application_no}</strong></div>
                  <div><span className="text-slate-400">Submission Date:</span> <strong className="font-mono text-slate-800">{formatDDMMYYYY(app.submitted_at)}</strong></div>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase rounded border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>{app.status === 'VERIFIED' ? '✓ APPLICATION VERIFIED' : '✓ FORM SUBMITTED'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* B. EXAMINATION DETAILS */}
              {/* ========================================================================= */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-sapphire-900 bg-sapphire-50/80 px-2.5 py-0.5 rounded border-l-4 border-sapphire-900">
                  EXAMINATION DETAILS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[9.5px] text-slate-400 block">Examination Name:</span>
                    <strong className="text-slate-900 text-[11px]">{app.exam_name || link?.exam_name || 'CBSE Annual Board Examination 2026'}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block">Academic Session:</span>
                    <strong className="text-slate-900 text-[11px]">{app.academic_year || '2025-2026'}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block">Registered Class &amp; Sec:</span>
                    <strong className="text-slate-900 text-[11px]">{app.class_name} (Section {app.section_name})</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block">Examination Center:</span>
                    <strong className="text-slate-900 text-[11px]">{link?.exam_center || 'Don Bosco Academy Main Hall'}</strong>
                  </div>
                </div>

                {/* Selected Subjects List */}
                {app.subjects && app.subjects.length > 0 && (
                  <div className="p-1.5 rounded-xl bg-white border border-slate-200 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Confirmed Examination Papers / Selected Subjects:</span>
                    <div className="flex flex-wrap gap-1">
                      {app.subjects.map((sub, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[9.5px] font-bold rounded border border-slate-200">
                          {idx + 1}. {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* C. STUDENT INFORMATION & D. ACADEMIC DETAILS */}
              {/* ========================================================================= */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-sapphire-900 bg-sapphire-50/80 px-2.5 py-0.5 rounded border-l-4 border-sapphire-900">
                  STUDENT &amp; ACADEMIC PARTICULARS
                </div>
                <div className="flex gap-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 items-center">
                  {/* LEFT: Fixed Passport Photo */}
                  <div
                    style={{ width: '82px', height: '100px', minWidth: '82px', maxWidth: '82px' }}
                    className="shrink-0 rounded-lg border-2 border-sapphire-900 overflow-hidden bg-white p-0.5 shadow-2xs"
                  >
                    <img
                      src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={app.student_name}
                      style={{ width: '100%', height: '100%' }}
                      className="object-cover rounded"
                    />
                  </div>

                  {/* RIGHT: Grid Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-xs flex-1">
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Candidate Full Name:</span>
                      <strong className="text-slate-900 text-xs font-extrabold">{app.student_name}</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Admission Number (Unique):</span>
                      <strong className="text-sapphire-900 font-mono font-bold text-xs">{app.admission_number}</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Class Roll Number:</span>
                      <strong className="text-slate-900 font-mono font-bold text-xs">{app.roll_number}</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Father's Name:</span>
                      <strong className="text-slate-800 text-[11px]">{app.father_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Mother's Name:</span>
                      <strong className="text-slate-800 text-[11px]">{app.mother_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Date of Birth:</span>
                      <strong className="text-slate-800 font-mono text-[11px]">{formatDDMMYYYY(app.dob)}</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Gender:</span>
                      <strong className="text-slate-800 text-[11px]">{app.gender}</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Class &amp; Section:</span>
                      <strong className="text-slate-800 text-[11px]">{app.class_name} (Sec {app.section_name})</strong>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Contact Phone:</span>
                      <strong className="text-slate-800 font-mono text-[11px]">{app.contact_phone}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* E. CONTACT & RESIDENTIAL ADDRESS */}
              {/* ========================================================================= */}
              <div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] text-slate-400 block">Registered Residential Address:</span>
                    <strong className="text-slate-800 text-[11px]">{app.address || 'Raipur Bazar, Nanpur, Sitamarhi'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] text-slate-400 block">Student Status:</span>
                    <span className="font-bold text-emerald-700 text-[11px]">Regular Enrolled Scholar</span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* F. SUBMISSION CONFIRMATION NOTICE */}
              {/* ========================================================================= */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-0.5">
                <div className="flex items-center gap-1.5 font-black text-xs font-display">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>✓ EXAMINATION FORM SUCCESSFULLY SUBMITTED &amp; LOCKED</span>
                </div>
                <p className="text-[10.5px] text-emerald-800 leading-snug">
                  Your examination form has been successfully submitted and recorded in the official database of Don Bosco Academy. These verified particulars will be used directly for your upcoming Admit Card.
                </p>
              </div>

              {/* ========================================================================= */}
              {/* G. SIGNATURES & OFFICIAL INSTITUTIONAL SEAL (NO QR CODE) */}
              {/* ========================================================================= */}
              <div className="pt-2 border-t-2 border-slate-300 grid grid-cols-3 gap-6 items-end text-xs">
                {/* Left: Candidate Signature */}
                <div className="text-center space-y-2">
                  <div className="h-8 flex items-end justify-center">
                    <span className="text-[9.5px] font-mono text-slate-400 italic">Verified Submission</span>
                  </div>
                  <div className="border-t-2 border-slate-400 pt-1">
                    <div className="font-bold text-slate-900 text-xs">{app.student_name}</div>
                    <div className="text-[8.5px] text-slate-500 font-semibold uppercase tracking-wider">Candidate's Signature</div>
                  </div>
                </div>

                {/* Center: Institutional Seal */}
                <div className="text-center space-y-1">
                  <div className="inline-block p-0.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <img
                      src="/assets/branding/don-bosco-stamp.svg"
                      alt="Institutional Seal"
                      style={{ width: '56px', height: '56px', minWidth: '56px', maxWidth: '56px' }}
                      className="object-contain mx-auto opacity-95"
                    />
                  </div>
                  <div className="text-[8.5px] font-black uppercase tracking-wider text-sapphire-950 block">
                    Institutional Seal
                  </div>
                  <div className="text-[7.5px] font-semibold text-slate-400 -mt-1 block">
                    Don Bosco Academy
                  </div>
                </div>

                {/* Right: Principal & Authorized Signatory */}
                <div className="text-center sm:text-right space-y-0.5">
                  <div className="h-10 flex items-end justify-center sm:justify-end">
                    <img
                      src="/assets/branding/principal-signature.svg"
                      alt="Principal Signature"
                      style={{ height: '36px', maxWidth: '140px' }}
                      className="object-contain mx-auto sm:ml-auto"
                    />
                  </div>
                  <div className="border-t-2 border-slate-400 pt-1">
                    <div className="font-extrabold text-slate-900 text-xs">Md. Shami Ahmad</div>
                    <div className="text-[8.5px] text-slate-500 font-semibold uppercase tracking-wider">Principal &amp; Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* H. FOOTER */}
            {/* ========================================================================= */}
            <div className="border-t border-slate-200 pt-1.5 text-[8.5px] text-slate-400 flex items-center justify-between relative z-10">
              <span>This is a computer-generated Examination Form Submission Receipt.</span>
              <span className="font-semibold text-slate-600">Please keep this receipt safely for future reference.</span>
              <span>Don Bosco Academy &bull; Estd 1997</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
