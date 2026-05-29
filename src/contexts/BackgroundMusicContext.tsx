import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

type MusicSlot = 'home' | 'work' | 'resume';

interface BackgroundMusicContextType {
  isMuted: boolean;
  toggleMute: () => void;
  hasAudioAvailable: boolean;
  getAnalyserData: () => Uint8Array<ArrayBuffer> | null;
}

const STORAGE_KEY = 'bg-music-muted';

const BackgroundMusicContext = createContext<BackgroundMusicContextType>({
  isMuted: false,
  toggleMute: () => {},
  hasAudioAvailable: false,
  getAnalyserData: () => null,
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceConnectedRef = useRef(false);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const location = useLocation();

  const [isMuted, setIsMuted] = useState<boolean>(getInitialMuted);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isErrored, setIsErrored] = useState(false);
  const [urls, setUrls] = useState<Record<MusicSlot, string | null>>({
    home: null, work: null, resume: null,
  });

  // Mirror isMuted into a ref so the global interaction listener reads the
  // latest value without re-registering on every mute toggle.
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Lazily build the AudioContext → MediaElementSource → AnalyserNode graph.
  // Once connected, the audio element's output is rerouted through the context
  // (so we must keep the context resumed for sound). Must be called from a
  // user-gesture handler the first time.
  const ensureAnalyser = useCallback(() => {
    if (sourceConnectedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    try {
      const Ctor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx: AudioContext = new Ctor();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;            // 32 frequency bins, low CPU
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceConnectedRef.current = true;
    } catch {
      // Tainted source (CORS) or element already connected — silently fail.
      // Audio still plays; only the visualizer is disabled.
    }
  }, []);

  // Snapshot of current frequency data — called by the visualizer in its rAF loop.
  const getAnalyserData = useCallback((): Uint8Array<ArrayBuffer> | null => {
    const analyser = analyserRef.current;
    if (!analyser) return null;
    if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(dataArrayRef.current);
    return dataArrayRef.current;
  }, []);

  // Close AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
        analyserRef.current = null;
        sourceConnectedRef.current = false;
      }
    };
  }, []);

  // Fetch initial URLs and subscribe to realtime updates of site_settings.
  // The Supabase SDK is dynamically imported so it doesn't sit on the
  // critical render path for the first paint of Home.
  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;
    (async () => {
      const { supabase } = await import('../lib/supabase');
      if (!mounted) return;
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
      cleanup = () => supabase.removeChannel(channel);
    })();
    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  // Resolve target URL via the fallback chain
  const slot = routeToSlot(location.pathname);
  const targetUrl = urls[slot] || urls.home || null;
  const hasAudioAvailable = targetUrl !== null && !isErrored;

  // Reset error state whenever target URL changes
  useEffect(() => {
    setIsErrored(false);
  }, [targetUrl]);

  // Sync audio src to target URL. Audio starts HTML-muted so play() is always
  // safe to call (no autoplay block). No fade ramps — the source files already
  // have their own fade-in baked in.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isErrored) return;
    if (targetUrl === currentUrl) return;

    if (targetUrl === null) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setCurrentUrl(null);
      return;
    }

    audio.src = targetUrl;
    audio.load();
    audio.play().catch(() => { /* should not happen — element is muted */ });
    setCurrentUrl(targetUrl);
  }, [targetUrl, currentUrl, isErrored]);

  // First-interaction handler: flips audio.muted=false so the user can finally
  // hear the music that has been playing silently since page load. Also
  // initializes the Web Audio graph for the visualizer. Self-cleans the
  // listeners on first successful unmute — otherwise scroll/mousemove keep
  // firing this handler for the lifetime of the page.
  useEffect(() => {
    let attemptInProgress = false;
    let cleaned = false;

    // Events split by type: gesture events benefit from capture-phase to
    // catch them as early as possible; passive movement/scroll events should
    // signal the browser they won't preventDefault.
    const gestureEvents = ['click', 'keydown', 'touchstart', 'pointerdown'] as const;
    const passiveEvents = ['scroll', 'wheel', 'mousemove'] as const;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      gestureEvents.forEach(e => document.removeEventListener(e, tryUnmute, true));
      passiveEvents.forEach(e => document.removeEventListener(e, tryUnmute, true));
    };

    function tryUnmute() {
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.muted) { cleanup(); return; }
      if (isMutedRef.current) return;
      if (attemptInProgress) return;

      attemptInProgress = true;
      audio.muted = false;
      audio.play()
        .then(() => {
          ensureAnalyser();
          audioContextRef.current?.resume().catch(() => {});
          attemptInProgress = false;
          cleanup();
        })
        .catch(() => {
          // Browser rejected unmute (no user activation). Revert and wait.
          audio.muted = true;
          audio.play().catch(() => {});
          attemptInProgress = false;
        });
    }

    gestureEvents.forEach(e => {
      document.addEventListener(e, tryUnmute, { capture: true });
    });
    passiveEvents.forEach(e => {
      document.addEventListener(e, tryUnmute, { capture: true, passive: true });
    });

    return cleanup;
  }, [ensureAnalyser]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      const audio = audioRef.current;
      if (audio) {
        audio.muted = next;
        if (!next) {
          audio.play().catch(() => {});
          ensureAnalyser();
          audioContextRef.current?.resume().catch(() => {});
        }
      }
      return next;
    });
  }, [ensureAnalyser]);

  return (
    <BackgroundMusicContext.Provider value={{ isMuted, toggleMute, hasAudioAvailable, getAnalyserData }}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        muted
        crossOrigin="anonymous"
        style={{ display: 'none' }}
        onError={() => setIsErrored(true)}
      />
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export const useBackgroundMusic = () => useContext(BackgroundMusicContext);
