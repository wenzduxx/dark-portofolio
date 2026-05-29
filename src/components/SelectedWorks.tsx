import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Link } from 'react-router-dom';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

export function SelectedWorks() {
  const { homeProjects: PROJECTS } = usePortfolioData();
  return (
    <section className="bg-bg py-12 md:py-16">
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
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight mb-4">
              Featured <span className="font-display italic text-text-primary/90">projects</span>
            </h2>
            <p className="text-muted text-sm md:text-base max-w-md">
              A selection of projects I've worked on, from concept to launch.
            </p>
          </div>
          
          <Link to="/work" className="hidden md:inline-flex group relative rounded-full text-sm shrink-0 hover:scale-105 transition-all duration-300">
            <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative px-6 py-3 rounded-full bg-surface border border-stroke text-text-primary flex items-center gap-2 group-hover:bg-bg/90 backdrop-blur-sm z-10 mx-[2px] my-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)]">
               View all work <ArrowRight className="w-4 h-4 text-muted group-hover:text-text-primary transition-colors" />
            </div>
          </Link>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {PROJECTS.map((project) => (
            <Link 
              key={project.id}
              to={`/project/${project.id}`}
              className={`${project.col} group relative block aspect-[4/3] md:aspect-auto md:min-h-[400px] overflow-hidden rounded-3xl bg-surface border border-stroke`}
            >
              {/* Background Image */}
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Halftone overlay */}
              <div 
                className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                  backgroundSize: "4px 4px"
                }}
              />
              
              {/* Hover Darken Overlay */}
              <div className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 backdrop-blur-lg transition-all duration-500 ease-out" />

              {/* Hover Label */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-10 pointer-events-none pb-4 group-hover:pb-0">
                <div className="relative p-[2px] rounded-full overflow-hidden">
                  <div className="absolute inset-0 accent-gradient [animation:gradient-shift_6s_ease_infinite]" />
                  <div className="relative bg-white text-bg px-6 py-2.5 rounded-full text-sm font-medium">
                    View — <span className="font-display italic text-lg">{project.title}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "View all" button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link to="/work" className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300 w-full">
            <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative px-6 py-3 rounded-full bg-surface border border-stroke text-text-primary flex items-center justify-center gap-2 group-hover:bg-bg/90 backdrop-blur-sm z-10 mx-[2px] my-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)]">
               View all work <ArrowRight className="w-4 h-4 text-muted group-hover:text-text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
