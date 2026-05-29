import React, { useRef, useEffect } from 'react';

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;
    let stopped = false;
    let resizePending = false;

    // 320x320 upscaled via CSS to 100vw/100vh with image-rendering:pixelated.
    // Grain noise has no structure — the eye can't distinguish 1024² from
    // 320² after upscale, but per-frame ImageData allocation drops ~10×
    // (≈4 MB/tick → ≈400 KB/tick).
    const canvasSize = 320;
    const imageData = ctx.createImageData(canvasSize, canvasSize);
    const data = imageData.data;
    // Pre-fill the alpha channel once; only RGB values change per frame.
    for (let i = 3; i < data.length; i += 4) data[i] = patternAlpha;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    };

    const drawGrain = () => {
      for (let i = 0; i < data.length; i += 4) {
        const value = (Math.random() * 255) | 0;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      if (!stopped) animationId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (!stopped) return;
      stopped = false;
      animationId = window.requestAnimationFrame(loop);
    };
    const stop = () => {
      stopped = true;
      window.cancelAnimationFrame(animationId);
    };

    // rAF-coalesce the resize handler so a single resize-drag doesn't fire
    // dozens of layout writes.
    const onResize = () => {
      if (resizePending) return;
      resizePending = true;
      window.requestAnimationFrame(() => {
        resizePending = false;
        resize();
      });
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    resize();
    loop();

    return () => {
      stopped = true;
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      className="pointer-events-none fixed inset-0 z-0 w-full h-full"
      ref={grainRef}
      style={{
        imageRendering: 'pixelated'
      }}
    />
  );
};

export default Noise;

