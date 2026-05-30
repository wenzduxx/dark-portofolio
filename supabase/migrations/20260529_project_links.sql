-- ============================================================================
-- Migration: `projects` table — add live_url and repo_url columns
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor.
--
-- The Project Detail page has a "Visit Project" call-to-action with
-- "Live Preview" and "Repository" buttons, but the `projects` table had no
-- columns to store those URLs, so the buttons pointed at dead `#` links.
-- This migration adds the two columns; the Back Office "Project Links" editor
-- writes them and the front-end renders a button only when its URL exists.
--
-- Idempotent: safe to run more than once (ADD COLUMN IF NOT EXISTS).
-- No RLS changes needed — columns inherit the existing `projects` policies.
-- ============================================================================

-- 1. Columns -----------------------------------------------------------------
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS live_url TEXT,
  ADD COLUMN IF NOT EXISTS repo_url TEXT;

-- 2. Verification ------------------------------------------------------------
SELECT column_name, data_type
  FROM information_schema.columns
 WHERE table_name = 'projects'
   AND column_name IN ('live_url', 'repo_url')
 ORDER BY column_name;
