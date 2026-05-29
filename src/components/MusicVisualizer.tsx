import React, { memo, useEffect, useRef } from 'react';
import { useBackgroundMusic } from '../contexts/BackgroundMusicContext';

const BAR_COUNT = 4;
const IDLE_HEIGHTS = [3, 5, 4, 6];
const MAX_HEIGHT = 14;
const SMOOTH_FACTOR = 0.35;
// Threshold below which we skip the style.height write — visually
// imperceptible (< 0.1px) but avoids forcing a layout recalc every frame.
const WRITE_THRESHOLD = 0.1;

function MusicVisualizerImpl() {
  const { isMuted, hasAudioAvailable, getAnalyserData } = useBackgroundMusic();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const bars = Array.from(container.children) as HTMLElement[];
    if (bars.length !== BAR_COUNT) return;

    const smoothed = new Array(BAR_COUNT).fill(0);
    const lastWritten = new Array(BAR_COUNT).fill(-1);
    let raf = 0;
    let stopped = false;

    const tick = () => {
      const isAudible = !isMuted;
      const data = isAudible ? getAnalyserData() : null;
      const t = performance.now();

      for (let i = 0; i < BAR_COUNT; i++) {
        let targetPx: number;
        if (data && data.length > 0) {
          // Sample from the lower-mid portion of the spectrum — where most
          // of the perceptible "rhythm" lives in typical music.
          const usableBins = Math.max(1, Math.floor(data.length * 0.6));
          const step = Math.max(1, Math.floor(usableBins / BAR_COUNT));
          let sum = 0;
          for (let j = 0; j < step; j++) sum += data[i * step + j];
          const normalized = (sum / step) / 255;
          targetPx = Math.max(IDLE_HEIGHTS[i], normalized * MAX_HEIGHT);
        } else {
          // Subtle breathing while idle — slow sine, offset per bar.
          const phase = (t / 900) + i * 0.4;
          targetPx = IDLE_HEIGHTS[i] + Math.sin(phase) * 0.9;
        }
        smoothed[i] = smoothed[i] + (targetPx - smoothed[i]) * SMOOTH_FACTOR;
        if (Math.abs(smoothed[i] - lastWritten[i]) >= WRITE_THRESHOLD) {
          bars[i].style.height = `${smoothed[i].toFixed(2)}px`;
          lastWritten[i] = smoothed[i];
        }
      }
      if (!stopped) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!stopped) return;
      stopped = false;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };

    // rAF is already throttled by the browser when the tab is hidden, but
    // wiring visibilitychange lets us also fully release the loop instead
    // of letting it tick at 1 Hz.
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    raf = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isMuted, getAnalyserData]);

  if (!hasAudioAvailable) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ height: `${MAX_HEIGHT}px` }}
      className={`flex items-end gap-[2px] transition-colors duration-500 ${
        isMuted ? 'text-muted opacity-50' : 'text-text-primary opacity-95'
      }`}
    >
      {IDLE_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-current"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

export const MusicVisualizer = memo(MusicVisualizerImpl);
