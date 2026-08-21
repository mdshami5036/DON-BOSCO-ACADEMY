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
  QrCode,
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
      setIsLoading(false);
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

  const receiptVerificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/exam-portal/receipt/${app?.application_no || applicationNo}`
    : '';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* PRINT-SPECIFIC CSS INJECTION */}
      <style>{'\
        @page {\
          size: A4 portrait;\
          margin: 8mm;\
        }\
        @media print {\
          body {\
            background: #ffffff !important;\
            margin: 0 !important;\
            padding: 0 !important;\
            -webkit-print-color-adjust: exact !important;\
            print-color-adjust: exact !important;\
          }\
          .no-print {\
            display: none !important;\
          }\
          .a4-receipt-canvas {\
            width: 100% !important;\
            max-width: 100% !important;\
            min-height: 100% !important;\
            height: auto !important;\
            border: none !important;\
            box-shadow: none !important;\
            margin: 0 !important;\
            padding: 0 !important;\
          }\
        }\
      '}</style>

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
          /* A4 RECEIPT DOCUMENT CANVAS (210mm x 297mm) */
          /* ========================================================================= */
          <div className="a4-receipt-canvas w-[210mm] min-h-[297mm] bg-white border border-slate-300 shadow-2xl p-[10mm] text-slate-900 flex flex-col justify-between box-border rounded-xl print:rounded-none relative">
            
            {/* Background Watermark */}
            <img
              src="/assets/branding/don-bosco-logo.png"
              alt="Watermark"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.035] pointer-events-none object-contain"
            />

            <div className="space-y-4">
              {/* ========================================================================= */}
              {/* A. HEADER — TOP SECTION */}
              {/* ========================================================================= */}
              <div className="border-b-2 border-sapphire-900 pb-3 flex items-start justify-between gap-4">
                {/* Left: School Crest */}
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/branding/don-bosco-logo.png"
                    alt="Don Bosco Academy Crest"
                    className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-0.5"
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
                    <div className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-1">
                      Academic Session: {app.academic_year || '2025–2026'}
                    </div>
                  </div>
                </div>

                {/* Right: Receipt Identification Meta */}
                <div className="text-right text-[11px] space-y-1 shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400">Receipt No:</span> <strong className="font-mono text-sapphire-900">{app.receipt_no || 'DBA-REC-2026-0001'}</strong></div>
                  <div><span className="text-slate-400">Application No:</span> <strong className="font-mono text-indigo-700">{app.application_no}</strong></div>
                  <div><span className="text-slate-400">Submission Date:</span> <strong className="font-mono text-slate-800">{formatDDMMYYYY(app.submitted_at)}</strong></div>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase rounded border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>{app.status === 'VERIFIED' ? '✓ APPLICATION VERIFIED' : '✓ FORM SUBMITTED'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* B. EXAMINATION DETAILS */}
              {/* ========================================================================= */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-sapphire-900 bg-sapphire-50/80 px-3 py-1 rounded border-l-4 border-sapphire-900">
                  EXAMINATION DETAILS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Examination Name:</span>
                    <strong className="text-slate-900">{app.exam_name || link?.exam_name || 'CBSE Annual Board Examination 2026'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Academic Year / Session:</span>
                    <strong className="text-slate-900">{app.academic_year || '2025-2026'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Registered Class & Section:</span>
                    <strong className="text-slate-900">{app.class_name} (Section {app.section_name})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Examination Center:</span>
                    <strong className="text-slate-900 text-[11px]">{link?.exam_center || 'Don Bosco Academy Main Hall'}</strong>
                  </div>
                </div>

                {/* Selected Subjects List */}
                {app.subjects && app.subjects.length > 0 && (
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirmed Examination Papers / Selected Subjects:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.subjects.map((sub, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded border border-slate-200">
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
              <div className="space-y-1.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-sapphire-900 bg-sapphire-50/80 px-3 py-1 rounded border-l-4 border-sapphire-900">
                  STUDENT & ACADEMIC PARTICULARS
                </div>
                <div className="flex gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 items-center">
                  {/* LEFT: Fixed Passport Photo */}
                  <div className="w-24 h-28 shrink-0 rounded-lg border-2 border-sapphire-900 overflow-hidden bg-white p-0.5 shadow-2xs">
                    <img
                      src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={app.student_name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* RIGHT: Grid Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Candidate Full Name:</span>
                      <strong className="text-slate-900 text-sm font-extrabold">{app.student_name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Admission Number (Unique):</span>
                      <strong className="text-sapphire-900 font-mono font-bold">{app.admission_number}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Class Roll Number:</span>
                      <strong className="text-slate-900 font-mono font-bold">{app.roll_number}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Father's Name:</span>
                      <strong className="text-slate-800">{app.father_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mother's Name:</span>
                      <strong className="text-slate-800">{app.mother_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Date of Birth:</span>
                      <strong className="text-slate-800 font-mono">{formatDDMMYYYY(app.dob)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Gender:</span>
                      <strong className="text-slate-800">{app.gender}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Class & Cohort:</span>
                      <strong className="text-slate-800">{app.class_name} (Section {app.section_name})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Contact Phone:</span>
                      <strong className="text-slate-800 font-mono">{app.contact_phone}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* E. CONTACT & RESIDENTIAL ADDRESS */}
              {/* ========================================================================= */}
              <div className="space-y-1">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Registered Residential Address:</span>
                    <strong className="text-slate-800">{app.address || 'Raipur Bazar, Nanpur, Sitamarhi'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Student Status:</span>
                    <span className="font-bold text-emerald-700">Regular Enrolled Scholar</span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* F. SUBMISSION CONFIRMATION NOTICE */}
              {/* ========================================================================= */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-black text-xs font-display">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✓ EXAMINATION FORM SUCCESSFULLY SUBMITTED</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Your examination form has been successfully submitted and recorded in the official records of Don Bosco Academy. The stored particulars will serve as the primary source of truth for the upcoming Admit Card.
                </p>
              </div>

              {/* ========================================================================= */}
              {/* G. QR CODE / RECEIPT VERIFICATION & H. SIGNATURES */}
              {/* ========================================================================= */}
              <div className="pt-2 border-t-2 border-slate-300 grid grid-cols-3 gap-4 items-end text-xs">
                {/* Left: Candidate Signature space */}
                <div className="text-center space-y-12">
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-700">
                    Candidate's Signature
                  </div>
                </div>

                {/* Center: Institutional Seal */}
                <div className="text-center space-y-1">
                  <img
                    src="/assets/branding/don-bosco-seal.png"
                    alt="School Seal"
                    className="w-16 h-16 object-contain mx-auto opacity-95"
                  />
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-600">
                    Institutional Seal
                  </div>
                </div>

                {/* Right: Principal Signature & QR code */}
                <div className="text-right space-y-2">
                  <div className="flex items-center justify-end gap-2">
                    <div>
                      <span className="text-[8px] font-black uppercase text-emerald-700 block">SCAN TO VIEW RECEIPT</span>
                      <code className="text-[8px] font-mono text-slate-500 block">{app.application_no}</code>
                    </div>
                    <div className="p-1 bg-white border border-slate-300 rounded shadow-2xs inline-block">
                      <QrCode className="w-9 h-9 text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <img
                      src="/assets/branding/principal-signature.png"
                      alt="Signature"
                      className="h-8 ml-auto object-contain"
                    />
                    <div className="font-bold text-slate-900 text-[11px] leading-tight">Md. Shami Ahmad</div>
                    <div className="text-[9px] text-slate-500 font-semibold">Principal & Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* I. FOOTER */}
            {/* ========================================================================= */}
            <div className="border-t border-slate-200 pt-2 text-[9px] text-slate-400 flex items-center justify-between">
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
