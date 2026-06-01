import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap, Info, AlertTriangle, ExternalLink, Github, Download, Link2 } from 'lucide-react';
import type { Block, CalloutVariant, ButtonIcon } from '../../lib/blocks';
import CountUp from '../CountUp';
import Markdown from './Markdown';
import CodeView from './CodeView';
import GalleryView from './GalleryView';

// --- helpers ---------------------------------------------------------------

function parseMetric(value: string): { prefix: string; number: number | null; suffix: string } {
  const m = (value || '').match(/^([^\d-]*)(-?[\d.,]+)(.*)$/);
  if (!m) return { prefix: '', number: null, suffix: value };
  return { prefix: m[1], number: parseFloat(m[2].replace(/,/g, '')), suffix: m[3] };
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

type IconCmp = React.ComponentType<{ className?: string }>;

const CALLOUT_STYLE: Record<CalloutVariant, { icon: IconCmp; ring: string; tint: string }> = {
  info: { icon: Info, ring: 'border-stroke', tint: 'text-muted' },
  impact: { icon: Zap, ring: 'border-accent/30', tint: 'text-accent' },
  warning: { icon: AlertTriangle, ring: 'border-amber-500/30', tint: 'text-amber-400' },
};

const BUTTON_ICON: Record<ButtonIcon, IconCmp> = {
  live: ExternalLink,
  github: Github,
  download: Download,
  link: Link2,
};

const IMAGE_WIDTH: Record<string, string> = {
  normal: 'max-w-lg mx-auto',
  wide: 'max-w-3xl mx-auto',
  full: 'w-full',
};

// --- reveal wrapper --------------------------------------------------------

function BlockReveal({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const reduce = useReducedMotion();
  if (reduce || disabled) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// --- single block ----------------------------------------------------------

function renderBlock(block: Block, key: React.Key): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const align = block.align === 'center' ? 'text-center' : 'text-left';
      const size =
        block.level === 2
          ? 'text-3xl md:text-4xl'
          : block.level === 3
          ? 'text-2xl md:text-3xl'
          : 'text-xl md:text-2xl';
      const cls = `font-display italic text-text-primary leading-tight ${size} ${align}`;
      if (block.level === 3) return <h3 key={key} className={cls}>{block.text}</h3>;
      if (block.level === 4) return <h4 key={key} className={cls}>{block.text}</h4>;
      return <h2 key={key} className={cls}>{block.text}</h2>;
    }
    case 'paragraph': {
      const align = block.align === 'center' ? 'text-center' : '';
      const dropcap = block.dropcap
        ? '[&_p:first-of-type]:first-letter:float-left [&_p:first-of-type]:first-letter:font-display [&_p:first-of-type]:first-letter:italic [&_p:first-of-type]:first-letter:text-7xl [&_p:first-of-type]:first-letter:leading-[0.7] [&_p:first-of-type]:first-letter:mr-3 [&_p:first-of-type]:first-letter:mt-1 [&_p:first-of-type]:first-letter:text-accent'
        : '';
      return (
        <Markdown key={key} className={`text-lg md:text-xl text-text-primary/90 ${align} ${dropcap}`}>
          {block.text}
        </Markdown>
      );
    }
    case 'quote':
      return (
        <figure key={key} className="border-l-2 border-accent pl-6 md:pl-8 py-2">
          <blockquote className="text-2xl md:text-3xl font-display italic text-text-primary leading-snug">
            “{block.text}”
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-4 text-sm font-mono uppercase tracking-widest text-muted">
              — {block.attribution}
            </figcaption>
          )}
        </figure>
      );
    case 'callout': {
      const s = CALLOUT_STYLE[block.variant] || CALLOUT_STYLE.info;
      const Icon = s.icon;
      return (
        <div key={key} className={`p-8 bg-surface/40 rounded-[2rem] border ${s.ring} backdrop-blur-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <Icon className={`w-4 h-4 ${s.tint}`} />
            {block.title && (
              <h3 className="text-xs text-muted uppercase tracking-[0.2em]">{block.title}</h3>
            )}
          </div>
          <Markdown className="text-base md:text-lg text-text-primary/90">{block.text}</Markdown>
        </div>
      );
    }
    case 'list': {
      const items = (block.items || []).filter(Boolean);
      if (items.length === 0) return null;
      const cls = 'text-lg md:text-xl text-text-primary/90 space-y-2 pl-6 ' + (block.ordered ? 'list-decimal' : 'list-disc');
      return block.ordered ? (
        <ol key={key} className={cls}>
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed pl-1">{it}</li>
          ))}
        </ol>
      ) : (
        <ul key={key} className={cls}>
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed pl-1">{it}</li>
          ))}
        </ul>
      );
    }
    case 'divider':
      return (
        <div key={key} className="flex items-center justify-center py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stroke" />
          <span className="mx-3 w-24 h-px bg-stroke" />
          <span className="w-1.5 h-1.5 rounded-full bg-stroke" />
        </div>
      );
    case 'image': {
      if (!block.url) return null;
      const rounded = block.rounded === false ? '' : 'rounded-[2rem]';
      return (
        <figure key={key} className={IMAGE_WIDTH[block.width] || IMAGE_WIDTH.wide}>
          <div className={`overflow-hidden border border-stroke ${rounded}`}>
            <img
              src={block.url}
              alt={block.caption || ''}
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-xs font-mono text-muted text-center">{block.caption}</figcaption>
          )}
        </figure>
      );
    }
    case 'gallery':
      return <GalleryView key={key} block={block} />;
    case 'video': {
      if (!block.url) return null;
      let src: string | null = null;
      if (block.provider === 'youtube') {
        const id = youtubeId(block.url);
        src = id ? `https://www.youtube.com/embed/${id}` : null;
      } else if (block.provider === 'vimeo') {
        const id = vimeoId(block.url);
        src = id ? `https://player.vimeo.com/video/${id}` : null;
      }
      return (
        <figure key={key}>
          <div className="aspect-video rounded-[2rem] overflow-hidden border border-stroke bg-black">
            {block.provider === 'file' ? (
              <video src={block.url} controls className="w-full h-full object-cover" />
            ) : src ? (
              <iframe
                src={src}
                title={block.caption || 'Embedded video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">Invalid video URL</div>
            )}
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-xs font-mono text-muted text-center">{block.caption}</figcaption>
          )}
        </figure>
      );
    }
    case 'embed':
      if (!block.url) return null;
      return (
        <div
          key={key}
          className="rounded-[2rem] overflow-hidden border border-stroke bg-surface"
          style={{ height: block.height || 480 }}
        >
          <iframe src={block.url} title="Embedded content" className="w-full h-full" allowFullScreen />
        </div>
      );
    case 'code':
      return <CodeView key={key} block={block} />;
    case 'techStack': {
      const items = (block.items || []).filter(Boolean);
      if (items.length === 0) return null;
      return (
        <div key={key} className="flex flex-wrap gap-2.5">
          {items.map((t, i) => (
            <span
              key={i}
              className="text-xs font-mono text-text-primary/80 border border-stroke bg-bg rounded-full px-3 py-1.5"
            >
              {t}
            </span>
          ))}
        </div>
      );
    }
    case 'buttons': {
      const items = (block.items || []).filter((b) => b.label && b.url);
      if (items.length === 0) return null;
      return (
        <div key={key} className="flex flex-wrap gap-4">
          {items.map((b, i) => {
            const Icon = b.icon ? BUTTON_ICON[b.icon] : null;
            const base =
              'group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';
            const variant =
              b.variant === 'primary'
                ? 'bg-accent text-bg hover:opacity-90'
                : 'border border-stroke text-text-primary hover:border-accent hover:bg-surface';
            return (
              <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className={`${base} ${variant}`}>
                {Icon && <Icon className="w-4 h-4" />}
                {b.label}
                <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            );
          })}
        </div>
      );
    }
    case 'stats': {
      const items = (block.items || []).filter((s) => s.label && s.value);
      if (items.length === 0) return null;
      return (
        <div key={key} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((s, i) => {
            const { prefix, number, suffix } = parseMetric(s.value);
            return (
              <div key={i} className="p-6 rounded-[2rem] border border-stroke bg-surface/40 text-center">
                <div className="text-4xl md:text-5xl font-display italic text-text-primary mb-2">
                  {number !== null ? (
                    <>
                      {prefix}
                      <CountUp to={number} duration={2} />
                      {suffix}
                    </>
                  ) : (
                    s.value
                  )}
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-muted">{s.label}</div>
              </div>
            );
          })}
        </div>
      );
    }
    case 'columns':
      return (
        <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-8">{(block.left || []).map((b, i) => renderBlock(b, `${key}-l-${i}`))}</div>
          <div className="space-y-8">{(block.right || []).map((b, i) => renderBlock(b, `${key}-r-${i}`))}</div>
        </div>
      );
    case 'table': {
      const headers = block.headers || [];
      const rows = block.rows || [];
      if (headers.length === 0 && rows.length === 0) return null;
      return (
        <div key={key} className="overflow-x-auto rounded-2xl border border-stroke">
          <table className="w-full text-left text-sm">
            {headers.length > 0 && (
              <thead>
                <tr className="border-b border-stroke bg-surface/40">
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 font-mono uppercase tracking-wider text-xs text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-stroke/60 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-text-primary/90">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    default:
      return null;
  }
}

/** Renders an ordered list of content blocks with the site's reveal-on-scroll animation. */
export default function BlockRenderer({ blocks, className = '' }: { blocks?: Block[] | null; className?: string }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className={`space-y-10 md:space-y-14 ${className}`}>
      {blocks.map((block, i) => (
        <BlockReveal key={block.id || i}>{renderBlock(block, block.id || i)}</BlockReveal>
      ))}
    </div>
  );
}
