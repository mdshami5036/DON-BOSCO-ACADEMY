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
