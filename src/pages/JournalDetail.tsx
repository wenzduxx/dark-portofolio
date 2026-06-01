import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { usePortfolioData } from '../contexts/PortfolioDataContext';
import { hexToHslChannels } from '../lib/blocks';
import BlockRenderer from '../components/blocks/BlockRenderer';

export default function JournalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { journalMap: JOURNAL_ENTRIES, loading } = usePortfolioData();
  const entry = id ? JOURNAL_ENTRIES[id] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loading && !entry) {
      navigate('/');
    }
  }, [entry, navigate, loading]);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!entry) return null;

  // ── Appearance (all optional; legacy entries with no settings render as before) ──
  const ap = entry.appearance || null;
  const accentChannels = ap?.accentColor ? hexToHslChannels(ap.accentColor) : null;
  const rootStyle = accentChannels ? ({ ['--accent']: accentChannels } as React.CSSProperties) : undefined;
  const headerStyle = ap?.headerStyle || 'left';
  const widthClass = ap?.contentWidth === 'wide' ? 'max-w-[1100px]' : 'max-w-[800px]';
  const hasBlocks = !!(entry.blocks && entry.blocks.length > 0);

  const meta = (
    <div className={`flex items-center gap-4 text-xs font-mono text-muted uppercase tracking-widest mb-6 ${headerStyle === 'centered' ? 'justify-center flex-wrap' : ''}`}>
      <span className="px-3 py-1 border border-stroke rounded-full">{entry.category}</span>
      <div className="flex items-center gap-2"><Calendar className="w-3 h-3" />{entry.date}</div>
      <div className="flex items-center gap-2"><Clock className="w-3 h-3" />{entry.readingTime}</div>
    </div>
  );

  const body = (
    <>
      {hasBlocks ? (
        <BlockRenderer blocks={entry.blocks} />
      ) : (
        <div className="space-y-12">
          {entry.content.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-lg md:text-xl text-text-primary/90 leading-relaxed"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      )}
    </>
  );

  const footer = (
    <footer className="mt-24 pt-12 border-t border-stroke">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-wrap gap-2">
          {entry.tags.map(tag => (
            <span key={tag} className="text-xs text-muted font-mono bg-surface px-3 py-1 rounded-full">#{tag}</span>
          ))}
        </div>
        <button className="flex items-center gap-2 text-sm text-text-primary hover:text-white transition-colors">
          <Share2 className="w-4 h-4" /> Share Article
        </button>
      </div>
    </footer>
  );

  // ── Full-hero header variant ────────────────────────────────────────────
  if (headerStyle === 'full-hero') {
    return (
      <div className="bg-bg min-h-screen pb-40" style={rootStyle}>
        <section className="relative h-[70vh] min-h-[440px] w-full overflow-hidden">
          {entry.heroImage && (
            <img
              src={entry.heroImage}
              alt={entry.title}
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.4]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <Link
            to="/"
            className="absolute top-28 left-6 md:left-12 inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors group z-10"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
          </Link>
          <div className="absolute bottom-0 inset-x-0 px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className={`${widthClass} mx-auto pb-12 md:pb-20`}
            >
              {meta}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary leading-tight">
                {entry.title}
              </h1>
            </motion.div>
          </div>
        </section>
        <article className={`${widthClass} mx-auto px-6 pt-16`}>
          <p className="text-xl md:text-2xl text-muted leading-relaxed font-light italic mb-16">{entry.excerpt}</p>
          {body}
          {footer}
        </article>
      </div>
    );
  }

  // ── Centered / Left header variants ─────────────────────────────────────
  const centered = headerStyle === 'centered';
  return (
    <div className="bg-bg min-h-screen pt-32 pb-40" style={rootStyle}>
      <article className={`${widthClass} mx-auto px-6`}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors mb-16 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
        </Link>

        <header className="mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className={centered ? 'text-center' : ''}>
            {meta}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary leading-tight mb-8">
              {entry.title}
            </h1>
            <p className={`text-xl md:text-2xl text-muted leading-relaxed font-light italic ${centered ? 'max-w-3xl mx-auto' : ''}`}>
              {entry.excerpt}
            </p>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="aspect-video rounded-[3rem] overflow-hidden mb-16 border border-stroke shadow-2xl"
        >
          <img
            src={entry.heroImage}
            alt={entry.title}
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </motion.div>

        {body}
        {footer}
      </article>
    </div>
  );
}
