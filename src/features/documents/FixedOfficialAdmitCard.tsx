import React from 'react';
import { formatDDMMYYYY } from '../../lib/date-utils';

export interface AdmitCardData {
  school_name?: string;
  school_address?: string;
  school_affiliation?: string;
  school_code?: string;
  udise_code?: string;
  school_contact?: string;
  academic_session: string;
  exam_name: string;
  admit_card_no: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  dob: string;
  gender: string;
  class_name: string;
  section_name?: string;
  roll_number: string;
  admission_no: string;
  registration_no?: string;
  photo_url?: string;
  exam_center?: string;
  center_address?: string;
  center_code?: string;
  exam_start_time?: string;
  reporting_time?: string;
  timetable: Array<{
    subject: string;
    date: string;
    day?: string;
    time?: string;
    reporting_time?: string;
    room?: string;
  }>;
  principal_name?: string;
  principal_signature_url?: string;
}

interface FixedOfficialAdmitCardProps {
  data: AdmitCardData;
}

// Helper to compute Day of the week from DD/MM/YYYY or YYYY-MM-DD
function getDayName(dateStr: string): string {
  if (!dateStr) return 'Monday';
  try {
    let d: Date;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        d = new Date(dateStr);
      }
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return 'Monday';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()];
  } catch {
    return 'Monday';
  }
}

export const FixedOfficialAdmitCard: React.FC<FixedOfficialAdmitCardProps> = ({ data }) => {
  const schoolName = data.school_name || 'DON BOSCO ACADEMY';
  const schoolAddress = data.school_address || 'Raipur Bazar, PS Nanpur, District Sitamarhi, Bihar - Pin Code 843326';
  const schoolAffiliation = data.school_affiliation || 'Affiliated to CBSE (Affiliation No. 1234567)';
  const schoolCode = data.school_code || '12345';
  const udiseCode = data.udise_code || '12345678901';
  const examCenter = data.exam_center || 'Don Bosco Academy Main Campus, Sitamarhi';
  const centerAddress = data.center_address || 'Raipur Bazar, PS Nanpur, Sitamarhi (Bihar) - 843326';
  const centerCode = data.center_code || 'DBA-CTR-101';
  const examStartTime = data.exam_start_time || '10:00 AM';
  const reportingTime = data.reporting_time || '09:30 AM (30 Min Before Exam)';

  return (
    <div className="fixed-admit-card-root flex justify-center items-center">
      {/* Exact A4 Portrait Dimensions (210mm x 297mm) */}
      <div
        className="a4-admit-card-canvas relative box-border overflow-hidden bg-white text-slate-900 shadow-2xl print:shadow-none"
        style={{
          width: '210mm',
          minWidth: '210mm',
          maxWidth: '210mm',
          height: '297mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          padding: '8mm 10mm 8mm 10mm', // Perfectly calibrated A4 margins
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          pageBreakAfter: 'avoid',
          pageBreakInside: 'avoid',
          boxSizing: 'border-box',
        }}
      >
        {/* Central School Watermark */}
        <img
          src="/assets/branding/don-bosco-logo.png"
          alt="Watermark"
          style={{ width: '85mm', height: '85mm' }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.038] pointer-events-none object-contain select-none z-0"
        />

        {/* Outer Double Security Border Container */}
        <div
          className="relative z-10 w-full h-full border-2 border-[#0F2756] rounded-xl p-3 flex flex-col justify-start gap-2.5"
          style={{ boxSizing: 'border-box' }}
        >
          {/* ========================================================================= */}
          {/* 1. HEADER SECTION */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 border-b-2 border-[#0F2756] pb-1.5">
              {/* Left: School Crest Logo */}
              <div className="shrink-0 flex items-center justify-center">
                <img
                  src="/assets/branding/don-bosco-logo.png"
                  alt="School Crest"
                  style={{ width: '50px', height: '50px' }}
                  className="object-contain rounded-lg border border-slate-300 p-0.5 bg-white shadow-2xs"
                />
              </div>

              {/* Center: School Particulars */}
              <div className="text-center flex-1">
                <h1
                  className="font-black tracking-tight uppercase text-[#0F2756] leading-none"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", Garamond, serif',
                    fontSize: '18pt',
                    letterSpacing: '0.8px',
                  }}
                >
                  {schoolName}
                </h1>
                <p className="text-slate-800 font-semibold text-[7.5pt] mt-0.5 leading-tight">
                  {schoolAddress}
                </p>
                <p className="text-slate-700 font-medium text-[7pt] mt-0.5 leading-tight">
                  {schoolAffiliation} | School Code: {schoolCode} | UDISE Code: {udiseCode}
                </p>
              </div>

              {/* Right: Academic Session Badge */}
              <div className="shrink-0 text-right">
                <div className="bg-[#0F2756]/10 border border-[#0F2756]/30 px-2 py-0.5 rounded text-center">
                  <span className="block text-[6pt] font-black uppercase text-slate-500">ACADEMIC SESSION</span>
                  <strong className="block text-[8.5pt] font-mono font-black text-[#0F2756]">{data.academic_session}</strong>
                </div>
              </div>
            </div>

            {/* ADMIT CARD Title Bar (Clean White / Ujla Theme) */}
            <div className="flex items-center justify-between bg-white text-[#0F2756] border-y-2 border-[#0F2756] px-2.5 py-0.5 mt-0.5">
              <span className="font-mono text-[7pt] tracking-wide font-bold text-slate-600">
                ADMIT CARD NO: <strong className="text-[#0F2756] font-black">{data.admit_card_no}</strong>
              </span>
              <h2 className="font-black uppercase tracking-widest text-[9.5pt] font-display text-[#0F2756]">
                EXAMINATION ADMIT CARD / HALL TICKET
              </h2>
              <span className="font-mono text-[7pt] tracking-wide font-bold text-slate-600">
                EXAM: <strong className="text-[#0F2756] font-black">{data.exam_name}</strong>
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. STUDENT INFORMATION SECTION (Bordered Card with Photo on Right) */}
          {/* ========================================================================= */}
          <div className="rounded-lg border border-[#0F2756]/50 bg-slate-50/40 p-2 mt-0.5">
            <div className="flex items-stretch gap-3">
              {/* Left: 2-Column Key-Value Information Grid */}
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[7.5pt]">
                <div className="flex items-center border-b border-slate-200 pb-0.5">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Candidate Name:</span>
                  <strong className="text-slate-950 font-black text-[8pt] truncate">{data.student_name}</strong>
                </div>
                <div className="flex items-center border-b border-slate-200 pb-0.5">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Admission / Reg. No.:</span>
                  <strong className="text-[#0F2756] font-mono font-black text-[8pt] truncate">
                    {data.admission_no} {data.registration_no ? `(${data.registration_no})` : ''}
                  </strong>
                </div>
                <div className="flex items-center border-b border-slate-200 pb-0.5">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Father's Name:</span>
                  <span className="text-slate-900 font-bold truncate">{data.father_name || 'N/A'}</span>
                </div>
                <div className="flex items-center border-b border-slate-200 pb-0.5">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Mother's Name:</span>
                  <span className="text-slate-900 font-bold truncate">{data.mother_name || 'N/A'}</span>
                </div>
                <div className="flex items-center border-b border-slate-200 pb-0.5">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Class &amp; Section:</span>
                  <strong className="text-slate-900 font-black text-[8pt]">
                    {data.class_name} {data.section_name ? `(Section ${data.section_name})` : ''}
                  </strong>
                </div>
                <div className="flex items-center border-b border-slate-200 pb-0.5">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Roll Number:</span>
                  <strong className="text-[#0F2756] font-mono font-black text-[8.5pt]">{data.roll_number}</strong>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Date of Birth:</span>
                  <span className="text-slate-900 font-mono font-bold">{formatDDMMYYYY(data.dob)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-600 font-bold w-[26mm] shrink-0">Gender:</span>
                  <span className="text-slate-900 font-bold">{data.gender || 'Male'}</span>
                </div>
              </div>

              {/* Right: Student Passport Photograph */}
              <div
                className="shrink-0 rounded border-2 border-[#0F2756] bg-white p-0.5 overflow-hidden flex items-center justify-center text-center shadow-2xs"
                style={{ width: '26mm', height: '32mm' }}
              >
                {data.photo_url ? (
                  <img
                    src={data.photo_url}
                    alt={data.student_name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-slate-400 font-black text-[6pt] tracking-wider leading-tight">
                    CANDIDATE<br />PHOTOGRAPH
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. EXAM CENTRE SECTION */}
          {/* ========================================================================= */}
          <div className="rounded-lg border border-[#0F2756]/50 bg-transparent mt-0.5 p-1.5">
            <div className="text-[7pt] font-black uppercase text-[#0F2756] tracking-wider border-b border-[#0F2756]/20 pb-0.5 mb-1 flex items-center justify-between">
              <span>🏛️ EXAMINATION CENTRE &amp; TIMING DETAILS</span>
              <span className="font-mono text-slate-500">CENTRE CODE: <strong className="text-slate-900">{centerCode}</strong></span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[7pt]">
              <div>
                <span className="text-slate-500 font-bold block">Examination Centre:</span>
                <strong className="text-slate-900 font-black text-[7.5pt] block truncate">{examCenter}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Centre Address:</span>
                <span className="text-slate-800 font-semibold block truncate">{centerAddress}</span>
              </div>
              <div className="flex items-center justify-between gap-1 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 font-bold block text-[6pt]">EXAM TIME</span>
                  <strong className="text-[#0F2756] font-mono font-black text-[7pt]">{examStartTime}</strong>
                </div>
                <div className="border-l border-slate-300 pl-2">
                  <span className="text-slate-500 font-bold block text-[6pt]">REPORTING TIME</span>
                  <strong className="text-rose-900 font-mono font-black text-[7pt]">{reportingTime}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. EXAMINATION SCHEDULE TABLE */}
          {/* ========================================================================= */}
          <div className="w-full border-2 border-[#0F2756] rounded-lg overflow-hidden mt-0.5">
            <div className="bg-white text-[#0F2756] border-b-2 border-[#0F2756] px-2.5 py-1 flex items-center justify-between">
              <h3 className="font-black uppercase tracking-wider text-[8pt] text-[#0F2756]">
                📅 EXAMINATION SCHEDULE &amp; SUBJECT TIMETABLE
              </h3>
              <span className="text-[7pt] font-bold text-slate-600">
                Total Papers: <strong className="text-[#0F2756]">{data.timetable.length} Subjects</strong>
              </span>
            </div>

            <table className="w-full border-collapse text-slate-950 text-[7pt]">
              <thead>
                <tr className="bg-slate-100 font-black uppercase text-center border-b border-[#0F2756]/30" style={{ height: '5.8mm' }}>
                  <th style={{ width: '10mm', padding: '1px' }} className="border-r border-slate-300">S.No.</th>
                  <th style={{ width: '24mm', padding: '1px' }} className="border-r border-slate-300">Date</th>
                  <th style={{ width: '22mm', padding: '1px' }} className="border-r border-slate-300">Day</th>
                  <th style={{ padding: '1px 6px' }} className="text-left border-r border-slate-300">Subject Name</th>
                  <th style={{ width: '38mm', padding: '1px' }} className="border-r border-slate-300">Exam Time</th>
                  <th style={{ width: '24mm', padding: '1px' }} className="border-r border-slate-300">Reporting</th>
                  <th style={{ width: '24mm', padding: '1px' }}>Invigilator Sign</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#0F2756]/20">
                {data.timetable.map((item, idx) => (
                  <tr
                    key={idx}
                    className="text-center"
                    style={{ height: '5.5mm', lineHeight: '1' }}
                  >
                    <td className="font-mono text-slate-700 border-r border-[#0F2756]/20 font-bold">{idx + 1}</td>
                    <td className="font-mono font-black text-slate-950 border-r border-[#0F2756]/20">{formatDDMMYYYY(item.date)}</td>
                    <td className="font-semibold text-slate-700 border-r border-[#0F2756]/20">{item.day || getDayName(item.date)}</td>
                    <td className="text-left font-black text-slate-950 px-2 border-r border-[#0F2756]/20 truncate">{item.subject}</td>
                    <td className="font-mono text-[#0F2756] font-bold border-r border-[#0F2756]/20">{item.time || '10:00 AM - 01:00 PM'}</td>
                    <td className="font-mono text-slate-700 font-bold border-r border-[#0F2756]/20">{item.reporting_time || '09:30 AM'}</td>
                    <td className="text-center">
                      <div className="w-14 h-3 border-b border-slate-300 mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* 5. IMPORTANT INSTRUCTIONS BOX */}
          {/* ========================================================================= */}
          <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-1.5 mt-0.5">
            <div className="text-[6.5pt] font-black uppercase text-[#0F2756] tracking-wider mb-0.5 flex items-center gap-1">
              <span>⚠️ IMPORTANT INSTRUCTIONS FOR CANDIDATES:</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[6pt] text-slate-700 font-medium leading-tight">
              <div>1. Students must bring this Admit Card on every examination day.</div>
              <div>2. Students must report to the examination room before the reporting time.</div>
              <div>3. Students should carry the required stationery (pens, geometry, etc.).</div>
              <div>4. Mobile phones and unauthorized electronic devices are strictly prohibited.</div>
              <div>5. Students must strictly follow all examination rules and code of conduct.</div>
              <div>6. Admit Card must be kept clean, intact, and presented whenever requested.</div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. SIGNATURES & OFFICIAL SCHOOL SEAL / STAMP SECTION */}
          {/* ========================================================================= */}
          <div className="w-full mt-auto pt-2 flex items-end justify-between gap-4 px-2 border-t border-slate-200">
            {/* 1. Student / Candidate Signature */}
            <div className="w-[40mm] text-center">
              <div className="h-[8mm] flex items-end justify-center">
                <span className="text-[6pt] font-mono text-slate-400 italic">Candidate Sign</span>
              </div>
              <div className="border-t-2 border-slate-700 pt-0.5 text-slate-900 font-bold uppercase text-[7pt]">
                Student Signature
              </div>
            </div>

            {/* 2. Class Teacher Signature */}
            <div className="w-[40mm] text-center">
              <div className="h-[8mm] flex items-end justify-center">
                <span className="text-[6pt] font-mono text-slate-400 italic">Teacher Verified</span>
              </div>
              <div className="border-t-2 border-slate-700 pt-0.5 text-slate-900 font-bold uppercase text-[7pt]">
                Class Teacher Signature
              </div>
            </div>

            {/* 3. Official Institutional Seal / Stamp (Center) */}
            <div className="text-center">
              <div className="bg-transparent inline-block">
                <img
                  src="/assets/branding/don-bosco-stamp.svg"
                  alt="School Seal"
                  style={{ width: '18mm', height: '18mm', mixBlendMode: 'multiply' }}
                  className="w-[18mm] h-[18mm] mx-auto object-contain opacity-95"
                />
              </div>
            </div>

            {/* 4. Principal / Headmaster Signature */}
            <div className="w-[44mm] text-center">
              <div className="h-[8mm] flex items-end justify-center">
                <img
                  src="/assets/branding/principal-signature.svg"
                  alt="Principal Signature"
                  style={{ height: '26px', maxWidth: '120px' }}
                  className="mx-auto object-contain"
                />
              </div>
              <div className="border-t-2 border-slate-700 pt-0.5 text-slate-900 font-extrabold uppercase text-[7pt] leading-none">
                Principal / Headmaster
              </div>
              <div className="text-slate-600 font-semibold text-[6pt] mt-0.5">
                {data.principal_name || 'Md. Shami Ahmad'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
