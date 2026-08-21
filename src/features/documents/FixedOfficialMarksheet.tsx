import { formatDDMMYYYY } from '../../lib/date-utils';
import React, { useState, useEffect } from 'react';
import { generateQrCodeDataUri } from '../../lib/qr-generator';
import { QrCode } from 'lucide-react';

export interface MarksheetSubjectRow {
  subject_name: string;
  full_marks: number;
  pass_marks: number;
  theory_marks: number;
  practical_marks?: number | null;
  total_marks: number;
  grade: string;
}

export interface MarksheetData {
  school_name?: string;
  school_address?: string;
  affiliation_text?: string;
  marksheet_title?: string;
  academic_session: string;
  exam_name: string;
  class_name: string;
  section_name: string;
  marksheet_no: string;
  verification_id: string;
  issue_date: string;
  student_name: string;
  admission_no: string;
  registration_no?: string;
  roll_no: string;
  dob: string;
  gender: string;
  father_name: string;
  mother_name: string;
  photo_url?: string;
  subjects: MarksheetSubjectRow[];
  total_full_marks: number;
  total_marks_obtained: number;
  percentage: number;
  overall_grade: string;
  division: string;
  result: 'PASS' | 'FAIL' | 'COMPARTMENT';
  attendance?: string;
  class_rank?: string;
  remarks?: string;
}

interface FixedOfficialMarksheetProps {
  data: MarksheetData;
  isPrintMode?: boolean;
}

export const FixedOfficialMarksheet: React.FC<FixedOfficialMarksheetProps> = ({
  data,
  isPrintMode = false,
}) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verifyUrl = `${origin}/verify?id=${data.verification_id}`;
  const [qrDataUri, setQrDataUri] = useState<string>('');

  useEffect(() => {
    async function loadQr() {
      try {
        const uri = await generateQrCodeDataUri(verifyUrl);
        setQrDataUri(uri);
      } catch (err) {
        console.error('Error generating QR for marksheet:', err);
      }
    }
    loadQr();
  }, [verifyUrl]);

  return (
    <div className="fixed-marksheet-root flex justify-center items-center">
      {/* Exact A4 Portrait Dimensions (210mm x 297mm) */}
      <div
        className="a4-marksheet-canvas relative box-border overflow-hidden bg-white text-slate-900 shadow-2xl print:shadow-none"
        style={{
          width: '210mm',
          minWidth: '210mm',
          maxWidth: '210mm',
          height: '297mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          padding: '20mm 18mm 25mm 18mm', // Safe margins (Left/Right: 18mm, Top: 20mm, Bottom: 25mm to clear bottom ornament)
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Permanent Security Background Layer (Ornamental Border & Guilloche Watermark) */}
        <img
          src="/assets/branding/marksheet-security-bg.jpg"
          alt="Marksheet Security Background"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 select-none"
        />

        {/* Central School Logo Watermark */}
        <img
          src="/assets/branding/don-bosco-logo.png"
          alt="School Logo Watermark"
          style={{ width: '80mm', height: '80mm' }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.065] pointer-events-none object-contain select-none z-0"
        />

        {/* Content Container (Constrained strictly to 174mm safe width) */}
        <div
          className="relative z-10 flex flex-col justify-start gap-2 h-full"
          style={{ width: '174mm', maxWidth: '174mm', margin: '0 auto' }}
        >
          {/* ========================================================================= */}
          {/* 5. HEADER SECTION (Fully Centered Without Top-Left Logo) */}
          {/* ========================================================================= */}
          <div className="text-center relative pt-0.5 w-full">
            <h1
              className="font-bold tracking-tight uppercase text-[#0F2756]"
              style={{
                fontFamily: 'Georgia, "Times New Roman", Garamond, serif',
                fontSize: '21pt',
                lineHeight: '1.1',
                letterSpacing: '0.8px',
              }}
            >
              {data.school_name || 'DON BOSCO ACADEMY'}
            </h1>

            <p className="text-slate-700 font-semibold mt-1" style={{ fontSize: '8.5pt', lineHeight: '1.2' }}>
              {data.school_address || 'Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326'}
            </p>

            <p className="text-slate-600 font-medium mt-0.5" style={{ fontSize: '7.5pt', lineHeight: '1.2' }}>
              {data.affiliation_text || 'Affiliated to CBSE, New Delhi • School Code: 65001 • UDISE Code: 100204001'}
            </p>

            {/* Main Title Badge */}
            <div className="mt-2 inline-block">
              <span
                className="font-bold tracking-wider uppercase text-[#0F2756] border-y-2 border-[#0F2756] px-6 py-0.5 inline-block"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", Garamond, serif',
                  fontSize: '13pt',
                  letterSpacing: '1.5px',
                }}
              >
                {data.marksheet_title || 'ANNUAL EXAMINATION MARKSHEET'}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. EXAMINATION INFORMATION CARD (172mm) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/40 bg-white/85 shadow-2xs mt-1.5"
            style={{ padding: '3px 8px' }}
          >
            <div className="grid grid-cols-6 gap-2 text-center items-center">
              <div className="border-r border-slate-300 pr-1">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Academic Session</span>
                <strong className="block text-[#0F2756] font-bold" style={{ fontSize: '8pt' }}>{data.academic_session}</strong>
              </div>
              <div className="border-r border-slate-300 pr-1">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Examination</span>
                <strong className="block text-slate-900 font-bold truncate" style={{ fontSize: '8pt' }}>{data.exam_name}</strong>
              </div>
              <div className="border-r border-slate-300 pr-1">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Class</span>
                <strong className="block text-slate-900 font-bold" style={{ fontSize: '8pt' }}>{data.class_name}</strong>
              </div>
              <div className="border-r border-slate-300 pr-1">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Section</span>
                <strong className="block text-slate-900 font-bold" style={{ fontSize: '8pt' }}>{data.section_name}</strong>
              </div>
              <div className="border-r border-slate-300 pr-1">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Marksheet No.</span>
                <strong className="block font-mono text-[#0F2756] font-bold truncate" style={{ fontSize: '7.5pt' }}>{data.marksheet_no}</strong>
              </div>
              <div>
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Issue Date</span>
                <strong className="block font-mono text-slate-800 font-bold" style={{ fontSize: '7.5pt' }}>{formatDDMMYYYY(data.issue_date)}</strong>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. STUDENT INFORMATION CARD (172mm x ~33mm) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/40 bg-white/85 p-2 shadow-2xs mt-1.5 flex gap-3 items-center"
            style={{ height: '33mm', minHeight: '33mm', maxHeight: '33mm' }}
          >
            {/* Left & Middle Info Columns */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-800 flex-1 leading-tight" style={{ fontSize: '7.5pt' }}>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Student Name:</span>
                <strong className="text-[#0F2756] uppercase font-black truncate">{data.student_name}</strong>
              </div>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Roll Number:</span>
                <strong className="font-mono text-slate-900 font-bold">{data.roll_no}</strong>
              </div>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Father's Name:</span>
                <span className="font-semibold text-slate-800 truncate">{data.father_name || '—'}</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Date of Birth:</span>
                <span className="font-mono font-semibold text-slate-800">{formatDDMMYYYY(data.dob)}</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Mother's Name:</span>
                <span className="font-semibold text-slate-800 truncate">{data.mother_name || '—'}</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Gender:</span>
                <span className="font-semibold text-slate-800">{data.gender}</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Admission No:</span>
                <strong className="font-mono text-[#0F2756] font-bold">{data.admission_no}</strong>
              </div>
              <div className="flex">
                <span className="text-slate-500 font-medium w-[24mm] shrink-0">Reg. Number:</span>
                <span className="font-mono font-semibold text-slate-700">{data.registration_no || 'DBA/' + data.admission_no}</span>
              </div>
            </div>

            {/* Right: Student Passport Photo */}
            <div
              className="w-[28mm] h-[31mm] shrink-0 rounded border border-slate-400 bg-slate-50 p-0.5 overflow-hidden flex items-center justify-center text-center"
              style={{ width: '28mm', height: '31mm' }}
            >
              {data.photo_url ? (
                <img
                  src={data.photo_url}
                  alt={data.student_name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-slate-400 font-bold tracking-wider" style={{ fontSize: '6.5pt' }}>
                  STUDENT<br />PHOTO
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 8. MARKS TABLE (172mm) */}
          {/* ========================================================================= */}
          <div className="w-full border border-[#0F2756]/50 rounded overflow-hidden bg-white/90 shadow-2xs mt-1.5">
            <table className="w-full border-collapse text-slate-900" style={{ fontSize: '7.5pt' }}>
              <thead>
                <tr className="bg-[#0F2756] text-white font-bold uppercase text-center" style={{ height: '7.5mm' }}>
                  <th style={{ width: '10mm', padding: '2px' }} className="border-r border-white/20">Sl.</th>
                  <th style={{ width: '42mm', padding: '2px 6px' }} className="text-left border-r border-white/20">Subject Name</th>
                  <th style={{ width: '20mm', padding: '2px' }} className="border-r border-white/20">Full Marks</th>
                  <th style={{ width: '20mm', padding: '2px' }} className="border-r border-white/20">Pass Marks</th>
                  <th style={{ width: '20mm', padding: '2px' }} className="border-r border-white/20">Theory</th>
                  <th style={{ width: '20mm', padding: '2px' }} className="border-r border-white/20">Practical</th>
                  <th style={{ width: '22mm', padding: '2px' }} className="border-r border-white/20">Total</th>
                  <th style={{ width: '20mm', padding: '2px' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {data.subjects.map((sub, idx) => (
                  <tr
                    key={idx}
                    className={'border-b border-slate-200 text-center ' + (idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white/80')}
                    style={{ height: '6.8mm' }}
                  >
                    <td className="font-mono text-slate-500 border-r border-slate-200">{idx + 1}</td>
                    <td className="text-left font-bold text-slate-900 px-2 border-r border-slate-200 truncate">{sub.subject_name}</td>
                    <td className="font-mono text-slate-700 border-r border-slate-200">{sub.full_marks}</td>
                    <td className="font-mono text-slate-700 border-r border-slate-200">{sub.pass_marks}</td>
                    <td className="font-mono font-semibold text-slate-900 border-r border-slate-200">{sub.theory_marks}</td>
                    <td className="font-mono text-slate-700 border-r border-slate-200">
                      {sub.practical_marks !== null && sub.practical_marks !== undefined ? sub.practical_marks : '—'}
                    </td>
                    <td className="font-mono font-black text-[#0F2756] border-r border-slate-200">{sub.total_marks}</td>
                    <td className="font-bold text-slate-900">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* 11. RESULT SUMMARY CARD (172mm x ~17mm) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border-2 border-[#0F2756] bg-[#0F2756]/5 p-1.5 mt-1.5 shadow-2xs"
            style={{ height: '16mm', minHeight: '16mm' }}
          >
            <div className="grid grid-cols-6 gap-2 text-center items-center h-full">
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Total Full Marks</span>
                <strong className="block font-mono text-slate-900 font-bold" style={{ fontSize: '9pt' }}>{data.total_full_marks}</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Marks Obtained</span>
                <strong className="block font-mono text-[#0F2756] font-black" style={{ fontSize: '10pt' }}>{data.total_marks_obtained}</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Percentage</span>
                <strong className="block font-mono text-emerald-800 font-black" style={{ fontSize: '10pt' }}>{data.percentage.toFixed(2)}%</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Overall Grade</span>
                <strong className="block text-[#0F2756] font-black" style={{ fontSize: '10pt' }}>{data.overall_grade}</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Division</span>
                <strong className="block text-slate-900 font-bold" style={{ fontSize: '8pt' }}>{data.division}</strong>
              </div>
              <div>
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Final Result</span>
                <span
                  className={'inline-block px-2 py-0.5 font-black uppercase rounded ' + (data.result === 'PASS' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900')}
                  style={{ fontSize: '8.5pt' }}
                >
                  {data.result}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 12. ADDITIONAL SUMMARY CARD (172mm) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-slate-300 bg-white/85 px-3 py-1 mt-1.5 flex items-center justify-between text-slate-800"
            style={{ fontSize: '6.5pt' }}
          >
            <div>
              <span className="text-slate-500 font-semibold uppercase">Attendance:</span>{' '}
              <strong className="font-mono text-slate-900">{data.attendance || '214 / 225 Days'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold uppercase">Class Rank:</span>{' '}
              <strong className="text-[#0F2756]">{data.class_rank || '1st Position'}</strong>
            </div>
            <div className="truncate max-w-[70mm]">
              <span className="text-slate-500 font-semibold uppercase">Remarks:</span>{' '}
              <span className="italic font-medium text-slate-700">{data.remarks || 'Outstanding academic performance and discipline.'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold uppercase">Status:</span>{' '}
              <strong className="text-emerald-700">OFFICIALLY ISSUED</strong>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 13. QR VERIFICATION & 14. TWO SIGNATURES SECTION (CLASS TEACHER & PRINCIPAL) */}
          {/* ========================================================================= */}
          <div className="w-full pt-1.5 mt-auto border-t border-slate-300/80 flex items-end justify-between gap-4">
            {/* Left: QR Code & Direct Verification URL (Offset with pl-2 to avoid corner border) */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-[19mm] h-[19mm] bg-white p-1 rounded border border-slate-300 shrink-0 flex items-center justify-center shadow-2xs">
                {qrDataUri ? (
                  <img src={qrDataUri} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-full h-full text-slate-900" />
                )}
              </div>
              <div className="text-slate-600 leading-tight space-y-0.5" style={{ fontSize: '6pt' }}>
                <span className="font-bold text-[#0F2756] block uppercase tracking-wider">SECURE DIGITAL VERIFICATION</span>
                <span className="font-mono text-slate-700 font-bold block">ID: {data.verification_id}</span>
                <span className="text-slate-500 block">Scan QR code to verify authentic CBSE record</span>
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold block truncate hover:underline"
                  style={{ fontSize: '6pt' }}
                >
                  {origin ? origin.replace(/^https?:\/\//, '') : 'don-bosco-academy.vercel.app'}/verify?id={data.verification_id}
                </a>
              </div>
            </div>

            {/* Center: Institutional Seal (Using working SVG) */}
            <div className="text-center">
              <div className="p-0.5 bg-white rounded-xl border border-slate-200 shadow-2xs inline-block">
                <img
                  src="/assets/branding/don-bosco-stamp.svg"
                  alt="Institutional Seal"
                  style={{ width: '48px', height: '48px' }}
                  className="w-[15mm] h-[15mm] mx-auto object-contain opacity-95"
                />
              </div>
              <span className="block text-[5.5pt] font-black text-slate-600 uppercase tracking-wider mt-0.5">Official School Seal</span>
            </div>

            {/* Right: Two Signatures (Class Teacher & Principal) */}
            <div className="flex gap-6 text-center items-end">
              {/* 1. Class Teacher */}
              <div className="w-[32mm]">
                <div className="h-[9mm]"></div>
                <div className="border-t-2 border-slate-500 pt-0.5 text-slate-800 font-bold uppercase" style={{ fontSize: '7pt' }}>
                  Class Teacher
                </div>
              </div>

              {/* 2. Principal & Authorized Signatory */}
              <div className="w-[36mm]">
                <img
                  src="/assets/branding/principal-signature.svg"
                  alt="Principal Signature"
                  style={{ height: '30px', maxWidth: '120px' }}
                  className="h-[8mm] mx-auto object-contain mb-0.5"
                />
                <div className="border-t-2 border-slate-500 pt-0.5 text-slate-900 font-bold uppercase leading-none" style={{ fontSize: '7pt' }}>
                  Principal
                </div>
                <div className="text-slate-500 font-semibold leading-none mt-0.5" style={{ fontSize: '5.5pt' }}>
                  Md. Shami Ahmad
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 15. FOOTER */}
          {/* ========================================================================= */}
          <div className="text-center text-slate-400 font-medium pt-0.5 pb-0.5" style={{ fontSize: '5.5pt' }}>
            This is a computer-generated official academic marksheet &bull; Don Bosco Academy &bull; Estd. 1997
          </div>
        </div>
      </div>
    </div>
  );
};
