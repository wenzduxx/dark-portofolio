-- ============================================================================
-- Migration: Site Views — global visit counter
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor.
--
-- Creates a single-row counter table plus an atomic increment RPC that anon
-- visitors may call (via SECURITY DEFINER) without being able to UPDATE the
-- table directly. Idempotent: safe to re-run.
-- ============================================================================

-- 1. Counter table (single row, id is pinned to 1) ---------------------------
CREATE TABLE IF NOT EXISTS site_views (
  id    INT    PRIMARY KEY DEFAULT 1,
  total BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT site_views_single_row CHECK (id = 1)
);

INSERT INTO site_views (id, total) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS: public may read the total, but not write it directly ----------------
ALTER TABLE site_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_views" ON site_views;
CREATE POLICY "Public read site_views" ON site_views
  FOR SELECT USING (true);

-- 3. Atomic increment RPC (returns the new total) ----------------------------
CREATE OR REPLACE FUNCTION increment_site_views()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE site_views SET total = total + 1 WHERE id = 1
  RETURNING total;
$$;

GRANT EXECUTE ON FUNCTION increment_site_views() TO anon, authenticated;

-- 4. Verification ------------------------------------------------------------
SELECT total FROM site_views WHERE id = 1;
