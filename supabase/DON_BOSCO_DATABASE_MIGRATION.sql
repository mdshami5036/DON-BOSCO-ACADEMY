-- =========================================================================
-- DON BOSCO ACADEMY ERP - COMPLETE POSTGRESQL DATABASE SCHEMA & SEED DATA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- -------------------------------------------------------------------------
-- FILE: 01_initial_schema.sql
-- -------------------------------------------------------------------------
-- ========================================================
-- 01_initial_schema.sql: Multi-Tenant School SaaS Core Schema
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE school_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'leave');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_type_enum AS ENUM (
        'MARKSHEET',
        'CERTIFICATE',
        'TRANSFER_CERTIFICATE',
        'BONAFIDE_CERTIFICATE',
        'CHARACTER_CERTIFICATE',
        'ADMIT_CARD',
        'ID_CARD',
        'ACHIEVEMENT_CERTIFICATE',
        'FEE_RECEIPT',
        'CUSTOM_DOCUMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_status_enum AS ENUM ('VALID', 'REVOKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admission_status_enum AS ENUM ('pending', 'approved', 'rejected', 'waitlisted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
    price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_students INT NOT NULL DEFAULT 100,
    max_teachers INT NOT NULL DEFAULT 10,
    max_storage_mb INT NOT NULL DEFAULT 500,
    features JSONB NOT NULL DEFAULT '{"qr_verification": true, "custom_templates": true, "sms_alerts": false}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SCHOOLS (Multi-Tenant Hub)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    principal_name TEXT,
    principal_photo_url TEXT,
    principal_signature_url TEXT,
    stamp_url TEXT,
    logo_url TEXT,
    banner_url TEXT,
    about TEXT,
    website TEXT,
    status school_status NOT NULL DEFAULT 'pending',
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);

-- 4. SCHOOL MEMBERS (Multi-Tenant User Mapping)
CREATE TABLE IF NOT EXISTS school_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'STUDENT',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_school_members_school ON school_members(school_id);
CREATE INDEX IF NOT EXISTS idx_school_members_user ON school_members(user_id);

-- 5. SCHOOL SETTINGS
CREATE TABLE IF NOT EXISTS school_settings (
    school_id UUID PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    grading_system JSONB NOT NULL DEFAULT '[
        {"grade": "A+", "min_percentage": 90, "max_percentage": 100, "gpa": 4.0, "description": "Outstanding"},
        {"grade": "A", "min_percentage": 80, "max_percentage": 89.99, "gpa": 3.7, "description": "Excellent"},
        {"grade": "B+", "min_percentage": 70, "max_percentage": 79.99, "gpa": 3.3, "description": "Very Good"},
        {"grade": "B", "min_percentage": 60, "max_percentage": 69.99, "gpa": 3.0, "description": "Good"},
        {"grade": "C", "min_percentage": 50, "max_percentage": 59.99, "gpa": 2.0, "description": "Average"},
        {"grade": "D", "min_percentage": 40, "max_percentage": 49.99, "gpa": 1.0, "description": "Pass"},
        {"grade": "F", "min_percentage": 0, "max_percentage": 39.99, "gpa": 0.0, "description": "Fail"}
    ]'::jsonb,
    attendance_type TEXT NOT NULL DEFAULT 'daily',
    currency_symbol TEXT NOT NULL DEFAULT '$',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    theme_color TEXT NOT NULL DEFAULT '#4f46e5',
    custom_domain TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ACADEMIC SESSIONS
CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "2025-2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_school ON academic_sessions(school_id);

-- 7. CLASSES & SECTIONS
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Class 10" or "Grade 10"
    numeric_grade INT,
    class_teacher_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "A", "B"
    room_no TEXT,
    capacity INT DEFAULT 40,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'theory', -- theory, practical, both
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    employee_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    designation TEXT DEFAULT 'Teacher',
    qualification TEXT,
    phone TEXT,
    email TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TEACHER ALLOCATIONS
CREATE TABLE IF NOT EXISTS teacher_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    admission_number TEXT NOT NULL,
    roll_number TEXT,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT,
    photo_url TEXT,
    father_name TEXT,
    mother_name TEXT,
    guardian_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    current_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    current_section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    current_session_id UUID REFERENCES academic_sessions(id) ON DELETE SET NULL,
    admission_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive, archived, graduated
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(school_id, admission_number);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(school_id, current_class_id, current_section_id);

-- 12. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    remarks TEXT,
    marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(school_id, class_id, date);

-- 13. FEES & PAYMENTS
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- e.g. "Tuition Fee - Term 1"
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    frequency TEXT DEFAULT 'monthly', -- monthly, quarterly, annual, one-time
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
    receipt_no TEXT NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    fine NUMERIC(10, 2) DEFAULT 0,
    payment_method TEXT DEFAULT 'Cash', -- Cash, Bank Transfer, Card, UPI, Cheque
    transaction_ref TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'paid', -- paid, partial, pending
    received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(school_id, student_id);

-- 14. EXAMS & MARKS
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Mid-Term Examination 2025"
    exam_type TEXT NOT NULL DEFAULT 'Term', -- Unit Test, Quarterly, Half Yearly, Annual, Pre-Board
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    max_theory_marks NUMERIC(5, 2) NOT NULL DEFAULT 80.0,
    max_practical_marks NUMERIC(5, 2) NOT NULL DEFAULT 20.0,
    pass_marks NUMERIC(5, 2) NOT NULL DEFAULT 33.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_subject_id UUID NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    theory_marks NUMERIC(5, 2) DEFAULT 0,
    practical_marks NUMERIC(5, 2) DEFAULT 0,
    total_marks NUMERIC(5, 2) DEFAULT 0,
    grade TEXT,
    remarks TEXT,
    is_absent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exam_subject_id, student_id)
);

CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    total_max_marks NUMERIC(8, 2) NOT NULL,
    total_obtained_marks NUMERIC(8, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    gpa NUMERIC(3, 2),
    grade TEXT NOT NULL,
    result_status TEXT NOT NULL, -- PASS, FAIL, COMPARTMENT
    rank_in_class INT,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- 15. MASTER TEMPLATES & SCHOOL ASSIGNMENTS
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category doc_type_enum NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    html_content TEXT NOT NULL,
    css_content TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    page_size TEXT NOT NULL DEFAULT 'A4', -- A4, A5, ID_CARD_PORTRAIT, ID_CARD_LANDSCAPE
    orientation TEXT NOT NULL DEFAULT 'portrait', -- portrait, landscape
    version INT NOT NULL DEFAULT 1,
    is_system BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    category doc_type_enum NOT NULL,
    template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE RESTRICT,
    custom_css TEXT,
    custom_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, category)
);

-- 16. GENERATED DOCUMENTS & QR VERIFICATIONS
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
    doc_type doc_type_enum NOT NULL,
    certificate_no TEXT NOT NULL,
    verification_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    file_url TEXT,
    status doc_status_enum NOT NULL DEFAULT 'VALID',
    issued_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_gen_docs_verification ON generated_documents(verification_code);
CREATE INDEX IF NOT EXISTS idx_gen_docs_student ON generated_documents(school_id, student_id);

CREATE TABLE IF NOT EXISTS document_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_code TEXT UNIQUE NOT NULL,
    document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    verified_count INT NOT NULL DEFAULT 0,
    last_verified_at TIMESTAMPTZ
);

-- 17. ADMISSIONS, NOTICES, HOMEWORK, TIMETABLES & AUDIT
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    application_no TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL,
    applying_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    previous_school TEXT,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT,
    address TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    status admission_status_enum NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    target_role TEXT NOT NULL DEFAULT 'ALL', -- ALL, TEACHER, STUDENT, PARENT
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    attachment_url TEXT,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    day_of_week TEXT NOT NULL, -- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_no TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON audit_logs(school_id, created_at DESC);


-- -------------------------------------------------------------------------
-- FILE: 02_rls_policies.sql
-- -------------------------------------------------------------------------
-- ========================================================
-- 02_rls_policies.sql: Multi-Tenant Row Level Security Policies
-- ========================================================

-- Helper Function: Check if user is Super Admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_super_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Get Current User's Role in a School
CREATE OR REPLACE FUNCTION get_user_school_role(p_school_id UUID)
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role
    FROM school_members
    WHERE school_id = p_school_id AND user_id = auth.uid() AND status = 'active'
    LIMIT 1;

    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check if user is member of school
CREATE OR REPLACE FUNCTION is_school_member(p_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM school_members
        WHERE school_id = p_school_id AND user_id = auth.uid() AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check if user is School Admin of school
CREATE OR REPLACE FUNCTION is_school_admin(p_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM school_members
        WHERE school_id = p_school_id AND user_id = auth.uid() AND role = 'SCHOOL_ADMIN' AND status = 'active'
    ) OR is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check if user is Teacher of school
CREATE OR REPLACE FUNCTION is_school_teacher(p_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM school_members
        WHERE school_id = p_school_id AND user_id = auth.uid() AND role IN ('TEACHER', 'SCHOOL_ADMIN') AND status = 'active'
    ) OR is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- ENABLE RLS ON ALL TABLES
-- ========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 1. PROFILES POLICIES
-- ========================================================
CREATE POLICY "Users can view own profile or Super Admin all"
    ON profiles FOR SELECT
    USING (id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Super Admins can insert/delete profiles"
    ON profiles FOR ALL
    USING (is_super_admin());

-- ========================================================
-- 2. SUBSCRIPTION PLANS POLICIES
-- ========================================================
CREATE POLICY "Public can view active subscription plans"
    ON subscription_plans FOR SELECT
    USING (is_active = TRUE OR is_super_admin());

CREATE POLICY "Super Admins manage subscription plans"
    ON subscription_plans FOR ALL
    USING (is_super_admin());

-- ========================================================
-- 3. SCHOOLS POLICIES
-- ========================================================
CREATE POLICY "Public can view active schools by slug"
    ON schools FOR SELECT
    USING (status = 'active' OR is_school_member(id) OR is_super_admin());

CREATE POLICY "Public can insert school during registration"
    ON schools FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "School Admins can update own school"
    ON schools FOR UPDATE
    USING (is_school_admin(id));

CREATE POLICY "Super Admins manage all schools"
    ON schools FOR ALL
    USING (is_super_admin());

-- ========================================================
-- 4. SCHOOL MEMBERS POLICIES
-- ========================================================
CREATE POLICY "School members can view school staff/members"
    ON school_members FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage school members"
    ON school_members FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 5. SCHOOL SETTINGS POLICIES
-- ========================================================
CREATE POLICY "Members and public can view school settings"
    ON school_settings FOR SELECT
    USING (TRUE);

CREATE POLICY "School Admins update school settings"
    ON school_settings FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 6. ACADEMICS, CLASSES, SECTIONS, SUBJECTS
-- ========================================================
CREATE POLICY "School members view academic sessions"
    ON academic_sessions FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage academic sessions"
    ON academic_sessions FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "School members view classes"
    ON classes FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage classes"
    ON classes FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "School members view sections"
    ON sections FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage sections"
    ON sections FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "School members view subjects"
    ON subjects FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage subjects"
    ON subjects FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 7. TEACHERS & ALLOCATIONS
-- ========================================================
CREATE POLICY "School members view teachers"
    ON teachers FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage teachers"
    ON teachers FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "School members view teacher allocations"
    ON teacher_allocations FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage teacher allocations"
    ON teacher_allocations FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 8. STUDENTS POLICIES
-- ========================================================
CREATE POLICY "Staff view students, Students view own record"
    ON students FOR SELECT
    USING (
        is_school_admin(school_id)
        OR is_school_teacher(school_id)
        OR user_id = auth.uid()
        OR is_super_admin()
    );

CREATE POLICY "School Admins manage students"
    ON students FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 9. ATTENDANCE POLICIES
-- ========================================================
CREATE POLICY "View attendance within school"
    ON attendance FOR SELECT
    USING (
        is_school_admin(school_id)
        OR is_school_teacher(school_id)
        OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        OR is_super_admin()
    );

CREATE POLICY "Teachers & Admins mark attendance"
    ON attendance FOR ALL
    USING (is_school_teacher(school_id));

-- ========================================================
-- 10. FEES & PAYMENTS POLICIES
-- ========================================================
CREATE POLICY "School members view fee structures"
    ON fee_structures FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage fee structures"
    ON fee_structures FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "View payments"
    ON fee_payments FOR SELECT
    USING (
        is_school_admin(school_id)
        OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        OR is_super_admin()
    );

CREATE POLICY "School Admins manage fee payments"
    ON fee_payments FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 11. EXAMS, MARKS, RESULTS
-- ========================================================
CREATE POLICY "School members view exams"
    ON exams FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage exams"
    ON exams FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "School members view exam subjects"
    ON exam_subjects FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage exam subjects"
    ON exam_subjects FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "View marks"
    ON marks FOR SELECT
    USING (
        is_school_teacher(school_id)
        OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        OR is_super_admin()
    );

CREATE POLICY "Teachers & Admins manage marks"
    ON marks FOR ALL
    USING (is_school_teacher(school_id));

CREATE POLICY "View published results"
    ON results FOR SELECT
    USING (
        is_school_teacher(school_id)
        OR (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND EXISTS (SELECT 1 FROM exams WHERE id = results.exam_id AND is_published = TRUE))
        OR is_super_admin()
    );

CREATE POLICY "School Admins manage results"
    ON results FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 12. MASTER TEMPLATES & SCHOOL ASSIGNMENTS
-- ========================================================
CREATE POLICY "Public/Members view document templates"
    ON document_templates FOR SELECT
    USING (TRUE);

CREATE POLICY "Super Admins manage master templates"
    ON document_templates FOR ALL
    USING (is_super_admin());

CREATE POLICY "Members view school template assignments"
    ON school_templates FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins & Super Admins manage school templates"
    ON school_templates FOR ALL
    USING (is_school_admin(school_id));

-- ========================================================
-- 13. GENERATED DOCUMENTS & QR VERIFICATION
-- ========================================================
CREATE POLICY "View generated documents"
    ON generated_documents FOR SELECT
    USING (
        is_school_admin(school_id)
        OR is_school_teacher(school_id)
        OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
        OR is_super_admin()
    );

CREATE POLICY "School Admins generate & revoke documents"
    ON generated_documents FOR ALL
    USING (is_school_admin(school_id));

-- Verification table is PUBLIC for QR verification lookup
CREATE POLICY "Public document verification read"
    ON document_verifications FOR SELECT
    USING (TRUE);

CREATE POLICY "System updates document verification"
    ON document_verifications FOR ALL
    USING (TRUE);

-- ========================================================
-- 14. ADMISSIONS, NOTICES, HOMEWORK, TIMETABLE & AUDIT
-- ========================================================
CREATE POLICY "Public can submit admission application"
    ON admissions FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admins view and manage admissions"
    ON admissions FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "School members view published notices"
    ON notices FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "Admins & Teachers manage notices"
    ON notices FOR ALL
    USING (is_school_teacher(school_id));

CREATE POLICY "School members view homework"
    ON homework FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "Teachers & Admins manage homework"
    ON homework FOR ALL
    USING (is_school_teacher(school_id));

CREATE POLICY "School members view timetable"
    ON timetables FOR SELECT
    USING (is_school_member(school_id) OR is_super_admin());

CREATE POLICY "School Admins manage timetable"
    ON timetables FOR ALL
    USING (is_school_admin(school_id));

CREATE POLICY "School Admins view school audit logs"
    ON audit_logs FOR SELECT
    USING (is_school_admin(school_id));

CREATE POLICY "System logs audit entries"
    ON audit_logs FOR INSERT
    WITH CHECK (TRUE);


-- -------------------------------------------------------------------------
-- FILE: 03_functions_triggers.sql
-- -------------------------------------------------------------------------
-- ========================================================
-- 03_functions_triggers.sql: Functions, Triggers & Auth Hooks
-- ========================================================

-- 1. Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_schools_updated_at ON schools;
CREATE TRIGGER set_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_students_updated_at ON students;
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_document_templates_updated_at ON document_templates;
CREATE TRIGGER set_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- 2. New User Creation Trigger (Supabase Auth Hook)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, is_super_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'::user_role),
        COALESCE((NEW.raw_user_meta_data->>'is_super_admin')::boolean, FALSE)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Marks calculation trigger (Calculates total marks automatically)
CREATE OR REPLACE FUNCTION calculate_marks_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_marks = COALESCE(NEW.theory_marks, 0) + COALESCE(NEW.practical_marks, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_marks_total ON marks;
CREATE TRIGGER trg_calculate_marks_total
    BEFORE INSERT OR UPDATE ON marks
    FOR EACH ROW
    EXECUTE FUNCTION calculate_marks_total();

-- 4. Document Verification Counter Function
CREATE OR REPLACE FUNCTION record_document_verification(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_doc RECORD;
    v_school RECORD;
BEGIN
    SELECT gd.*, dv.verified_count
    INTO v_doc
    FROM generated_documents gd
    LEFT JOIN document_verifications dv ON dv.verification_code = gd.verification_code
    WHERE gd.verification_code = p_code
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Document not found');
    END IF;

    -- Increment verification count
    INSERT INTO document_verifications (verification_code, document_id, school_id, verified_count, last_verified_at)
    VALUES (p_code, v_doc.id, v_doc.school_id, 1, NOW())
    ON CONFLICT (verification_code) DO UPDATE
    SET verified_count = document_verifications.verified_count + 1,
        last_verified_at = NOW();

    -- Fetch School Info
    SELECT name, logo_url, slug, city, state, country INTO v_school FROM schools WHERE id = v_doc.school_id;

    RETURN jsonb_build_object(
        'success', true,
        'status', v_doc.status,
        'certificate_no', v_doc.certificate_no,
        'doc_type', v_doc.doc_type,
        'title', v_doc.title,
        'issued_at', v_doc.issued_at,
        'revoked_at', v_doc.revoked_at,
        'revocation_reason', v_doc.revocation_reason,
        'school_name', v_school.name,
        'school_logo', v_school.logo_url,
        'metadata', v_doc.metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------------------------
-- FILE: 04_storage_setup.sql
-- -------------------------------------------------------------------------
-- ========================================================
-- 04_storage_setup.sql: Supabase Storage Buckets & Policies
-- ========================================================

-- Insert storage buckets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('school-assets', 'school-assets', true),
    ('student-photos', 'student-photos', true),
    ('teacher-photos', 'teacher-photos', true),
    ('signatures', 'signatures', false),
    ('documents', 'documents', false),
    ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Public view policy for school-assets (logos, banners, stamps)
CREATE POLICY "Public can view school assets"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('school-assets', 'student-photos', 'teacher-photos', 'attachments'));

-- Authenticated users can upload assets to their school folders
CREATE POLICY "Authenticated users can upload assets"
    ON storage.objects FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Users can update or delete their uploaded files
CREATE POLICY "Users can update their uploaded files"
    ON storage.objects FOR UPDATE
    USING (auth.uid() = owner);

CREATE POLICY "Users can delete their uploaded files"
    ON storage.objects FOR DELETE
    USING (auth.uid() = owner);


-- -------------------------------------------------------------------------
-- FILE: 05_seed_data.sql
-- -------------------------------------------------------------------------
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



-- =========================================================================
-- DON BOSCO ACADEMY DEFAULT SCHOOL RECORD
-- =========================================================================
INSERT INTO schools (
    id, name, slug, email, phone, address, city, state, country, postal_code,
    principal_name, status, subscription_plan_id, logo_url, principal_signature_url, stamp_url
) VALUES (
    '33333333-3333-3333-3333-333333333301',
    'DON BOSCO ACADEMY',
    'don-bosco-academy',
    'principal@donboscoacademy.edu.in',
    '+91 98765 43210',
    'Raipur Bazar, PS Nanpur, District Sitamarhi Bihar - Pin Code 843326',
    'Sitamarhi',
    'Bihar',
    'India',
    '843326',
    'Md. Shami Ahmad',
    'active',
    '11111111-1111-1111-1111-111111111103',
    '/assets/branding/don-bosco-logo.png',
    '/assets/branding/principal-signature.svg',
    '/assets/branding/don-bosco-stamp.svg'
) ON CONFLICT (id) DO NOTHING;

-- Set Initial School Settings
INSERT INTO school_settings (
    school_id, grading_system, attendance_type, currency_symbol, timezone, date_format, theme_color
) VALUES (
    '33333333-3333-3333-3333-333333333301',
    '[{"grade":"A1","min_score":91,"max_score":100,"grade_point":10,"remark":"Outstanding"},{"grade":"A2","min_score":81,"max_score":90,"grade_point":9,"remark":"Excellent"},{"grade":"B1","min_score":71,"max_score":80,"grade_point":8,"remark":"Very Good"},{"grade":"B2","min_score":61,"max_score":70,"grade_point":7,"remark":"Good"},{"grade":"C1","min_score":51,"max_score":60,"grade_point":6,"remark":"Above Average"},{"grade":"C2","min_score":41,"max_score":50,"grade_point":5,"remark":"Average"},{"grade":"D","min_score":33,"max_score":40,"grade_point":4,"remark":"Pass"},{"grade":"E","min_score":0,"max_score":32,"grade_point":0,"remark":"Needs Improvement"}]'::jsonb,
    'daily',
    '₹',
    'Asia/Kolkata',
    'DD/MM/YYYY',
    '#0F2756'
) ON CONFLICT (school_id) DO NOTHING;


-- =========================================================================
-- FILE: 04_exam_links_and_applications.sql (EXAMINATION PORTALS & ADMIT CARDS)
-- =========================================================================

-- 1. EXAM LINKS (Public / Protected Examination Links)
CREATE TABLE IF NOT EXISTS exam_links (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    title TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    target_classes JSONB NOT NULL DEFAULT '["ALL"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_date TEXT NOT NULL,
    link_type TEXT NOT NULL DEFAULT 'EXAM_FORM',
    class_timetables JSONB DEFAULT '{}'::jsonb,
    admit_cards_issued BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE exam_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read exam_links" ON exam_links FOR SELECT USING (true);
CREATE POLICY "Allow all full access exam_links" ON exam_links FOR ALL USING (true);

-- 2. EXAM APPLICATIONS (Student Online Examination Form Submissions)
CREATE TABLE IF NOT EXISTS exam_applications (
    id TEXT PRIMARY KEY,
    link_id TEXT NOT NULL,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    student_id TEXT,
    student_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL DEFAULT 'A',
    roll_number TEXT NOT NULL,
    admission_number TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    address TEXT,
    photo_url TEXT,
    application_no TEXT UNIQUE NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    exam_name TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE exam_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read exam_applications" ON exam_applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert exam_applications" ON exam_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all full access exam_applications" ON exam_applications FOR ALL USING (true);

-- 3. ISSUED MARKSHEETS (Official Verified Digital Marksheets)
CREATE TABLE IF NOT EXISTS issued_marksheets (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    student_id TEXT,
    student_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    gender TEXT,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL DEFAULT 'A',
    roll_number TEXT NOT NULL,
    admission_no TEXT NOT NULL,
    registration_no TEXT,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    exam_name TEXT NOT NULL,
    marksheet_no TEXT UNIQUE NOT NULL,
    verification_id TEXT UNIQUE NOT NULL,
    issue_date TEXT NOT NULL,
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_full_marks NUMERIC(10,2) NOT NULL DEFAULT 600,
    total_marks_obtained NUMERIC(10,2) NOT NULL DEFAULT 0,
    percentage NUMERIC(6,2) NOT NULL DEFAULT 0,
    overall_grade TEXT NOT NULL DEFAULT 'A',
    division TEXT NOT NULL DEFAULT '1st Division',
    result TEXT NOT NULL DEFAULT 'PASS',
    attendance TEXT,
    class_rank TEXT,
    remarks TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE issued_marksheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read issued_marksheets" ON issued_marksheets FOR SELECT USING (true);
CREATE POLICY "Allow all full access issued_marksheets" ON issued_marksheets FOR ALL USING (true);

-- 4. ADMIT CARDS (Official Verified Examination Admit Cards)
CREATE TABLE IF NOT EXISTS admit_cards (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL DEFAULT 'sch-don-bosco',
    link_id TEXT,
    application_id TEXT,
    admit_card_no TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL DEFAULT 'A',
    roll_number TEXT NOT NULL,
    admission_number TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    issue_date TEXT NOT NULL,
    photo_url TEXT,
    timetable JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read admit_cards" ON admit_cards FOR SELECT USING (true);
CREATE POLICY "Allow all full access admit_cards" ON admit_cards FOR ALL USING (true);

-- Default Seed for Exam Links
INSERT INTO exam_links (id, school_id, title, exam_name, academic_year, target_classes, is_active, expiry_date, link_type, admit_cards_issued)
VALUES 
('link-annual-2026', 'sch-don-bosco', 'CBSE Class X Annual Board Examination 2026 - Registration Portal', 'CBSE Class X Annual Board Exam 2026', '2025-2026', '["ALL"]'::jsonb, TRUE, '2026-03-31', 'EXAM_FORM', TRUE),
('link-terminal-2026', 'sch-don-bosco', 'Class 8-10 Mid-Term Examination 2026 Form', 'Mid-Term Examination 2026', '2025-2026', '["Class 8", "Class 9", "Class 10"]'::jsonb, TRUE, '2026-04-15', 'EXAM_FORM', FALSE)
ON CONFLICT (id) DO NOTHING;
