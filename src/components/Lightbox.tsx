import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface LightboxImage {
  url: string;
  caption: string;
}

interface LightboxProps {
  images: LightboxImage[];
  /** Index of the image to show, or `null` when the lightbox is closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

/**
 * Accessible full-screen image viewer.
 *
 * - Keyboard: Esc closes, ArrowLeft/ArrowRight navigate.
 * - Touch: horizontal swipe navigates.
 * - Focus is moved into the dialog on open and restored to the trigger on close.
 * - Respects `prefers-reduced-motion` (fades only, no slide/scale).
 */
export default function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null;
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const count = images.length;
  const hasMultiple = count > 1;

  const go = (dir: number) => {
    if (index === null || count === 0) return;
    onIndexChange((index + dir + count) % count);
  };

  // Lock body scroll, manage focus, and wire keyboard controls while open.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Defer focus until the dialog has mounted.
    const focusId = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusId);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
    // `index` is intentionally included so the keydown closure reads the latest value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || 'Image viewer'}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={onClose}
        >
          {/* Close */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Close image viewer"
            className="absolute top-5 right-5 md:top-8 md:right-8 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          {hasMultiple && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-xs text-white/60 font-mono tracking-widest">
              {(index ?? 0) + 1} / {count}
            </div>
          )}

          {/* Prev / Next */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Previous image"
                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Next image"
                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <motion.figure
            key={index}
            className="relative max-w-[92vw] max-h-[82vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
            drag={hasMultiple ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <img
              src={current.url}
              alt={current.caption}
              draggable={false}
              className="max-w-[92vw] max-h-[72vh] w-auto h-auto object-contain rounded-2xl shadow-2xl select-none"
            />
            {current.caption && (
              <figcaption className="text-xs md:text-sm text-white/70 font-mono text-center max-w-2xl px-4">
                {current.caption}
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
