# Background Music Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ambient background music to the portfolio with three independently uploadable tracks (Home / Work / Resume), continuous playback across navigation, an elegant mute/unmute toggle in the Navbar, and Back Office uploads (max 50MB) into three Supabase storage buckets.

**Architecture:** A singleton `<audio>` element lives inside a React provider (`BackgroundMusicContext`) wrapping the public portfolio routes. The provider reads `site_settings` from Supabase (with realtime), maps the current route to a music slot, applies the home-as-fallback rule, and crossfades between tracks (600ms) when the source changes. A small `MusicToggle` button inside the existing Navbar pill controls mute state, persisted to `localStorage`. Audio uploads happen in the Back Office Site Settings page via a new `AudioUpload` component (mirrors the existing `ImageUpload`).

**Tech Stack:** React 19, react-router-dom 7, Supabase (storage + realtime), lucide-react icons, Tailwind v4. HTML5 `<audio>` API (no Web Audio API).

**Spec:** [docs/superpowers/specs/2026-05-28-background-music-design.md](../specs/2026-05-28-background-music-design.md)

---

## File Structure

**Create:**
- `supabase/migrations/20260528_background_music.sql` — buckets + columns + RLS
- `src/contexts/BackgroundMusicContext.tsx` — singleton audio provider
- `src/components/MusicToggle.tsx` — navbar button
- `src/pages/BackOffice/components/AudioUpload.tsx` — audio upload widget

**Modify:**
- `src/pages/BackOffice/sections/SiteSettings.tsx` — add "Background Music" card
- `src/components/Navbar.tsx` — embed `<MusicToggle />`
- `src/App.tsx` — wrap `<PortfolioApp />` in `<BackgroundMusicProvider>`

---

## Task 1: SQL Migration — Buckets, RLS, Columns

**Files:**
- Create: `supabase/migrations/20260528_background_music.sql`

- [ ] **Step 1: Create the migration file**

Write to `supabase/migrations/20260528_background_music.sql`:

```sql
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
```

- [ ] **Step 2: Apply the migration in Supabase**

This is a manual step done by the project owner. Open Supabase Studio → SQL Editor → paste the file contents → Run. The verification SELECTs at the bottom must return 3 buckets + 3 columns.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260528_background_music.sql
git commit -m "feat(db): add music storage buckets and site_settings music columns"
```

---

## Task 2: AudioUpload Component

**Files:**
- Create: `src/pages/BackOffice/components/AudioUpload.tsx`

- [ ] **Step 1: Create the component**

Write to `src/pages/BackOffice/components/AudioUpload.tsx`:

```tsx
import React, { useRef, useState } from 'react';
import { supabase, deleteStorageFile } from '../../../lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';

interface AudioUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket: 'music-home' | 'music-work' | 'music-resume';
}

const MAX_SIZE_BYTES = 52428800; // 50MB

export default function AudioUpload({ value, onChange, label = 'Audio', bucket }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'url' | 'upload'>('url');

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error('File terlalu besar (maksimal 50MB)');
      }
      if (!file.type.startsWith('audio/')) {
        throw new Error('File harus berupa audio');
      }
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      if (value) {
        await deleteStorageFile(value);
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      await deleteStorageFile(value);
    }
    onChange('');
  };

  return (
    <div>
      <label className="block text-xs text-[#888] mb-2">{label}</label>

      <div className="flex gap-1 mb-3">
        {(['url', 'upload'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              tab === t ? 'bg-[#84CC16] text-black font-medium' : 'bg-[#1a1a1a] text-[#888] hover:text-[#e5e5e5]'
            }`}
          >
            {t === 'url' ? 'URL' : 'Upload file'}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://...mp3"
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors"
          />
          {value && (
            <button onClick={handleRemove} className="p-2 text-[#555] hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] hover:border-[#84CC16] rounded-lg p-6 flex flex-col items-center gap-2 text-[#888] hover:text-[#e5e5e5] transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#84CC16]" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span className="text-xs">{uploading ? 'Uploading...' : 'Click to upload audio (max 50MB)'}</span>
          </button>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
      )}

      {value && (
        <div className="mt-3 rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a] p-2 flex items-center gap-2">
          <audio src={value} controls preload="none" className="w-full h-9" />
          <button
            onClick={handleRemove}
            className="p-1.5 text-[#555] hover:text-red-400 transition-colors shrink-0"
            title="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: PASS (no new errors). The script is `tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/BackOffice/components/AudioUpload.tsx
git commit -m "feat(backoffice): add AudioUpload component for music files"
```

---

## Task 3: Extend SiteSettings — Background Music Card

**Files:**
- Modify: `src/pages/BackOffice/sections/SiteSettings.tsx`

- [ ] **Step 1: Import AudioUpload**

Add to the imports at the top of `src/pages/BackOffice/sections/SiteSettings.tsx`:

```tsx
import AudioUpload from '../components/AudioUpload';
```

- [ ] **Step 2: Extend the form state**

Replace the `useState` block (around line 9-12):

```tsx
const [form, setForm] = useState({
  owner_name: '', owner_initials: '', owner_email: '', owner_location: '',
  logo_initials: '', collection_label: '', seo_title: '', seo_description: '',
  home_music_url: '', work_music_url: '', resume_music_url: ''
});
```

- [ ] **Step 3: Add the Background Music card**

Insert this card AFTER the SEO card (after the `</BOCard>` that closes SEO, BEFORE `<BOSaveButton ... />`):

```tsx
<BOCard>
  <h3 className="text-sm font-semibold text-[#e5e5e5] mb-1">Background Music</h3>
  <p className="text-xs text-[#555] mb-4">
    Upload audio for each section (max 50MB). Empty slots fall back to Home music. Leave all empty to disable.
  </p>
  <div className="space-y-4">
    <AudioUpload
      label="Home Music"
      bucket="music-home"
      value={form.home_music_url}
      onChange={v => setForm(f => ({ ...f, home_music_url: v }))}
    />
    <AudioUpload
      label="Work Music"
      bucket="music-work"
      value={form.work_music_url}
      onChange={v => setForm(f => ({ ...f, work_music_url: v }))}
    />
    <AudioUpload
      label="Resume Music"
      bucket="music-resume"
      value={form.resume_music_url}
      onChange={v => setForm(f => ({ ...f, resume_music_url: v }))}
    />
  </div>
</BOCard>
```

- [ ] **Step 4: TypeScript check**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/BackOffice/sections/SiteSettings.tsx
git commit -m "feat(backoffice): add Background Music card in Site Settings"
```

---

## Task 4: BackgroundMusicContext Provider

**Files:**
- Create: `src/contexts/BackgroundMusicContext.tsx`

- [ ] **Step 1: Create the provider**

Write to `src/contexts/BackgroundMusicContext.tsx`:

```tsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type MusicSlot = 'home' | 'work' | 'resume';

interface BackgroundMusicContextType {
  isMuted: boolean;
  toggleMute: () => void;
  hasAudioAvailable: boolean;
}

const STORAGE_KEY = 'bg-music-muted';
const CROSSFADE_MS = 600;

const BackgroundMusicContext = createContext<BackgroundMusicContextType>({
  isMuted: true,
  toggleMute: () => {},
  hasAudioAvailable: false,
});

const getInitialMuted = (): boolean => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
};

const routeToSlot = (pathname: string): MusicSlot => {
  if (pathname === '/resume' || pathname.startsWith('/academic/')) return 'resume';
  if (
    pathname === '/work' ||
    pathname.startsWith('/project/') ||
    pathname.startsWith('/experience/') ||
    pathname.startsWith('/journal/') ||
    pathname.startsWith('/activity/')
  ) {
    return 'work';
  }
  return 'home';
};

export function BackgroundMusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const location = useLocation();

  const [isMuted, setIsMuted] = useState<boolean>(getInitialMuted);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isErrored, setIsErrored] = useState(false);
  const [urls, setUrls] = useState<Record<MusicSlot, string | null>>({
    home: null, work: null, resume: null,
  });

  // Fetch initial URLs and subscribe to realtime updates of site_settings
  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('home_music_url, work_music_url, resume_music_url')
        .single();
      if (!mounted || !data) return;
      setUrls({
        home: data.home_music_url || null,
        work: data.work_music_url || null,
        resume: data.resume_music_url || null,
      });
    };

    fetchSettings();

    const channel = supabase
      .channel('bg-music-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchSettings)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Resolve target URL
  const slot = routeToSlot(location.pathname);
  const targetUrl = urls[slot] || urls.home || null;
  const hasAudioAvailable = targetUrl !== null && !isErrored;

  // Reset error state whenever target URL changes (give the new URL a chance)
  useEffect(() => {
    setIsErrored(false);
  }, [targetUrl]);

  // Volume ramp via requestAnimationFrame
  const fadeTo = useCallback((target: number, durationMs: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) { onDone?.(); return; }
    if (fadeRafRef.current !== null) cancelAnimationFrame(fadeRafRef.current);

    const start = audio.volume;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / Math.max(1, durationMs));
      audio.volume = start + (target - start) * t;
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(step);
      } else {
        fadeRafRef.current = null;
        onDone?.();
      }
    };
    fadeRafRef.current = requestAnimationFrame(step);
  }, []);

  // Sync audio src to target URL — no-op if same, crossfade if different
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isErrored) return; // do not retry a failed URL

    if (targetUrl === currentUrl) return;

    if (targetUrl === null) {
      const done = () => {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        setCurrentUrl(null);
      };
      if (isMuted || currentUrl === null) done();
      else fadeTo(0, CROSSFADE_MS, done);
      return;
    }

    const swap = () => {
      audio.src = targetUrl;
      audio.load();
      audio.play().catch(() => { /* autoplay rejected; user can unmute later */ });
      setCurrentUrl(targetUrl);
      if (!isMuted) fadeTo(1, CROSSFADE_MS);
    };

    if (currentUrl === null) {
      audio.volume = 0;
      swap();
    } else if (isMuted) {
      swap();
    } else {
      fadeTo(0, CROSSFADE_MS, swap);
    }
  }, [targetUrl, currentUrl, isMuted, isErrored, fadeTo]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      if (audioRef.current && currentUrl) {
        // Ensure audio is playing so unmute can take effect
        audioRef.current.play().catch(() => {});
        fadeTo(next ? 0 : 1, CROSSFADE_MS);
      }
      return next;
    });
  }, [currentUrl, fadeTo]);

  return (
    <BackgroundMusicContext.Provider value={{ isMuted, toggleMute, hasAudioAvailable }}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        style={{ display: 'none' }}
        onError={() => setIsErrored(true)}
      />
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export const useBackgroundMusic = () => useContext(BackgroundMusicContext);
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/contexts/BackgroundMusicContext.tsx
git commit -m "feat(audio): add BackgroundMusicContext provider with crossfade and fallback"
```

---

## Task 5: MusicToggle Component

**Files:**
- Create: `src/components/MusicToggle.tsx`

- [ ] **Step 1: Create the toggle**

Write to `src/components/MusicToggle.tsx`:

```tsx
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useBackgroundMusic } from '../contexts/BackgroundMusicContext';

export function MusicToggle() {
  const { isMuted, toggleMute, hasAudioAvailable } = useBackgroundMusic();

  if (!hasAudioAvailable) return null;

  return (
    <button
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      className={`relative rounded-full p-2 transition-all duration-300 hover:bg-white/10 ${
        isMuted ? 'text-muted animate-pulse' : 'text-text-primary'
      }`}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/MusicToggle.tsx
git commit -m "feat(audio): add MusicToggle button for navbar"
```

---

## Task 6: Navbar Integration

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Import MusicToggle**

Add this import at the top of `src/components/Navbar.tsx` (after the `usePortfolioData` import):

```tsx
import { MusicToggle } from './MusicToggle';
```

- [ ] **Step 2: Insert MusicToggle between divider and "Say hi"**

Replace this block (the `{/* Divider */}` followed by the "Say hi" anchor, lines around 68-80):

```tsx
          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-3" />

          {/* "Say hi" button */}
          <a 
            href={`mailto:${siteData.ownerEmail}`}
            className="group relative rounded-full inline-flex items-center justify-center text-xs sm:text-sm px-4 py-2 hover:bg-white/10 transition-colors duration-300"
          >
            <span className="relative flex items-center gap-2 text-text-primary">
              Say hi <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-primary" />
            </span>
          </a>
```

with:

```tsx
          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-3" />

          {/* Music toggle */}
          <MusicToggle />

          {/* "Say hi" button */}
          <a 
            href={`mailto:${siteData.ownerEmail}`}
            className="group relative rounded-full inline-flex items-center justify-center text-xs sm:text-sm px-4 py-2 hover:bg-white/10 transition-colors duration-300"
          >
            <span className="relative flex items-center gap-2 text-text-primary">
              Say hi <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-primary" />
            </span>
          </a>
```

- [ ] **Step 3: TypeScript check**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat(audio): embed MusicToggle inside Navbar pill"
```

---

## Task 7: App.tsx — Mount the Provider

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import BackgroundMusicProvider**

Add this import to `src/App.tsx` (after `PortfolioDataProvider`):

```tsx
import { BackgroundMusicProvider } from './contexts/BackgroundMusicContext';
```

- [ ] **Step 2: Wrap PortfolioApp in the provider**

Replace the portfolio route (around lines 62-66):

```tsx
        <Route path="/*" element={
          <PortfolioDataProvider>
            <PortfolioApp />
          </PortfolioDataProvider>
        } />
```

with:

```tsx
        <Route path="/*" element={
          <PortfolioDataProvider>
            <BackgroundMusicProvider>
              <PortfolioApp />
            </BackgroundMusicProvider>
          </PortfolioDataProvider>
        } />
```

The `/bts-porto/*` route stays untouched — Back Office must NOT play audio.

- [ ] **Step 3: TypeScript check**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(audio): mount BackgroundMusicProvider on public portfolio routes"
```

---

## Task 8: Manual Smoke Test

**Files:** None modified — verification only.

- [ ] **Step 1: Build check**

Run: `npm run build`
Expected: completes without TypeScript errors.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Expected: server listens on http://localhost:3000

- [ ] **Step 3: Confirm migration has been applied**

Open Supabase Studio → Storage. Verify three buckets exist: `music-home`, `music-work`, `music-resume`, each with 50MB size limit. Open Table Editor → `site_settings` and verify the three new columns exist (initially NULL).

- [ ] **Step 4: Empty-state test**

With all 3 music URLs NULL in `site_settings`:
- Visit http://localhost:3000/ — MusicToggle button is NOT visible in the Navbar.
- Visit /work — same.
- Visit /resume — same.

- [ ] **Step 5: Single upload (Home only)**

Open http://localhost:3000/bts-porto, log in, open Site Settings, upload one MP3 to "Home Music", click Save.

- Visit / — MusicToggle appears with a pulse animation, muted icon (VolumeX). Click it → unmuted icon (Volume2), audio audible, fades in over 600ms.
- Navigate to /work — audio does NOT restart, keeps playing (fallback hits home URL on both routes → same source → no-op).
- Navigate to /resume — same.

- [ ] **Step 6: Two uploads (Home + Work)**

Upload a different MP3 to "Work Music", click Save.

- Visit / — Home track plays.
- Navigate to /work — 600ms crossfade to Work track.
- Navigate to /resume — 600ms crossfade back to Home track (Resume slot empty → fallback).

- [ ] **Step 7: All three uploaded**

Upload a third MP3 to "Resume Music", click Save.

- Navigate / → /work → /resume → each crossfades to its own track.
- Navigate /work → /project/<any-existing-slug> — Work track keeps playing (detail page inherits Work).
- Navigate /resume → /academic/<any-existing-slug> — Resume track keeps playing.

- [ ] **Step 8: Mute persistence**

While unmuted, refresh the page. Audio resumes muted=false (i.e., the saved state). Mute → refresh → audio is muted on load. Tested on a regular tab; localStorage works.

- [ ] **Step 9: File size validation**

In Back Office, try uploading a >50MB audio file. Expect error: "File terlalu besar (maksimal 50MB)" — upload does NOT proceed.

- [ ] **Step 10: MIME validation**

Try uploading a non-audio file (rename `.txt` to `.mp3` if needed). Expect error: "File harus berupa audio" (client) OR Supabase rejects via `allowed_mime_types` (server).

- [ ] **Step 11: Back Office isolation**

Navigate to /bts-porto. Confirm no audio plays in this section and no MusicToggle appears.

- [ ] **Step 12: Final commit (if any merged tweaks)**

If smoke test surfaced minor fixes already committed in earlier tasks, no additional commit needed. Otherwise:

```bash
git status
# If clean, done. If fixes were made, commit them with a focused message.
```

---

## Notes for the Implementer

- Tests are intentionally NOT added for audio playback. Browser `<audio>` mocking is brittle, and the spec section 7 calls for manual smoke tests only.
- The `merge-journal-and-activities` branch already has an uncommitted modification in `supabase/migrations/20260528_unified_posts.sql` — DO NOT include that file in your commits. Stage explicitly listed files only.
- `lucide-react` icons `Volume2` and `VolumeX` are already available via the existing dependency.
- The Tailwind utility `animate-pulse` is built-in and produces the opacity pulse used by MusicToggle.
