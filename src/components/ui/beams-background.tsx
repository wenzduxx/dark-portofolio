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

// Visible beam count. The original spec rendered 30 (MINIMUM_BEAMS × 1.5);
// at ~14 beams with our wider sprite we keep continuous visual coverage at
// a fraction of the per-frame fill cost.
const BEAM_COUNT = 14;

const OPACITY_MAP = {
  subtle: 0.7,
  medium: 0.85,
  strong: 1,
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
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

// Build a single offscreen canvas containing the beam gradient. Each draw
// becomes a cheap drawImage + transform — no per-shape canvas filter pass.
function makeBeamSprite(spriteWidth: number, spriteLength: number) {
  const sprite = document.createElement('canvas');
  sprite.width = spriteWidth;
  sprite.height = spriteLength;
  const sctx = sprite.getContext('2d');
  if (!sctx) return sprite;
  const grad = sctx.createLinearGradient(0, 0, 0, spriteLength);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.1, 'rgba(255,255,255,0.5)');
  grad.addColorStop(0.4, 'rgba(255,255,255,1)');
  grad.addColorStop(0.6, 'rgba(255,255,255,1)');
  grad.addColorStop(0.9, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, spriteWidth, spriteLength);
  return sprite;
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
    let sprite: HTMLCanvasElement | null = null;
    let spriteWidth = 0;
    let spriteLength = 0;
    // Logical (CSS-pixel) canvas dimensions used for placement math.
    let cssW = 0;
    let cssH = 0;
    let rafId = 0;
    let frame = 0;
    let stopped = false;
    let inView = true;
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
      beam.opacity = 0.2 + Math.random() * 0.1;
    };

    const updateCanvasSize = () => {
      // Internal canvas at 50% of viewport — heavy CSS blur hides the
      // resolution drop. DPR forced to 1 for the same reason.
      const w = Math.max(1, Math.round(window.innerWidth * 0.5));
      const h = Math.max(1, Math.round(window.innerHeight * 0.5));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      cssW = w;
      cssH = h;

      // Build sprite sized to the largest expected beam (200 wide × beam.length).
      spriteWidth = 220;
      spriteLength = Math.round(h * 2.5);
      sprite = makeBeamSprite(spriteWidth, spriteLength);

      beams = Array.from({ length: BEAM_COUNT }, () => createBeam(w, h));
    };

    const drawBeam = (beam: Beam) => {
      if (!sprite) return;
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityScale;
      ctx.globalAlpha = pulsingOpacity;
      // Color the white sprite per-beam via a HSL fill blend.
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(
        sprite,
        -beam.width / 2,
        0,
        beam.width,
        beam.length
      );
      // Tint pass: multiply HSL color onto the drawn sprite area.
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `hsl(${beam.hue}, 85%, 65%)`;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    };

    const animate = () => {
      if (stopped) return;
      // 30 FPS — soft blurry beams don't need 60. Schedule first so a slow
      // draw doesn't accumulate backlog.
      rafId = requestAnimationFrame(animate);
      if (frame++ % 2 !== 0) return;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
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

    // rAF-coalesce resize — a drag fires dozens of events.
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
    stopped = true;
    start();

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
        style={{ filter: 'blur(40px)' }}
      />
    </div>
  );
}

export const BeamsBackground = memo(BeamsBackgroundImpl);
