-- ============================================================================
-- Seed: project tech stack, metrics, methodology phases, and visuals
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor AFTER the projects already exist.
--
-- The `projects` table is populated, but the four related tables
-- (project_tech_stack, project_metrics, project_methodology_phases,
-- project_visuals) are EMPTY in the database. That is why the Project Detail
-- page rendered with no gallery images, no tech-stack chips, no metrics and no
-- methodology phases — the right side of the page looked empty.
--
-- This seed mirrors the canonical content in `src/data/projects.ts` (same
-- image URLs already used elsewhere in the repo, so no broken links) for the
-- four existing projects, keyed by slug so it works regardless of UUIDs.
--
-- Idempotent: deletes any existing rows for these projects first, then inserts.
-- Safe to re-run. The Back Office "Projects" editor can manage these rows
-- afterwards (add/remove visuals, tech, metrics, phases).
-- ============================================================================

BEGIN;

-- Clear existing rows for the four seeded projects (no-op if already empty) ---
DELETE FROM project_tech_stack          WHERE project_id IN (SELECT id FROM projects WHERE slug IN ('automotive-motion','urban-architecture','human-perspective','brand-identity'));
DELETE FROM project_metrics             WHERE project_id IN (SELECT id FROM projects WHERE slug IN ('automotive-motion','urban-architecture','human-perspective','brand-identity'));
DELETE FROM project_methodology_phases  WHERE project_id IN (SELECT id FROM projects WHERE slug IN ('automotive-motion','urban-architecture','human-perspective','brand-identity'));
DELETE FROM project_visuals             WHERE project_id IN (SELECT id FROM projects WHERE slug IN ('automotive-motion','urban-architecture','human-perspective','brand-identity'));

-- ── Tech stack ──────────────────────────────────────────────────────────────
INSERT INTO project_tech_stack (project_id, tech, sort_order)
SELECT p.id, t.tech, t.sort_order FROM projects p
JOIN (VALUES
  ('automotive-motion', 'React', 0),
  ('automotive-motion', 'Three.js', 1),
  ('automotive-motion', 'GSAP', 2),
  ('automotive-motion', 'GLSL Shaders', 3),
  ('automotive-motion', 'Web Audio API', 4),
  ('urban-architecture', 'MidJourney', 0),
  ('urban-architecture', 'Blender', 1),
  ('urban-architecture', 'Unreal Engine 5', 2),
  ('urban-architecture', 'Rhino 3D', 3),
  ('human-perspective', 'Leica M6', 0),
  ('human-perspective', 'Kodak Tri-X 400', 1),
  ('human-perspective', 'Silverfast AI', 2),
  ('human-perspective', 'Darkroom Printing', 3),
  ('brand-identity', 'Adobe Illustrator', 0),
  ('brand-identity', 'Figma', 1),
  ('brand-identity', 'Motion', 2),
  ('brand-identity', 'Next.js', 3)
) AS t(slug, tech, sort_order) ON t.slug = p.slug;

-- ── Outcome metrics (automotive-motion only) ────────────────────────────────
INSERT INTO project_metrics (project_id, label, value, sort_order)
SELECT p.id, m.label, m.value, m.sort_order FROM projects p
JOIN (VALUES
  ('automotive-motion', 'Time on Site', '+140%', 0),
  ('automotive-motion', 'Conversion Rate', '+22%', 1),
  ('automotive-motion', 'Load Time', '< 1.2s', 2)
) AS m(slug, label, value, sort_order) ON m.slug = p.slug;

-- ── Methodology phases (automotive-motion only) ─────────────────────────────
INSERT INTO project_methodology_phases (project_id, name, description, sort_order)
SELECT p.id, ph.name, ph.description, ph.sort_order FROM projects p
JOIN (VALUES
  ('automotive-motion', 'Data Ingestion', 'Parsed CAD data and reduced polycount by 90% for web delivery without losing visual fidelity.', 0),
  ('automotive-motion', 'Physics Prototyping', 'Developed GLSL shaders to represent real-world aerodynamics and lighting reflections.', 1),
  ('automotive-motion', 'Haptic Sync', 'Synchronized Web Audio API layers to trigger nuanced sound design mimicking tactile feedback.', 2)
) AS ph(slug, name, description, sort_order) ON ph.slug = p.slug;

-- ── Visuals / gallery ───────────────────────────────────────────────────────
INSERT INTO project_visuals (project_id, url, caption, sort_order)
SELECT p.id, v.url, v.caption, v.sort_order FROM projects p
JOIN (VALUES
  ('automotive-motion', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1200', 'Interface details and color configuration', 0),
  ('automotive-motion', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200', 'Shadow and lighting study for real-time rendering', 1),
  ('automotive-motion', 'https://images.unsplash.com/photo-1518985206232-22533ddc4a96?auto=format&fit=crop&q=80&w=1200', 'Performance testing metrics', 2),
  ('urban-architecture', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200', 'Structure detail and material study', 0),
  ('urban-architecture', 'https://images.unsplash.com/photo-1449156001935-d2863fb72690?auto=format&fit=crop&q=80&w=1200', 'Interior social atrium concept', 1),
  ('human-perspective', 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=1200', 'Street scene in Shinjuku', 0),
  ('human-perspective', 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=1200', 'Portrait study on 35mm', 1),
  ('brand-identity', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&q=80&w=1200', 'Logo construction and grid', 0),
  ('brand-identity', 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=1200', 'Typography and brand applications', 1)
) AS v(slug, url, caption, sort_order) ON v.slug = p.slug;

COMMIT;

-- Verification ---------------------------------------------------------------
SELECT 'tech_stack' AS tbl, count(*) FROM project_tech_stack
UNION ALL SELECT 'metrics', count(*) FROM project_metrics
UNION ALL SELECT 'phases',  count(*) FROM project_methodology_phases
UNION ALL SELECT 'visuals', count(*) FROM project_visuals;
