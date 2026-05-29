import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Link } from 'react-router-dom';
import BorderGlow from './BorderGlow';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

export function Journal() {
  const { homeJournal: JOURNAL_ENTRIES } = usePortfolioData();
  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Journal</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight mb-4">
              Recent <span className="font-display italic text-text-primary/90">thoughts</span>
            </h2>
            <p className="text-muted text-sm md:text-base max-w-md">
              Writing about design philosophy, technical explorations, and industry observations.
            </p>
          </div>
          
          <Link to="/work" className="hidden md:inline-flex group relative rounded-full text-sm shrink-0 hover:scale-105 transition-all duration-300">
            <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative px-6 py-3 rounded-full bg-surface border border-stroke text-text-primary flex items-center gap-2 group-hover:bg-bg/90 backdrop-blur-sm z-10 mx-[2px] my-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)]">
               View all articles <ArrowRight className="w-4 h-4 text-muted group-hover:text-text-primary transition-colors" />
            </div>
          </Link>
        </motion.div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {JOURNAL_ENTRIES.map((entry) => (
            <BorderGlow
              key={entry.id}
              className="rounded-[40px] sm:rounded-full"
              edgeSensitivity={20}
              glowColor="40 80 80"
              backgroundColor="hsl(var(--bg))"
              borderRadius={50}
              glowRadius={50}
              glowIntensity={1.0}
              coneSpread={25}
              animated
              colors={['#c084fc', '#f472b6', '#38bdf8']}
            >
              <Link
                to={`/${entry.kind ?? 'journal'}/${entry.id}`}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 rounded-[40px] sm:rounded-full transition-colors duration-300 w-full h-full"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden rounded-full self-start sm:self-auto">
                  <img
                    src={entry.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg md:text-xl text-text-primary truncate mb-1 group-hover:text-white transition-colors duration-300">{entry.title}</h3>
                  <div className="flex items-center gap-3 text-xs md:text-sm text-muted">
                    <span>{entry.date}</span>
                    <span className="w-1 h-1 rounded-full bg-stroke" />
                    <span>{entry.readTime}</span>
                  </div>
                </div>
                <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-full border border-stroke items-center justify-center group-hover:bg-white group-hover:border-transparent transition-all duration-300 mr-4">
                  <ArrowRight className="w-5 h-5 text-text-primary group-hover:text-bg group-hover:-rotate-45 transition-all duration-300" />
                </div>
              </Link>
            </BorderGlow>
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link to="/work" className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300 w-full">
            <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative px-6 py-3 rounded-full bg-surface border border-stroke text-text-primary flex items-center justify-center gap-2 group-hover:bg-bg/90 backdrop-blur-sm z-10 mx-[2px] my-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)]">
               View all articles <ArrowRight className="w-4 h-4 text-muted group-hover:text-text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
