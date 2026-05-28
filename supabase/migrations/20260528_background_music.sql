-- ============================================================================
-- Migration: Background Music — storage buckets + site_settings columns
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor.
--
-- Creates 3 public storage buckets (50MB cap, audio MIME types only) and
-- adds three nullable TEXT columns to site_settings for the uploaded URLs.
-- Idempotent: safe to re-run.
-- ============================================================================

-- 1. Storage buckets ---------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('music-home',   'music-home',   true, 52428800,
    ARRAY['audio/mpeg','audio/wav','audio/ogg','audio/mp4','audio/aac','audio/x-m4a','audio/webm']),
  ('music-work',   'music-work',   true, 52428800,
    ARRAY['audio/mpeg','audio/wav','audio/ogg','audio/mp4','audio/aac','audio/x-m4a','audio/webm']),
  ('music-resume', 'music-resume', true, 52428800,
    ARRAY['audio/mpeg','audio/wav','audio/ogg','audio/mp4','audio/aac','audio/x-m4a','audio/webm'])
ON CONFLICT (id) DO UPDATE
  SET public           = EXCLUDED.public,
      file_size_limit  = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS policies on storage.objects -----------------------------------------
DROP POLICY IF EXISTS "Public read music buckets" ON storage.objects;
DROP POLICY IF EXISTS "Auth write music buckets"  ON storage.objects;

CREATE POLICY "Public read music buckets" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('music-home','music-work','music-resume'));

CREATE POLICY "Auth write music buckets" ON storage.objects
  FOR ALL
  USING      (bucket_id IN ('music-home','music-work','music-resume') AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id IN ('music-home','music-work','music-resume') AND auth.role() = 'authenticated');

-- 3. site_settings columns ---------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS home_music_url   TEXT,
  ADD COLUMN IF NOT EXISTS work_music_url   TEXT,
  ADD COLUMN IF NOT EXISTS resume_music_url TEXT;

-- 4. Verification ------------------------------------------------------------
SELECT id, public, file_size_limit FROM storage.buckets
  WHERE id IN ('music-home','music-work','music-resume');

SELECT column_name FROM information_schema.columns
  WHERE table_name = 'site_settings'
    AND column_name IN ('home_music_url','work_music_url','resume_music_url');
