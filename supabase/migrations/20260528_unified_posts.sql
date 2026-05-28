-- ============================================================================
-- Migration: Unified `posts` table (Journal + Activities merge)
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor.
--
-- This migration creates a unified `posts` table to replace the separate
-- `journal_entries` and `activities` tables, along with their relations.
-- Both kinds of content (journal articles and activities/insights/experiments)
-- share the same metadata (title, slug, date, cover image, etc.), so they
-- live in one table now, discriminated by the `kind` column.
--
-- After running this script, verify the row counts match the originals, then
-- run the commented DROP statements at the bottom in a SEPARATE step.
-- ============================================================================

-- 0. Safety backups (optional but recommended — run manually if you want them)
CREATE TABLE journal_entries_backup_20260528 AS SELECT * FROM journal_entries;
CREATE TABLE journal_content_backup_20260528 AS SELECT * FROM journal_content;
CREATE TABLE journal_tags_backup_20260528    AS SELECT * FROM journal_tags;
CREATE TABLE activities_backup_20260528      AS SELECT * FROM activities;
CREATE TABLE activity_links_backup_20260528  AS SELECT * FROM activity_links;

-- ============================================================================
-- 1. Create unified `posts` table
-- ============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('journal', 'activity')),

  -- Common metadata
  title        TEXT NOT NULL,
  date         TEXT,
  cover_image  TEXT,
  excerpt      TEXT,
  is_featured  BOOLEAN DEFAULT FALSE,
  sort_order   INTEGER DEFAULT 0,

  -- Journal-only (nullable for activities)
  category       TEXT,
  reading_time   TEXT,

  -- Activity-only (nullable for journal)
  activity_type    TEXT,                                    -- 'Insight' | 'Event' | 'Experiment'
  status           TEXT,
  long_description TEXT,
  impact           TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_kind        ON posts(kind);
CREATE INDEX IF NOT EXISTS idx_posts_featured    ON posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_sort_order  ON posts(sort_order);

-- ============================================================================
-- 2. Create unified relation tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS post_paragraphs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  paragraph  TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_post_paragraphs_post ON post_paragraphs(post_id);

CREATE TABLE IF NOT EXISTS post_tags (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag     TEXT
);
CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);

CREATE TABLE IF NOT EXISTS post_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  label      TEXT,
  url        TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_post_links_post ON post_links(post_id);

-- ============================================================================
-- 3. Migrate existing data
-- ============================================================================

-- 3a. Journal entries → posts (kind='journal')
INSERT INTO posts (
  id, slug, kind, title, date, cover_image, excerpt, is_featured, sort_order,
  category, reading_time, created_at, updated_at
)
SELECT
  id, slug, 'journal', title, date, hero_image, excerpt, is_featured, sort_order,
  category, reading_time, created_at, updated_at
FROM journal_entries
ON CONFLICT (slug) DO NOTHING;

-- 3b. Activities → posts (kind='activity')
INSERT INTO posts (
  id, slug, kind, title, date, cover_image, excerpt, is_featured, sort_order,
  activity_type, status, long_description, impact, created_at, updated_at
)
SELECT
  id, slug, 'activity', title, date, image_url, description, FALSE, sort_order,
  type, status, long_description, impact, created_at, updated_at
FROM activities
ON CONFLICT (slug) DO NOTHING;

-- 3c. Journal content → post_paragraphs
INSERT INTO post_paragraphs (post_id, paragraph, sort_order)
SELECT entry_id, paragraph, sort_order FROM journal_content;

-- 3d. Journal tags → post_tags
INSERT INTO post_tags (post_id, tag)
SELECT entry_id, tag FROM journal_tags;

-- 3e. Activity links → post_links
INSERT INTO post_links (post_id, label, url, sort_order)
SELECT activity_id, label, url, sort_order FROM activity_links;

-- ============================================================================
-- 4. RLS policies (mirror existing tables — read public, write authenticated)
-- ============================================================================
ALTER TABLE posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_paragraphs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_links       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read posts"           ON posts;
DROP POLICY IF EXISTS "Auth write posts"            ON posts;
DROP POLICY IF EXISTS "Public read post_paragraphs" ON post_paragraphs;
DROP POLICY IF EXISTS "Auth write post_paragraphs"  ON post_paragraphs;
DROP POLICY IF EXISTS "Public read post_tags"       ON post_tags;
DROP POLICY IF EXISTS "Auth write post_tags"        ON post_tags;
DROP POLICY IF EXISTS "Public read post_links"      ON post_links;
DROP POLICY IF EXISTS "Auth write post_links"       ON post_links;

CREATE POLICY "Public read posts"           ON posts            FOR SELECT USING (true);
CREATE POLICY "Auth write posts"            ON posts            FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read post_paragraphs" ON post_paragraphs  FOR SELECT USING (true);
CREATE POLICY "Auth write post_paragraphs"  ON post_paragraphs  FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read post_tags"       ON post_tags        FOR SELECT USING (true);
CREATE POLICY "Auth write post_tags"        ON post_tags        FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read post_links"      ON post_links       FOR SELECT USING (true);
CREATE POLICY "Auth write post_links"       ON post_links       FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 5. Enable Realtime for the new tables
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE post_paragraphs;
ALTER PUBLICATION supabase_realtime ADD TABLE post_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE post_links;

-- ============================================================================
-- 6. Verification queries — run these AFTER the migration and compare counts
-- ============================================================================
SELECT 'journal_entries' AS source, COUNT(*) FROM journal_entries
UNION ALL SELECT 'posts(journal)', COUNT(*) FROM posts WHERE kind = 'journal'
UNION ALL SELECT 'activities',     COUNT(*) FROM activities
UNION ALL SELECT 'posts(activity)', COUNT(*) FROM posts WHERE kind = 'activity'
UNION ALL SELECT 'journal_content', COUNT(*) FROM journal_content
UNION ALL SELECT 'post_paragraphs', COUNT(*) FROM post_paragraphs
UNION ALL SELECT 'journal_tags',    COUNT(*) FROM journal_tags
UNION ALL SELECT 'post_tags',       COUNT(*) FROM post_tags
UNION ALL SELECT 'activity_links',  COUNT(*) FROM activity_links
UNION ALL SELECT 'post_links',      COUNT(*) FROM post_links;

-- ============================================================================
-- 7. Drop old tables (RUN SEPARATELY, ONLY AFTER VERIFICATION)
-- ============================================================================
DROP TABLE IF EXISTS activity_links  CASCADE;
DROP TABLE IF EXISTS journal_tags    CASCADE;
DROP TABLE IF EXISTS journal_content CASCADE;
DROP TABLE IF EXISTS activities      CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
