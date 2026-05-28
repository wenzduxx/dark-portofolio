# Background Music Feature — Design Spec

**Date:** 2026-05-28
**Status:** Approved by user, ready for implementation plan
**Branch:** `merge-journal-and-activities` (current)

---

## 1. Purpose

Add ambient background music to the portfolio site with three independently uploadable tracks (Home, Work, Resume) configurable from the Back Office. Each route plays its assigned track, with continuous playback when neighboring routes share the same track, and a fallback to the Home track when a slot is empty. A single elegant mute/unmute control lives in the Navbar.

## 2. Constraints & UX Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Autoplay strategy | Audio starts muted, user unmutes via icon click | Browser autoplay policy blocks audio playback without prior user interaction; muted autoplay is allowed |
| Navigation behavior | Same URL → continue; different URL → 600ms crossfade | Matches user requirement "berkelanjutan" (continuous) |
| Music icon placement | Inside the Navbar pill, between nav links and "Say hi" | Consistent with existing glassmorphism, always visible, no floating element |
| Detail-page mapping | `/project`, `/journal`, `/activity`, `/experience` → Work; `/academic` → Resume | Detail pages inherit music from their parent section |
| Max file size | 50MB per track | Per user requirement |
| Number of buckets | 3 separate buckets (`music-home`, `music-work`, `music-resume`) | Per user requirement |

## 3. Storage & Database

### 3.1 Migration file

`supabase/migrations/20260528_background_music.sql`

Contains:
1. `INSERT INTO storage.buckets` for three buckets: `music-home`, `music-work`, `music-resume`
   - `public = true` (publicly readable for `<audio>` tag)
   - `file_size_limit = 52428800` (50MB in bytes)
   - `allowed_mime_types = ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/x-m4a', 'audio/webm']`
2. RLS policies on `storage.objects`:
   - Public read for `bucket_id IN ('music-home', 'music-work', 'music-resume')`
   - Authenticated insert/update/delete for the same buckets
3. `ALTER TABLE site_settings ADD COLUMN` for three TEXT columns:
   - `home_music_url`
   - `work_music_url`
   - `resume_music_url`

All statements use `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` so the migration is idempotent.

### 3.2 No table changes beyond `site_settings`

`site_settings` is a singleton row, fitting the existing pattern.

## 4. Routing & Fallback Logic

### 4.1 Route → music slot map

```
'/'                                     → home
'/work'                                 → work
'/project/:id'                          → work
'/experience/:id'                       → work
'/journal/:id'                          → work
'/activity/:id'                         → work
'/resume'                               → resume
'/academic/:id'                         → resume
'/bts-porto/*'                          → NO MUSIC (provider not mounted here)
```

### 4.2 Fallback chain

```
target_url = settings[`${slot}_music_url`] ?? settings.home_music_url ?? null
```

If `target_url === null` for the current route, the MusicToggle icon is hidden and the audio element is paused.

### 4.3 Continuous playback rule

On every route change:
- Compute new `target_url`
- If `target_url === currentUrl` → no-op (audio keeps playing without restart)
- If `target_url !== currentUrl` AND not muted → 600ms crossfade (ramp current volume to 0, swap `src`, ramp to 1)
- If `target_url !== currentUrl` AND muted → swap `src` immediately (volume already 0)

## 5. Frontend Architecture

### 5.1 New files

| File | Purpose |
|---|---|
| `src/contexts/BackgroundMusicContext.tsx` | Singleton audio provider, fallback resolver, mute state |
| `src/components/MusicToggle.tsx` | Icon button rendered inside Navbar |
| `src/pages/BackOffice/components/AudioUpload.tsx` | Audio file/URL upload component (mirror of `ImageUpload.tsx`) |

### 5.2 Files modified

| File | Change |
|---|---|
| `src/App.tsx` | Wrap `<PortfolioApp />` in `<BackgroundMusicProvider>` (NOT the `/bts-porto/*` route) |
| `src/components/Navbar.tsx` | Render `<MusicToggle />` between nav links group and "Say hi" anchor |
| `src/pages/BackOffice/sections/SiteSettings.tsx` | Add "Background Music" card with three `AudioUpload` instances; extend `form` state to include the three new fields |

### 5.3 `BackgroundMusicContext` internals

- One hidden `<audio>` element rendered by the provider (`loop`, `preload="auto"`).
- State: `{ isMuted, currentUrl, isReady, hasAudioAvailable }`.
- Reads `site_settings` row on mount via Supabase (subscribes to Realtime so CMS updates propagate live).
- Uses `useLocation()` from react-router-dom to derive the route → slot mapping.
- `isMuted` persisted to `localStorage('bg-music-muted')`; default `true` on first visit.
- Audio `play()` invoked on every src change; `.catch()` swallows rejected promises silently.
- Crossfade implemented via `requestAnimationFrame` volume ramp (no Web Audio API needed).

### 5.4 `MusicToggle` UI

- Icons: `Volume2` (unmuted) / `VolumeX` (muted) from `lucide-react` (already a project dep).
- Style: small round button, matches navbar item styling (`rounded-full px-3 py-1.5 text-muted hover:text-text-primary`).
- When `isMuted`: subtle pulse animation (`opacity 0.6 ↔ 1.0`, 2s loop) to hint that audio is available.
- Hidden entirely when `hasAudioAvailable === false` (no music uploaded for this route + no Home fallback).
- Accessible: `aria-label` reads "Mute background music" / "Unmute background music".

### 5.5 `AudioUpload` component

Mirrors `ImageUpload.tsx`:
- Tab switcher: `URL` / `Upload file`
- File input restricted to `accept="audio/*"`
- Client-side validation: `file.size <= 52428800` and `file.type.startsWith('audio/')`
- On replace: call `deleteStorageFile()` for the old URL before uploading new
- Preview: native `<audio controls>` element below the input when `value` is set

## 6. Error Handling & Edge Cases

| Scenario | Handling |
|---|---|
| File > 50MB | Client validation rejects; bucket `file_size_limit` is server-side safety net |
| Non-audio MIME | Client validation rejects; bucket `allowed_mime_types` is server-side safety net |
| Replacing existing audio | Old file deleted via `deleteStorageFile()` helper |
| Audio fails to load (404, deleted file) | `<audio>` `onerror` → `setIsReady(false)` → toggle hidden; no crash |
| `audio.play()` promise rejects | Caught silently; state stays muted; user can manually unmute |
| Navigate to page with no audio | Pause audio, hide toggle. On return to a page with audio, resume with the same mute state |
| `localStorage` unavailable (incognito strict mode) | Wrap in `try/catch`; default to `isMuted=true` |
| Crossfade while muted | Skip ramp; swap `src` directly (volume already 0) |
| Back Office user updates URLs while audience listens | Realtime subscription pushes new URLs; provider re-evaluates `target_url` and crossfades if needed |

## 7. Testing Strategy

Manual smoke tests (no automated tests — browser audio APIs are awkward to mock and ROI is low for this feature):

1. **Empty state:** All 3 slots empty → MusicToggle hidden on all pages.
2. **Single upload (Home only):** Music plays on Home, Work, Resume, and all detail pages (fallback).
3. **Two uploads (Home + Work):** Resume falls back to Home; Work plays its own track.
4. **All three uploaded:** Each route plays its own track; detail pages match parent.
5. **Continuity:** Navigate Home → Work when both share the same URL (e.g. both empty + same fallback) → audio does not restart.
6. **Crossfade:** Navigate Home → Resume when each has a different track → 600ms fade between tracks.
7. **Mute persistence:** Unmute, navigate, refresh → state restored from `localStorage`.
8. **File size validation:** Try uploading 60MB audio → rejected client-side.
9. **MIME validation:** Try uploading `.txt` renamed to `.mp3` → rejected (MIME, not extension).
10. **Realtime:** Update URL in Back Office in one tab → music updates in another tab without manual refresh.
11. **Back Office isolation:** Navigate to `/bts-porto` → no music plays (provider not mounted there).

## 8. Out of Scope

- Volume slider (only mute toggle; volume always 100% when unmuted)
- Per-user preferences beyond mute state (e.g. preferred volume)
- Playlist / shuffle / next-track features
- Track metadata display (title, artist)
- Visualizer or waveform
- Mobile-specific UI variations (uses same Navbar component, mobile behavior inherited)
- Automated tests for audio playback

## 9. Implementation Order (preview for writing-plans)

1. SQL migration (`20260528_background_music.sql`) — creates buckets, RLS, columns
2. `AudioUpload` component
3. `SiteSettings` Back Office card extension
4. `BackgroundMusicContext` provider
5. `MusicToggle` component
6. Navbar integration
7. `App.tsx` provider mount
8. Manual smoke test
