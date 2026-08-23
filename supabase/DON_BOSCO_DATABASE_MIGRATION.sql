-- =========================================================================
-- DON BOSCO ACADEMY ERP - 100% BULLETPROOF POSTGRESQL DATABASE MIGRATION
-- =========================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES
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

-- 3. SCHOOLS
CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add all possible columns to existing or new schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS principal_name TEXT DEFAULT 'Md. Shami Ahmad';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/assets/branding/don-bosco-logo.png';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS stamp_url TEXT DEFAULT '/assets/branding/don-bosco-stamp.svg';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS principal_signature_url TEXT DEFAULT '/assets/branding/principal-signature.svg';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'KNOWLEDGE IS POWER';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS established_year TEXT DEFAULT '1997';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_type TEXT DEFAULT 'Residential Cum Day School';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS academic_pattern TEXT DEFAULT 'CBSE Pattern';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS classes_offered TEXT DEFAULT 'Play to Class 10th';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    name TEXT NOT NULL,
    numeric_grade INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS class_teacher_name TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS assigned_subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    admission_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE students ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male';
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_class_id TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS section_name TEXT DEFAULT 'A';
ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. EXAM LINKS (Online Exam Forms)
CREATE TABLE IF NOT EXISTS exam_links (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT 'ADMIT_CARD_FORM';
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2025-2026';
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS exam_name TEXT DEFAULT 'CBSE Annual Examination 2026';
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS marksheet_title TEXT DEFAULT 'ANNUAL EXAMINATION MARKSHEET';
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS target_classes JSONB DEFAULT '["ALL"]'::jsonb;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS admit_cards_issued BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS marksheets_issued BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS exam_center TEXT DEFAULT 'Don Bosco Academy Main Examination Hall, Sitamarhi';
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS class_timetables JSONB DEFAULT '{}'::jsonb;
ALTER TABLE exam_links ADD COLUMN IF NOT EXISTS timetable JSONB DEFAULT '[]'::jsonb;

-- 7. EXAM APPLICATIONS (Student Submissions)
CREATE TABLE IF NOT EXISTS exam_applications (
    id TEXT PRIMARY KEY,
    link_id TEXT,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    admission_number TEXT NOT NULL,
    application_no TEXT UNIQUE NOT NULL,
    exam_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male';
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS class_name TEXT DEFAULT 'Class 10';
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS section_name TEXT DEFAULT 'A';
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS registration_no TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS receipt_no TEXT;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2025-2026';
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'SUBMITTED';
ALTER TABLE exam_applications ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

-- 8. ISSUED MARKSHEETS
CREATE TABLE IF NOT EXISTS issued_marksheets (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    admission_no TEXT NOT NULL,
    marksheet_no TEXT UNIQUE NOT NULL,
    verification_id TEXT UNIQUE NOT NULL,
    issue_date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS class_name TEXT DEFAULT 'Class 10';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS section_name TEXT DEFAULT 'A';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS registration_no TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2025-2026';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS exam_name TEXT DEFAULT 'CBSE Annual Examination 2026';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS marksheet_title TEXT DEFAULT 'ANNUAL EXAMINATION MARKSHEET';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS total_full_marks NUMERIC(10,2) DEFAULT 600;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS total_marks_obtained NUMERIC(10,2) DEFAULT 0;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS percentage NUMERIC(6,2) DEFAULT 0;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS overall_grade TEXT DEFAULT 'A';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS division TEXT DEFAULT '1st Division';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS result TEXT DEFAULT 'PASS';
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS attendance TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS class_rank TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE issued_marksheets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ISSUED';

-- 9. ADMIT CARDS
CREATE TABLE IF NOT EXISTS admit_cards (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    admit_card_no TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    admission_number TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS link_id TEXT;
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS application_id TEXT;
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS class_name TEXT DEFAULT 'Class 10';
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS section_name TEXT DEFAULT 'A';
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS exam_name TEXT DEFAULT 'CBSE Annual Examination 2026';
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2025-2026';
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS timetable JSONB DEFAULT '[]'::jsonb;
ALTER TABLE admit_cards ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ISSUED';

-- 10. POLICIES & PERMISSIONS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_marksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admit_cards ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['profiles', 'schools', 'classes', 'students', 'exam_links', 'exam_applications', 'issued_marksheets', 'admit_cards'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON %I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_all_%s" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 11. INITIAL SEED: DON BOSCO ACADEMY & CLASSES
INSERT INTO schools (
    id, name, slug, email, phone, address, city, state, postal_code,
    principal_name, logo_url, tagline, established_year, school_type, academic_pattern, classes_offered, status
) VALUES (
    'sch-don-bosco', 'DON BOSCO ACADEMY', 'don-bosco-academy', 'donboscoacademy002@gmail.com', '+91 91024 35126',
    'Raipur Bazar, Nanpur, Sitamarhi', 'Sitamarhi', 'Bihar', '843326',
    'Md. Shami Ahmad', '/assets/branding/don-bosco-logo.png', 'KNOWLEDGE IS POWER', '1997',
    'Residential Cum Day School', 'CBSE Pattern', 'Play to Class 10th', 'active'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    principal_name = EXCLUDED.principal_name,
    academic_pattern = EXCLUDED.academic_pattern;

INSERT INTO classes (id, school_id, name, numeric_grade, class_teacher_name, assigned_subjects) VALUES
('class-play', 'sch-don-bosco', 'Play Group', 0, 'Mrs. Shabana Khatoon', '[{"subject_name": "English (Oral & Rhymes)", "full_marks": 50, "pass_marks": 17, "has_practical": true}, {"subject_name": "Hindi (Kavita & Akshar)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers & Counting)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Drawing, Art & Coloring", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-nursery', 'sch-don-bosco', 'Nursery', 0, 'Mrs. Anjali Kumari', '[{"subject_name": "English (Alphabet & Rhymes)", "full_marks": 50, "pass_marks": 17, "has_practical": true}, {"subject_name": "Hindi (Akshar Gyan & Kavita)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers 1-50)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Drawing & Craft Activity", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-lkg', 'sch-don-bosco', 'LKG', 0, 'Ms. Pooja Sharma', '[{"subject_name": "English (Reading, Writing & Rhymes)", "full_marks": 50, "pass_marks": 17, "has_practical": true}, {"subject_name": "Hindi (Swar, Vyanjan & Kavita)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers 1-100)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "General Awareness & Conversation", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-ukg', 'sch-don-bosco', 'UKG', 0, 'Mrs. Farhana Begum', '[{"subject_name": "English (Phonics & Primer)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Hindi (Shabd Gyan & Vyakaran)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Mathematics (Numbers & Basic Addition)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Environmental Studies (EVS)", "full_marks": 50, "pass_marks": 17, "has_practical": false}, {"subject_name": "Art, Drawing & Coloring", "full_marks": 50, "pass_marks": 17, "has_practical": true}]'::jsonb),
('class-10', 'sch-don-bosco', 'Class 10', 10, 'Mr. Amit Kumar Jha', '[{"subject_name": "English Language & Literature (184)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Mathematics (Standard / Basic) (041)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Science (Physics, Chem, Bio) (086)", "full_marks": 100, "pass_marks": 33, "has_practical": true}, {"subject_name": "Social Science (087)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Hindi Course-A (002)", "full_marks": 100, "pass_marks": 33, "has_practical": false}, {"subject_name": "Computer Applications & AI (165/417)", "full_marks": 100, "pass_marks": 33, "has_practical": true}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET assigned_subjects = EXCLUDED.assigned_subjects;

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
) ON CONFLICT (id) DO UPDATE SET
    marksheet_title = EXCLUDED.marksheet_title,
    results_published = EXCLUDED.results_published;
