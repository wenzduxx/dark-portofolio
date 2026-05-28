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
  isMuted: false,
  toggleMute: () => {},
  hasAudioAvailable: false,
});

const getInitialMuted = (): boolean => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? false : v === 'true';
  } catch {
    return false;
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

  // Mirror isMuted into a ref so the global interaction listener can read the
  // latest value without having to re-register on every mute toggle.
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

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

  // Resolve target URL via the fallback chain
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

  // Sync audio src to target URL — no-op if same, crossfade if different.
  // Audio element starts HTML-muted (allowed by all browsers' autoplay
  // policy) so play() always succeeds; we just flip audio.muted=false later
  // on the first user interaction.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isErrored) return;
    if (targetUrl === currentUrl) return;

    if (targetUrl === null) {
      const done = () => {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        setCurrentUrl(null);
      };
      if (audio.muted || isMuted || currentUrl === null) done();
      else fadeTo(0, CROSSFADE_MS, done);
      return;
    }

    const swap = (fadeIn: boolean) => {
      audio.src = targetUrl;
      audio.load();
      audio.play()
        .then(() => {
          if (fadeIn && !audio.muted && !isMuted) fadeTo(1, CROSSFADE_MS);
        })
        .catch(() => {
          // Should not happen because audio.muted=true allows autoplay,
          // but if it does (e.g. src error), the onError handler picks it up.
        });
      setCurrentUrl(targetUrl);
    };

    if (currentUrl === null) {
      // Initial start — volume stays at 0; the first-interaction handler
      // will unmute and fade volume up.
      audio.volume = 0;
      swap(false);
    } else if (audio.muted || isMuted) {
      // Audio is silent either way (HTML-muted or user-muted) — instant swap
      swap(false);
    } else {
      // Currently audible — crossfade
      fadeTo(0, CROSSFADE_MS, () => swap(true));
    }
  }, [targetUrl, currentUrl, isMuted, isErrored, fadeTo]);

  // First-interaction handler: flips audio.muted=false so the user can finally
  // hear the music that has been playing silently since page load.
  //
  // Browser autoplay reality check:
  //   - audio.muted=true → play() ALWAYS works (no user activation needed)
  //   - audio.muted=false without user activation → browser pauses the audio
  //
  // So we listen broadly (click, keydown, touch, pointer, scroll, wheel,
  // mousemove). The "activation-granting" events (click/keydown/touchstart/
  // pointerdown) unmute successfully. The "soft" events (scroll/wheel/
  // mousemove) attempt to unmute — if browser rejects, we revert to muted
  // and wait for a real activation event. Either way, audio keeps playing.
  useEffect(() => {
    let attemptInProgress = false;

    const tryUnmute = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.muted) return;            // already unmuted — done
      if (isMutedRef.current) return;      // user wants it muted — respect
      if (attemptInProgress) return;       // avoid overlapping attempts

      attemptInProgress = true;
      audio.muted = false;
      audio.play()
        .then(() => {
          fadeTo(1, CROSSFADE_MS);
          attemptInProgress = false;
        })
        .catch(() => {
          // Browser rejected the unmute (no user activation yet). Revert to
          // muted-autoplay so audio keeps playing silently, and wait for the
          // next event — eventually the user will click/tap, which will work.
          audio.muted = true;
          audio.play().catch(() => {});
          attemptInProgress = false;
        });
    };

    const events = ['click', 'keydown', 'touchstart', 'pointerdown', 'scroll', 'wheel', 'mousemove'] as const;
    events.forEach(e => {
      document.addEventListener(e, tryUnmute, { capture: true, passive: true });
    });

    return () => {
      events.forEach(e => {
        document.removeEventListener(e, tryUnmute, true);
      });
    };
  }, [fadeTo]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      const audio = audioRef.current;
      if (audio) {
        if (next) {
          // Muting — ramp volume down (audio.muted stays as-is; volume=0 is enough)
          fadeTo(0, CROSSFADE_MS);
        } else {
          // Unmuting — ensure audio.muted=false, ensure playing, ramp volume up
          audio.muted = false;
          audio.play().catch(() => {});
          fadeTo(1, CROSSFADE_MS);
        }
      }
      return next;
    });
  }, [fadeTo]);

  return (
    <BackgroundMusicContext.Provider value={{ isMuted, toggleMute, hasAudioAvailable }}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        muted
        style={{ display: 'none' }}
        onError={() => setIsErrored(true)}
      />
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export const useBackgroundMusic = () => useContext(BackgroundMusicContext);
