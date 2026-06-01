-- Flexible content blocks + per-page appearance for posts (journal/activity) and projects.
-- Run manually in the Supabase SQL editor.
--
-- `content_blocks` is an ordered JSONB array of typed blocks (heading, paragraph,
-- image, gallery, code, callout, stats, columns, table, etc.). `appearance` holds
-- optional per-page look settings (accent colour, header style, content width, decor).
-- Both are backward compatible: existing rows default to an empty block list and
-- render via their legacy fields until blocks are added.

ALTER TABLE posts    ADD COLUMN IF NOT EXISTS content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE posts    ADD COLUMN IF NOT EXISTS appearance     JSONB;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS appearance     JSONB;
