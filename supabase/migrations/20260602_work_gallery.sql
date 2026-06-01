-- ============================================================================
-- Migration: `work_gallery` table
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor.
--
-- Powers the dynamic image gallery in the Work page "Design Philosophy" card
-- (previously a static "WP" placeholder). Read by PortfolioDataContext and the
-- Back Office "Work Gallery" editor. Until rows exist (or if the fetch 404s),
-- the app falls back to hard-coded Unsplash defaults so the card is never blank.
--
-- Mirrors the conventions of explorations_gallery: UUID PK, indexes, RLS
-- (public read / authenticated write), realtime.
-- ============================================================================

-- 1. Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_gallery (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   TEXT NOT NULL,
  caption     TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_gallery_sort ON work_gallery(sort_order);

-- 2. RLS (read public, write authenticated) ---------------------------------
ALTER TABLE work_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read work_gallery" ON work_gallery;
DROP POLICY IF EXISTS "Auth write work_gallery"  ON work_gallery;

CREATE POLICY "Public read work_gallery" ON work_gallery FOR SELECT USING (true);
CREATE POLICY "Auth write work_gallery"  ON work_gallery FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. Realtime ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE work_gallery;

-- 4. Seed dummy images (Unsplash) -------------------------------------------
INSERT INTO work_gallery (image_url, caption, sort_order) VALUES
  ('https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&q=80&w=1200', 'Editorial layout study', 0),
  ('https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200', 'Motion & 3D render', 1),
  ('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200', 'Abstract gradient system', 2),
  ('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200', 'Interface concept', 3),
  ('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=1200', 'Type & grid exploration', 4);
