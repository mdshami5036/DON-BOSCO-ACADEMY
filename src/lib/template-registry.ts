import { DocumentTemplate, DocType } from '../types/database';

/**
 * 20 Production-Grade Master Document Templates (5 per category)
 * Meticulously styled with modern CSS, zero text overlap, scaled layouts,
 * dynamic placeholder interpolation, QR codes, signatures, and seals.
 */
export const MASTER_TEMPLATES: DocumentTemplate[] = [
  // ==========================================
  // 1. MARKSHEETS (5 UNIQUE DESIGNS)
  // ==========================================

  // Marksheet 1: Modern Indigo CBSE Grade Sheet
  {
    id: 'tmpl-marksheet-01',
    name: 'Modern Indigo CBSE Grade Sheet',
    category: 'MARKSHEET',
    description: 'Contemporary deep indigo theme with structured subject table, percentage ring, and QR security code.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'roll_number', 'admission_number', 'class_name', 'section', 'academic_session', 'exam_name', 'marks_list', 'total_obtained_marks', 'total_max_marks', 'percentage', 'grade', 'result_status', 'rank_in_class', 'remarks', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="marksheet-indigo">
  <div class="header">
    <div class="logo-box">
      <img src="{{school_logo}}" alt="Logo" class="logo" />
    </div>
    <div class="school-info">
      <h1>{{school_name}}</h1>
      <p class="sub">{{school_address}} | Phone: {{school_phone}}</p>
      <div class="report-badge">OFFICIAL ACADEMIC PROGRESS REPORT &bull; {{academic_session}}</div>
    </div>
    <div class="qr-box">
      <img src="{{qr_code}}" alt="QR" class="qr" />
      <span>{{verification_code}}</span>
    </div>
  </div>

  <div class="exam-title-bar">
    <h2>{{exam_name}}</h2>
  </div>

  <div class="student-strip">
    <div class="photo-cell">
      <img src="{{student_photo}}" alt="Photo" class="student-img" />
    </div>
    <div class="info-grid">
      <div class="info-item"><span class="lbl">Student Name:</span> <strong class="val">{{student_name}}</strong></div>
      <div class="info-item"><span class="lbl">Admission No:</span> <strong class="val font-mono">{{admission_number}}</strong></div>
      <div class="info-item"><span class="lbl">Roll Number:</span> <strong class="val font-mono">{{roll_number}}</strong></div>
      <div class="info-item"><span class="lbl">Class & Section:</span> <strong class="val">{{class_name}} ({{section}})</strong></div>
      <div class="info-item"><span class="lbl">Father's Name:</span> <strong class="val">{{father_name}}</strong></div>
      <div class="info-item"><span class="lbl">Date of Birth:</span> <strong class="val">{{date_of_birth}}</strong></div>
    </div>
  </div>

  <table class="marks-table">
    <thead>
      <tr>
        <th style="width: 35%;">Subject Description</th>
        <th style="width: 15%;">Max Theory</th>
        <th style="width: 15%;">Max Pract.</th>
        <th style="width: 15%;">Total Max</th>
        <th style="width: 20%;">Marks Obtained</th>
      </tr>
    </thead>
    <tbody>
      {{#each marks_list}}
      <tr>
        <td class="sub-name">{{subject_name}}</td>
        <td class="center">{{max_theory}}</td>
        <td class="center">{{max_practical}}</td>
        <td class="center font-bold">{{max_total}}</td>
        <td class="center mark-obtained font-bold">{{total_obtained}}</td>
      </tr>
      {{/each}}
    </tbody>
    <tfoot>
      <tr class="grand-total-row">
        <td colspan="3" class="text-right font-bold">GRAND TOTAL:</td>
        <td class="center font-bold">{{total_max_marks}}</td>
        <td class="center grand-mark">{{total_obtained_marks}}</td>
      </tr>
    </tfoot>
  </table>

  <div class="summary-cards">
    <div class="card-metric">
      <span class="m-lbl">Aggregate %</span>
      <span class="m-val indigo">{{percentage}}%</span>
    </div>
    <div class="card-metric">
      <span class="m-lbl">Final Grade</span>
      <span class="m-val purple">{{grade}}</span>
    </div>
    <div class="card-metric">
      <span class="m-lbl">Class Rank</span>
      <span class="m-val amber">Rank #{{rank_in_class}}</span>
    </div>
    <div class="card-metric">
      <span class="m-lbl">Result Outcome</span>
      <span class="m-val green">{{result_status}}</span>
    </div>
  </div>

  <div class="remarks-box">
    <strong>Faculty Remarks:</strong> <span>{{remarks}}</span>
  </div>

  <div class="footer-signatures">
    <div class="sig-block">
      <div class="sig-line"></div>
      <span>Class Teacher</span>
    </div>
    <div class="stamp-block">
      <img src="{{school_stamp}}" alt="Seal" class="stamp" />
      <span>Official School Seal</span>
    </div>
    <div class="sig-block">
      <img src="{{principal_signature}}" alt="Sig" class="sig-img" />
      <div class="sig-line"></div>
      <span>Principal &bull; {{principal_name}}</span>
    </div>
  </div>
</div>`,
    css_content: `.marksheet-indigo { font-family: 'Segoe UI', Inter, sans-serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 26px 30px; background: #ffffff; color: #1e293b; line-height: 1.35; display: flex; flex-direction: column; justify-content: space-between; }
.header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #4338ca; padding-bottom: 14px; margin-bottom: 12px; gap: 14px; }
.logo { width: 72px; height: 72px; object-fit: contain; }
.school-info { text-align: center; flex: 1; }
.school-info h1 { font-size: 20px; font-weight: 900; color: #1e1b4b; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
.school-info .sub { font-size: 10px; color: #64748b; margin: 3px 0 0 0; }
.report-badge { display: inline-block; background: #e0e7ff; color: #3730a3; font-size: 9.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px; margin-top: 5px; }
.qr-box { text-align: center; }
.qr { width: 62px; height: 62px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 4px; }
.qr-box span { display: block; font-size: 7.5px; font-family: monospace; color: #64748b; margin-top: 2px; }

.exam-title-bar { background: #4338ca; color: #ffffff; text-align: center; padding: 6px; border-radius: 6px; margin-bottom: 14px; }
.exam-title-bar h2 { margin: 0; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }

.student-strip { display: flex; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; align-items: center; }
.student-img { width: 64px; height: 74px; object-fit: cover; border-radius: 6px; border: 2px solid #cbd5e1; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 14px; flex: 1; font-size: 11px; }
.info-item .lbl { color: #64748b; font-size: 10px; }
.info-item .val { color: #0f172a; margin-left: 4px; }

.marks-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
.marks-table th { background: #1e1b4b; color: #ffffff; padding: 7px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.marks-table td { padding: 6.5px 10px; border-bottom: 1px solid #e2e8f0; }
.marks-table tbody tr:nth-child(even) { background: #f8fafc; }
.center { text-align: center; }
.text-right { text-align: right; }
.sub-name { font-weight: 700; color: #1e293b; }
.mark-obtained { color: #4338ca; }
.grand-total-row td { background: #e0e7ff; font-weight: 800; border-top: 2px solid #4338ca; border-bottom: 2px solid #4338ca; }
.grand-mark { color: #312e81; font-size: 13px; font-weight: 900; }

.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
.card-metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
.m-lbl { display: block; font-size: 9.5px; color: #64748b; font-weight: 700; text-transform: uppercase; }
.m-val { display: block; font-size: 15px; font-weight: 900; margin-top: 2px; }
.indigo { color: #4338ca; }
.purple { color: #7e22ce; }
.amber { color: #b45309; }
.green { color: #15803d; }

.remarks-box { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 8px 12px; font-size: 10.5px; border-radius: 4px; margin-bottom: 20px; }

.footer-signatures { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px; }
.sig-block { text-align: center; width: 140px; }
.sig-line { border-top: 1px dashed #94a3b8; margin-top: 35px; margin-bottom: 4px; }
.sig-block span { font-size: 9.5px; color: #64748b; font-weight: 600; }
.sig-img { height: 36px; object-fit: contain; margin-bottom: -4px; }
.stamp-block { text-align: center; }
.stamp { width: 55px; height: 55px; opacity: 0.85; margin: 0 auto 2px; }
.stamp-block span { display: block; font-size: 8px; color: #94a3b8; text-transform: uppercase; }`,
  },

  // Marksheet 2: Classic Oxford Academic Transcript
  {
    id: 'tmpl-marksheet-02',
    name: 'Classic Oxford Academic Transcript',
    category: 'MARKSHEET',
    description: 'Traditional heritage design with burgundy and gold accents, Roman serif headers, and transcript structure.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'roll_number', 'admission_number', 'class_name', 'section', 'academic_session', 'exam_name', 'marks_list', 'total_obtained_marks', 'total_max_marks', 'percentage', 'grade', 'result_status', 'rank_in_class', 'remarks', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="marksheet-oxford">
  <div class="ornate-border">
    <div class="oxford-header">
      <img src="{{school_logo}}" alt="Crest" class="oxford-logo" />
      <div class="oxford-title">
        <h1>{{school_name}}</h1>
        <div class="motto">INSTITUTION OF DISTINGUISHED SCHOLARSHIP</div>
        <p>{{school_address}}</p>
      </div>
      <div class="qr-col">
        <img src="{{qr_code}}" alt="QR" class="qr-img" />
        <span>{{verification_code}}</span>
      </div>
    </div>

    <div class="transcript-heading">
      <span>OFFICIAL ACADEMIC TRANSCRIPT &bull; {{academic_session}}</span>
      <h3>{{exam_name}}</h3>
    </div>

    <div class="oxford-bio-grid">
      <div><strong>Student Name:</strong> {{student_name}}</div>
      <div><strong>Admission No:</strong> {{admission_number}}</div>
      <div><strong>Roll Number:</strong> {{roll_number}}</div>
      <div><strong>Class & Section:</strong> {{class_name}} - {{section}}</div>
      <div><strong>Parent/Guardian:</strong> {{father_name}}</div>
      <div><strong>Grading Session:</strong> {{academic_session}}</div>
    </div>

    <table class="oxford-table">
      <thead>
        <tr>
          <th style="width: 40%;">Course Description</th>
          <th style="width: 15%;">Theory Max</th>
          <th style="width: 15%;">Pract. Max</th>
          <th style="width: 15%;">Total Max</th>
          <th style="width: 15%;">Marks Awarded</th>
        </tr>
      </thead>
      <tbody>
        {{#each marks_list}}
        <tr>
          <td class="course-name">{{subject_name}}</td>
          <td class="center">{{max_theory}}</td>
          <td class="center">{{max_practical}}</td>
          <td class="center">{{max_total}}</td>
          <td class="center font-bold">{{total_obtained}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr class="oxford-total">
          <td colspan="3"><strong>CUMULATIVE AGGREGATE EVALUATION:</strong></td>
          <td class="center"><strong>{{total_max_marks}}</strong></td>
          <td class="center"><strong>{{total_obtained_marks}}</strong></td>
        </tr>
      </tfoot>
    </table>

    <div class="oxford-metrics-row">
      <div class="metric-pill"><span>Aggregate Percentage:</span> <strong>{{percentage}}%</strong></div>
      <div class="metric-pill"><span>Final Standing:</span> <strong>Grade {{grade}}</strong></div>
      <div class="metric-pill"><span>Class Rank:</span> <strong>Position #{{rank_in_class}}</strong></div>
      <div class="metric-pill"><span>Academic Result:</span> <strong>{{result_status}}</strong></div>
    </div>

    <div class="oxford-eval">
      <p><strong>Faculty Evaluation:</strong> <em>"{{remarks}}"</em></p>
    </div>

    <div class="oxford-signatures">
      <div class="sig-item">
        <div class="line"></div>
        <span>Dean of Academics</span>
      </div>
      <div class="seal-item">
        <img src="{{school_stamp}}" alt="Seal" class="oxford-seal" />
        <span>University Seal</span>
      </div>
      <div class="sig-item">
        <img src="{{principal_signature}}" alt="Sig" class="sig-photo" />
        <div class="line"></div>
        <span>{{principal_name}} (Principal)</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.marksheet-oxford { font-family: 'Georgia', 'Times New Roman', serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 20px; background: #fffdfa; color: #2d1e18; display: flex; flex-direction: column; }
.ornate-border { border: 2px solid #78350f; outline: 1px solid #92400e; outline-offset: 4px; padding: 18px 22px; background: #ffffff; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
.oxford-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #78350f; padding-bottom: 12px; margin-bottom: 12px; }
.oxford-logo { width: 70px; height: 70px; object-fit: contain; }
.oxford-title { text-align: center; flex: 1; }
.oxford-title h1 { margin: 0; font-size: 21px; font-weight: bold; color: #78350f; letter-spacing: 1px; text-transform: uppercase; }
.oxford-title .motto { font-size: 9px; font-style: italic; color: #b45309; letter-spacing: 1.5px; margin-top: 2px; }
.oxford-title p { margin: 2px 0 0 0; font-size: 9.5px; color: #713f12; }
.qr-col { text-align: center; }
.qr-img { width: 58px; height: 58px; border: 1px solid #d97706; padding: 2px; }
.qr-col span { display: block; font-size: 7.5px; font-family: monospace; color: #78350f; margin-top: 2px; }

.transcript-heading { text-align: center; background: #fef3c7; border: 1px solid #fde68a; padding: 6px; margin-bottom: 12px; border-radius: 3px; }
.transcript-heading span { font-size: 9.5px; font-weight: bold; letter-spacing: 1px; color: #92400e; text-transform: uppercase; }
.transcript-heading h3 { margin: 2px 0 0 0; font-size: 14px; font-weight: bold; color: #78350f; }

.oxford-bio-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; font-size: 11px; padding: 10px; background: #fafaf9; border: 1px solid #e7e5e4; margin-bottom: 14px; }
.oxford-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; }
.oxford-table th { background: #78350f; color: #fef3c7; padding: 7px 10px; text-align: left; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; }
.oxford-table td { padding: 6.5px 10px; border-bottom: 1px solid #e7e5e4; }
.oxford-table tbody tr:nth-child(even) { background: #fafaf9; }
.course-name { font-weight: bold; color: #78350f; }
.oxford-total td { background: #fef3c7; border-top: 2px solid #78350f; border-bottom: 2px solid #78350f; font-weight: bold; }

.oxford-metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
.metric-pill { background: #fafaf9; border: 1px solid #d6d3d1; padding: 8px; border-radius: 4px; text-align: center; }
.metric-pill span { display: block; font-size: 9.5px; color: #78716c; }
.metric-pill strong { font-size: 14px; color: #78350f; margin-top: 2px; display: block; }

.oxford-eval { background: #fef3c7; border: 1px solid #fde68a; padding: 8px 12px; font-size: 10.5px; border-radius: 4px; margin-bottom: 18px; color: #78350f; }
.oxford-signatures { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px; }
.sig-item { text-align: center; width: 140px; }
.sig-item .line { border-top: 1px solid #78350f; margin-top: 35px; margin-bottom: 4px; }
.sig-item span { font-size: 9.5px; color: #78350f; }
.sig-photo { height: 36px; object-fit: contain; margin-bottom: -4px; }
.seal-item { text-align: center; }
.oxford-seal { width: 55px; height: 55px; opacity: 0.85; margin: 0 auto; }
.seal-item span { display: block; font-size: 8px; color: #92400e; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }`,
  },

  // Marksheet 3: Corporate Minimalist Grade Card
  {
    id: 'tmpl-marksheet-03',
    name: 'Corporate Minimalist Grade Card',
    category: 'MARKSHEET',
    description: 'Clean Swiss design with emerald and slate accents, compact summary tiles, and high-contrast typography.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'roll_number', 'admission_number', 'class_name', 'section', 'academic_session', 'exam_name', 'marks_list', 'total_obtained_marks', 'total_max_marks', 'percentage', 'grade', 'result_status', 'rank_in_class', 'remarks', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="marksheet-minimal">
  <header class="min-header">
    <div class="min-brand">
      <img src="{{school_logo}}" alt="Logo" class="min-logo" />
      <div>
        <h1>{{school_name}}</h1>
        <p>{{school_address}} &bull; {{school_email}}</p>
      </div>
    </div>
    <div class="min-qr">
      <img src="{{qr_code}}" alt="QR" />
      <code>{{verification_code}}</code>
    </div>
  </header>

  <div class="min-subbar">
    <h2>ACADEMIC PERFORMANCE REPORT &bull; {{exam_name}}</h2>
    <span class="session-tag">{{academic_session}}</span>
  </div>

  <div class="min-student-card">
    <img src="{{student_photo}}" alt="Photo" class="min-stu-img" />
    <div class="min-grid">
      <div><small>STUDENT NAME</small><p>{{student_name}}</p></div>
      <div><small>ADMISSION NO</small><p class="mono">{{admission_number}}</p></div>
      <div><small>ROLL NO</small><p class="mono">{{roll_number}}</p></div>
      <div><small>CLASS & SECTION</small><p>{{class_name}} (Sec {{section}})</p></div>
      <div><small>GUARDIAN</small><p>{{father_name}}</p></div>
      <div><small>DATE OF BIRTH</small><p>{{date_of_birth}}</p></div>
    </div>
  </div>

  <table class="min-table">
    <thead>
      <tr>
        <th>Subject Curriculum</th>
        <th class="c">Theory</th>
        <th class="c">Pract.</th>
        <th class="c">Max Marks</th>
        <th class="c">Obtained</th>
      </tr>
    </thead>
    <tbody>
      {{#each marks_list}}
      <tr>
        <td class="bold">{{subject_name}}</td>
        <td class="c">{{max_theory}}</td>
        <td class="c">{{max_practical}}</td>
        <td class="c">{{max_total}}</td>
        <td class="c score">{{total_obtained}}</td>
      </tr>
      {{/each}}
      <tr class="total-row">
        <td colspan="3" class="r bold">AGGREGATE SUM</td>
        <td class="c bold">{{total_max_marks}}</td>
        <td class="c bold score-total">{{total_obtained_marks}}</td>
      </tr>
    </tbody>
  </table>

  <div class="min-kpi-grid">
    <div class="kpi-box"><label>SCORE PERCENTAGE</label><h3>{{percentage}}%</h3></div>
    <div class="kpi-box"><label>LETTER GRADE</label><h3 class="em">{{grade}}</h3></div>
    <div class="kpi-box"><label>COHORT RANK</label><h3>Rank #{{rank_in_class}}</h3></div>
    <div class="kpi-box"><label>ACADEMIC STATUS</label><h3 class="grn">{{result_status}}</h3></div>
  </div>

  <div class="min-remarks">
    <span class="tag">Observation</span>
    <p>{{remarks}}</p>
  </div>

  <footer class="min-footer">
    <div class="sign-item">
      <div class="sig-space"></div>
      <p>Class Evaluator</p>
    </div>
    <div class="seal-item">
      <img src="{{school_stamp}}" alt="Stamp" />
    </div>
    <div class="sign-item">
      <img src="{{principal_signature}}" alt="Sig" class="sig-pic" />
      <div class="sig-space"></div>
      <p>{{principal_name}} (Principal)</p>
    </div>
  </footer>
</div>`,
    css_content: `.marksheet-minimal { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 26px 30px; background: #ffffff; color: #0f172a; display: flex; flex-direction: column; justify-content: space-between; }
.min-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 2px solid #0f172a; margin-bottom: 12px; }
.min-brand { display: flex; align-items: center; gap: 12px; }
.min-logo { width: 60px; height: 60px; object-fit: contain; }
.min-brand h1 { margin: 0; font-size: 19px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
.min-brand p { margin: 2px 0 0 0; font-size: 10px; color: #64748b; }
.min-qr { text-align: center; }
.min-qr img { width: 54px; height: 54px; }
.min-qr code { display: block; font-size: 7px; color: #64748b; margin-top: 2px; }

.min-subbar { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #ffffff; padding: 6px 12px; border-radius: 4px; margin-bottom: 12px; }
.min-subbar h2 { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
.session-tag { background: #059669; font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 3px; }

.min-student-card { display: flex; gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 12px; align-items: center; }
.min-stu-img { width: 60px; height: 68px; object-fit: cover; border-radius: 4px; }
.min-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 14px; flex: 1; }
.min-grid small { font-size: 8px; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
.min-grid p { margin: 1px 0 0 0; font-size: 11px; font-weight: 600; color: #0f172a; }
.mono { font-family: monospace; }

.min-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
.min-table th { background: #f1f5f9; color: #475569; padding: 6px 8px; text-align: left; font-size: 9.5px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
.min-table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
.bold { font-weight: 700; }
.c { text-align: center; }
.r { text-align: right; }
.score { color: #059669; font-weight: 700; }
.total-row td { background: #f8fafc; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; }
.score-total { color: #0f172a; font-size: 12.5px; }

.min-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
.kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
.kpi-box label { font-size: 8px; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
.kpi-box h3 { margin: 3px 0 0 0; font-size: 14px; font-weight: 900; color: #0f172a; }
.em { color: #7c3aed; }
.grn { color: #059669; }

.min-remarks { display: flex; gap: 8px; align-items: center; background: #f0fdf4; border: 1px solid #dcfce7; padding: 6px 10px; border-radius: 4px; margin-bottom: 16px; font-size: 10px; }
.min-remarks .tag { background: #16a34a; color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; }
.min-remarks p { margin: 0; color: #166534; }

.min-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 8px; }
.sign-item { text-align: center; width: 130px; }
.sig-space { border-top: 1px solid #cbd5e1; margin-top: 28px; margin-bottom: 3px; }
.sign-item p { margin: 0; font-size: 9px; color: #64748b; font-weight: 600; }
.sig-pic { height: 32px; object-fit: contain; margin-bottom: -4px; }
.seal-item img { width: 50px; height: 50px; opacity: 0.8; }`,
  },

  // Marksheet 4: STEM Technical Assessment Report
  {
    id: 'tmpl-marksheet-04',
    name: 'STEM Technical Assessment Report',
    category: 'MARKSHEET',
    description: 'Futuristic technical layout with cyan highlights, subject performance metrics, and security hologram banner.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'roll_number', 'admission_number', 'class_name', 'section', 'academic_session', 'exam_name', 'marks_list', 'total_obtained_marks', 'total_max_marks', 'percentage', 'grade', 'result_status', 'rank_in_class', 'remarks', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="marksheet-stem">
  <div class="stem-header">
    <div class="stem-brand">
      <img src="{{school_logo}}" alt="Logo" class="stem-logo" />
      <div>
        <h1>{{school_name}}</h1>
        <div class="stem-sub">CENTRE FOR ADVANCED SCIENTIFIC & TECHNICAL EDUCATION</div>
      </div>
    </div>
    <div class="stem-auth">
      <img src="{{qr_code}}" alt="QR" class="stem-qr" />
      <span>SECURE DIGI-VERIFY</span>
    </div>
  </div>

  <div class="stem-exam-pill">
    <div class="flex justify-between">
      <strong>TECHNICAL SCHOLASTIC REPORT: {{exam_name}}</strong>
      <span>SESSION: {{academic_session}}</span>
    </div>
  </div>

  <div class="stem-candidate-block">
    <img src="{{student_photo}}" alt="Candidate" class="stem-photo" />
    <div class="stem-meta-grid">
      <div class="meta-field"><label>CANDIDATE ID</label><p class="cyan">{{admission_number}}</p></div>
      <div class="meta-field"><label>NAME</label><p>{{student_name}}</p></div>
      <div class="meta-field"><label>ROLL CODE</label><p class="cyan">{{roll_number}}</p></div>
      <div class="meta-field"><label>ACADEMIC LEVEL</label><p>{{class_name}} &bull; Sec {{section}}</p></div>
      <div class="meta-field"><label>GUARDIAN</label><p>{{father_name}}</p></div>
      <div class="meta-field"><label>DOB</label><p>{{date_of_birth}}</p></div>
    </div>
  </div>

  <table class="stem-table">
    <thead>
      <tr>
        <th style="width: 40%;">TECHNICAL MODULE / PAPER</th>
        <th class="c">THEORY (MAX)</th>
        <th class="c">LAB / PRACT.</th>
        <th class="c">MAX TOTAL</th>
        <th class="c">OBTAINED</th>
      </tr>
    </thead>
    <tbody>
      {{#each marks_list}}
      <tr>
        <td class="mod-title">{{subject_name}}</td>
        <td class="c">{{max_theory}}</td>
        <td class="c">{{max_practical}}</td>
        <td class="c">{{max_total}}</td>
        <td class="c mod-score">{{total_obtained}}</td>
      </tr>
      {{/each}}
    </tbody>
    <tfoot>
      <tr class="stem-total-bar">
        <td colspan="3" class="r">CUMULATIVE METRIC SUM:</td>
        <td class="c">{{total_max_marks}}</td>
        <td class="c cyan-bold">{{total_obtained_marks}}</td>
      </tr>
    </tfoot>
  </table>

  <div class="stem-analytics">
    <div class="stem-stat"><label>AGGREGATE</label><div class="stat-num">{{percentage}}%</div></div>
    <div class="stem-stat"><label>GRADE</label><div class="stat-num glow">{{grade}}</div></div>
    <div class="stem-stat"><label>CLASS RANK</label><div class="stat-num">#{{rank_in_class}}</div></div>
    <div class="stem-stat"><label>STATUS</label><div class="stat-num pass">{{result_status}}</div></div>
  </div>

  <div class="stem-verdict">
    <strong>FACULTY ASSESSMENT:</strong> <span>{{remarks}}</span>
  </div>

  <div class="stem-signatures">
    <div class="stem-sig-box">
      <div class="dash"></div>
      <label>Head of Department</label>
    </div>
    <div class="stem-seal-box">
      <img src="{{school_stamp}}" alt="Seal" />
    </div>
    <div class="stem-sig-box">
      <img src="{{principal_signature}}" alt="Sig" class="stem-sig-img" />
      <div class="dash"></div>
      <label>{{principal_name}} (Principal)</label>
    </div>
  </div>
</div>`,
    css_content: `.marksheet-stem { font-family: 'Segoe UI', 'Consolas', monospace; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 24px 28px; background: #030712; color: #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; }
.stem-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 10px; }
.stem-brand { display: flex; align-items: center; gap: 12px; }
.stem-logo { width: 62px; height: 62px; object-fit: contain; }
.stem-brand h1 { margin: 0; font-size: 19px; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; }
.stem-sub { font-size: 8.5px; color: #94a3b8; letter-spacing: 1px; margin-top: 2px; }
.stem-auth { text-align: center; }
.stem-qr { width: 56px; height: 56px; border: 1px solid #0284c7; padding: 2px; background: #ffffff; border-radius: 4px; }
.stem-auth span { display: block; font-size: 7px; color: #38bdf8; margin-top: 2px; letter-spacing: 0.5px; }

.stem-exam-pill { background: #0f172a; border: 1px solid #0284c7; color: #bae6fd; padding: 5px 10px; font-size: 10px; border-radius: 4px; margin-bottom: 10px; }
.stem-candidate-block { display: flex; gap: 12px; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; align-items: center; }
.stem-photo { width: 58px; height: 66px; object-fit: cover; border-radius: 4px; border: 1px solid #0284c7; }
.stem-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 12px; flex: 1; font-size: 10px; }
.meta-field label { font-size: 7.5px; color: #64748b; font-weight: bold; display: block; }
.meta-field p { margin: 1px 0 0 0; color: #ffffff; font-weight: bold; }
.cyan { color: #38bdf8 !important; }

.stem-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10.5px; }
.stem-table th { background: #0284c7; color: #ffffff; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; }
.stem-table td { padding: 6px 8px; border-bottom: 1px solid #1e293b; }
.stem-table tbody tr { background: #0b1120; }
.stem-table tbody tr:nth-child(even) { background: #0f172a; }
.mod-title { font-weight: bold; color: #f8fafc; }
.c { text-align: center; }
.r { text-align: right; }
.mod-score { color: #38bdf8; font-weight: bold; }
.stem-total-bar td { background: #0284c7; color: #ffffff; font-weight: bold; }
.cyan-bold { font-size: 13px; font-weight: 900; color: #ffffff; }

.stem-analytics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
.stem-stat { background: #0f172a; border: 1px solid #1e293b; border-radius: 4px; padding: 6px; text-align: center; }
.stem-stat label { font-size: 7.5px; color: #64748b; font-weight: bold; display: block; }
.stat-num { font-size: 14px; font-weight: 900; color: #38bdf8; margin-top: 2px; }
.glow { color: #a855f7; }
.pass { color: #22c55e; }

.stem-verdict { background: #0f172a; border: 1px solid #1e293b; border-left: 3px solid #38bdf8; padding: 6px 10px; font-size: 9.5px; margin-bottom: 14px; }
.stem-signatures { display: flex; justify-content: space-between; align-items: flex-end; }
.stem-sig-box { text-align: center; width: 130px; }
.stem-sig-box .dash { border-top: 1px dashed #0284c7; margin-top: 24px; margin-bottom: 3px; }
.stem-sig-box label { font-size: 8px; color: #94a3b8; }
.stem-sig-img { height: 30px; object-fit: contain; filter: brightness(2); margin-bottom: -4px; }
.stem-seal-box img { width: 48px; height: 48px; opacity: 0.8; filter: drop-shadow(0 0 6px rgba(14,165,233,0.3)); }`,
  },

  // Marksheet 5: Luxury Royal Gold Board Marksheet
  {
    id: 'tmpl-marksheet-05',
    name: 'Luxury Royal Gold Board Marksheet',
    category: 'MARKSHEET',
    description: 'Prestigious royal dark aesthetic with gold foil borders, serif typography, and luxury academic report card.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'roll_number', 'admission_number', 'class_name', 'section', 'academic_session', 'exam_name', 'marks_list', 'total_obtained_marks', 'total_max_marks', 'percentage', 'grade', 'result_status', 'rank_in_class', 'remarks', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="marksheet-gold">
  <div class="gold-frame">
    <div class="gold-header">
      <img src="{{school_logo}}" alt="Logo" class="gold-logo" />
      <div class="gold-title">
        <h1>{{school_name}}</h1>
        <p class="gold-sub">BOARD OF SECONDARY & SENIOR SECONDARY EDUCATION</p>
        <span class="gold-badge">SCHOLASTIC EVALUATION TRANSCRIPT &bull; {{academic_session}}</span>
      </div>
      <div class="gold-qr">
        <img src="{{qr_code}}" alt="QR" />
        <span>{{verification_code}}</span>
      </div>
    </div>

    <div class="gold-exam-bar">
      <h2>{{exam_name}}</h2>
    </div>

    <div class="gold-stu-box">
      <img src="{{student_photo}}" alt="Photo" class="gold-stu-img" />
      <div class="gold-stu-grid">
        <div><span class="lbl">CANDIDATE:</span> <strong class="val">{{student_name}}</strong></div>
        <div><span class="lbl">ENROLL NO:</span> <strong class="val font-mono">{{admission_number}}</strong></div>
        <div><span class="lbl">ROLL CODE:</span> <strong class="val font-mono">{{roll_number}}</strong></div>
        <div><span class="lbl">CLASS / SEC:</span> <strong class="val">{{class_name}} - {{section}}</strong></div>
        <div><span class="lbl">GUARDIAN:</span> <strong class="val">{{father_name}}</strong></div>
        <div><span class="lbl">BIRTH DATE:</span> <strong class="val">{{date_of_birth}}</strong></div>
      </div>
    </div>

    <table class="gold-table">
      <thead>
        <tr>
          <th style="width: 42%;">CURRICULUM MODULE</th>
          <th class="c">THEORY</th>
          <th class="c">PRACT.</th>
          <th class="c">TOTAL MAX</th>
          <th class="c">OBTAINED</th>
        </tr>
      </thead>
      <tbody>
        {{#each marks_list}}
        <tr>
          <td class="gold-mod-name">{{subject_name}}</td>
          <td class="c">{{max_theory}}</td>
          <td class="c">{{max_practical}}</td>
          <td class="c font-bold">{{max_total}}</td>
          <td class="c gold-score font-bold">{{total_obtained}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr class="gold-grand">
          <td colspan="3" class="r font-bold">TOTAL AGGREGATE EVALUATION</td>
          <td class="c font-bold">{{total_max_marks}}</td>
          <td class="c font-bold gold-mark-val">{{total_obtained_marks}}</td>
        </tr>
      </tfoot>
    </table>

    <div class="gold-kpi-bar">
      <div class="kpi"><span class="k-lbl">Percentage</span><span class="k-val">{{percentage}}%</span></div>
      <div class="kpi"><span class="k-lbl">Final Grade</span><span class="k-val gold-col">{{grade}}</span></div>
      <div class="kpi"><span class="k-lbl">Standing</span><span class="k-val">Rank #{{rank_in_class}}</span></div>
      <div class="kpi"><span class="k-lbl">Outcome</span><span class="k-val green-col">{{result_status}}</span></div>
    </div>

    <div class="gold-note">
      <strong>Academic Faculty Note:</strong> <span>{{remarks}}</span>
    </div>

    <div class="gold-sig-row">
      <div class="sig-col">
        <div class="g-line"></div>
        <span>Controller of Exams</span>
      </div>
      <div class="seal-col">
        <img src="{{school_stamp}}" alt="Seal" />
      </div>
      <div class="sig-col">
        <img src="{{principal_signature}}" alt="Sig" class="g-sig-img" />
        <div class="g-line"></div>
        <span>{{principal_name}} (Principal)</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.marksheet-gold { font-family: 'Cinzel', 'Georgia', serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 18px; background: #0c0a09; color: #f5f5f4; display: flex; flex-direction: column; }
.gold-frame { border: 2px solid #d97706; outline: 1px solid #b45309; outline-offset: 4px; padding: 18px 22px; background: #1c1917; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
.gold-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #d97706; padding-bottom: 12px; margin-bottom: 10px; }
.gold-logo { width: 68px; height: 68px; object-fit: contain; }
.gold-title { text-align: center; flex: 1; }
.gold-title h1 { margin: 0; font-size: 20px; font-weight: 900; color: #fef08a; letter-spacing: 1px; text-transform: uppercase; }
.gold-sub { font-size: 8.5px; color: #fbbf24; letter-spacing: 1.5px; margin: 2px 0 0 0; }
.gold-badge { display: inline-block; background: #78350f; color: #fef08a; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 999px; margin-top: 4px; border: 1px solid #d97706; }
.gold-qr { text-align: center; }
.gold-qr img { width: 56px; height: 56px; border: 1px solid #d97706; padding: 2px; background: #ffffff; border-radius: 3px; }
.gold-qr span { display: block; font-size: 7px; color: #fef08a; margin-top: 2px; font-family: monospace; }

.gold-exam-bar { background: linear-gradient(90deg, #78350f, #b45309, #78350f); color: #fef08a; text-align: center; padding: 5px; border-radius: 4px; margin-bottom: 12px; border: 1px solid #d97706; }
.gold-exam-bar h2 { margin: 0; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }

.gold-stu-box { display: flex; gap: 14px; background: #292524; border: 1px solid #44403c; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; align-items: center; }
.gold-stu-img { width: 60px; height: 70px; object-fit: cover; border-radius: 4px; border: 1px solid #d97706; }
.gold-stu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 14px; flex: 1; font-size: 10.5px; }
.gold-stu-grid .lbl { color: #a8a29e; font-size: 8.5px; }
.gold-stu-grid .val { color: #fafaf9; margin-left: 3px; }

.gold-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
.gold-table th { background: #78350f; color: #fef08a; padding: 6px 8px; text-align: left; font-size: 9.5px; font-weight: bold; border-bottom: 1px solid #d97706; }
.gold-table td { padding: 6px 8px; border-bottom: 1px solid #292524; }
.gold-table tbody tr:nth-child(even) { background: #292524; }
.gold-mod-name { font-weight: bold; color: #f5f5f4; }
.c { text-align: center; }
.r { text-align: right; }
.gold-score { color: #fde047; }
.gold-grand td { background: #451a03; border-top: 2px solid #d97706; border-bottom: 2px solid #d97706; color: #fef08a; }
.gold-mark-val { font-size: 13px; color: #fde047; }

.gold-kpi-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
.kpi { background: #292524; border: 1px solid #44403c; border-radius: 4px; padding: 6px; text-align: center; }
.k-lbl { display: block; font-size: 8px; color: #a8a29e; text-transform: uppercase; }
.k-val { display: block; font-size: 14px; font-weight: 900; margin-top: 2px; color: #fafaf9; }
.gold-col { color: #fde047; }
.green-col { color: #4ade80; }

.gold-note { background: #292524; border-left: 3px solid #d97706; padding: 6px 10px; font-size: 9.5px; margin-bottom: 16px; color: #e7e5e4; }
.gold-sig-row { display: flex; justify-content: space-between; align-items: flex-end; }
.sig-col { text-align: center; width: 140px; }
.g-line { border-top: 1px solid #d97706; margin-top: 24px; margin-bottom: 3px; }
.sig-col span { font-size: 8.5px; color: #a8a29e; }
.g-sig-img { height: 32px; object-fit: contain; filter: brightness(1.5); margin-bottom: -4px; }
.seal-col img { width: 50px; height: 50px; opacity: 0.85; filter: drop-shadow(0 0 6px rgba(217,119,6,0.4)); }`,
  },

  // ==========================================
  // 2. CERTIFICATES (5 UNIQUE DESIGNS)
  // ==========================================

  // Certificate 1: Official Guilloche Security Border Certificate
  {
    id: 'tmpl-cert-01',
    name: 'Official Guilloche Security Border Certificate',
    category: 'CERTIFICATE',
    description: 'Authentic institutional merit award with ornate Guilloche rosettes, security watermark medallion, and cryptographic QR authentication.',
    page_size: 'A4',
    orientation: 'landscape',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'school_address', 'academic_session', 'student_name', 'admission_number', 'roll_number', 'class_name', 'section', 'certificate_title', 'certificate_body', 'certificate_number', 'issue_date', 'principal_name', 'principal_signature', 'school_stamp', 'qr_code', 'verification_code'],
    html_content: `<div class="cert-guilloche-official">
  <div class="cert-content-inner">
    <div class="cert-header-section">
      <img src="{{school_logo}}" alt="Logo" class="cert-school-logo" />
      <h1 class="cert-school-name">{{school_name}}</h1>
      <p class="cert-school-meta">{{school_address}} &bull; CBSE Pattern &bull; ESTD 1997 &bull; Academic Session {{academic_session}}</p>
    </div>

    <div class="cert-title-section">
      <h2 class="cert-main-title">{{certificate_title}}</h2>
      <div class="cert-title-divider">
        <span class="cert-diamond">&diams;</span>
        <span class="cert-line"></span>
        <span class="cert-subtitle">OF MERIT & ACADEMIC DISTINCTION</span>
        <span class="cert-line"></span>
        <span class="cert-diamond">&diams;</span>
      </div>
    </div>

    <div class="cert-recipient-section">
      <p class="cert-presents-label">THIS IS TO CERTIFY THAT</p>
      <h1 class="cert-student-name">{{student_name}}</h1>
      <div class="cert-student-details">
        <span>Admission No: <strong>{{admission_number}}</strong></span> &bull; 
        <span>Class & Section: <strong>{{class_name}} ({{section}})</strong></span> &bull; 
        <span>Roll No: <strong>{{roll_number}}</strong></span>
      </div>
    </div>

    <div class="cert-body-section">
      <p class="cert-body-paragraph">{{certificate_body}}</p>
    </div>

    <div class="cert-footer-section">
      <div class="cert-left-meta">
        <div class="cert-meta-item"><span>Certificate No:</span> <strong>{{certificate_number}}</strong></div>
        <div class="cert-meta-item"><span>Date of Issue:</span> <strong>{{issue_date}}</strong></div>
        <div class="cert-qr-container">
          <img src="{{qr_code}}" alt="QR" class="cert-qr-img" />
          <div class="cert-qr-text">
            <span>Scan to Verify</span>
            <code>{{verification_code}}</code>
          </div>
        </div>
      </div>

      <div class="cert-center-seal">
        <img src="{{school_stamp}}" alt="Official Seal" class="cert-stamp-img" />
        <span class="cert-stamp-label">OFFICIAL INSTITUTIONAL SEAL</span>
      </div>

      <div class="cert-right-signature">
        <img src="{{principal_signature}}" alt="Principal Signature" class="cert-sig-img" />
        <div class="cert-sig-line"></div>
        <div class="cert-sig-name">{{principal_name}}</div>
        <div class="cert-sig-title">Principal & Head of Institution</div>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.cert-guilloche-official { font-family: 'Cinzel', 'Georgia', 'Times New Roman', serif; width: 1123px; height: 794px; min-height: 794px; max-height: 794px; box-sizing: border-box; overflow: hidden; margin: 0 auto; background-color: #fafbfc; background-image: url('/official-certificate-border.jpg'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; position: relative; padding: 78px 115px 72px 115px; display: flex; flex-direction: column; justify-content: space-between; text-align: center; color: #020617; }
.cert-content-inner { height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
.cert-header-section { display: flex; flex-direction: column; align-items: center; margin-top: 0; }
.cert-school-logo { width: 78px; height: 78px; object-fit: contain; margin-bottom: 3px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12)); }
.cert-school-name { font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: 2px; text-transform: uppercase; margin: 0; line-height: 1.15; }
.cert-school-meta { font-size: 10px; font-weight: 600; color: #334155; letter-spacing: 0.8px; margin: 2px 0 0 0; }
.cert-title-section { margin: 4px 0; }
.cert-main-title { font-size: 24px; font-weight: 900; color: #09090b; letter-spacing: 2px; text-transform: uppercase; margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.cert-title-divider { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 2px; }
.cert-diamond { color: #1e3a8a; font-size: 11px; }
.cert-line { display: inline-block; width: 65px; height: 1.5px; background: #0f172a; }
.cert-subtitle { font-size: 9.5px; font-weight: 800; color: #1e3a8a; letter-spacing: 2px; text-transform: uppercase; }
.cert-recipient-section { margin: 2px 0; }
.cert-presents-label { font-size: 9.5px; font-weight: 800; letter-spacing: 2px; color: #475569; text-transform: uppercase; margin: 0 0 2px 0; }
.cert-student-name { font-family: 'Great Vibes', 'Brush Script MT', 'Palatino', cursive, serif; font-size: 44px; font-weight: bold; color: #0b1f44; margin: 0; line-height: 1.1; text-shadow: 0 1px 1px rgba(0,0,0,0.12); }
.cert-student-details { font-size: 11px; font-weight: 600; color: #1e293b; margin-top: 2px; letter-spacing: 0.5px; }
.cert-body-section { max-width: 800px; margin: 0 auto; }
.cert-body-paragraph { font-family: 'Georgia', serif; font-size: 13.5px; line-height: 1.55; color: #09090b; font-style: italic; font-weight: 600; margin: 0; }
.cert-footer-section { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 4px; margin-top: 4px; }
.cert-left-meta { text-align: left; font-size: 10px; font-weight: 600; color: #0f172a; width: 220px; }
.cert-meta-item { margin-bottom: 2px; }
.cert-meta-item span { color: #475569; font-weight: 500; }
.cert-qr-container { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
.cert-qr-img { width: 54px; height: 54px; border: 1.5px solid #0f172a; padding: 2px; background: #ffffff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.cert-qr-text span { display: block; font-size: 8px; color: #334155; font-weight: 800; text-transform: uppercase; }
.cert-qr-text code { display: block; font-size: 8px; font-family: monospace; color: #0f172a; font-weight: 900; }
.cert-center-seal { text-align: center; }
.cert-stamp-img { width: 72px; height: 72px; object-fit: contain; margin: 0 auto 3px auto; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.12)); }
.cert-stamp-label { display: block; font-size: 8px; color: #334155; letter-spacing: 1px; text-transform: uppercase; font-weight: 800; }
.cert-right-signature { text-align: center; width: 220px; }
.cert-sig-img { height: 46px; max-width: 170px; object-fit: contain; margin: 0 auto -2px auto; }
.cert-sig-line { border-top: 1.5px solid #0f172a; width: 100%; margin-bottom: 3px; }
.cert-sig-name { font-size: 11.5px; font-weight: 900; color: #020617; text-transform: uppercase; letter-spacing: 0.5px; }
.cert-sig-title { font-size: 9px; font-weight: 600; color: #475569; }`,
  },

  // Certificate 2: Modern Gradient Achievement Award
  {
    id: 'tmpl-cert-02',
    name: 'Modern Gradient Achievement Award',
    category: 'CERTIFICATE',
    description: 'Sleek corporate violet-indigo geometric certificate with sharp typography and digital badge.',
    page_size: 'A4',
    orientation: 'landscape',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'certificate_title', 'certificate_body', 'certificate_number', 'issue_date', 'principal_name', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="cert-modern-grad">
  <div class="mod-top-strip"></div>
  <div class="mod-body">
    <div class="mod-header">
      <div class="mod-logo-box">
        <img src="{{school_logo}}" alt="Logo" class="mod-logo" />
        <div>
          <h2>{{school_name}}</h2>
          <p>{{school_address}}</p>
        </div>
      </div>
      <div class="mod-badge">EXCELLENCE AWARD</div>
    </div>

    <div class="mod-title-area">
      <h1>{{certificate_title}}</h1>
      <p class="presented">THIS SPECIAL RECOGNITION IS AWARDED TO</p>
    </div>

    <div class="mod-hero-student">
      {{student_name}}
    </div>

    <p class="mod-text-body">
      {{certificate_body}}
    </p>

    <div class="mod-footer">
      <div class="mod-meta">
        <div><strong>Certificate ID:</strong> {{certificate_number}}</div>
        <div><strong>Issued On:</strong> {{issue_date}}</div>
        <div class="mod-qr-row">
          <img src="{{qr_code}}" alt="QR" class="mod-qr" />
          <span>{{verification_code}}</span>
        </div>
      </div>

      <div class="mod-seal">
        <img src="{{school_stamp}}" alt="Stamp" />
      </div>

      <div class="mod-sig">
        <img src="{{principal_signature}}" alt="Signature" class="mod-sig-img" />
        <div class="mod-line"></div>
        <strong>{{principal_name}}</strong>
        <span>Principal & Executive Director</span>
      </div>
    </div>
  </div>
  <div class="mod-bottom-strip"></div>
</div>`,
    css_content: `.cert-modern-grad { font-family: 'Inter', -apple-system, sans-serif; width: 1123px; height: 794px; min-height: 794px; max-height: 794px; box-sizing: border-box; overflow: hidden; margin: 0 auto; background: #ffffff; color: #0f172a; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; }
.mod-top-strip { height: 10px; flex-shrink: 0; background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899); }
.mod-bottom-strip { height: 10px; flex-shrink: 0; background: linear-gradient(90deg, #ec4899, #7c3aed, #4f46e5); }
.mod-body { padding: 22px 36px; height: calc(100% - 20px); box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }

.mod-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.mod-logo-box { display: flex; align-items: center; gap: 12px; text-align: left; }
.mod-logo { width: 52px; height: 52px; object-fit: contain; }
.mod-logo-box h2 { margin: 0; font-size: 17px; font-weight: 800; color: #1e1b4b; text-transform: uppercase; }
.mod-logo-box p { margin: 1px 0 0 0; font-size: 9px; color: #64748b; }
.mod-badge { background: #ede9fe; color: #6d28d9; font-size: 9px; font-weight: 800; padding: 3px 10px; border-radius: 999px; letter-spacing: 1px; }

.mod-title-area { text-align: center; margin-top: 4px; }
.mod-title-area h1 { margin: 0; font-size: 23px; font-weight: 900; color: #4338ca; letter-spacing: -0.5px; text-transform: uppercase; }
.presented { font-size: 9px; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; margin: 4px 0 0 0; }

.mod-hero-student { text-align: center; font-size: 28px; font-weight: 900; color: #0f172a; margin: 4px 0 8px 0; border-bottom: 2px solid #e0e7ff; display: inline-block; padding: 0 20px 3px 20px; }
.mod-text-body { font-size: 11.5px; color: #475569; max-width: 700px; margin: 0 auto 10px auto; line-height: 1.55; }

.mod-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f5f9; padding-top: 8px; }
.mod-meta { text-align: left; font-size: 9px; color: #475569; }
.mod-meta div { margin-bottom: 2px; }
.mod-qr-row { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.mod-qr { width: 38px; height: 38px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 1px; }
.mod-qr-row span { font-size: 7px; font-family: monospace; color: #64748b; }

.mod-seal img { width: 52px; height: 52px; opacity: 0.9; }

.mod-sig { text-align: center; width: 170px; }
.mod-sig-img { height: 34px; object-fit: contain; margin-bottom: -4px; }
.mod-line { border-top: 1.5px solid #6366f1; margin-bottom: 3px; }
.mod-sig strong { display: block; font-size: 10.5px; color: #1e1b4b; }
.mod-sig span { font-size: 8px; color: #64748b; }`,
  },

  // Certificate 3: Vintage Parchment Academic Diploma
  {
    id: 'tmpl-cert-03',
    name: 'Vintage Parchment Academic Diploma',
    category: 'CERTIFICATE',
    description: 'Heritage gothic styling with parchment textured aesthetic, classical Roman font, and heraldic diploma title.',
    page_size: 'A4',
    orientation: 'landscape',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'certificate_title', 'certificate_body', 'certificate_number', 'issue_date', 'principal_name', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="cert-parchment">
  <div class="parchment-frame">
    <div class="parchment-header">
      <img src="{{school_logo}}" alt="Seal" class="p-logo" />
      <div class="p-inst">
        <h2>{{school_name}}</h2>
        <p>{{school_address}}</p>
      </div>
      <div class="p-qr">
        <img src="{{qr_code}}" alt="QR" />
        <span>{{certificate_number}}</span>
      </div>
    </div>

    <div class="p-heading">
      <h1>Diploma of Honor</h1>
      <div class="p-sub-title">{{certificate_title}}</div>
    </div>

    <p class="p-testamur">BE IT KNOWN UNTO ALL THAT</p>
    <div class="p-student">{{student_name}}</div>

    <p class="p-body">
      {{certificate_body}}
    </p>

    <div class="p-footer">
      <div class="p-date-col">
        <p><strong>Registry Folio:</strong> {{certificate_number}}</p>
        <p><strong>Dated:</strong> {{issue_date}}</p>
      </div>

      <div class="p-seal-col">
        <img src="{{school_stamp}}" alt="Wax Seal" class="wax-seal" />
      </div>

      <div class="p-sig-col">
        <img src="{{principal_signature}}" alt="Sig" class="p-sig" />
        <div class="p-rule"></div>
        <strong>{{principal_name}}</strong>
        <span>Chancellor & Principal</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.cert-parchment { font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; width: 1123px; height: 794px; min-height: 794px; max-height: 794px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 18px; background: #fef9c3; color: #451a03; display: flex; flex-direction: column; }
.parchment-frame { border: 3px double #78350f; padding: 20px 30px; background: #fffbeb; text-align: center; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
.parchment-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #b45309; padding-bottom: 6px; margin-bottom: 8px; }
.p-logo { width: 58px; height: 58px; object-fit: contain; }
.p-inst h2 { margin: 0; font-size: 18px; font-weight: bold; color: #78350f; letter-spacing: 1px; text-transform: uppercase; }
.p-inst p { margin: 2px 0 0 0; font-size: 8.5px; color: #92400e; }
.p-qr img { width: 40px; height: 40px; border: 1px solid #b45309; }
.p-qr span { display: block; font-size: 7px; color: #78350f; font-family: monospace; }

.p-heading h1 { font-family: 'Old English Text MT', 'UnifrakturMaguntia', serif; font-size: 30px; color: #78350f; margin: 4px 0 0 0; }
.p-sub-title { font-size: 10.5px; font-style: italic; color: #b45309; letter-spacing: 1px; }

.p-testamur { font-size: 8.5px; letter-spacing: 2px; color: #a16207; margin-top: 8px; margin-bottom: 2px; }
.p-student { font-family: 'Brush Script MT', cursive, serif; font-size: 34px; color: #78350f; margin-bottom: 6px; }
.p-body { font-size: 11.5px; color: #451a03; max-width: 680px; margin: 0 auto 10px auto; line-height: 1.55; }

.p-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #d97706; padding-top: 8px; }
.p-date-col { text-align: left; font-size: 9px; color: #78350f; }
.p-date-col p { margin: 2px 0; }
.wax-seal { width: 54px; height: 54px; }

.p-sig-col { text-align: center; width: 160px; }
.p-sig { height: 32px; object-fit: contain; margin-bottom: -4px; }
.p-rule { border-top: 1px solid #78350f; margin-bottom: 3px; }
.p-sig-col strong { display: block; font-size: 10px; color: #78350f; }
.p-sig-col span { font-size: 7.5px; color: #92400e; }`,
  },

  // Certificate 4: Minimalist Clean Merit Certificate
  {
    id: 'tmpl-cert-04',
    name: 'Minimalist Clean Merit Certificate',
    category: 'CERTIFICATE',
    description: 'Ultra clean modern Swiss layout with emerald border framing and high legibility typography.',
    page_size: 'A4',
    orientation: 'landscape',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'certificate_title', 'certificate_body', 'certificate_number', 'issue_date', 'principal_name', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="cert-clean-merit">
  <div class="clean-border">
    <div class="c-head">
      <div class="c-left">
        <img src="{{school_logo}}" alt="Logo" class="c-logo" />
        <div>
          <h1>{{school_name}}</h1>
          <p>{{school_address}}</p>
        </div>
      </div>
      <div class="c-qr-col">
        <img src="{{qr_code}}" alt="QR" />
        <code>{{certificate_number}}</code>
      </div>
    </div>

    <div class="c-main">
      <span class="c-badge">CERTIFICATE OF MERIT</span>
      <h2>{{certificate_title}}</h2>
      <p class="award-to">Presented with highest commendation to</p>
      <div class="c-name">{{student_name}}</div>
      <p class="c-text">{{certificate_body}}</p>
    </div>

    <div class="c-foot">
      <div class="c-date">
        <small>DATE OF ISSUANCE</small>
        <p>{{issue_date}}</p>
      </div>
      <div class="c-stamp">
        <img src="{{school_stamp}}" alt="Seal" />
      </div>
      <div class="c-sign">
        <img src="{{principal_signature}}" alt="Sig" />
        <div class="line"></div>
        <small>{{principal_name}}</small>
        <span>Head of School</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.cert-clean-merit { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; width: 1123px; height: 794px; min-height: 794px; max-height: 794px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 18px; background: #ffffff; color: #0f172a; display: flex; flex-direction: column; }
.clean-border { border: 2px solid #059669; padding: 20px 32px; border-radius: 6px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
.c-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px; }
.c-left { display: flex; align-items: center; gap: 12px; }
.c-logo { width: 48px; height: 48px; object-fit: contain; }
.c-left h1 { margin: 0; font-size: 16px; font-weight: 800; color: #065f46; text-transform: uppercase; }
.c-left p { margin: 1px 0 0 0; font-size: 8.5px; color: #64748b; }
.c-qr-col { text-align: center; }
.c-qr-col img { width: 38px; height: 38px; }
.c-qr-col code { font-size: 7px; color: #64748b; }

.c-main { text-align: center; padding: 6px 0; }
.c-badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 8.5px; font-weight: 800; padding: 2.5px 8px; border-radius: 999px; letter-spacing: 1px; margin-bottom: 4px; }
.c-main h2 { margin: 0; font-size: 21px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; }
.award-to { font-size: 9px; color: #64748b; margin: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 1px; }
.c-name { font-size: 27px; font-weight: 900; color: #047857; margin-bottom: 6px; }
.c-text { font-size: 11.5px; color: #475569; max-width: 680px; margin: 0 auto 10px auto; line-height: 1.55; }

.c-foot { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 8px; }
.c-date small { font-size: 7px; font-weight: 700; color: #64748b; display: block; }
.c-date p { margin: 2px 0 0 0; font-size: 10.5px; font-weight: 700; color: #0f172a; }
.c-stamp img { width: 48px; height: 48px; opacity: 0.85; }

.c-sign { text-align: center; width: 150px; }
.c-sign img { height: 30px; object-fit: contain; margin-bottom: -4px; }
.c-sign .line { border-top: 1px solid #047857; margin-bottom: 3px; }
.c-sign small { font-size: 9px; font-weight: bold; color: #0f172a; display: block; }
.c-sign span { font-size: 7.5px; color: #64748b; }`,
  },

  // Certificate 5: Athletic & Sports Champion Certificate
  {
    id: 'tmpl-cert-05',
    name: 'Athletic & Sports Champion Certificate',
    category: 'CERTIFICATE',
    description: 'Dynamic crimson and gold athletic award certificate with victory laurel wreath badge.',
    page_size: 'A4',
    orientation: 'landscape',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'certificate_title', 'certificate_body', 'certificate_number', 'issue_date', 'principal_name', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="cert-sports-champ">
  <div class="sports-border">
    <div class="sp-header">
      <img src="{{school_logo}}" alt="Logo" class="sp-logo" />
      <div class="sp-center">
        <h1>{{school_name}}</h1>
        <p>ANNUAL ATHLETIC & SCHOLASTIC CHAMPIONSHIP</p>
      </div>
      <div class="sp-qr">
        <img src="{{qr_code}}" alt="QR" />
        <span>{{certificate_number}}</span>
      </div>
    </div>

    <div class="sp-hero">
      <div class="laurel-badge">&#9733; VICTORY & MERIT &#9733;</div>
      <h2>{{certificate_title}}</h2>
      <p class="sp-intro">THIS HONOR IS ACCORDED TO</p>
      <h1 class="sp-champ-name">{{student_name}}</h1>
      <p class="sp-desc">{{certificate_body}}</p>
    </div>

    <div class="sp-bottom">
      <div class="sp-meta">
        <div><strong>Record ID:</strong> {{certificate_number}}</div>
        <div><strong>Award Date:</strong> {{issue_date}}</div>
      </div>
      <div class="sp-seal">
        <img src="{{school_stamp}}" alt="Seal" />
      </div>
      <div class="sp-sig">
        <img src="{{principal_signature}}" alt="Sig" />
        <div class="sp-line"></div>
        <strong>{{principal_name}}</strong>
        <span>Sports Director / Principal</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.cert-sports-champ { font-family: 'Segoe UI', 'Impact', sans-serif; width: 1123px; height: 794px; min-height: 794px; max-height: 794px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 18px; background: #fff1f2; color: #881337; display: flex; flex-direction: column; }
.sports-border { border: 4px solid #be123c; outline: 2px solid #fb7185; outline-offset: 4px; padding: 20px 28px; background: #ffffff; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
.sp-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #be123c; padding-bottom: 8px; margin-bottom: 8px; }
.sp-logo { width: 52px; height: 52px; object-fit: contain; }
.sp-center { text-align: center; }
.sp-center h1 { margin: 0; font-size: 18px; font-weight: 900; color: #881337; text-transform: uppercase; }
.sp-center p { margin: 2px 0 0 0; font-size: 8.5px; color: #be123c; font-weight: bold; letter-spacing: 1px; }
.sp-qr img { width: 40px; height: 40px; border: 1px solid #be123c; }
.sp-qr span { display: block; font-size: 7px; color: #881337; font-family: monospace; }

.sp-hero { text-align: center; padding: 4px 0; }
.laurel-badge { display: inline-block; background: #be123c; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2.5px 10px; border-radius: 999px; letter-spacing: 1px; margin-bottom: 3px; }
.sp-hero h2 { margin: 0; font-size: 22px; font-weight: 900; color: #be123c; text-transform: uppercase; }
.sp-intro { font-size: 8.5px; font-weight: 700; color: #9f1239; letter-spacing: 1.5px; margin: 6px 0 2px 0; }
.sp-champ-name { font-size: 30px; font-weight: 900; color: #881337; margin: 2px 0 6px 0; text-transform: uppercase; }
.sp-desc { font-size: 11.5px; color: #4c0519; max-width: 680px; margin: 0 auto 10px auto; line-height: 1.5; font-weight: 500; }

.sp-bottom { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #fecdd3; padding-top: 8px; }
.sp-meta { text-align: left; font-size: 9px; color: #881337; }
.sp-seal img { width: 50px; height: 50px; }
.sp-sig { text-align: center; width: 160px; }
.sp-sig img { height: 32px; object-fit: contain; margin-bottom: -4px; }
.sp-line { border-top: 1.5px solid #be123c; margin-bottom: 3px; }
.sp-sig strong { display: block; font-size: 10px; color: #881337; }
.sp-sig span { font-size: 7.5px; color: #9f1239; }`,
  },

  // ==========================================
  // 3. ADMIT CARDS (5 UNIQUE DESIGNS)
  // ==========================================

  // Admit Card 1: Standard CBSE Board Hall Ticket
  {
    id: 'tmpl-admit-01',
    name: 'Standard CBSE Board Hall Ticket',
    category: 'ADMIT_CARD',
    description: 'Clean official examination hall pass with tabular timetable, student photo, candidate guidelines, and verification QR.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'exam_name', 'schedule_list', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="admit-cbse">
  <div class="admit-header">
    <img src="{{school_logo}}" alt="Logo" class="admit-logo" />
    <div class="admit-school-info">
      <h1>{{school_name}}</h1>
      <p>{{school_address}} &bull; Phone: {{school_phone}}</p>
      <div class="hall-ticket-badge">EXAMINATION HALL TICKET &bull; {{academic_session}}</div>
    </div>
    <div class="admit-qr-col">
      <img src="{{qr_code}}" alt="QR" class="admit-qr" />
      <span>{{verification_code}}</span>
    </div>
  </div>

  <div class="exam-bar">
    <h2>{{exam_name}} &bull; OFFICIAL ENTRY PASS</h2>
  </div>

  <div class="candidate-box">
    <img src="{{student_photo}}" alt="Candidate" class="cand-photo" />
    <div class="cand-grid">
      <div><span class="lbl">Candidate Name:</span> <strong class="val">{{student_name}}</strong></div>
      <div><span class="lbl">Admission No:</span> <strong class="val font-mono">{{admission_number}}</strong></div>
      <div><span class="lbl">Roll Number:</span> <strong class="val font-mono">{{roll_number}}</strong></div>
      <div><span class="lbl">Class & Section:</span> <strong class="val">{{class_name}} (Sec {{section}})</strong></div>
      <div><span class="lbl">Father's Name:</span> <strong class="val">{{father_name}}</strong></div>
      <div><span class="lbl">Date of Birth:</span> <strong class="val">{{date_of_birth}}</strong></div>
    </div>
  </div>

  <div class="timetable-section">
    <div class="table-heading">CONFIRMED EXAMINATION SCHEDULE & ROOM ALLOTMENT</div>
    <table class="admit-table">
      <thead>
        <tr>
          <th style="width: 20%;">Date</th>
          <th style="width: 20%;">Time Slot</th>
          <th style="width: 40%;">Subject Paper</th>
          <th style="width: 20%;">Room / Hall</th>
        </tr>
      </thead>
      <tbody>
        {{#each schedule_list}}
        <tr>
          <td class="font-bold">{{date}}</td>
          <td class="mono-time">{{time}}</td>
          <td class="font-bold text-indigo">{{subject_name}}</td>
          <td class="font-mono">{{room_no}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  <div class="instructions-box">
    <strong>IMPORTANT CANDIDATE INSTRUCTIONS:</strong>
    <ol>
      <li>Candidates must arrive at the examination center at least 15 minutes before the scheduled time.</li>
      <li>This Admit Card along with an official Student ID must be presented for verification at the entry gate.</li>
      <li>Electronic devices, smartwatches, and programmable calculators are strictly prohibited inside the hall.</li>
    </ol>
  </div>

  <div class="admit-signatures">
    <div class="sig-item">
      <div class="sig-space"></div>
      <span>Candidate's Signature</span>
    </div>
    <div class="stamp-item">
      <img src="{{school_stamp}}" alt="Seal" />
      <span>Center Superintendent Seal</span>
    </div>
    <div class="sig-item">
      <img src="{{principal_signature}}" alt="Sig" class="sig-img" />
      <div class="sig-space"></div>
      <span>Principal &bull; {{principal_name}}</span>
    </div>
  </div>
</div>`,
    css_content: `.admit-cbse { font-family: 'Segoe UI', Inter, sans-serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 26px 30px; background: #ffffff; color: #1e293b; line-height: 1.4; display: flex; flex-direction: column; justify-content: space-between; }
.admit-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #1e40af; padding-bottom: 12px; margin-bottom: 12px; }
.admit-logo { width: 68px; height: 68px; object-fit: contain; }
.admit-school-info { text-align: center; flex: 1; }
.admit-school-info h1 { margin: 0; font-size: 19px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
.admit-school-info p { margin: 2px 0 0 0; font-size: 9.5px; color: #64748b; }
.hall-ticket-badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 9.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px; margin-top: 4px; }
.admit-qr { width: 58px; height: 58px; border: 1px solid #cbd5e1; padding: 2px; }
.admit-qr-col { text-align: center; }
.admit-qr-col span { display: block; font-size: 7px; color: #64748b; font-family: monospace; }

.exam-bar { background: #1e40af; color: #ffffff; text-align: center; padding: 6px; border-radius: 4px; margin-bottom: 12px; }
.exam-bar h2 { margin: 0; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }

.candidate-box { display: flex; gap: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; align-items: center; }
.cand-photo { width: 64px; height: 74px; object-fit: cover; border-radius: 4px; border: 2px solid #cbd5e1; }
.cand-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 14px; flex: 1; font-size: 11px; }
.cand-grid .lbl { color: #64748b; font-size: 9.5px; }
.cand-grid .val { color: #0f172a; margin-left: 3px; }

.timetable-section { margin-bottom: 14px; }
.table-heading { font-size: 10px; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
.admit-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.admit-table th { background: #1e3a8a; color: #ffffff; padding: 7px 10px; text-align: left; font-size: 9.5px; font-weight: 700; text-transform: uppercase; }
.admit-table td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
.admit-table tbody tr:nth-child(even) { background: #f8fafc; }
.text-indigo { color: #1e40af; font-weight: 700; }
.mono-time { font-family: monospace; font-size: 10.5px; }

.instructions-box { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 8px 12px; font-size: 9.5px; border-radius: 4px; margin-bottom: 20px; }
.instructions-box strong { color: #b45309; display: block; margin-bottom: 4px; font-size: 10px; }
.instructions-box ol { margin: 0; padding-left: 16px; color: #78350f; line-height: 1.5; }

.admit-signatures { display: flex; justify-content: space-between; align-items: flex-end; }
.sig-item { text-align: center; width: 140px; }
.sig-space { border-top: 1px dashed #94a3b8; margin-top: 30px; margin-bottom: 3px; }
.sig-item span { font-size: 9px; color: #64748b; }
.sig-img { height: 34px; object-fit: contain; margin-bottom: -4px; }
.stamp-item { text-align: center; }
.stamp-item img { width: 50px; height: 50px; opacity: 0.85; margin: 0 auto 2px; }
.stamp-item span { display: block; font-size: 7.5px; color: #94a3b8; text-transform: uppercase; }`,
  },

  // Admit Card 2: Modern Hexagon Photo Admit Card
  {
    id: 'tmpl-admit-02',
    name: 'Modern Hexagon Photo Admit Card',
    category: 'ADMIT_CARD',
    description: 'Tech-inspired dark indigo examination pass with candidate barcode and verified hall allocation grid.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'exam_name', 'schedule_list', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="admit-hexagon">
  <div class="hex-top-bar">
    <div class="hex-brand">
      <img src="{{school_logo}}" alt="Logo" class="hex-logo" />
      <div>
        <h1>{{school_name}}</h1>
        <p>{{school_address}}</p>
      </div>
    </div>
    <div class="hex-qr-box">
      <img src="{{qr_code}}" alt="QR" />
      <span>{{verification_code}}</span>
    </div>
  </div>

  <div class="hex-title">
    <h2>OFFICIAL CANDIDATE ADMIT PASS &bull; {{exam_name}}</h2>
  </div>

  <div class="hex-profile">
    <img src="{{student_photo}}" alt="Candidate" class="hex-photo" />
    <div class="hex-info">
      <div class="h-row"><span class="h-k">CANDIDATE:</span> <strong class="h-v">{{student_name}}</strong></div>
      <div class="h-row"><span class="h-k">ROLL NUMBER:</span> <strong class="h-v purple">{{roll_number}}</strong></div>
      <div class="h-row"><span class="h-k">ADMISSION NO:</span> <strong class="h-v purple">{{admission_number}}</strong></div>
      <div class="h-row"><span class="h-k">CLASS / SECTION:</span> <strong class="h-v">{{class_name}} - {{section}}</strong></div>
      <div class="h-row"><span class="h-k">GUARDIAN:</span> <strong class="h-v">{{father_name}}</strong></div>
      <div class="h-row"><span class="h-k">SESSION:</span> <strong class="h-v">{{academic_session}}</strong></div>
    </div>
  </div>

  <table class="hex-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Course Paper</th>
        <th>Hall / Room</th>
        <th>Sign of Invigilator</th>
      </tr>
    </thead>
    <tbody>
      {{#each schedule_list}}
      <tr>
        <td class="font-bold">{{date}}</td>
        <td>{{time}}</td>
        <td class="font-bold text-purp">{{subject_name}}</td>
        <td class="font-mono">{{room_no}}</td>
        <td class="invig-sign"></td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="hex-rules">
    <strong>EXAM CENTER CODE OF CONDUCT:</strong>
    <p>Gate closes 10 minutes prior to exam start. Mobile phones and unauthorized materials will result in immediate disqualification.</p>
  </div>

  <div class="hex-signatures">
    <div class="hex-sig"><div class="line"></div><span>Candidate Signature</span></div>
    <div class="hex-seal"><img src="{{school_stamp}}" alt="Seal" /></div>
    <div class="hex-sig">
      <img src="{{principal_signature}}" alt="Sig" class="hex-sig-pic" />
      <div class="line"></div>
      <span>{{principal_name}} (Principal)</span>
    </div>
  </div>
</div>`,
    css_content: `.admit-hexagon { font-family: 'Inter', -apple-system, sans-serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 24px 28px; background: #ffffff; color: #0f172a; display: flex; flex-direction: column; justify-content: space-between; }
.hex-top-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-bottom: 10px; }
.hex-brand { display: flex; align-items: center; gap: 10px; }
.hex-logo { width: 56px; height: 56px; object-fit: contain; }
.hex-brand h1 { margin: 0; font-size: 18px; font-weight: 900; color: #312e81; text-transform: uppercase; }
.hex-brand p { margin: 2px 0 0 0; font-size: 9.5px; color: #64748b; }
.hex-qr-box { text-align: center; }
.hex-qr-box img { width: 52px; height: 52px; border: 1px solid #6366f1; padding: 2px; border-radius: 4px; }
.hex-qr-box span { display: block; font-size: 7px; color: #64748b; font-family: monospace; }

.hex-title { background: #4338ca; color: #ffffff; text-align: center; padding: 5px; border-radius: 4px; margin-bottom: 12px; }
.hex-title h2 { margin: 0; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px; }

.hex-profile { display: flex; gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; align-items: center; }
.hex-photo { width: 60px; height: 68px; object-fit: cover; border-radius: 6px; border: 2px solid #6366f1; }
.hex-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 12px; flex: 1; font-size: 10.5px; }
.h-k { color: #64748b; font-size: 9px; }
.h-v { color: #0f172a; margin-left: 2px; }
.purple { color: #4338ca; }

.hex-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10.5px; }
.hex-table th { background: #1e1b4b; color: #ffffff; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; font-weight: 700; }
.hex-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
.hex-table tbody tr:nth-child(even) { background: #f8fafc; }
.text-purp { color: #4338ca; }
.invig-sign { width: 90px; border-bottom: 1px dashed #cbd5e1; }

.hex-rules { background: #ede9fe; border: 1px solid #ddd6fe; padding: 6px 10px; font-size: 9.5px; border-radius: 4px; margin-bottom: 16px; }
.hex-rules strong { color: #5b21b6; }
.hex-rules p { margin: 2px 0 0 0; color: #6d28d9; }

.hex-signatures { display: flex; justify-content: space-between; align-items: flex-end; }
.hex-sig { text-align: center; width: 140px; }
.hex-sig .line { border-top: 1px solid #6366f1; margin-top: 26px; margin-bottom: 2px; }
.hex-sig span { font-size: 8.5px; color: #64748b; }
.hex-sig-pic { height: 32px; object-fit: contain; margin-bottom: -4px; }
.hex-seal img { width: 48px; height: 48px; opacity: 0.85; }`,
  },

  // Admit Card 3: Compact Fast-Pass Entry Card
  {
    id: 'tmpl-admit-03',
    name: 'Compact Fast-Pass Entry Card',
    category: 'ADMIT_CARD',
    description: 'Emerald green minimal fast-entry hall ticket designed for rapid barcode gate verification.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'exam_name', 'schedule_list', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="admit-fastpass">
  <div class="fp-head">
    <div class="fp-left">
      <img src="{{school_logo}}" alt="Logo" class="fp-logo" />
      <div>
        <h1>{{school_name}}</h1>
        <p>{{school_address}}</p>
      </div>
    </div>
    <div class="fp-badge">FAST-PASS ENTRY &bull; {{academic_session}}</div>
  </div>

  <div class="fp-hero-bar">
    <h2>{{exam_name}} &bull; HALL TICKET</h2>
  </div>

  <div class="fp-body">
    <div class="fp-cand">
      <img src="{{student_photo}}" alt="Student" class="fp-photo" />
      <div class="fp-details">
        <p><strong>Candidate:</strong> {{student_name}}</p>
        <p><strong>Roll No:</strong> <span class="mono em">{{roll_number}}</span></p>
        <p><strong>Adm No:</strong> <span class="mono">{{admission_number}}</span></p>
        <p><strong>Class:</strong> {{class_name}} - {{section}}</p>
      </div>
      <div class="fp-qr-box">
        <img src="{{qr_code}}" alt="QR" />
        <code>{{verification_code}}</code>
      </div>
    </div>

    <table class="fp-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Slot</th>
          <th>Subject Module</th>
          <th>Room</th>
        </tr>
      </thead>
      <tbody>
        {{#each schedule_list}}
        <tr>
          <td class="bold">{{date}}</td>
          <td>{{time}}</td>
          <td class="bold em">{{subject_name}}</td>
          <td>{{room_no}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="fp-footer">
      <div class="fp-note">
        <strong>Gate Rule:</strong> Please keep this card visible around your desk at all times.
      </div>
      <div class="fp-sig">
        <img src="{{principal_signature}}" alt="Sig" />
        <p>{{principal_name}} (Principal)</p>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.admit-fastpass { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 24px 28px; background: #ffffff; color: #0f172a; border: 2px solid #059669; border-radius: 6px; display: flex; flex-direction: column; justify-content: space-between; }
.fp-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.fp-left { display: flex; align-items: center; gap: 10px; }
.fp-logo { width: 50px; height: 50px; object-fit: contain; }
.fp-left h1 { margin: 0; font-size: 16px; font-weight: 800; color: #065f46; }
.fp-left p { margin: 1px 0 0 0; font-size: 9px; color: #64748b; }
.fp-badge { background: #d1fae5; color: #065f46; font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 4px; }

.fp-hero-bar { background: #059669; color: #ffffff; padding: 4px 10px; border-radius: 4px; text-align: center; margin-bottom: 10px; }
.fp-hero-bar h2 { margin: 0; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; }

.fp-cand { display: flex; gap: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; align-items: center; }
.fp-photo { width: 56px; height: 64px; object-fit: cover; border-radius: 4px; border: 1px solid #059669; }
.fp-details { flex: 1; font-size: 10.5px; }
.fp-details p { margin: 2px 0; }
.em { color: #059669; font-weight: bold; }
.fp-qr-box { text-align: center; }
.fp-qr-box img { width: 44px; height: 44px; }
.fp-qr-box code { font-size: 7px; color: #065f46; display: block; }

.fp-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 12px; }
.fp-table th { background: #047857; color: #ffffff; padding: 5px 8px; text-align: left; font-size: 9px; }
.fp-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
.fp-table tbody tr:nth-child(even) { background: #f8fafc; }
.bold { font-weight: bold; }

.fp-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
.fp-note { font-size: 9px; color: #475569; }
.fp-sig { text-align: center; }
.fp-sig img { height: 28px; object-fit: contain; }
.fp-sig p { margin: 1px 0 0 0; font-size: 8.5px; color: #065f46; font-weight: bold; }`,
  },

  // Admit Card 4: Premium Secure Barcode Hall Pass
  {
    id: 'tmpl-admit-04',
    name: 'Premium Secure Barcode Hall Pass',
    category: 'ADMIT_CARD',
    description: 'Amber & slate secure examination admit card with security barcode, invigilator sign blocks, and session timetable.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'exam_name', 'schedule_list', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="admit-secure">
  <div class="sec-outer">
    <div class="sec-header">
      <img src="{{school_logo}}" alt="Logo" class="sec-logo" />
      <div class="sec-inst">
        <h1>{{school_name}}</h1>
        <p>{{school_address}} &bull; Email: {{school_email}}</p>
        <div class="sec-tag">EXAMINATION ADMISSION & HALL PASS &bull; {{academic_session}}</div>
      </div>
      <div class="sec-qr-wrap">
        <img src="{{qr_code}}" alt="QR" />
        <span>{{verification_code}}</span>
      </div>
    </div>

    <div class="sec-exam-banner">
      <h2>{{exam_name}}</h2>
    </div>

    <div class="sec-cand-card">
      <img src="{{student_photo}}" alt="Candidate" class="sec-cand-img" />
      <div class="sec-meta-table">
        <div><span>Candidate Name:</span> <strong>{{student_name}}</strong></div>
        <div><span>Enrollment ID:</span> <strong>{{admission_number}}</strong></div>
        <div><span>Roll Number:</span> <strong>{{roll_number}}</strong></div>
        <div><span>Class Cohort:</span> <strong>{{class_name}} - {{section}}</strong></div>
        <div><span>Father's Name:</span> <strong>{{father_name}}</strong></div>
        <div><span>Birth Date:</span> <strong>{{date_of_birth}}</strong></div>
      </div>
    </div>

    <table class="sec-schedule-table">
      <thead>
        <tr>
          <th style="width: 20%;">Exam Date</th>
          <th style="width: 20%;">Time Slot</th>
          <th style="width: 40%;">Subject Paper</th>
          <th style="width: 20%;">Assigned Room</th>
        </tr>
      </thead>
      <tbody>
        {{#each schedule_list}}
        <tr>
          <td class="font-bold">{{date}}</td>
          <td class="font-mono">{{time}}</td>
          <td class="font-bold text-amber">{{subject_name}}</td>
          <td class="font-mono">{{room_no}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="sec-instructions">
      <strong>CANDIDATE DISCIPLINE DIRECTIVES:</strong>
      <p>1. Candidates must occupy their seats 10 minutes prior to commencement. 2. No candidate shall leave the hall before half-time. 3. Hall ticket is mandatory for all days.</p>
    </div>

    <div class="sec-footer-sigs">
      <div class="sec-sig-col">
        <div class="s-rule"></div>
        <span>Candidate's Signature</span>
      </div>
      <div class="sec-seal-col">
        <img src="{{school_stamp}}" alt="Seal" />
        <span>Controller Seal</span>
      </div>
      <div class="sec-sig-col">
        <img src="{{principal_signature}}" alt="Sig" class="s-sig-img" />
        <div class="s-rule"></div>
        <span>{{principal_name}} (Principal)</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.admit-secure { font-family: 'Cinzel', 'Georgia', serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 20px; background: #fafaf9; color: #1c1917; display: flex; flex-direction: column; }
.sec-outer { border: 2px solid #b45309; padding: 18px 24px; background: #ffffff; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
.sec-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #b45309; padding-bottom: 10px; margin-bottom: 10px; }
.sec-logo { width: 62px; height: 62px; object-fit: contain; }
.sec-inst { text-align: center; flex: 1; }
.sec-inst h1 { margin: 0; font-size: 18px; font-weight: 900; color: #78350f; text-transform: uppercase; }
.sec-inst p { margin: 2px 0 0 0; font-size: 9px; color: #64748b; }
.sec-tag { display: inline-block; background: #fef3c7; color: #92400e; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 999px; margin-top: 4px; border: 1px solid #fde68a; }
.sec-qr-wrap { text-align: center; }
.sec-qr-wrap img { width: 50px; height: 50px; border: 1px solid #b45309; padding: 1px; }
.sec-qr-wrap span { display: block; font-size: 7px; color: #78350f; font-family: monospace; }

.sec-exam-banner { background: #b45309; color: #ffffff; text-align: center; padding: 5px; border-radius: 4px; margin-bottom: 10px; }
.sec-exam-banner h2 { margin: 0; font-size: 11.5px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; }

.sec-cand-card { display: flex; gap: 12px; background: #fffdfa; border: 1px solid #fed7aa; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; align-items: center; }
.sec-cand-img { width: 60px; height: 68px; object-fit: cover; border-radius: 4px; border: 1px solid #b45309; }
.sec-meta-table { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 12px; flex: 1; font-size: 10.5px; }
.sec-meta-table span { color: #78716c; font-size: 9px; }
.sec-meta-table strong { color: #1c1917; margin-left: 2px; }

.sec-schedule-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 12px; }
.sec-schedule-table th { background: #78350f; color: #ffffff; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; font-weight: 700; }
.sec-schedule-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
.sec-schedule-table tbody tr:nth-child(even) { background: #fffdfa; }
.text-amber { color: #b45309; font-weight: bold; }

.sec-instructions { background: #fffbeb; border: 1px solid #fef3c7; border-left: 3px solid #b45309; padding: 6px 10px; font-size: 9px; border-radius: 4px; margin-bottom: 16px; }
.sec-instructions strong { color: #78350f; }
.sec-instructions p { margin: 2px 0 0 0; color: #92400e; }

.sec-footer-sigs { display: flex; justify-content: space-between; align-items: flex-end; }
.sec-sig-col { text-align: center; width: 140px; }
.s-rule { border-top: 1px solid #b45309; margin-top: 26px; margin-bottom: 2px; }
.sec-sig-col span { font-size: 8.5px; color: #64748b; }
.s-sig-img { height: 32px; object-fit: contain; margin-bottom: -4px; }
.sec-seal-col { text-align: center; }
.sec-seal-col img { width: 48px; height: 48px; opacity: 0.85; margin: 0 auto 2px; }
.sec-seal-col span { display: block; font-size: 7px; color: #78350f; text-transform: uppercase; }`,
  },

  // Admit Card 5: Dual-Column Clean Examination Ticket
  {
    id: 'tmpl-admit-05',
    name: 'Dual-Column Clean Examination Ticket',
    category: 'ADMIT_CARD',
    description: 'Modern two-column format with candidate profile on the left and timetable & entry pass on the right.',
    page_size: 'A4',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'exam_name', 'schedule_list', 'principal_signature', 'school_stamp', 'qr_code'],
    html_content: `<div class="admit-dual">
  <div class="dual-header">
    <img src="{{school_logo}}" alt="Logo" class="d-logo" />
    <div class="d-info">
      <h1>{{school_name}}</h1>
      <p>{{school_address}} &bull; Session {{academic_session}}</p>
    </div>
    <div class="d-badge">EXAM ADMIT PASS</div>
  </div>

  <div class="dual-exam-title">
    <h2>{{exam_name}}</h2>
  </div>

  <div class="dual-split">
    <!-- Left Column: Student Bio -->
    <div class="dual-left-col">
      <img src="{{student_photo}}" alt="Candidate" class="d-photo" />
      <h3 class="d-name">{{student_name}}</h3>
      <div class="d-bio-item"><small>ROLL NO</small><strong>{{roll_number}}</strong></div>
      <div class="d-bio-item"><small>ADMISSION NO</small><strong>{{admission_number}}</strong></div>
      <div class="d-bio-item"><small>CLASS / SECTION</small><strong>{{class_name}} ({{section}})</strong></div>
      <div class="d-bio-item"><small>FATHER'S NAME</small><strong>{{father_name}}</strong></div>
      <div class="d-qr-wrap">
        <img src="{{qr_code}}" alt="QR" />
        <code>{{verification_code}}</code>
      </div>
    </div>

    <!-- Right Column: Exam Schedule -->
    <div class="dual-right-col">
      <div class="d-sec-title">CONFIRMED SUBJECT TIMETABLE</div>
      <table class="d-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Subject</th>
            <th>Hall</th>
          </tr>
        </thead>
        <tbody>
          {{#each schedule_list}}
          <tr>
            <td class="bold">{{date}}</td>
            <td>{{time}}</td>
            <td class="bold blue">{{subject_name}}</td>
            <td>{{room_no}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>

      <div class="d-rules">
        <small>EXAMINATION CODE</small>
        <p>Report 15 mins prior. Bring ID Card and this Hall Ticket.</p>
      </div>

      <div class="d-sigs">
        <div class="d-sig-item">
          <div class="line"></div>
          <span>Student Sign</span>
        </div>
        <div class="d-sig-item">
          <img src="{{principal_signature}}" alt="Sig" />
          <div class="line"></div>
          <span>Principal</span>
        </div>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.admit-dual { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; width: 794px; height: 1123px; min-height: 1123px; max-height: 1123px; box-sizing: border-box; overflow: hidden; margin: 0 auto; padding: 24px 28px; background: #ffffff; color: #0f172a; border: 2px solid #0284c7; border-radius: 6px; display: flex; flex-direction: column; justify-content: space-between; }
.dual-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 10px; }
.d-logo { width: 52px; height: 52px; object-fit: contain; }
.d-info h1 { margin: 0; font-size: 17px; font-weight: 800; color: #0369a1; text-transform: uppercase; }
.d-info p { margin: 1px 0 0 0; font-size: 9px; color: #64748b; }
.d-badge { background: #0284c7; color: #ffffff; font-size: 9px; font-weight: bold; padding: 3px 8px; border-radius: 4px; }

.dual-exam-title { background: #e0f2fe; border: 1px solid #bae6fd; text-align: center; padding: 4px; border-radius: 4px; margin-bottom: 10px; }
.dual-exam-title h2 { margin: 0; font-size: 11.5px; font-weight: bold; color: #0369a1; }

.dual-split { display: grid; grid-template-columns: 200px 1fr; gap: 14px; }
.dual-left-col { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center; }
.d-photo { width: 72px; height: 82px; object-fit: cover; border-radius: 4px; border: 2px solid #0284c7; margin: 0 auto 6px auto; }
.d-name { margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #0f172a; }
.d-bio-item { text-align: left; margin-bottom: 5px; font-size: 10px; }
.d-bio-item small { display: block; font-size: 7.5px; color: #64748b; font-weight: bold; }
.d-bio-item strong { color: #0369a1; }
.d-qr-wrap { margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
.d-qr-wrap img { width: 48px; height: 48px; margin: 0 auto; }
.d-qr-wrap code { font-size: 7px; color: #64748b; display: block; }

.dual-right-col { display: flex; flex-direction: column; justify-content: space-between; }
.d-sec-title { font-size: 9.5px; font-weight: bold; color: #0284c7; text-transform: uppercase; margin-bottom: 6px; }
.d-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 10px; }
.d-table th { background: #0369a1; color: #ffffff; padding: 5px 6px; text-align: left; font-size: 8.5px; text-transform: uppercase; }
.d-table td { padding: 5px 6px; border-bottom: 1px solid #e2e8f0; }
.d-table tbody tr:nth-child(even) { background: #f8fafc; }
.bold { font-weight: bold; }
.blue { color: #0284c7; }

.d-rules { background: #f0f9ff; border-left: 2px solid #0284c7; padding: 4px 8px; font-size: 8.5px; margin-bottom: 12px; }
.d-rules small { font-weight: bold; color: #0369a1; }
.d-rules p { margin: 1px 0 0 0; color: #475569; }

.d-sigs { display: flex; justify-content: space-between; align-items: flex-end; }
.d-sig-item { text-align: center; width: 110px; }
.d-sig-item img { height: 26px; object-fit: contain; margin-bottom: -4px; }
.d-sig-item .line { border-top: 1px solid #94a3b8; margin-top: 20px; margin-bottom: 2px; }
.d-sig-item span { font-size: 8px; color: #64748b; }`,
  },

  // ==========================================
  // 4. ID CARDS (5 UNIQUE DESIGNS)
  // ==========================================

  // ID Card 1: Modern Vertical Campus Card
  {
    id: 'tmpl-id-01',
    name: 'Modern Vertical Campus Card',
    category: 'ID_CARD',
    description: 'Portrait 320x480 format with indigo header, circular photo, student barcode, and validity chip.',
    page_size: 'ID_CARD_PORTRAIT',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'blood_group', 'parent_phone', 'principal_signature', 'qr_code'],
    html_content: `<div class="id-vertical-card">
  <div class="id-v-header">
    <img src="{{school_logo}}" alt="Logo" class="id-v-logo" />
    <h2>{{school_name}}</h2>
    <span class="v-card-type">STUDENT IDENTIFICATION PASS</span>
  </div>

  <div class="id-v-body">
    <div class="v-photo-wrapper">
      <img src="{{student_photo}}" alt="Photo" class="id-v-photo" />
    </div>

    <h1 class="v-student-name">{{student_name}}</h1>
    <div class="v-class-badge">{{class_name}} &bull; Section {{section}}</div>

    <div class="v-details-grid">
      <div><span>Roll Number:</span> <strong>{{roll_number}}</strong></div>
      <div><span>Admission No:</span> <strong>{{admission_number}}</strong></div>
      <div><span>Blood Group:</span> <strong class="red-bg">{{blood_group}}</strong></div>
      <div><span>Session:</span> <strong>{{academic_session}}</strong></div>
      <div class="full-w"><span>Emergency Contact:</span> <strong>{{parent_phone}}</strong></div>
    </div>

    <div class="v-footer">
      <img src="{{qr_code}}" alt="QR" class="v-qr" />
      <div class="v-sig-block">
        <img src="{{principal_signature}}" alt="Sig" class="v-sig-img" />
        <span>Principal</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.id-vertical-card { width: 320px; height: 480px; font-family: 'Segoe UI', Inter, sans-serif; background: #ffffff; color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border: 1px solid #cbd5e1; display: flex; flex-direction: column; }
.id-v-header { background: linear-gradient(135deg, #312e81, #4338ca); color: #ffffff; text-align: center; padding: 12px 8px 8px 8px; }
.id-v-logo { width: 36px; height: 36px; object-fit: contain; margin: 0 auto; }
.id-v-header h2 { margin: 2px 0 0 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.v-card-type { font-size: 7.5px; font-weight: bold; background: #e0e7ff; color: #3730a3; padding: 1.5px 6px; border-radius: 999px; display: inline-block; margin-top: 2px; }

.id-v-body { padding: 10px 14px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.v-photo-wrapper { margin-top: -2px; }
.id-v-photo { width: 72px; height: 82px; object-fit: cover; border-radius: 8px; border: 3px solid #4338ca; margin: 0 auto; }
.v-student-name { margin: 4px 0 2px 0; font-size: 14px; font-weight: 900; color: #0f172a; }
.v-class-badge { display: inline-block; background: #f1f5f9; color: #4338ca; font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }

.v-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 8px; font-size: 9px; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; }
.v-details-grid span { color: #64748b; font-size: 8px; }
.v-details-grid strong { color: #0f172a; display: block; font-size: 9.5px; }
.red-bg { color: #dc2626 !important; }
.full-w { grid-column: span 2; }

.v-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 4px; }
.v-qr { width: 42px; height: 42px; }
.v-sig-block { text-align: center; }
.v-sig-img { height: 24px; object-fit: contain; }
.v-sig-block span { display: block; font-size: 7.5px; color: #64748b; border-top: 1px solid #94a3b8; padding-top: 1px; }`,
  },

  // ID Card 2: Corporate Landscape Smart Badge
  {
    id: 'tmpl-id-02',
    name: 'Corporate Landscape Smart Badge',
    category: 'ID_CARD',
    description: 'Landscape 480x300 format with split layout, bold student portrait, and smart verification QR.',
    page_size: 'ID_CARD_LANDSCAPE',
    orientation: 'landscape',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'blood_group', 'parent_phone', 'principal_signature', 'qr_code'],
    html_content: `<div class="id-landscape-badge">
  <div class="id-ls-sidebar">
    <img src="{{student_photo}}" alt="Student" class="id-ls-photo" />
    <span class="id-blood-badge">Blood: {{blood_group}}</span>
  </div>

  <div class="id-ls-main">
    <div class="id-ls-header">
      <img src="{{school_logo}}" alt="Logo" class="id-ls-logo" />
      <div>
        <h2>{{school_name}}</h2>
        <span class="id-ls-sub">OFFICIAL STUDENT SMART PASS</span>
      </div>
    </div>

    <h1 class="id-ls-name">{{student_name}}</h1>
    <div class="id-ls-class">{{class_name}} &bull; Section {{section}}</div>

    <div class="id-ls-grid">
      <div><small>ROLL NO</small><strong>{{roll_number}}</strong></div>
      <div><small>ADM NO</small><strong>{{admission_number}}</strong></div>
      <div><small>SESSION</small><strong>{{academic_session}}</strong></div>
      <div><small>PHONE</small><strong>{{parent_phone}}</strong></div>
    </div>

    <div class="id-ls-bottom">
      <img src="{{qr_code}}" alt="QR" class="id-ls-qr" />
      <div class="id-ls-sig">
        <img src="{{principal_signature}}" alt="Sig" />
        <span>Principal Signature</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.id-landscape-badge { width: 480px; height: 300px; font-family: 'Inter', -apple-system, sans-serif; background: #ffffff; color: #0f172a; border-radius: 10px; overflow: hidden; border: 1.5px solid #0284c7; display: flex; }
.id-ls-sidebar { width: 140px; background: linear-gradient(180deg, #0369a1, #0284c7); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; }
.id-ls-photo { width: 90px; height: 105px; object-fit: cover; border-radius: 6px; border: 2px solid #ffffff; }
.id-blood-badge { background: #ffffff; color: #dc2626; font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 999px; margin-top: 8px; }

.id-ls-main { flex: 1; padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; }
.id-ls-header { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e0f2fe; padding-bottom: 6px; }
.id-ls-logo { width: 32px; height: 32px; object-fit: contain; }
.id-ls-header h2 { margin: 0; font-size: 11px; font-weight: 800; color: #0369a1; text-transform: uppercase; }
.id-ls-sub { font-size: 7px; color: #64748b; font-weight: bold; letter-spacing: 0.5px; }

.id-ls-name { margin: 4px 0 1px 0; font-size: 15px; font-weight: 900; color: #0f172a; }
.id-ls-class { font-size: 9.5px; font-weight: bold; color: #0284c7; margin-bottom: 4px; }

.id-ls-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px 8px; font-size: 8.5px; background: #f8fafc; padding: 4px 6px; border-radius: 4px; }
.id-ls-grid small { color: #64748b; font-size: 7px; display: block; font-weight: bold; }
.id-ls-grid strong { color: #0f172a; }

.id-ls-bottom { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f5f9; padding-top: 4px; }
.id-ls-qr { width: 36px; height: 36px; }
.id-ls-sig { text-align: center; }
.id-ls-sig img { height: 20px; object-fit: contain; }
.id-ls-sig span { display: block; font-size: 7px; color: #64748b; border-top: 1px solid #94a3b8; }`,
  },

  // ID Card 3: Hologram Gradient Scholar Pass
  {
    id: 'tmpl-id-03',
    name: 'Hologram Gradient Scholar Pass',
    category: 'ID_CARD',
    description: 'Vibrant purple-indigo gradient vertical identity card with holographic styling.',
    page_size: 'ID_CARD_PORTRAIT',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'blood_group', 'parent_phone', 'principal_signature', 'qr_code'],
    html_content: `<div class="id-hologram">
  <div class="holo-header">
    <img src="{{school_logo}}" alt="Logo" class="holo-logo" />
    <h2>{{school_name}}</h2>
    <span class="holo-tag">SCHOLAR ACCESS ID</span>
  </div>

  <div class="holo-body">
    <div class="holo-img-wrap">
      <img src="{{student_photo}}" alt="Photo" class="holo-photo" />
    </div>

    <h1 class="holo-name">{{student_name}}</h1>
    <div class="holo-class-tag">{{class_name}} &bull; Sec {{section}}</div>

    <div class="holo-meta">
      <div><span>Roll No:</span> <strong>{{roll_number}}</strong></div>
      <div><span>Adm No:</span> <strong>{{admission_number}}</strong></div>
      <div><span>Blood:</span> <strong class="red">{{blood_group}}</strong></div>
      <div><span>Session:</span> <strong>{{academic_session}}</strong></div>
      <div class="full"><span>Emergency:</span> <strong>{{parent_phone}}</strong></div>
    </div>

    <div class="holo-footer">
      <img src="{{qr_code}}" alt="QR" class="holo-qr" />
      <div class="holo-sig">
        <img src="{{principal_signature}}" alt="Sig" />
        <span>Principal</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.id-hologram { width: 320px; height: 480px; font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1.5px solid #a855f7; display: flex; flex-direction: column; }
.holo-header { background: linear-gradient(135deg, #6b21a8, #3b0764); text-align: center; padding: 12px 8px 8px 8px; border-bottom: 2px solid #a855f7; }
.holo-logo { width: 34px; height: 34px; object-fit: contain; margin: 0 auto; }
.holo-header h2 { margin: 2px 0 0 0; font-size: 10.5px; font-weight: 900; color: #f3e8ff; text-transform: uppercase; }
.holo-tag { font-size: 7.5px; font-weight: bold; background: #a855f7; color: #ffffff; padding: 1px 6px; border-radius: 999px; display: inline-block; margin-top: 2px; }

.holo-body { padding: 10px 14px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.holo-photo { width: 70px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #c084fc; margin: 0 auto; }
.holo-name { margin: 4px 0 1px 0; font-size: 13.5px; font-weight: 900; color: #ffffff; }
.holo-class-tag { display: inline-block; background: #3b0764; color: #e9d5ff; font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 4px; margin-bottom: 4px; border: 1px solid #7e22ce; }

.holo-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 8px; font-size: 8.5px; text-align: left; background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 6px; padding: 5px 8px; }
.holo-meta span { color: #a78bfa; font-size: 7.5px; }
.holo-meta strong { color: #ffffff; display: block; }
.red { color: #f87171 !important; }
.full { grid-column: span 2; }

.holo-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #334155; padding-top: 4px; }
.holo-qr { width: 40px; height: 40px; background: #ffffff; padding: 1px; border-radius: 3px; }
.holo-sig { text-align: center; }
.holo-sig img { height: 22px; object-fit: contain; filter: brightness(2); }
.holo-sig span { display: block; font-size: 7px; color: #94a3b8; border-top: 1px solid #64748b; }`,
  },

  // ID Card 4: Minimal Dark Edition Student ID
  {
    id: 'tmpl-id-04',
    name: 'Minimal Dark Edition Student ID',
    category: 'ID_CARD',
    description: 'Stealth dark slate vertical ID with emerald accents, high-contrast typography, and RFID graphic chip.',
    page_size: 'ID_CARD_PORTRAIT',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'blood_group', 'parent_phone', 'principal_signature', 'qr_code'],
    html_content: `<div class="id-dark-stealth">
  <div class="dk-top">
    <img src="{{school_logo}}" alt="Logo" class="dk-logo" />
    <div>
      <h2>{{school_name}}</h2>
      <small>ACADEMIC PASS</small>
    </div>
  </div>

  <div class="dk-content">
    <img src="{{student_photo}}" alt="Photo" class="dk-photo" />
    <h1 class="dk-name">{{student_name}}</h1>
    <span class="dk-grade">{{class_name}} &bull; Sec {{section}}</span>

    <div class="dk-grid">
      <div><label>ROLL NO</label><strong>{{roll_number}}</strong></div>
      <div><label>ADM NO</label><strong>{{admission_number}}</strong></div>
      <div><label>BLOOD</label><strong class="grn">{{blood_group}}</strong></div>
      <div><label>SESSION</label><strong>{{academic_session}}</strong></div>
    </div>

    <div class="dk-bottom">
      <img src="{{qr_code}}" alt="QR" class="dk-qr" />
      <div class="dk-sig">
        <img src="{{principal_signature}}" alt="Sig" />
        <small>Principal</small>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.id-dark-stealth { width: 320px; height: 480px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #020617; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1.5px solid #059669; display: flex; flex-direction: column; }
.dk-top { display: flex; align-items: center; gap: 8px; background: #0f172a; padding: 10px 14px; border-bottom: 1.5px solid #059669; }
.dk-logo { width: 32px; height: 32px; object-fit: contain; }
.dk-top h2 { margin: 0; font-size: 11px; font-weight: 800; color: #ffffff; text-transform: uppercase; }
.dk-top small { font-size: 7px; color: #10b981; font-weight: bold; letter-spacing: 0.5px; }

.dk-content { padding: 10px 14px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.dk-photo { width: 72px; height: 82px; object-fit: cover; border-radius: 6px; border: 2px solid #10b981; margin: 0 auto; }
.dk-name { margin: 4px 0 1px 0; font-size: 14px; font-weight: 900; color: #ffffff; }
.dk-grade { display: inline-block; background: #064e3b; color: #6ee7b7; font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 4px; margin-bottom: 4px; }

.dk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; font-size: 9px; text-align: left; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 8px; }
.dk-grid label { color: #64748b; font-size: 7px; display: block; font-weight: bold; }
.dk-grid strong { color: #ffffff; }
.grn { color: #10b981 !important; }

.dk-bottom { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #1e293b; padding-top: 4px; }
.dk-qr { width: 40px; height: 40px; background: #ffffff; padding: 1px; border-radius: 3px; }
.dk-sig { text-align: center; }
.dk-sig img { height: 22px; object-fit: contain; filter: brightness(2); }
.dk-sig small { display: block; font-size: 7px; color: #64748b; border-top: 1px solid #334155; }`,
  },

  // ID Card 5: Vibrant Primary School Lanyard Badge
  {
    id: 'tmpl-id-05',
    name: 'Vibrant Primary School Lanyard Badge',
    category: 'ID_CARD',
    description: 'Friendly bright sky-blue card with large clear photo, emergency guardian details, and vibrant accents.',
    page_size: 'ID_CARD_PORTRAIT',
    orientation: 'portrait',
    version: 1,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variables: ['school_name', 'school_logo', 'student_name', 'student_photo', 'admission_number', 'roll_number', 'class_name', 'section', 'academic_session', 'blood_group', 'parent_phone', 'principal_signature', 'qr_code'],
    html_content: `<div class="id-primary-vibrant">
  <div class="pri-top">
    <img src="{{school_logo}}" alt="Logo" class="pri-logo" />
    <h2>{{school_name}}</h2>
    <span>PRIMARY SCHOLAR CARD</span>
  </div>

  <div class="pri-body">
    <div class="pri-photo-frame">
      <img src="{{student_photo}}" alt="Photo" class="pri-photo" />
    </div>

    <h1 class="pri-name">{{student_name}}</h1>
    <div class="pri-class">{{class_name}} &bull; Section {{section}}</div>

    <div class="pri-table">
      <div><span>Roll No:</span> <strong>{{roll_number}}</strong></div>
      <div><span>Adm No:</span> <strong>{{admission_number}}</strong></div>
      <div><span>Blood Group:</span> <strong class="red">{{blood_group}}</strong></div>
      <div><span>Session:</span> <strong>{{academic_session}}</strong></div>
      <div class="span2"><span>Parent Helpline:</span> <strong>{{parent_phone}}</strong></div>
    </div>

    <div class="pri-foot">
      <img src="{{qr_code}}" alt="QR" class="pri-qr" />
      <div class="pri-sig">
        <img src="{{principal_signature}}" alt="Sig" />
        <span>Headmistress</span>
      </div>
    </div>
  </div>
</div>`,
    css_content: `.id-primary-vibrant { width: 320px; height: 480px; font-family: 'Comic Sans MS', 'Segoe UI', sans-serif; background: #ffffff; color: #1e293b; border-radius: 12px; overflow: hidden; border: 2px solid #0284c7; display: flex; flex-direction: column; }
.pri-top { background: #0284c7; color: #ffffff; text-align: center; padding: 10px 8px 6px 8px; }
.pri-logo { width: 34px; height: 34px; object-fit: contain; margin: 0 auto; }
.pri-top h2 { margin: 2px 0 0 0; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.pri-top span { font-size: 7.5px; font-weight: bold; background: #fef08a; color: #854d0e; padding: 1px 6px; border-radius: 999px; display: inline-block; margin-top: 2px; }

.pri-body { padding: 10px 14px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.pri-photo { width: 74px; height: 82px; object-fit: cover; border-radius: 8px; border: 3px solid #0284c7; margin: 0 auto; }
.pri-name { margin: 4px 0 1px 0; font-size: 14px; font-weight: 900; color: #0369a1; }
.pri-class { display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 9.5px; font-weight: bold; padding: 1px 6px; border-radius: 4px; margin-bottom: 4px; }

.pri-table { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 8px; font-size: 9px; text-align: left; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 5px 8px; }
.pri-table span { color: #64748b; font-size: 8px; }
.pri-table strong { color: #0f172a; display: block; }
.red { color: #dc2626 !important; }
.span2 { grid-column: span 2; }

.pri-foot { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 4px; }
.pri-qr { width: 40px; height: 40px; }
.pri-sig { text-align: center; }
.pri-sig img { height: 22px; object-fit: contain; }
.pri-sig span { display: block; font-size: 7px; color: #64748b; border-top: 1px solid #94a3b8; }`,
  },
];

/**
 * In-memory / Code registry for dynamic template injection
 */
let registeredTemplates: DocumentTemplate[] = [...MASTER_TEMPLATES];

/**
 * Get all available master templates
 */
export function getAllMasterTemplates(): DocumentTemplate[] {
  return registeredTemplates;
}

/**
 * Get master templates filtered by category
 */
export function getMasterTemplatesByCategory(category: DocType): DocumentTemplate[] {
  return registeredTemplates.filter((t) => t.category === category);
}

/**
 * PURE CODE-BASED TEMPLATE REGISTRATION FUNCTION
 * Easily add any new custom template purely via code with full HTML & CSS.
 */
export function registerCustomTemplate(template: {
  id?: string;
  name: string;
  category: DocType;
  description?: string;
  html_content: string;
  css_content: string;
  page_size?: 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'ID_CARD_PORTRAIT' | 'ID_CARD_LANDSCAPE' | 'CUSTOM';
  orientation?: 'portrait' | 'landscape';
  variables?: string[];
}): DocumentTemplate {
  const newTmpl: DocumentTemplate = {
    id: template.id || 'tmpl-custom-' + Date.now(),
    name: template.name,
    category: template.category,
    description: template.description || 'Custom template registered via code engine.',
    html_content: template.html_content,
    css_content: template.css_content,
    page_size: template.page_size || (template.category === 'ID_CARD' ? 'ID_CARD_PORTRAIT' : 'A4'),
    orientation: template.orientation || (template.category === 'CERTIFICATE' ? 'landscape' : 'portrait'),
    variables: template.variables || [
      'school_name',
      'school_logo',
      'student_name',
      'student_photo',
      'admission_number',
      'roll_number',
      'class_name',
      'section',
      'academic_session',
      'principal_signature',
      'school_stamp',
      'qr_code',
    ],
    version: 1,
    is_system: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existingIdx = registeredTemplates.findIndex((t) => t.id === newTmpl.id);
  if (existingIdx !== -1) {
    registeredTemplates[existingIdx] = newTmpl;
  } else {
    registeredTemplates.push(newTmpl);
  }

  return newTmpl;
}

/**
 * PURE CODE-BASED TEMPLATE MODIFICATION FUNCTION
 * Update HTML/CSS of any template purely via code.
 */
export function updateTemplateCode(
  templateId: string,
  code: { html_content?: string; css_content?: string; name?: string; description?: string }
): DocumentTemplate | null {
  const idx = registeredTemplates.findIndex((t) => t.id === templateId);
  if (idx === -1) return null;

  registeredTemplates[idx] = {
    ...registeredTemplates[idx],
    ...code,
    version: registeredTemplates[idx].version + 1,
    updated_at: new Date().toISOString(),
  };

  return registeredTemplates[idx];
}

/**
 * DISTINCT TEMPLATE ASSIGNMENT FOR SCHOOLS
 * Ensures each school receives a distinct design index for all 4 document categories.
 * School 0 gets Design 0, School 1 gets Design 1, etc.
 */
export function getDistinctTemplateForSchool(
  schoolIndex: number,
  category: DocType
): DocumentTemplate {
  const catTemplates = getMasterTemplatesByCategory(category);
  if (catTemplates.length === 0) return registeredTemplates[0];
  const idx = Math.abs(schoolIndex) % catTemplates.length;
  return catTemplates[idx];
}
