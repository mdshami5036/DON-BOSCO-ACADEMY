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
