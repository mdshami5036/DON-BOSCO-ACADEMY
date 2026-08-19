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
