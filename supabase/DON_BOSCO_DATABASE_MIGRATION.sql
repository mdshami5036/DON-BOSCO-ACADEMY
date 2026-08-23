-- =========================================================================
-- DON BOSCO ACADEMY ERP - COMPLETE FRESH CLEAN DATABASE INSTALLATION
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- 1. Clean Drop Old Conflicting Tables
DROP TABLE IF EXISTS issued_marksheets CASCADE;
DROP TABLE IF EXISTS admit_cards CASCADE;
DROP TABLE IF EXISTS exam_applications CASCADE;
DROP TABLE IF EXISTS exam_links CASCADE;
DROP TABLE IF EXISTS mark_records CASCADE;
DROP TABLE IF EXISTS exam_subjects CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS student_parents CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS fee_payments CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS timetable_entries CASCADE;
DROP TABLE IF EXISTS homework CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS teacher_allocations CASCADE;
DROP TABLE IF EXISTS document_verifications CASCADE;
DROP TABLE IF EXISTS generated_documents CASCADE;
DROP TABLE IF EXISTS school_templates CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS academic_sessions CASCADE;
DROP TABLE IF EXISTS school_settings CASCADE;
DROP TABLE IF EXISTS school_members CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- 2. Enable UUID & Crypto Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'STUDENT',
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SCHOOLS
CREATE TABLE schools (
    id TEXT PRIMARY KEY DEFAULT 'sch-don-bosco',
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    principal_name TEXT DEFAULT 'Md. Shami Ahmad',
    logo_url TEXT DEFAULT '/assets/branding/don-bosco-logo.png',
    banner_url TEXT,
    stamp_url TEXT DEFAULT '/assets/branding/don-bosco-stamp.svg',
    principal_signature_url TEXT DEFAULT '/assets/branding/principal-signature.svg',
    tagline TEXT DEFAULT 'KNOWLEDGE IS POWER',
    established_year TEXT DEFAULT '1997',
    school_type TEXT DEFAULT 'Residential Cum Day School',
    academic_pattern TEXT DEFAULT 'CBSE Pattern',
    classes_offered TEXT DEFAULT 'Play to Class 10th',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLASSES
CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    name TEXT NOT NULL,
    numeric_grade INTEGER DEFAULT 0,
    class_teacher_name TEXT,
    assigned_subjects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STUDENTS
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    user_id UUID,
    admission_number TEXT NOT NULL,
    roll_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    date_of_birth DATE,
    dob TEXT,
    gender TEXT DEFAULT 'Male',
    father_name TEXT,
    mother_name TEXT,
    photo_url TEXT,
    parent_phone TEXT,
    address TEXT,
    current_class_id TEXT,
    class_name TEXT,
    section_name TEXT DEFAULT 'A',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TEACHERS
CREATE TABLE teachers (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    user_id UUID,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    designation TEXT,
    qualification TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SUBJECTS
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    name TEXT NOT NULL,
    code TEXT,
    type TEXT DEFAULT 'theory',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EXAMS
CREATE TABLE exams (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    name TEXT NOT NULL,
    exam_type TEXT DEFAULT 'Annual',
    start_date DATE,
    end_date DATE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. EXAM SUBJECTS
CREATE TABLE exam_subjects (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    exam_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject_id TEXT,
    subject_name TEXT,
    subject_code TEXT,
    max_theory_marks INTEGER DEFAULT 80,
    max_practical_marks INTEGER DEFAULT 20,
    pass_marks INTEGER DEFAULT 33,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. MARK RECORDS
CREATE TABLE mark_records (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    exam_subject_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    theory_marks NUMERIC(6,2) DEFAULT 0,
    practical_marks NUMERIC(6,2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. EXAM LINKS (Online Exam Forms)
CREATE TABLE exam_links (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    link_type TEXT DEFAULT 'ADMIT_CARD_FORM',
    academic_year TEXT DEFAULT '2025-2026',
    exam_name TEXT NOT NULL,
    marksheet_title TEXT DEFAULT 'ANNUAL EXAMINATION MARKSHEET',
    description TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT TRUE,
    target_classes JSONB DEFAULT '["ALL"]'::jsonb,
    admit_cards_issued BOOLEAN DEFAULT FALSE,
    results_published BOOLEAN DEFAULT FALSE,
    marksheets_issued BOOLEAN DEFAULT FALSE,
    exam_center TEXT DEFAULT 'Don Bosco Academy Main Examination Hall, Sitamarhi',
    instructions JSONB DEFAULT '[]'::jsonb,
    class_timetables JSONB DEFAULT '{}'::jsonb,
    timetable JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. EXAM APPLICATIONS (Student Submissions)
CREATE TABLE exam_applications (
    id TEXT PRIMARY KEY,
    link_id TEXT,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    student_id TEXT,
    student_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    gender TEXT DEFAULT 'Male',
    class_name TEXT DEFAULT 'Class 10',
    section_name TEXT DEFAULT 'A',
    roll_number TEXT NOT NULL,
    admission_number TEXT NOT NULL,
    registration_no TEXT,
    contact_phone TEXT,
    address TEXT,
    photo_url TEXT,
    application_no TEXT UNIQUE NOT NULL,
    receipt_no TEXT,
    exam_name TEXT NOT NULL,
    academic_year TEXT DEFAULT '2025-2026',
    subjects JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ISSUED MARKSHEETS
CREATE TABLE issued_marksheets (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    student_id TEXT,
    student_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    gender TEXT DEFAULT 'Male',
    class_name TEXT DEFAULT 'Class 10',
    section_name TEXT DEFAULT 'A',
    roll_number TEXT NOT NULL,
    admission_no TEXT NOT NULL,
    registration_no TEXT,
    academic_year TEXT DEFAULT '2025-2026',
    exam_name TEXT DEFAULT 'CBSE Annual Examination 2026',
    marksheet_title TEXT DEFAULT 'ANNUAL EXAMINATION MARKSHEET',
    marksheet_no TEXT UNIQUE NOT NULL,
    verification_id TEXT UNIQUE NOT NULL,
    issue_date TEXT NOT NULL,
    subjects JSONB DEFAULT '[]'::jsonb,
    total_full_marks NUMERIC(10,2) DEFAULT 600,
    total_marks_obtained NUMERIC(10,2) DEFAULT 0,
    percentage NUMERIC(6,2) DEFAULT 0,
    overall_grade TEXT DEFAULT 'A',
    division TEXT DEFAULT '1st Division',
    result TEXT DEFAULT 'PASS',
    attendance TEXT,
    class_rank TEXT,
    remarks TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'ISSUED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ADMIT CARDS
CREATE TABLE admit_cards (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    link_id TEXT,
    application_id TEXT,
    admit_card_no TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    class_name TEXT DEFAULT 'Class 10',
    section_name TEXT DEFAULT 'A',
    roll_number TEXT NOT NULL,
    admission_number TEXT NOT NULL,
    exam_name TEXT DEFAULT 'CBSE Annual Examination 2026',
    academic_year TEXT DEFAULT '2025-2026',
    issue_date TEXT NOT NULL,
    photo_url TEXT,
    timetable JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'ISSUED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. DOCUMENT VERIFICATIONS
CREATE TABLE document_verifications (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    document_id TEXT,
    verification_code TEXT UNIQUE NOT NULL,
    document_type TEXT NOT NULL,
    student_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    qr_data TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY POLICIES (Full Public Read/Write Access for App)
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mark_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_marksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_verifications ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['profiles', 'schools', 'classes', 'students', 'teachers', 'subjects', 'exams', 'exam_subjects', 'mark_records', 'exam_links', 'exam_applications', 'issued_marksheets', 'admit_cards', 'document_verifications'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON %I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_all_%s" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- =========================================================================
-- INITIAL SEED: DON BOSCO ACADEMY & ALL CLASSES
-- =========================================================================
INSERT INTO schools (
    id, name, slug, email, phone, address, city, state, postal_code,
    principal_name, logo_url, tagline, established_year, school_type, academic_pattern, classes_offered, status
) VALUES (
    'sch-don-bosco', 'DON BOSCO ACADEMY', 'don-bosco-academy', 'donboscoacademy002@gmail.com', '+91 91024 35126',
    'Raipur Bazar, Nanpur, Sitamarhi', 'Sitamarhi', 'Bihar', '843326',
    'Md. Shami Ahmad', '/assets/branding/don-bosco-logo.png', 'KNOWLEDGE IS POWER', '1997',
    'Residential Cum Day School', 'CBSE Pattern', 'Play to Class 10th', 'active'
);

INSERT INTO classes (id, school_id, name, numeric_grade, class_teacher_name, assigned_subjects) VALUES
('class-play', 'sch-don-bosco', 'Play Group', 0, 'Mrs. Shabana Khatoon', '[{"subject_name": "English (Oral & Rhymes)", "full_marks": 50, "pass_marks": 17, "has_practical": true}, {"subject_name": "Hindi (Kavita & Akshar)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers & Counting)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Drawing, Art & Coloring", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-nursery', 'sch-don-bosco', 'Nursery', 0, 'Mrs. Anjali Kumari', '[{"subject_name": "English (Alphabet & Rhymes)", "full_marks": 50, "pass_marks": 17, "has_practical": true}, {"subject_name": "Hindi (Akshar Gyan & Kavita)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers 1-50)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Drawing & Craft Activity", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-lkg', 'sch-don-bosco', 'LKG', 0, 'Ms. Pooja Sharma', '[{"subject_name": "English (Reading, Writing & Rhymes)", "full_marks": 50, "pass_marks": 17, "has_practical": true}, {"subject_name": "Hindi (Swar, Vyanjan & Kavita)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers 1-100)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "General Awareness & Conversation", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-ukg', 'sch-don-bosco', 'UKG', 0, 'Mrs. Farhana Begum', '[{"subject_name": "English (Phonics & Primer)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Hindi (Shabd Gyan & Vyakaran)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers & Basic Addition)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Environmental Studies (EVS)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Art, Drawing & Coloring", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-10', 'sch-don-bosco', 'Class 10', 10, 'Mr. Amit Kumar Jha', '[{"subject_name": "English Language & Literature (184)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Mathematics (Standard / Basic) (041)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Science (Physics, Chem, Bio) (086)", "full_marks": 100, "pass_marks": 33, "has_practical": true}, {"subject_name": "Social Science (087)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Hindi Course-A (002)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Computer Applications & AI (165/417)", "full_marks": 100, "pass_marks": 33, "has_practical": true}]'::jsonb);

-- Seed Default Exam Link
INSERT INTO exam_links (
    id, school_id, title, slug, link_type, academic_year, exam_name, marksheet_title,
    description, start_date, expiry_date, is_active, target_classes, admit_cards_issued, results_published
) VALUES (
    'link-annual-2026', 'sch-don-bosco', 'CBSE Class X Annual Board Examination 2026 - Registration Portal',
    'cbse-class-x-annual-board-examination-2026-registration-portal', 'ADMIT_CARD_FORM', '2025-2026',
    'CBSE Class X Annual Board Examination 2026', 'ANNUAL EXAMINATION MARKSHEET',
    'Official online candidate exam registration portal for all students.',
    NOW(), NOW() + INTERVAL '45 days', TRUE, '["ALL"]'::jsonb, TRUE, TRUE
);
