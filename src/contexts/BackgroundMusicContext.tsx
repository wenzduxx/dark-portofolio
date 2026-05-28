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

    const swap = (fadeInAfterPlay: boolean) => {
      audio.src = targetUrl;
      audio.load();
      audio.play()
        .then(() => {
          if (fadeInAfterPlay && !isMuted) fadeTo(1, CROSSFADE_MS);
        })
        .catch(() => {
          // Autoplay blocked — the interaction listener below will retry and fade in.
        });
      setCurrentUrl(targetUrl);
    };

    if (currentUrl === null) {
      // Initial load: start volume at 0, no fade — interaction listener fades in once play succeeds.
      audio.volume = 0;
      swap(false);
    } else if (isMuted) {
      swap(false);
    } else {
      fadeTo(0, CROSSFADE_MS, () => swap(true));
    }
  }, [targetUrl, currentUrl, isMuted, isErrored, fadeTo]);

  // Auto-play on first user interaction (click, keydown, touch, scroll, pointer).
  // Works around browser autoplay restrictions without requiring the user to
  // click the music toggle specifically — any interaction triggers playback,
  // and a smooth 600ms fade-in lands the volume at its target.
  useEffect(() => {
    const tryPlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.paused) return;
      audio.play()
        .then(() => {
          if (!isMuted) fadeTo(1, CROSSFADE_MS);
        })
        .catch(() => { /* still blocked; another event will retry */ });
    };

    document.addEventListener('click', tryPlay, true);
    document.addEventListener('keydown', tryPlay, true);
    document.addEventListener('touchstart', tryPlay, { capture: true, passive: true });
    document.addEventListener('pointerdown', tryPlay, true);
    document.addEventListener('scroll', tryPlay, { capture: true, passive: true });

    return () => {
      document.removeEventListener('click', tryPlay, true);
      document.removeEventListener('keydown', tryPlay, true);
      document.removeEventListener('touchstart', tryPlay, true);
      document.removeEventListener('pointerdown', tryPlay, true);
      document.removeEventListener('scroll', tryPlay, true);
    };
  }, [isMuted, fadeTo]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      if (audioRef.current && currentUrl) {
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
