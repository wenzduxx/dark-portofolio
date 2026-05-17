import React from 'react';
import { motion } from 'framer-motion';
import CountUp from './CountUp';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

export function Stats() {
  const { stats: STATS } = usePortfolioData();
  return (
    <section className="bg-bg py-16 md:py-24 border-y border-stroke">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-stroke">
          {STATS.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center pt-8 md:pt-0"
            >
              <div className="text-6xl md:text-7xl lg:text-8xl font-display italic text-text-primary tracking-tighter mb-2 flex items-center">
                <CountUp
                  from={0}
                  to={stat.value}
                  duration={2}
                  className="inline-block"
                />
                <span>{stat.suffix}</span>
              </div>
              <div className="text-sm md:text-base text-muted uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
