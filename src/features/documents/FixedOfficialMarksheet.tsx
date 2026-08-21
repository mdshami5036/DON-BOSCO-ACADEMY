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
          {/* 5. HEADER SECTION */}
          {/* School Name: 22–24 pt | Address: 8.5–9 pt | Affiliation: 7.5–8 pt | Title: 15–17 pt */}
          {/* ========================================================================= */}
          <div className="text-center relative pt-0.5 w-full">
            <h1
              className="font-bold tracking-tight uppercase text-[#0F2756]"
              style={{
                fontFamily: 'Georgia, "Times New Roman", Garamond, serif',
                fontSize: '23pt', // School Name: 22–24 pt
                lineHeight: '1.1',
                letterSpacing: '0.8px',
              }}
            >
              {data.school_name || 'DON BOSCO ACADEMY'}
            </h1>

            <p className="text-slate-700 font-semibold mt-1" style={{ fontSize: '9pt', lineHeight: '1.2' }}>
              {/* School Address: 8.5–9 pt */}
              {data.school_address || 'Raipur Bazar, Nanpur, Sitamarhi (Bihar) - 843326'}
            </p>

            <p className="text-slate-600 font-medium mt-0.5" style={{ fontSize: '8pt', lineHeight: '1.2' }}>
              {/* Affiliation / School Code: 7.5–8 pt */}
              {data.affiliation_text || 'Affiliated to CBSE, New Delhi • School Code: 65001 • UDISE Code: 100204001'}
            </p>

            {/* MARKSHEET Title: 15–17 pt */}
            <div className="mt-2 inline-block">
              <span
                className="font-bold tracking-wider uppercase text-[#0F2756] border-y-2 border-[#0F2756] px-6 py-0.5 inline-block"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", Garamond, serif',
                  fontSize: '16pt', // MARKSHEET Title: 15–17 pt
                  letterSpacing: '1.5px',
                }}
              >
                {data.marksheet_title || 'ANNUAL EXAMINATION MARKSHEET'}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. EXAMINATION INFORMATION CARD (172mm - Transparent See-Through) */}
          {/* Exam Info Labels: 7.5–8 pt | Exam Info Values: 8.5–9 pt */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/60 bg-transparent mt-1"
            style={{ padding: '4px 8px' }}
          >
            <div className="grid grid-cols-6 gap-2 text-center items-center">
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Academic Session</span>
                <strong className="block text-[#0F2756] font-black" style={{ fontSize: '9pt' }}>{data.academic_session}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Examination</span>
                <strong className="block text-slate-950 font-black truncate" style={{ fontSize: '9pt' }}>{data.exam_name}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Class</span>
                <strong className="block text-slate-950 font-black" style={{ fontSize: '9pt' }}>{data.class_name}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Section</span>
                <strong className="block text-slate-950 font-black" style={{ fontSize: '9pt' }}>{data.section_name}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30 pr-1">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Marksheet No.</span>
                <strong className="block font-mono text-[#0F2756] font-black truncate" style={{ fontSize: '9pt' }}>{data.marksheet_no}</strong>
              </div>
              <div>
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Issue Date</span>
                <strong className="block font-mono text-slate-950 font-black" style={{ fontSize: '9pt' }}>{formatDDMMYYYY(data.issue_date)}</strong>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. STUDENT INFORMATION CARD (172mm x ~34mm - Transparent See-Through) */}
          {/* Student Labels: 8 pt | Student Values: 8.5–9 pt */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/60 bg-transparent p-2 mt-1 flex gap-4 items-center"
            style={{ height: '34mm', minHeight: '34mm', maxHeight: '34mm' }}
          >
            {/* Left & Middle Info Columns */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-slate-900 flex-1 leading-snug">
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Student Name:</span>
                <strong className="text-[#0F2756] uppercase font-black truncate" style={{ fontSize: '9pt' }}>{data.student_name}</strong>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Roll Number:</span>
                <strong className="font-mono text-slate-950 font-black" style={{ fontSize: '9pt' }}>{data.roll_no}</strong>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Father's Name:</span>
                <span className="font-extrabold text-slate-950 truncate" style={{ fontSize: '9pt' }}>{data.father_name || '—'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Date of Birth:</span>
                <span className="font-mono font-black text-slate-950" style={{ fontSize: '9pt' }}>{formatDDMMYYYY(data.dob)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Mother's Name:</span>
                <span className="font-extrabold text-slate-950 truncate" style={{ fontSize: '9pt' }}>{data.mother_name || '—'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Gender:</span>
                <span className="font-black text-slate-950" style={{ fontSize: '9pt' }}>{data.gender}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Admission No:</span>
                <strong className="font-mono text-[#0F2756] font-black" style={{ fontSize: '9pt' }}>{data.admission_no}</strong>
              </div>
              <div className="flex items-center">
                <span className="text-slate-700 font-black w-[26mm] shrink-0" style={{ fontSize: '8pt' }}>Reg. Number:</span>
                <span className="font-mono font-black text-slate-800" style={{ fontSize: '9pt' }}>{data.registration_no || 'DBA/' + data.admission_no}</span>
              </div>
            </div>

            {/* Right: Student Passport Photo */}
            <div
              className="shrink-0 rounded border-2 border-[#0F2756]/70 bg-white/70 p-0.5 overflow-hidden flex items-center justify-center text-center shadow-2xs"
              style={{ width: '28mm', height: '32mm' }}
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
          {/* Table Header: 7.5–8 pt | Table Data: 8–8.5 pt */}
          {/* ========================================================================= */}
          <div className="w-full border-2 border-[#0F2756]/70 rounded overflow-hidden bg-transparent mt-1">
            <table className="w-full border-collapse text-slate-950">
              <thead>
                <tr className="bg-[#0F2756] text-white font-black uppercase text-center" style={{ height: '8mm', fontSize: '8pt' }}>
                  <th style={{ width: '10mm', padding: '3px' }} className="border-r border-white/20">Sl.</th>
                  <th style={{ width: '44mm', padding: '3px 8px' }} className="text-left border-r border-white/20">Subject Name</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Full Marks</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Pass Marks</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Theory</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Practical</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Total</th>
                  <th style={{ width: '20mm', padding: '3px' }}>Grade</th>
                </tr>
              </thead>
              <tbody className="bg-transparent" style={{ fontSize: '8.5pt' }}>
                {data.subjects.map((sub, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#0F2756]/30 text-center bg-transparent"
                    style={{ height: '7.2mm' }}
                  >
                    <td className="font-mono text-slate-700 border-r border-[#0F2756]/30 font-black">{idx + 1}</td>
                    <td className="text-left font-black text-slate-950 px-2.5 border-r border-[#0F2756]/30 truncate" style={{ fontSize: '8.5pt' }}>{sub.subject_name}</td>
                    <td className="font-mono text-slate-900 border-r border-[#0F2756]/30 font-bold" style={{ fontSize: '8.5pt' }}>{sub.full_marks}</td>
                    <td className="font-mono text-slate-900 border-r border-[#0F2756]/30 font-bold" style={{ fontSize: '8.5pt' }}>{sub.pass_marks}</td>
                    <td className="font-mono font-black text-slate-950 border-r border-[#0F2756]/30" style={{ fontSize: '8.5pt' }}>{sub.theory_marks}</td>
                    <td className="font-mono text-slate-900 border-r border-[#0F2756]/30 font-bold" style={{ fontSize: '8.5pt' }}>
                      {sub.practical_marks !== null && sub.practical_marks !== undefined ? sub.practical_marks : '—'}
                    </td>
                    <td className="font-mono font-black text-[#0F2756] border-r border-[#0F2756]/30" style={{ fontSize: '8.5pt' }}>{sub.total_marks}</td>
                    <td className="font-black text-slate-950" style={{ fontSize: '8.5pt' }}>{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* 11. RESULT SUMMARY CARD (172mm x ~16mm - Transparent See-Through) */}
          {/* Section Heading / Labels: 8–9.5 pt | Total / Percentage Values: 10–11 pt | Result PASS/FAIL: 10–11 pt bold */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border-2 border-[#0F2756] bg-transparent p-1.5 mt-1"
            style={{ height: '16mm', minHeight: '16mm' }}
          >
            <div className="grid grid-cols-6 gap-2 text-center items-center h-full">
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Total Full Marks</span>
                <strong className="block font-mono text-slate-950 font-black" style={{ fontSize: '10.5pt' }}>{data.total_full_marks}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Marks Obtained</span>
                <strong className="block font-mono text-[#0F2756] font-black" style={{ fontSize: '10.5pt' }}>{data.total_marks_obtained}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Percentage</span>
                <strong className="block font-mono text-emerald-900 font-black" style={{ fontSize: '10.5pt' }}>{data.percentage.toFixed(2)}%</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Overall Grade</span>
                <strong className="block text-[#0F2756] font-black" style={{ fontSize: '10.5pt' }}>{data.overall_grade}</strong>
              </div>
              <div className="border-r border-[#0F2756]/30">
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Division</span>
                <strong className="block text-slate-950 font-black" style={{ fontSize: '10pt' }}>{data.division}</strong>
              </div>
              <div>
                <span className="block text-slate-700 uppercase font-black" style={{ fontSize: '8pt' }}>Final Result</span>
                <span
                  className={'inline-block px-2.5 py-0.5 font-black uppercase rounded border ' + (data.result === 'PASS' ? 'bg-emerald-100/90 text-emerald-950 border-emerald-400' : 'bg-rose-100/90 text-rose-950 border-rose-400')}
                  style={{ fontSize: '10.5pt' }} // Result PASS/FAIL: 10–11 pt bold
                >
                  {data.result}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 12. ADDITIONAL SUMMARY CARD (172mm - Transparent See-Through) */}
          {/* Section Heading: 9.5–10 pt | Labels: 8 pt | Values: 8.5–9 pt */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/40 bg-transparent px-3 py-1 mt-1 flex items-center justify-between text-slate-900"
          >
            <div>
              <span className="text-slate-700 font-black uppercase" style={{ fontSize: '8pt' }}>Attendance:</span>{' '}
              <strong className="font-mono text-slate-950 font-black" style={{ fontSize: '9pt' }}>{data.attendance || '214 / 225 Days'}</strong>
            </div>
            <div>
              <span className="text-slate-700 font-black uppercase" style={{ fontSize: '8pt' }}>Class Rank:</span>{' '}
              <strong className="text-[#0F2756] font-black" style={{ fontSize: '9pt' }}>{data.class_rank || '1st Position'}</strong>
            </div>
            <div className="truncate max-w-[70mm]">
              <span className="text-slate-700 font-black uppercase" style={{ fontSize: '8pt' }}>Remarks:</span>{' '}
              <span className="italic font-bold text-slate-800" style={{ fontSize: '8.5pt' }}>{data.remarks || 'Outstanding academic performance and discipline.'}</span>
            </div>
            <div>
              <span className="text-slate-700 font-black uppercase" style={{ fontSize: '8pt' }}>Status:</span>{' '}
              <strong className="text-emerald-800 font-black" style={{ fontSize: '8.5pt' }}>OFFICIALLY ISSUED</strong>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 13. OFFICIAL SIGNATURES & INSTITUTIONAL SEAL ROW */}
          {/* Signature Labels: 7.5–8 pt */}
          {/* ========================================================================= */}
          <div className="w-full pt-2 mt-1 flex items-end justify-between gap-6 px-2">
            {/* Left: Class Teacher Signature */}
            <div className="w-[36mm] text-center">
              <div className="h-[9mm] flex items-end justify-center">
                <span className="text-[7pt] font-mono text-slate-400 italic">Signature Verified</span>
              </div>
              <div className="border-t-2 border-slate-600 pt-0.5 text-slate-900 font-bold uppercase" style={{ fontSize: '8pt' }}>
                Class Teacher
              </div>
            </div>

            {/* Center: Institutional Seal */}
            <div className="text-center space-y-0.5">
              <div className="p-0.5 bg-white rounded-xl border border-slate-200 shadow-2xs inline-block">
                <img
                  src="/assets/branding/don-bosco-stamp.svg"
                  alt="Institutional Seal"
                  style={{ width: '44px', height: '44px' }}
                  className="w-[13mm] h-[13mm] mx-auto object-contain opacity-95"
                />
              </div>
              <span className="block text-[7.5pt] font-black text-slate-700 uppercase tracking-wider">Institutional Seal</span>
            </div>

            {/* Right: Principal & Authorized Signatory */}
            <div className="w-[40mm] text-center">
              <div className="h-[9mm] flex items-end justify-center">
                <img
                  src="/assets/branding/principal-signature.svg"
                  alt="Principal Signature"
                  style={{ height: '30px', maxWidth: '120px' }}
                  className="mx-auto object-contain"
                />
              </div>
              <div className="border-t-2 border-slate-600 pt-0.5 text-slate-900 font-extrabold uppercase leading-none" style={{ fontSize: '8pt' }}>
                Principal
              </div>
              <div className="text-slate-600 font-semibold leading-none mt-0.5" style={{ fontSize: '7pt' }}>
                Md. Shami Ahmad
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 14. BOTTOM DIGITAL QR VERIFICATION BAR & 15. FOOTER */}
          {/* Verification Text: 7–7.5 pt | Footer: 6.5–7 pt */}
          {/* ========================================================================= */}
          <div className="w-full pt-1.5 mt-auto border-t border-slate-300/80 flex items-center justify-between gap-4 px-2">
            {/* Left: QR Code with Encoded Verify URL */}
            <div className="flex items-center gap-2.5">
              <div className="w-[17mm] h-[17mm] bg-white p-1 rounded border border-slate-300 shrink-0 flex items-center justify-center shadow-2xs">
                {qrDataUri ? (
                  <img src={qrDataUri} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-full h-full text-slate-900" />
                )}
              </div>
              <div className="text-slate-700 leading-tight space-y-0.5" style={{ fontSize: '7.5pt' }}>
                {/* Verification Text: 7–7.5 pt */}
                <span className="font-bold text-[#0F2756] block uppercase tracking-wider" style={{ fontSize: '7.5pt' }}>
                  SECURE DIGITAL QR VERIFICATION
                </span>
                <span className="font-mono text-slate-800 font-bold block" style={{ fontSize: '7.5pt' }}>
                  ID: {data.verification_id}
                </span>
                <span className="text-slate-500 block" style={{ fontSize: '7pt' }}>
                  Scan QR code using camera to verify authentic marksheet
                </span>
              </div>
            </div>

            {/* Right: Computer Generated Footer Note (Footer: 6.5–7 pt) */}
            <div className="text-right text-slate-500 font-medium leading-tight" style={{ fontSize: '7pt' }}>
              <div>This is a computer-generated official academic marksheet.</div>
              <div className="text-slate-600 font-semibold">Don Bosco Academy &bull; Estd. 1997</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
