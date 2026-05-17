import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

export default function JournalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { journalMap: JOURNAL_ENTRIES } = usePortfolioData();
  const entry = id ? JOURNAL_ENTRIES[id] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!entry) {
      navigate('/');
    }
  }, [entry, navigate]);

  if (!entry) return null;

  return (
    <div className="bg-bg min-h-screen pt-32 pb-40">
      <article className="max-w-[800px] mx-auto px-6">
        {/* Navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors mb-16 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Journal
        </Link>

        {/* Header */}
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 text-xs font-mono text-muted uppercase tracking-widest mb-6">
              <span className="px-3 py-1 border border-stroke rounded-full">{entry.category}</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {entry.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {entry.readingTime}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary leading-tight mb-8">
              {entry.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted leading-relaxed font-light italic">
              {entry.excerpt}
            </p>
          </motion.div>
        </header>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="aspect-video rounded-[3rem] overflow-hidden mb-16 border border-stroke shadow-2xl"
        >
          <img 
            src={entry.heroImage} 
            alt={entry.title} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </motion.div>

        {/* Content */}
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

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-stroke">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="flex gap-2">
              {entry.tags.map(tag => (
                <span key={tag} className="text-xs text-muted font-mono bg-surface px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <button className="flex items-center gap-2 text-sm text-text-primary hover:text-white transition-colors">
              <Share2 className="w-4 h-4" /> Share Article
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
