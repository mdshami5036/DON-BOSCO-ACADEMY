// HTML Template Engine for Dynamic Document Generation
import { normalizeImageUrl } from './image-helper';

export interface TemplateData {
  school_name?: string | null;
  school_code?: string | null;
  school_logo?: string | null;
  school_address?: string | null;
  school_phone?: string | null;
  school_email?: string | null;
  school_website?: string | null;
  principal_name?: string | null;
  principal_signature?: string | null;
  school_stamp?: string | null;

  student_name?: string | null;
  student_photo?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  admission_number?: string | null;
  roll_number?: string | null;
  class_name?: string | null;
  section?: string | null;
  academic_session?: string | null;
  parent_phone?: string | null;

  exam_name?: string | null;
  total_max_marks?: string | number | null;
  total_obtained_marks?: string | number | null;
  percentage?: string | number | null;
  grade?: string | null;
  result_status?: string | null;
  rank_in_class?: string | number | null;
  remarks?: string | null;

  certificate_title?: string | null;
  certificate_body?: string | null;
  certificate_number?: string | null;
  issue_date?: string | null;

  qr_code?: string | null;
  verification_code?: string | null;

  // Custom data arrays for tables
  marks_list?: Array<{
    subject_name: string;
    max_theory: number;
    max_practical: number;
    theory_obtained: number;
    practical_obtained: number;
    total_obtained: number;
    max_total: number;
    grade: string;
    remarks?: string | null;
  }>;

  schedule_list?: Array<{
    subject_name: string;
    subject_code?: string | null;
    date: string;
    time: string;
    room_no?: string | null;
  }>;

  [key: string]: any;
}

/**
 * Parses user-configured number formulas like:
 * - "{CLASS}/{YEAR}/{SEQ}" -> "LKG/2026/1"
 * - "{CLASS}/{YEAR}/{SEQ:3}" -> "10TH/2026/001"
 * - "{SCHOOL_CODE}/CERT/{YEAR}/{SEQ}" -> "XAV/CERT/2026/1"
 */
export function generateDocumentNumber(
  pattern: string = '{CLASS}/{YEAR}/{SEQ}',
  data: {
    class_name?: string | null;
    school_name?: string | null;
    school_code?: string | null;
    roll_number?: string | null;
    year?: string | number | null;
  },
  sequence: number = 1
): string {
  const currentYear = data.year || new Date().getFullYear();
  let className = (data.class_name || 'GEN').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!className) className = 'GEN';

  let schoolCode = data.school_code;
  if (!schoolCode && data.school_name) {
    const words = data.school_name.trim().split(/\s+/);
    schoolCode = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  }
  if (!schoolCode) schoolCode = 'SCH';

  let result = pattern;

  // Replace {CLASS}
  result = result.replace(/\{CLASS\}/gi, className);
  // Replace {YEAR}
  result = result.replace(/\{YEAR\}/gi, String(currentYear));
  // Replace {SCHOOL_CODE}
  result = result.replace(/\{SCHOOL_CODE\}/gi, schoolCode);
  // Replace {ROLL}
  result = result.replace(/\{ROLL\}/gi, data.roll_number || String(sequence));

  // Replace {SEQ:n} with zero-padding or plain {SEQ}
  result = result.replace(/\{SEQ(?::(\d+))?\}/gi, (_, padLen) => {
    if (padLen) {
      return String(sequence).padStart(Number(padLen), '0');
    }
    return String(sequence);
  });

  return result;
}

export function compileTemplateHtml(
  htmlContent: string,
  cssContent: string,
  data: TemplateData
): string {
  let compiledHtml = htmlContent;

  // 1. Process {{#each marks_list}} ... {{/each}} loops
  const marksLoopRegex = /\{\{#each\s+marks_list\}\}([\s\S]*?)\{\{\/each\}\}/gi;
  compiledHtml = compiledHtml.replace(marksLoopRegex, (_, rowTemplate) => {
    const list = data.marks_list || [];
    if (list.length === 0) {
      return `<tr><td colspan="6" style="text-align:center; padding:12px; color:#94a3b8;">No subject records found</td></tr>`;
    }
    return list
      .map((item) => {
        let row = rowTemplate;
        row = row.replace(/\{\{subject_name\}\}/gi, String(item.subject_name ?? ''));
        row = row.replace(/\{\{max_theory\}\}/gi, String(item.max_theory ?? '0'));
        row = row.replace(/\{\{max_practical\}\}/gi, String(item.max_practical ?? '0'));
        row = row.replace(/\{\{max_total\}\}/gi, String(item.max_total ?? '100'));
        row = row.replace(/\{\{theory_obtained\}\}/gi, String(item.theory_obtained ?? '0'));
        row = row.replace(/\{\{practical_obtained\}\}/gi, String(item.practical_obtained ?? '0'));
        row = row.replace(/\{\{total_obtained\}\}/gi, String(item.total_obtained ?? '0'));
        row = row.replace(/\{\{grade\}\}/gi, String(item.grade ?? ''));
        row = row.replace(/\{\{remarks\}\}/gi, String(item.remarks ?? ''));
        return row;
      })
      .join('');
  });

  // 2. Process {{#each schedule_list}} ... {{/each}} loops
  const scheduleLoopRegex = /\{\{#each\s+schedule_list\}\}([\s\S]*?)\{\{\/each\}\}/gi;
  compiledHtml = compiledHtml.replace(scheduleLoopRegex, (_, rowTemplate) => {
    const list = data.schedule_list || [];
    if (list.length === 0) {
      return `<tr><td colspan="4" style="text-align:center; padding:12px; color:#94a3b8;">No schedule assigned</td></tr>`;
    }
    return list
      .map((item) => {
        let row = rowTemplate;
        row = row.replace(/\{\{date\}\}/gi, String(item.date ?? ''));
        row = row.replace(/\{\{time\}\}/gi, String(item.time ?? ''));
        row = row.replace(/\{\{subject_name\}\}/gi, String(item.subject_name ?? ''));
        row = row.replace(/\{\{subject_code\}\}/gi, String(item.subject_code ?? ''));
        row = row.replace(/\{\{room_no\}\}/gi, String(item.room_no ?? 'Exam Hall'));
        return row;
      })
      .join('');
  });

  // 3. Fallback table generators if {{marks_table}} or {{exam_schedule_table}} placeholders are used
  if (/\{\{marks_table\}\}/gi.test(compiledHtml)) {
    const marksTableHtml = generateMarksTableHtml(data.marks_list || []);
    compiledHtml = compiledHtml.replace(/\{\{marks_table\}\}/gi, marksTableHtml);
  }

  if (/\{\{exam_schedule_table\}\}/gi.test(compiledHtml)) {
    const scheduleTableHtml = generateScheduleTableHtml(data.schedule_list || []);
    compiledHtml = compiledHtml.replace(/\{\{exam_schedule_table\}\}/gi, scheduleTableHtml);
  }

  // 4. Safe image fallbacks & variable replacements
  const safeData: Record<string, any> = {
    ...data,
    school_logo: normalizeImageUrl(data.school_logo) || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
    student_photo: normalizeImageUrl(data.student_photo) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    principal_photo: normalizeImageUrl(data.principal_photo) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    principal_signature: normalizeImageUrl(data.principal_signature) || 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Signature_example.svg',
    school_stamp: normalizeImageUrl(data.school_stamp) || 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Sample_Seal.svg',
    banner_url: normalizeImageUrl(data.banner_url) || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    issue_date: data.issue_date || new Date().toLocaleDateString('en-GB'),
    academic_session: data.academic_session || '2025-2026',
    result_status: data.result_status || 'PASS',
  };

  // 5. Replace all scalar {{variables}}
  for (const [key, value] of Object.entries(safeData)) {
    if (value !== null && value !== undefined && (typeof value === 'string' || typeof value === 'number')) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
      compiledHtml = compiledHtml.replace(regex, String(value));
    }
  }

  // 6. Clean up any remaining unreplaced variables or broken loop tags
  compiledHtml = compiledHtml.replace(/\{\{[^}]+\}\}/g, '');

  // 7. Assemble complete standalone document with CSS
  return `
    <style>
      ${cssContent}
    </style>
    ${compiledHtml}
  `;
}

function generateMarksTableHtml(
  marksList: Array<{
    subject_name: string;
    max_theory: number;
    max_practical: number;
    theory_obtained: number;
    practical_obtained: number;
    total_obtained: number;
    max_total: number;
    grade: string;
  }>
): string {
  if (!marksList || marksList.length === 0) {
    return `
      <table class="marks-table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; background:#f8fafc; font-size:11px;">Subject</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; background:#f8fafc; font-size:11px;">Max Marks</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; background:#f8fafc; font-size:11px;">Theory</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; background:#f8fafc; font-size:11px;">Practical</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; background:#f8fafc; font-size:11px;">Total Obtained</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; background:#f8fafc; font-size:11px;">Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 14px; font-size:11px; border:1px solid #cbd5e1;">No subject marks recorded</td></tr>
        </tbody>
      </table>
    `;
  }

  const rows = marksList
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; font-weight:600; font-size:11px;">${item.subject_name}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">${item.max_total}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">${item.theory_obtained} / ${item.max_theory}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">${item.practical_obtained} / ${item.max_practical}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-weight:bold; color:#1e293b; font-size:11px;">${item.total_obtained}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-weight:bold; color:#4f46e5; font-size:11px;">${item.grade}</td>
      </tr>
    `
    )
    .join('');

  return `
    <table class="marks-table" style="width:100%; border-collapse:collapse; margin-top:8px;">
      <thead>
        <tr style="background:#f1f5f9; color:#334155;">
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:left; font-size:11px;">Subject</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">Max Marks</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">Theory</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">Practical</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">Total</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">Grade</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function generateScheduleTableHtml(
  scheduleList: Array<{
    subject_name: string;
    date: string;
    time: string;
    room_no?: string | null;
  }>
): string {
  if (!scheduleList || scheduleList.length === 0) {
    return `
      <table class="schedule-table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:left; font-size:11px;">Date</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:left; font-size:11px;">Time</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:left; font-size:11px;">Subject</th>
            <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">Hall / Room</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 12px; font-size:11px; border:1px solid #cbd5e1;">Schedule to be announced</td></tr>
        </tbody>
      </table>
    `;
  }

  const rows = scheduleList
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; font-weight:600; font-size:11px;">${item.date}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; font-size:11px;">${item.time}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; font-weight:bold; color:#1e293b; font-size:11px;">${item.subject_name}</td>
        <td style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">${item.room_no || 'Exam Hall'}</td>
      </tr>
    `
    )
    .join('');

  return `
    <table class="schedule-table" style="width:100%; border-collapse:collapse; margin-top:8px;">
      <thead>
        <tr style="background:#f1f5f9; color:#334155;">
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:left; font-size:11px;">Date</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:left; font-size:11px;">Time</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:left; font-size:11px;">Subject</th>
          <th style="padding:8px 12px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">Room / Hall</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}
