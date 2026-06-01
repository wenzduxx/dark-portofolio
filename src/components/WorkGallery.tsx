import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface WorkGalleryItem {
  id: string;
  image: string;
  caption?: string;
}

/**
 * Dynamic, auto-rotating image gallery for the Work page "Design Philosophy" card.
 * Crossfades between images with a slow Ken Burns zoom, pauses on hover, and exposes
 * manual navigation (dots + arrows). Content comes from Supabase `work_gallery`
 * (editable in the Back Office), with a graceful fallback so the card is never blank.
 */
export default function WorkGallery({ images }: { images: WorkGalleryItem[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = images.length;
  const safeIndex = count > 0 ? index % count : 0;
  const current = images[safeIndex];

  // Auto-advance; re-arms per slide so manual navigation gets a full dwell.
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 4800);
    return () => clearTimeout(t);
  }, [safeIndex, paused, count]);

  if (!current) {
    return <div className="aspect-square bg-surface border border-stroke rounded-[3rem]" />;
  }

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  return (
    <div
      className="group relative aspect-square bg-surface border border-stroke rounded-[3rem] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence>
        <motion.img
          key={current.id}
          src={current.image}
          alt={current.caption || ''}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduce
              ? { duration: 0.4 }
              : { opacity: { duration: 0.9, ease: 'easeInOut' }, scale: { duration: 5.4, ease: 'easeOut' } }
          }
        />
      </AnimatePresence>

      {/* Legibility gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/10 to-bg/30 pointer-events-none" />

      {/* Section tag */}
      <div className="absolute top-7 left-7 flex items-center gap-2 text-xs text-text-primary/70 uppercase tracking-[0.3em]">
        <span className="w-6 h-px bg-text-primary/40" />
        Visual Lab
      </div>

      {/* Counter */}
      {count > 1 && (
        <div className="absolute top-7 right-8 text-xs font-mono text-text-primary/60 tabular-nums">
          {String(safeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </div>
      )}

      {/* Caption */}
      <div className="absolute left-7 right-7 bottom-16">
        <AnimatePresence mode="wait">
          {current.caption && (
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl font-display italic text-text-primary"
            >
              {current.caption}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="absolute left-7 bottom-7 flex items-center gap-2">
          {images.map((im, i) => (
            <button
              key={im.id}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{
                width: i === safeIndex ? 28 : 8,
                background: i === safeIndex ? 'hsl(var(--accent))' : 'hsl(var(--text) / 0.3)',
              }}
            />
          ))}
        </div>
      )}

      {/* Prev / Next (desktop hover) */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg/40 backdrop-blur-sm border border-stroke text-text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-bg/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg/40 backdrop-blur-sm border border-stroke text-text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-bg/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
