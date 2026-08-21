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
          {/* 6. EXAMINATION INFORMATION CARD (172mm - Transparent See-Through) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/60 bg-transparent mt-1.5"
            style={{ padding: '4px 8px' }}
          >
            <div className="grid grid-cols-6 gap-2 text-center items-center">
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '7.5pt' }}>Academic Session</span>
                <strong className="block text-[#0F2756] font-black" style={{ fontSize: '10.5pt' }}>{data.academic_session}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '7.5pt' }}>Examination</span>
                <strong className="block text-slate-950 font-black truncate" style={{ fontSize: '10pt' }}>{data.exam_name}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '7.5pt' }}>Class</span>
                <strong className="block text-slate-950 font-black" style={{ fontSize: '10.5pt' }}>{data.class_name}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '7.5pt' }}>Section</span>
                <strong className="block text-slate-950 font-black" style={{ fontSize: '10.5pt' }}>{data.section_name}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '7.5pt' }}>Marksheet No.</span>
                <strong className="block font-mono text-[#0F2756] font-black truncate" style={{ fontSize: '10pt' }}>{data.marksheet_no}</strong>
              </div>
              <div>
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '7.5pt' }}>Issue Date</span>
                <strong className="block font-mono text-slate-950 font-black" style={{ fontSize: '10pt' }}>{formatDDMMYYYY(data.issue_date)}</strong>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. STUDENT INFORMATION CARD (172mm x ~36mm - Transparent See-Through) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/60 bg-transparent p-2.5 mt-1.5 flex gap-4 items-center"
            style={{ height: '36mm', minHeight: '36mm', maxHeight: '36mm' }}
          >
            {/* Left & Middle Info Columns */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-slate-900 flex-1 leading-snug">
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Student Name:</span>
                <strong className="text-[#0F2756] uppercase font-black truncate" style={{ fontSize: '12pt' }}>{data.student_name}</strong>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Roll Number:</span>
                <strong className="font-mono text-slate-950 font-black" style={{ fontSize: '11.5pt' }}>{data.roll_no}</strong>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Father's Name:</span>
                <span className="font-extrabold text-slate-950 truncate" style={{ fontSize: '9.5pt' }}>{data.father_name || '—'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Date of Birth:</span>
                <span className="font-mono font-black text-slate-950" style={{ fontSize: '10pt' }}>{formatDDMMYYYY(data.dob)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Mother's Name:</span>
                <span className="font-extrabold text-slate-950 truncate" style={{ fontSize: '9.5pt' }}>{data.mother_name || '—'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Gender:</span>
                <span className="font-black text-slate-950" style={{ fontSize: '9.5pt' }}>{data.gender}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Admission No:</span>
                <strong className="font-mono text-[#0F2756] font-black" style={{ fontSize: '11pt' }}>{data.admission_no}</strong>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[27mm] shrink-0" style={{ fontSize: '8.5pt' }}>Reg. Number:</span>
                <span className="font-mono font-black text-slate-800" style={{ fontSize: '9.5pt' }}>{data.registration_no || 'DBA/' + data.admission_no}</span>
              </div>
            </div>

            {/* Right: Student Passport Photo */}
            <div
              className="shrink-0 rounded border-2 border-[#0F2756]/70 bg-white/70 p-0.5 overflow-hidden flex items-center justify-center text-center shadow-2xs"
              style={{ width: '30mm', height: '34mm' }}
            >
              {data.photo_url ? (
                <img
                  src={data.photo_url}
                  alt={data.student_name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-slate-600 font-black tracking-wider" style={{ fontSize: '7pt' }}>
                  STUDENT<br />PHOTO
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 8. MARKS TABLE (172mm - Transparent See-Through) */}
          {/* ========================================================================= */}
          <div className="w-full border border-[#0F2756]/60 rounded overflow-hidden bg-transparent mt-1.5">
            <table className="w-full border-collapse text-slate-950" style={{ fontSize: '7.5pt' }}>
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
              <tbody className="bg-transparent">
                {data.subjects.map((sub, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#0F2756]/20 text-center bg-transparent"
                    style={{ height: '6.8mm' }}
                  >
                    <td className="font-mono text-slate-600 border-r border-[#0F2756]/20 font-bold">{idx + 1}</td>
                    <td className="text-left font-extrabold text-slate-950 px-2 border-r border-[#0F2756]/20 truncate">{sub.subject_name}</td>
                    <td className="font-mono text-slate-800 border-r border-[#0F2756]/20 font-bold">{sub.full_marks}</td>
                    <td className="font-mono text-slate-800 border-r border-[#0F2756]/20 font-bold">{sub.pass_marks}</td>
                    <td className="font-mono font-bold text-slate-950 border-r border-[#0F2756]/20">{sub.theory_marks}</td>
                    <td className="font-mono text-slate-800 border-r border-[#0F2756]/20 font-bold">
                      {sub.practical_marks !== null && sub.practical_marks !== undefined ? sub.practical_marks : '—'}
                    </td>
                    <td className="font-mono font-black text-[#0F2756] border-r border-[#0F2756]/20">{sub.total_marks}</td>
                    <td className="font-black text-slate-950">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* 11. RESULT SUMMARY CARD (172mm x ~16mm - Transparent See-Through) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border-2 border-[#0F2756] bg-transparent p-1.5 mt-1.5"
            style={{ height: '16mm', minHeight: '16mm' }}
          >
            <div className="grid grid-cols-6 gap-2 text-center items-center h-full">
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-600 uppercase font-bold" style={{ fontSize: '6.5pt' }}>Total Full Marks</span>
                <strong className="block font-mono text-slate-950 font-black" style={{ fontSize: '9pt' }}>{data.total_full_marks}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-600 uppercase font-bold" style={{ fontSize: '6.5pt' }}>Marks Obtained</span>
                <strong className="block font-mono text-[#0F2756] font-black" style={{ fontSize: '10pt' }}>{data.total_marks_obtained}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-600 uppercase font-bold" style={{ fontSize: '6.5pt' }}>Percentage</span>
                <strong className="block font-mono text-emerald-900 font-black" style={{ fontSize: '10pt' }}>{data.percentage.toFixed(2)}%</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-600 uppercase font-bold" style={{ fontSize: '6.5pt' }}>Overall Grade</span>
                <strong className="block text-[#0F2756] font-black" style={{ fontSize: '10pt' }}>{data.overall_grade}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-600 uppercase font-bold" style={{ fontSize: '6.5pt' }}>Division</span>
                <strong className="block text-slate-950 font-black" style={{ fontSize: '8pt' }}>{data.division}</strong>
              </div>
              <div>
                <span className="block text-slate-600 uppercase font-bold" style={{ fontSize: '6.5pt' }}>Final Result</span>
                <span
                  className={'inline-block px-2.5 py-0.5 font-black uppercase rounded border ' + (data.result === 'PASS' ? 'bg-emerald-100/90 text-emerald-950 border-emerald-400' : 'bg-rose-100/90 text-rose-950 border-rose-400')}
                  style={{ fontSize: '8.5pt' }}
                >
                  {data.result}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 12. ADDITIONAL SUMMARY CARD (172mm - Transparent See-Through) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/40 bg-transparent px-3 py-1 mt-1.5 flex items-center justify-between text-slate-900"
            style={{ fontSize: '6.5pt' }}
          >
            <div>
              <span className="text-slate-600 font-bold uppercase">Attendance:</span>{' '}
              <strong className="font-mono text-slate-950 font-black">{data.attendance || '214 / 225 Days'}</strong>
            </div>
            <div>
              <span className="text-slate-600 font-bold uppercase">Class Rank:</span>{' '}
              <strong className="text-[#0F2756] font-black">{data.class_rank || '1st Position'}</strong>
            </div>
            <div className="truncate max-w-[70mm]">
              <span className="text-slate-600 font-bold uppercase">Remarks:</span>{' '}
              <span className="italic font-bold text-slate-800">{data.remarks || 'Outstanding academic performance and discipline.'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-bold uppercase">Status:</span>{' '}
              <strong className="text-emerald-800 font-black">OFFICIALLY ISSUED</strong>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 13. OFFICIAL SIGNATURES & INSTITUTIONAL SEAL ROW (Higher Up & Prominent) */}
          {/* ========================================================================= */}
          <div className="w-full pt-3 mt-1 flex items-end justify-between gap-6 px-2">
            {/* Left: Class Teacher Signature */}
            <div className="w-[36mm] text-center">
              <div className="h-[10mm] flex items-end justify-center">
                <span className="text-[6.5pt] font-mono text-slate-400 italic">Signature Verified</span>
              </div>
              <div className="border-t-2 border-slate-600 pt-0.5 text-slate-900 font-bold uppercase" style={{ fontSize: '7.5pt' }}>
                Class Teacher
              </div>
            </div>

            {/* Center: Institutional Seal */}
            <div className="text-center space-y-0.5">
              <div className="p-0.5 bg-white rounded-xl border border-slate-200 shadow-2xs inline-block">
                <img
                  src="/assets/branding/don-bosco-stamp.svg"
                  alt="Institutional Seal"
                  style={{ width: '46px', height: '46px' }}
                  className="w-[14mm] h-[14mm] mx-auto object-contain opacity-95"
                />
              </div>
              <span className="block text-[6pt] font-black text-slate-700 uppercase tracking-wider">Institutional Seal</span>
            </div>

            {/* Right: Principal & Authorized Signatory */}
            <div className="w-[40mm] text-center">
              <div className="h-[10mm] flex items-end justify-center">
                <img
                  src="/assets/branding/principal-signature.svg"
                  alt="Principal Signature"
                  style={{ height: '32px', maxWidth: '130px' }}
                  className="mx-auto object-contain"
                />
              </div>
              <div className="border-t-2 border-slate-600 pt-0.5 text-slate-900 font-extrabold uppercase leading-none" style={{ fontSize: '7.5pt' }}>
                Principal
              </div>
              <div className="text-slate-600 font-semibold leading-none mt-0.5" style={{ fontSize: '6pt' }}>
                Md. Shami Ahmad
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 14. BOTTOM DIGITAL QR VERIFICATION BAR (URL Encoded In QR, No Raw Text URL) */}
          {/* ========================================================================= */}
          <div className="w-full pt-2 mt-auto border-t border-slate-300/80 flex items-center justify-between gap-4 px-2">
            {/* Left: QR Code with Encoded Verify URL */}
            <div className="flex items-center gap-2.5">
              <div className="w-[18mm] h-[18mm] bg-white p-1 rounded border border-slate-300 shrink-0 flex items-center justify-center shadow-2xs">
                {qrDataUri ? (
                  <img src={qrDataUri} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-full h-full text-slate-900" />
                )}
              </div>
              <div className="text-slate-600 leading-tight space-y-0.5" style={{ fontSize: '6pt' }}>
                <span className="font-bold text-[#0F2756] block uppercase tracking-wider">SECURE DIGITAL QR VERIFICATION</span>
                <span className="font-mono text-slate-800 font-bold block">ID: {data.verification_id}</span>
                <span className="text-slate-500 block">Scan QR code using camera to verify authentic marksheet</span>
              </div>
            </div>

            {/* Right: Computer Generated Footer Note */}
            <div className="text-right text-slate-400 font-medium leading-tight" style={{ fontSize: '5.5pt' }}>
              <div>This is a computer-generated official academic marksheet.</div>
              <div className="text-slate-500 font-semibold">Don Bosco Academy &bull; Estd. 1997</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
