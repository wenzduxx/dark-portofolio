import { memo, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface BeamsBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

// Beam count — the original spec rendered 30 (MINIMUM_BEAMS × 1.5). 14 with
// the heavy CSS blur still gives continuous coverage at a fraction of the
// per-frame draw cost.
const BEAM_COUNT = 14;

// Slightly softer than the original spec (0.7 / 0.85 / 1.0). True HSL
// gradients (vs the earlier source-atop tint) read brighter per opacity
// unit, so we don't need to push all the way to 1.0 to feel "strong".
const OPACITY_MAP = {
  subtle: 0.6,
  medium: 0.8,
  strong: 0.95,
} as const;

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    // Slightly under spec (was 0.12 + r*0.16) — keeps individual beams from
    // dominating while still reading as vivid color.
    opacity: 0.1 + Math.random() * 0.14,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

function BeamsBackgroundImpl({ className, intensity = 'strong' }: BeamsBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const opacityScale = OPACITY_MAP[intensity];
    let beams: Beam[] = [];
    // Logical (CSS-pixel) canvas dimensions used for placement math.
    let cssW = 0;
    let cssH = 0;
    let rafId = 0;
    let frame = 0;
    let stopped = true;
    let inView = false;
    let tabVisible = !document.hidden;

    const resetBeam = (beam: Beam, index: number, totalBeams: number) => {
      const column = index % 3;
      const spacing = cssW / 3;
      beam.y = cssH + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 190 + (index * 70) / totalBeams;
      // Slightly under spec (was 0.2 + r*0.1) for the same reason.
      beam.opacity = 0.16 + Math.random() * 0.08;
    };

    const updateCanvasSize = () => {
      // Internal canvas at 50% of viewport — heavy CSS blur hides the
      // resolution drop, and DPR is forced to 1 for the same reason. Net
      // pixel work drops ~4× vs running at native window × DPR.
      const w = Math.max(1, Math.round(window.innerWidth * 0.5));
      const h = Math.max(1, Math.round(window.innerHeight * 0.5));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      cssW = w;
      cssH = h;
      beams = Array.from({ length: BEAM_COUNT }, () => createBeam(w, h));
    };

    // Draw a single colored beam. We deliberately do NOT set ctx.filter
    // here — the canvas element's CSS filter does all the softening at one
    // composite pass. Per-shape canvas filter blur (the original spec used
    // blur(35px)) is what made this component a perf sink.
    const drawBeam = (beam: Beam) => {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityScale;

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    };

    const animate = () => {
      if (stopped) return;
      // Schedule the next frame first so a slow draw never accumulates a
      // backlog of pending rAFs.
      rafId = requestAnimationFrame(animate);
      // 30 FPS — soft blurry beams move slowly enough that 30 is visually
      // indistinguishable from 60 here, halving total draw work.
      if (frame++ % 2 !== 0) return;

      ctx.clearRect(0, 0, cssW, cssH);

      const total = beams.length;
      for (let i = 0; i < total; i++) {
        const beam = beams[i];
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, i, total);
        drawBeam(beam);
      }
    };

    const start = () => {
      if (!stopped) return;
      if (!inView || !tabVisible) return;
      stopped = false;
      rafId = requestAnimationFrame(animate);
    };
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };

    // rAF-coalesce resize — a drag fires dozens of events otherwise.
    let resizePending = false;
    const onResize = () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        updateCanvasSize();
      });
    };

    const handleVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible) start();
      else stop();
    };

    // Pause the loop when the BG element itself is off-screen — fixed
    // positioning means it stays visible while the page is mounted, but
    // this is cheap insurance + matches the pattern used elsewhere.
    const io = new IntersectionObserver(
      entries => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(wrapper);

    updateCanvasSize();
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intensity]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        // Single CSS blur handles all the softening — combines what the
        // original spec did with canvas filter (35px) + CSS filter (15px)
        // into one composite pass. 40px keeps the same dreamy character.
        style={{ filter: 'blur(40px)' }}
      />
    </div>
  );
}

export const BeamsBackground = memo(BeamsBackgroundImpl);
