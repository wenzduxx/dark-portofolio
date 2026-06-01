import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import Lightbox from '../Lightbox';
import type { GalleryBlock } from '../../lib/blocks';

/**
 * Image gallery block. Three layouts share one clickable-tile renderer and the
 * site's accessible Lightbox (keyboard + swipe).
 */
export default function GalleryView({ block }: { block: GalleryBlock }) {
  const [index, setIndex] = useState<number | null>(null);
  const images = (block.images || []).filter((im) => im.url);
  if (images.length === 0) return null;

  const lightboxImages = images.map((im) => ({ url: im.url, caption: im.caption || '' }));

  const Tile = ({ i, className = '' }: { i: number; className?: string }) => {
    const im = images[i];
    return (
      <button
        type="button"
        onClick={() => setIndex(i)}
        aria-label={im.caption ? `View image: ${im.caption}` : 'View image'}
        className={`group relative overflow-hidden rounded-2xl border border-stroke bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      >
        <img
          src={im.url}
          alt={im.caption || ''}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {im.caption && (
          <span className="absolute bottom-0 inset-x-0 p-3 text-[11px] font-mono text-white/80 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left">
            {im.caption}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {block.layout === 'carousel' ? (
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 snap-x snap-mandatory">
          {images.map((_, i) => (
            <Tile key={i} i={i} className="snap-start shrink-0 w-[80%] md:w-[48%] aspect-[4/3]" />
          ))}
        </div>
      ) : block.layout === 'masonry' ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
          {images.map((_, i) => (
            <Tile key={i} i={i} className="block w-full break-inside-avoid" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((_, i) => (
            <Tile key={i} i={i} className="aspect-square" />
          ))}
        </div>
      )}

      <Lightbox
        images={lightboxImages}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </>
  );
}
