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
  marksheet_no: string;
  verification_id: string;
  academic_session: string;
  exam_name: string;
  issue_date: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  admission_no: string;
  registration_no?: string;
  roll_no: string;
  dob: string;
  gender: string;
  class_name: string;
  section_name: string;
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
          padding: '22mm 18mm 13mm 18mm', // Safe margins (Left/Right: 18mm, Top: 22mm to clear top ornament, Bottom: 13mm)
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

        {/* Content Container (Constrained strictly to 174mm safe width) */}
        <div
          className="relative z-10 flex flex-col justify-between h-full"
          style={{ width: '174mm', maxWidth: '174mm', margin: '0 auto' }}
        >
          {/* ========================================================================= */}
          {/* 5. HEADER SECTION */}
          {/* ========================================================================= */}
          <div className="text-center relative pt-0.5">
            {/* School Logo (Left: 6mm offset to right, 24mm x 24mm) */}
            <div className="absolute left-[6mm] top-[1mm] w-[24mm] h-[24mm] flex items-center justify-center">
              <img
                src="/assets/branding/don-bosco-logo.png"
                alt="School Crest"
                className="w-full h-full object-contain drop-shadow-2xs"
              />
            </div>

            {/* School Title & Affiliation Details (Centered) */}
            <div className="pl-[26mm] pr-[6mm]">
              <h1
                className="font-bold tracking-tight uppercase text-[#0F2756]"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", Garamond, serif',
                  fontSize: '20.5pt',
                  lineHeight: '1.1',
                  letterSpacing: '0.6px',
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
                    fontSize: '12.5pt',
                    letterSpacing: '1.5px',
                  }}
                >
                  {data.marksheet_title || 'ANNUAL EXAMINATION MARKSHEET'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. EXAMINATION INFORMATION CARD (172mm) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/40 bg-white/85 shadow-2xs mt-2"
            style={{ padding: '4px 8px' }}
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
          {/* 7. STUDENT INFORMATION CARD (172mm x ~34mm) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border border-[#0F2756]/40 bg-white/85 p-2 shadow-2xs mt-2 flex gap-3 items-center"
            style={{ height: '34mm', minHeight: '34mm', maxHeight: '34mm' }}
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

            {/* Right: Student Passport Photo (30mm x 36mm) */}
            <div
              className="w-[28mm] h-[34mm] shrink-0 rounded border border-slate-400 bg-slate-50 p-0.5 overflow-hidden flex items-center justify-center text-center"
              style={{ width: '28mm', height: '32mm' }}
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
          <div className="w-full border border-[#0F2756]/50 rounded overflow-hidden bg-white/90 shadow-2xs mt-2">
            <table className="w-full border-collapse text-slate-900" style={{ fontSize: '7.5pt' }}>
              <thead>
                <tr className="bg-[#0F2756] text-white font-bold uppercase text-center" style={{ height: '8mm' }}>
                  <th style={{ width: '10mm', padding: '3px' }} className="border-r border-white/20">Sl.</th>
                  <th style={{ width: '42mm', padding: '3px 6px' }} className="text-left border-r border-white/20">Subject Name</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Full Marks</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Pass Marks</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Theory</th>
                  <th style={{ width: '20mm', padding: '3px' }} className="border-r border-white/20">Practical</th>
                  <th style={{ width: '22mm', padding: '3px' }} className="border-r border-white/20">Total</th>
                  <th style={{ width: '20mm', padding: '3px' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {data.subjects.map((sub, idx) => (
                  <tr
                    key={idx}
                    className={'border-b border-slate-200 text-center ' + (idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white/80')}
                    style={{ height: '7.2mm' }}
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
          {/* 11. RESULT SUMMARY CARD (172mm x ~18mm) */}
          {/* ========================================================================= */}
          <div
            className="w-full rounded border-2 border-[#0F2756] bg-[#0F2756]/5 p-2 mt-2 shadow-2xs"
            style={{ height: '17mm', minHeight: '17mm' }}
          >
            <div className="grid grid-cols-6 gap-2 text-center items-center h-full">
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Total Full Marks</span>
                <strong className="block font-mono text-slate-900 font-bold" style={{ fontSize: '9.5pt' }}>{data.total_full_marks}</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Marks Obtained</span>
                <strong className="block font-mono text-[#0F2756] font-black" style={{ fontSize: '10.5pt' }}>{data.total_marks_obtained}</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Percentage</span>
                <strong className="block font-mono text-emerald-800 font-black" style={{ fontSize: '10.5pt' }}>{data.percentage.toFixed(2)}%</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Overall Grade</span>
                <strong className="block text-[#0F2756] font-black" style={{ fontSize: '10.5pt' }}>{data.overall_grade}</strong>
              </div>
              <div className="border-r border-slate-300">
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Division</span>
                <strong className="block text-slate-900 font-bold" style={{ fontSize: '8.5pt' }}>{data.division}</strong>
              </div>
              <div>
                <span className="block text-slate-500 uppercase font-semibold" style={{ fontSize: '6.5pt' }}>Final Result</span>
                <span
                  className={'inline-block px-2 py-0.5 font-black uppercase rounded ' + (data.result === 'PASS' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900')}
                  style={{ fontSize: '9pt' }}
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
            className="w-full rounded border border-slate-300 bg-white/85 px-3 py-1.5 mt-2 flex items-center justify-between text-slate-800"
            style={{ fontSize: '7pt' }}
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
          {/* 13. QR VERIFICATION & 14. SIGNATURES SECTION */}
          {/* ========================================================================= */}
          <div className="w-full pt-2 mt-1 border-t border-slate-300/80 flex items-end justify-between gap-2">
            {/* Left: QR Code & Verification Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-[20mm] h-[20mm] bg-white p-1 rounded border border-slate-300 shrink-0 flex items-center justify-center">
                {qrDataUri ? (
                  <img src={qrDataUri} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-full h-full text-slate-900" />
                )}
              </div>
              <div className="text-slate-600 leading-tight" style={{ fontSize: '6.5pt' }}>
                <span className="font-bold text-[#0F2756] block uppercase tracking-wider">SECURE DIGITAL VERIFICATION</span>
                <span className="font-mono text-slate-500 block">ID: {data.verification_id}</span>
                <span className="text-slate-500 block mt-0.5">Scan to verify authentic CBSE record</span>
                <span className="text-emerald-700 font-semibold block">don-bosco-academy.vercel.app/verify</span>
              </div>
            </div>

            {/* Center: Institutional Seal */}
            <div className="text-center">
              <img
                src="/assets/branding/don-bosco-seal.png"
                alt="Institutional Seal"
                className="w-[18mm] h-[18mm] mx-auto object-contain opacity-90"
              />
              <span className="block text-[6pt] font-bold text-slate-500 uppercase tracking-wider mt-0.5">School Seal</span>
            </div>

            {/* Right: Three Signatures */}
            <div className="flex gap-4 text-center items-end">
              <div className="w-[24mm]">
                <div className="h-[9mm]"></div>
                <div className="border-t border-slate-500 pt-0.5 text-slate-800 font-bold uppercase" style={{ fontSize: '6.5pt' }}>
                  Class Teacher
                </div>
              </div>

              <div className="w-[24mm]">
                <div className="h-[9mm]"></div>
                <div className="border-t border-slate-500 pt-0.5 text-slate-800 font-bold uppercase" style={{ fontSize: '6.5pt' }}>
                  Exam In-Charge
                </div>
              </div>

              <div className="w-[28mm]">
                <img
                  src="/assets/branding/principal-signature.png"
                  alt="Principal Signature"
                  className="h-[8mm] mx-auto object-contain mb-0.5"
                />
                <div className="border-t border-slate-500 pt-0.5 text-slate-900 font-bold uppercase leading-none" style={{ fontSize: '6.5pt' }}>
                  Principal
                </div>
                <div className="text-slate-500 font-medium leading-none mt-0.5" style={{ fontSize: '5.5pt' }}>
                  Md. Shami Ahmad
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 15. FOOTER */}
          {/* ========================================================================= */}
          <div className="text-center text-slate-400 font-medium pt-1" style={{ fontSize: '6pt' }}>
            This is a computer-generated official academic marksheet &bull; Don Bosco Academy &bull; Estd. 1997
          </div>
        </div>
      </div>
    </div>
  );
};
