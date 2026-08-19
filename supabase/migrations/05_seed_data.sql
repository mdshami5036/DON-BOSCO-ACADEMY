-- ========================================================
-- 05_seed_data.sql: Subscription Plans & Master Templates
-- ========================================================

-- 1. SUBSCRIPTION PLANS
INSERT INTO subscription_plans (id, name, slug, price_monthly, price_yearly, max_students, max_teachers, max_storage_mb, features, is_active)
VALUES 
    (
        '11111111-1111-1111-1111-111111111101',
        'Starter Free',
        'starter',
        0,
        0,
        150,
        15,
        500,
        '{"qr_verification": true, "custom_templates": false, "bulk_documents": true, "sms_alerts": false, "white_label": false}'::jsonb,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111102',
        'Growth Academy',
        'growth',
        49.00,
        490.00,
        1000,
        60,
        5000,
        '{"qr_verification": true, "custom_templates": true, "bulk_documents": true, "sms_alerts": true, "white_label": false}'::jsonb,
        TRUE
    ),
    (
        '11111111-1111-1111-1111-111111111103',
        'Enterprise Multi-Campus',
        'enterprise',
        149.00,
        1490.00,
        10000,
        500,
        50000,
        '{"qr_verification": true, "custom_templates": true, "bulk_documents": true, "sms_alerts": true, "white_label": true, "custom_domain": true}'::jsonb,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- 2. MASTER DOCUMENT TEMPLATES
-- Template 1: Modern Blue Marksheet
INSERT INTO document_templates (
    id, name, category, description, page_size, orientation, version, is_system, variables, html_content, css_content
) VALUES (
    '22222222-2222-2222-2222-222222222201',
    'Modern Indigo Marksheet / Report Card',
    'MARKSHEET',
    'A clean, modern academic performance report with subject breakdown, grading chart, principal signature, and QR verification.',
    'A4',
    'portrait',
    1,
    TRUE,
    '["school_name", "school_logo", "school_address", "school_phone", "school_email", "student_name", "student_photo", "admission_number", "roll_number", "class_name", "section", "academic_session", "exam_name", "marks_table", "total_max_marks", "total_obtained_marks", "percentage", "grade", "result_status", "rank_in_class", "remarks", "principal_name", "principal_signature", "school_stamp", "issue_date", "qr_code", "verification_code"]'::jsonb,
    '<div class="doc-container marksheet-modern">
  <div class="header">
    <div class="header-logo">
      <img src="{{school_logo}}" alt="Logo" class="school-logo" onerror="this.style.display=''none''" />
    </div>
    <div class="header-info">
      <h1 class="school-name">{{school_name}}</h1>
      <p class="school-sub">{{school_address}} | Phone: {{school_phone}} | Email: {{school_email}}</p>
      <div class="doc-badge">{{exam_name}} - REPORT CARD</div>
    </div>
    <div class="header-qr">
      <img src="{{qr_code}}" alt="QR Code" class="qr-code-img" />
      <span class="qr-label">Scan to Verify</span>
    </div>
  </div>

  <div class="student-profile-strip">
    <div class="profile-col">
      <div class="info-row"><span class="label">Student Name:</span> <span class="val highlight">{{student_name}}</span></div>
      <div class="info-row"><span class="label">Admission No:</span> <span class="val">{{admission_number}}</span></div>
      <div class="info-row"><span class="label">Roll No:</span> <span class="val">{{roll_number}}</span></div>
      <div class="info-row"><span class="label">Father''s Name:</span> <span class="val">{{father_name}}</span></div>
    </div>
    <div class="profile-col">
      <div class="info-row"><span class="label">Class & Section:</span> <span class="val">{{class_name}} ({{section}})</span></div>
      <div class="info-row"><span class="label">Academic Session:</span> <span class="val">{{academic_session}}</span></div>
      <div class="info-row"><span class="label">Date of Birth:</span> <span class="val">{{date_of_birth}}</span></div>
      <div class="info-row"><span class="label">Issue Date:</span> <span class="val">{{issue_date}}</span></div>
    </div>
    <div class="profile-photo-box">
      <img src="{{student_photo}}" alt="Photo" class="student-photo" onerror="this.src=''https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150''" />
    </div>
  </div>

  <div class="table-section">
    <div class="section-title">Academic Performance</div>
    {{marks_table}}
  </div>

  <div class="summary-cards">
    <div class="sum-card">
      <span class="sc-title">Total Marks</span>
      <span class="sc-val">{{total_obtained_marks}} / {{total_max_marks}}</span>
    </div>
    <div class="sum-card">
      <span class="sc-title">Percentage</span>
      <span class="sc-val">{{percentage}}%</span>
    </div>
    <div class="sum-card">
      <span class="sc-title">Grade</span>
      <span class="sc-val grade-highlight">{{grade}}</span>
    </div>
    <div class="sum-card">
      <span class="sc-title">Result Status</span>
      <span class="sc-val status-{{result_status}}">{{result_status}}</span>
    </div>
  </div>

  <div class="remarks-box">
    <strong>Teacher''s Remarks:</strong> {{remarks}}
  </div>

  <div class="footer-signatures">
    <div class="sig-block">
      <div class="sig-space"></div>
      <div class="sig-line">Class Teacher</div>
    </div>
    <div class="sig-block stamp-center">
      <img src="{{school_stamp}}" alt="Stamp" class="stamp-img" onerror="this.style.display=''none''" />
      <div class="sig-line">Official Stamp</div>
    </div>
    <div class="sig-block">
      <div class="sig-space">
        <img src="{{principal_signature}}" alt="Signature" class="sig-img" onerror="this.style.display=''none''" />
      </div>
      <div class="sig-line">{{principal_name}}<br><small>Principal</small></div>
    </div>
  </div>

  <div class="doc-security-footer">
    <span>Verification Code: <strong>{{verification_code}}</strong></span>
    <span>System Generated & Cryptographically Verified via EduCloud SaaS</span>
  </div>
</div>',
    '.marksheet-modern {
  font-family: ''Inter'', system-ui, -apple-system, sans-serif;
  padding: 32px;
  background: #ffffff;
  color: #1e293b;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 18px;
  margin-bottom: 20px;
}
.school-logo {
  width: 75px;
  height: 75px;
  object-fit: contain;
  border-radius: 8px;
}
.header-info {
  text-align: center;
  flex: 1;
  padding: 0 15px;
}
.school-name {
  font-size: 22px;
  font-weight: 800;
  color: #1e1b4b;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.school-sub {
  font-size: 11px;
  color: #64748b;
  margin: 0 0 8px 0;
}
.doc-badge {
  display: inline-block;
  background: #4f46e5;
  color: white;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}
.header-qr {
  text-align: center;
}
.qr-code-img {
  width: 65px;
  height: 65px;
  display: block;
  margin: 0 auto;
}
.qr-label {
  font-size: 9px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}
.student-profile-strip {
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 20px;
  gap: 15px;
}
.profile-col {
  flex: 1;
}
.info-row {
  font-size: 12px;
  margin-bottom: 6px;
  display: flex;
}
.info-row .label {
  width: 110px;
  color: #64748b;
  font-weight: 500;
}
.info-row .val {
  font-weight: 600;
  color: #0f172a;
}
.info-row .highlight {
  color: #4f46e5;
  font-size: 13px;
}
.profile-photo-box {
  width: 75px;
  text-align: center;
}
.student-photo {
  width: 70px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: #334155;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
table.marks-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  font-size: 11.5px;
}
table.marks-table th {
  background: #312e81;
  color: #ffffff;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
}
table.marks-table td {
  padding: 7px 10px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}
table.marks-table tr:nth-child(even) {
  background: #f8fafc;
}
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.sum-card {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  text-align: center;
}
.sc-title {
  display: block;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 2px;
}
.sc-val {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
.grade-highlight {
  color: #4f46e5;
}
.status-PASS {
  color: #16a34a;
}
.status-FAIL {
  color: #dc2626;
}
.remarks-box {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 11.5px;
  color: #92400e;
  margin-bottom: 24px;
}
.footer-signatures {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 30px;
  padding-bottom: 10px;
}
.sig-block {
  text-align: center;
  width: 180px;
}
.sig-space {
  height: 45px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sig-img {
  max-height: 40px;
  max-width: 140px;
}
.stamp-img {
  max-height: 55px;
  opacity: 0.85;
}
.sig-line {
  border-top: 1px solid #94a3b8;
  padding-top: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
}
.doc-security-footer {
  border-top: 1px dashed #cbd5e1;
  padding-top: 10px;
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #94a3b8;
}'
) ON CONFLICT (id) DO NOTHING;

-- Template 2: Premium Gold Certificate of Excellence
INSERT INTO document_templates (
    id, name, category, description, page_size, orientation, version, is_system, variables, html_content, css_content
) VALUES (
    '22222222-2222-2222-2222-222222222202',
    'Royal Gold Certificate of Excellence',
    'CERTIFICATE',
    'An elegant, royal certificate border layout designed for academic awards, merit achievements, and formal school ceremonies.',
    'A4',
    'landscape',
    1,
    TRUE,
    '["school_name", "school_logo", "student_name", "class_name", "certificate_title", "certificate_body", "certificate_number", "issue_date", "principal_name", "principal_signature", "school_stamp", "qr_code", "verification_code"]'::jsonb,
    '<div class="doc-container cert-gold">
  <div class="cert-border-outer">
    <div class="cert-border-inner">
      <div class="cert-header">
        <img src="{{school_logo}}" alt="Logo" class="cert-logo" onerror="this.style.display=''none''" />
        <h1 class="cert-school-name">{{school_name}}</h1>
        <p class="cert-school-sub">{{school_address}}</p>
      </div>

      <div class="cert-ribbon-wrap">
        <h2 class="cert-main-title">{{certificate_title}}</h2>
        <div class="cert-sub-line">PROUDLY PRESENTED TO</div>
      </div>

      <div class="cert-recipient">
        <span class="recipient-name">{{student_name}}</span>
      </div>

      <div class="cert-body-text">
        {{certificate_body}}
      </div>

      <div class="cert-meta-strip">
        <span>Class: <strong>{{class_name}}</strong></span>
        <span>Certificate No: <strong>{{certificate_number}}</strong></span>
        <span>Date: <strong>{{issue_date}}</strong></span>
      </div>

      <div class="cert-footer">
        <div class="cert-sig">
          <div class="sig-space"></div>
          <div class="sig-line">Director / Coordinator</div>
        </div>
        <div class="cert-center-seal">
          <img src="{{school_stamp}}" alt="Seal" class="cert-seal-img" onerror="this.style.display=''none''" />
          <div class="cert-qr-wrap">
            <img src="{{qr_code}}" alt="QR" class="cert-qr" />
            <span class="qr-num">{{verification_code}}</span>
          </div>
        </div>
        <div class="cert-sig">
          <div class="sig-space">
            <img src="{{principal_signature}}" alt="Signature" class="sig-img" onerror="this.style.display=''none''" />
          </div>
          <div class="sig-line">{{principal_name}}<br><small>Principal</small></div>
        </div>
      </div>
    </div>
  </div>
</div>',
    '.cert-gold {
  font-family: ''Playfair Display'', Georgia, serif;
  background: #fdfbf7;
  padding: 24px;
  box-sizing: border-box;
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  color: #27272a;
}
.cert-border-outer {
  border: 8px double #b45309;
  padding: 12px;
  background: #ffffff;
}
.cert-border-inner {
  border: 2px solid #d97706;
  padding: 28px;
  text-align: center;
  position: relative;
}
.cert-logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  margin-bottom: 6px;
}
.cert-school-name {
  font-family: ''Cinzel'', serif;
  font-size: 26px;
  font-weight: 700;
  color: #78350f;
  margin: 0 0 4px 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.cert-school-sub {
  font-family: ''Inter'', sans-serif;
  font-size: 11px;
  color: #71717a;
  margin: 0 0 16px 0;
}
.cert-main-title {
  font-family: ''Cinzel'', serif;
  font-size: 28px;
  font-weight: 800;
  color: #92400e;
  letter-spacing: 3px;
  margin: 0 0 6px 0;
  text-transform: uppercase;
}
.cert-sub-line {
  font-family: ''Inter'', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #a1a1aa;
  letter-spacing: 3px;
  margin-bottom: 12px;
}
.recipient-name {
  font-family: ''Playfair Display'', serif;
  font-size: 32px;
  font-weight: 700;
  font-style: italic;
  color: #18181b;
  border-bottom: 2px solid #f59e0b;
  padding: 0 24px 6px 24px;
  display: inline-block;
}
.cert-body-text {
  font-family: ''Inter'', sans-serif;
  font-size: 13px;
  line-height: 1.8;
  color: #4b5563;
  max-width: 650px;
  margin: 18px auto;
}
.cert-meta-strip {
  font-family: ''Inter'', sans-serif;
  display: flex;
  justify-content: center;
  gap: 30px;
  font-size: 11px;
  color: #52525b;
  margin-bottom: 24px;
}
.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 20px;
  padding: 0 20px;
}
.cert-sig {
  width: 170px;
  font-family: ''Inter'', sans-serif;
}
.sig-space {
  height: 40px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sig-img {
  max-height: 38px;
}
.sig-line {
  border-top: 1px solid #71717a;
  padding-top: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #27272a;
}
.cert-center-seal {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cert-seal-img {
  max-height: 55px;
  margin-bottom: 4px;
}
.cert-qr {
  width: 45px;
  height: 45px;
}
.qr-num {
  font-family: ''Inter'', sans-serif;
  font-size: 8px;
  color: #71717a;
  display: block;
}'
) ON CONFLICT (id) DO NOTHING;

-- Template 3: Modern Student ID Card (Portrait CR80)
INSERT INTO document_templates (
    id, name, category, description, page_size, orientation, version, is_system, variables, html_content, css_content
) VALUES (
    '22222222-2222-2222-2222-222222222203',
    'Modern Student ID Card (Portrait CR80)',
    'ID_CARD',
    'Compact standard CR-80 portrait student ID card layout with student photo, barcode/QR, emergency contact, and school stamp.',
    'ID_CARD_PORTRAIT',
    'portrait',
    1,
    TRUE,
    '["school_name", "school_logo", "school_phone", "student_name", "student_photo", "admission_number", "roll_number", "class_name", "section", "blood_group", "parent_phone", "date_of_birth", "principal_signature", "qr_code", "verification_code"]'::jsonb,
    '<div class="doc-container idcard-portrait">
  <div class="id-header">
    <img src="{{school_logo}}" alt="Logo" class="id-logo" onerror="this.style.display=''none''" />
    <div class="id-school-title">{{school_name}}</div>
  </div>
  <div class="id-sub-strip">STUDENT IDENTITY CARD</div>
  
  <div class="id-photo-area">
    <img src="{{student_photo}}" alt="Photo" class="id-student-photo" onerror="this.src=''https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150''" />
  </div>

  <div class="id-name">{{student_name}}</div>
  <div class="id-class">Class: {{class_name}} - {{section}}</div>

  <div class="id-details-grid">
    <div class="id-row"><span class="id-lbl">Adm No:</span> <span class="id-val">{{admission_number}}</span></div>
    <div class="id-row"><span class="id-lbl">Roll No:</span> <span class="id-val">{{roll_number}}</span></div>
    <div class="id-row"><span class="id-lbl">DOB:</span> <span class="id-val">{{date_of_birth}}</span></div>
    <div class="id-row"><span class="id-lbl">Blood:</span> <span class="id-val highlight-red">{{blood_group}}</span></div>
    <div class="id-row full"><span class="id-lbl">Emergency:</span> <span class="id-val">{{parent_phone}}</span></div>
  </div>

  <div class="id-footer">
    <div class="id-qr-box">
      <img src="{{qr_code}}" alt="QR" class="id-qr" />
    </div>
    <div class="id-sig-box">
      <img src="{{principal_signature}}" alt="Sig" class="id-sig" onerror="this.style.display=''none''" />
      <span class="id-sig-lbl">Principal</span>
    </div>
  </div>
</div>',
    '.idcard-portrait {
  font-family: ''Inter'', sans-serif;
  width: 260px;
  height: 410px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  border: 1px solid #cbd5e1;
  text-align: center;
  position: relative;
  box-sizing: border-box;
}
.id-header {
  background: #1e1b4b;
  color: white;
  padding: 10px 8px 6px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.id-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.id-school-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.2;
}
.id-sub-strip {
  background: #4f46e5;
  color: white;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 0;
}
.id-photo-area {
  margin-top: 10px;
}
.id-student-photo {
  width: 75px;
  height: 85px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #4f46e5;
}
.id-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 6px;
}
.id-class {
  font-size: 10px;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 8px;
}
.id-details-grid {
  padding: 0 16px;
  text-align: left;
  font-size: 9.5px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 3px;
}
.id-row.full {
  grid-column: span 2;
}
.id-lbl {
  color: #64748b;
  font-weight: 500;
}
.id-val {
  color: #1e293b;
  font-weight: 600;
}
.highlight-red {
  color: #dc2626;
}
.id-footer {
  position: absolute;
  bottom: 8px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid #e2e8f0;
  padding-top: 4px;
}
.id-qr {
  width: 38px;
  height: 38px;
}
.id-sig {
  max-height: 22px;
  display: block;
  margin: 0 auto;
}
.id-sig-lbl {
  font-size: 8px;
  color: #475569;
  font-weight: 600;
}'
) ON CONFLICT (id) DO NOTHING;

-- Template 4: Examination Admit Card
INSERT INTO document_templates (
    id, name, category, description, page_size, orientation, version, is_system, variables, html_content, css_content
) VALUES (
    '22222222-2222-2222-2222-222222222204',
    'Standard Examination Admit Card',
    'ADMIT_CARD',
    'Official hall ticket / admit card layout with student photo, exam schedule table, instructions for candidates, and QR verification.',
    'A4',
    'portrait',
    1,
    TRUE,
    '["school_name", "school_logo", "student_name", "student_photo", "admission_number", "roll_number", "class_name", "section", "exam_name", "exam_schedule_table", "principal_name", "principal_signature", "school_stamp", "qr_code", "verification_code"]'::jsonb,
    '<div class="doc-container admit-card-modern">
  <div class="header">
    <img src="{{school_logo}}" alt="Logo" class="school-logo" onerror="this.style.display=''none''" />
    <div class="header-center">
      <h1 class="school-title">{{school_name}}</h1>
      <p class="school-meta">{{school_address}}</p>
      <div class="admit-badge">EXAMINATION ADMIT CARD / HALL TICKET</div>
    </div>
    <img src="{{qr_code}}" alt="QR" class="qr-img" />
  </div>

  <div class="student-strip">
    <div class="info-left">
      <div class="field"><span class="lbl">Student Name:</span> <strong>{{student_name}}</strong></div>
      <div class="field"><span class="lbl">Roll Number:</span> <strong>{{roll_number}}</strong></div>
      <div class="field"><span class="lbl">Admission No:</span> <strong>{{admission_number}}</strong></div>
      <div class="field"><span class="lbl">Class & Section:</span> <strong>{{class_name}} ({{section}})</strong></div>
      <div class="field"><span class="lbl">Examination:</span> <strong style="color: #4f46e5;">{{exam_name}}</strong></div>
    </div>
    <div class="photo-right">
      <img src="{{student_photo}}" alt="Photo" class="photo" onerror="this.src=''https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150''" />
    </div>
  </div>

  <div class="schedule-section">
    <div class="sec-heading">Examination Schedule</div>
    {{exam_schedule_table}}
  </div>

  <div class="instructions-box">
    <h4>Important Instructions for Candidates:</h4>
    <ol>
      <li>Candidates must bring this Admit Card to every examination session.</li>
      <li>Entry to the examination hall will not be permitted without a valid Admit Card and School ID.</li>
      <li>Electronic gadgets, smartwatches, and unauthorized notes are strictly prohibited.</li>
      <li>Candidates must reach the exam hall at least 15 minutes before the scheduled time.</li>
    </ol>
  </div>

  <div class="admit-footer">
    <div class="sig-item">
      <div class="line">Candidate''s Signature</div>
    </div>
    <div class="sig-item">
      <div class="line">Invigilator''s Signature</div>
    </div>
    <div class="sig-item">
      <img src="{{principal_signature}}" alt="Sig" class="prin-sig" onerror="this.style.display=''none''" />
      <div class="line">{{principal_name}}<br><small>Principal</small></div>
    </div>
  </div>
</div>',
    '.admit-card-modern {
  font-family: ''Inter'', sans-serif;
  padding: 30px;
  background: #ffffff;
  color: #1e293b;
  max-width: 780px;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #0284c7;
  padding-bottom: 14px;
  margin-bottom: 18px;
}
.school-logo {
  width: 65px;
  height: 65px;
  object-fit: contain;
}
.header-center {
  text-align: center;
  flex: 1;
}
.school-title {
  font-size: 20px;
  font-weight: 800;
  color: #0369a1;
  margin: 0 0 2px 0;
  text-transform: uppercase;
}
.school-meta {
  font-size: 11px;
  color: #64748b;
  margin: 0 0 6px 0;
}
.admit-badge {
  display: inline-block;
  background: #0284c7;
  color: white;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}
.qr-img {
  width: 60px;
  height: 60px;
}
.student-strip {
  display: flex;
  justify-content: space-between;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 18px;
}
.info-left {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  font-size: 12px;
  flex: 1;
}
.lbl {
  color: #64748b;
  margin-right: 6px;
}
.photo {
  width: 70px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #0284c7;
}
.sec-heading {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #0369a1;
  margin-bottom: 6px;
}
table.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 18px;
}
table.schedule-table th {
  background: #0284c7;
  color: white;
  padding: 6px 10px;
  text-align: left;
}
table.schedule-table td {
  padding: 6px 10px;
  border-bottom: 1px solid #e2e8f0;
}
.instructions-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 10.5px;
  color: #475569;
  margin-bottom: 24px;
}
.instructions-box h4 {
  margin: 0 0 6px 0;
  color: #0f172a;
}
.instructions-box ol {
  margin: 0;
  padding-left: 18px;
}
.instructions-box li {
  margin-bottom: 3px;
}
.admit-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 30px;
}
.sig-item {
  text-align: center;
  width: 170px;
}
.prin-sig {
  max-height: 35px;
  margin-bottom: 4px;
}
.line {
  border-top: 1px solid #94a3b8;
  padding-top: 4px;
  font-size: 10.5px;
  font-weight: 600;
}'
) ON CONFLICT (id) DO NOTHING;
