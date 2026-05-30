-- ============================================================================
-- Migration: `explorations_gallery` table
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor.
--
-- The home-page Explorations parallax gallery and the Back Office
-- "Explorations Gallery" editor both read/write this table, but it was never
-- created in the schema. Without it the app 404s on every fetch and falls back
-- to the hard-coded default images. This migration creates the table so those
-- 404s disappear and the editor persists real data.
--
-- Mirrors the conventions of the other tables: UUID PK, indexes, RLS
-- (public read / authenticated write), and realtime.
-- ============================================================================

-- 1. Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS explorations_gallery (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url       TEXT NOT NULL,
  column_position INTEGER NOT NULL DEFAULT 1 CHECK (column_position IN (1, 2)),
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_explorations_gallery_col  ON explorations_gallery(column_position);
CREATE INDEX IF NOT EXISTS idx_explorations_gallery_sort ON explorations_gallery(sort_order);

-- 2. RLS (read public, write authenticated) ---------------------------------
ALTER TABLE explorations_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read explorations_gallery" ON explorations_gallery;
DROP POLICY IF EXISTS "Auth write explorations_gallery"  ON explorations_gallery;

CREATE POLICY "Public read explorations_gallery" ON explorations_gallery FOR SELECT USING (true);
CREATE POLICY "Auth write explorations_gallery"  ON explorations_gallery FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. Realtime ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE explorations_gallery;
