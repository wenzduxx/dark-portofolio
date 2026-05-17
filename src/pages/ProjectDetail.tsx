import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight, Github, Globe, CheckCircle2 } from 'lucide-react';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detailedProjects: DETAILED_PROJECTS } = usePortfolioData();
  const project = id ? DETAILED_PROJECTS[id] : null;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!project) {
      navigate('/work');
      return;
    }

    const ctx = gsap.context(() => {
      // Intro Text Reveal
      gsap.from(".reveal-text", {
        y: 60,
        opacity: 0,
        rotateX: 10,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out"
      });

      // Parallax Images
      gsap.utils.toArray<HTMLElement>('.parallax-img').forEach(img => {
        gsap.fromTo(img, 
          { yPercent: -15 },
          {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true
            }
          }
        );
      });

      // Fade up sections
      gsap.utils.toArray<HTMLElement>('.fade-up-section').forEach(section => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
          }
        });
      });

      // Staggered list items
      if (document.querySelector('.stagger-list')) {
        gsap.from('.stagger-item', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.stagger-list',
            start: "top 75%",
          }
        });
      }
      
    }, containerRef);

    return () => ctx.revert();
  }, [project, navigate]);

  if (!project) return null;

  return (
    <div ref={containerRef} className="bg-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-end">
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={project.heroImage} 
            alt={project.title}
            className="w-full h-full object-cover grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 pb-20">
          <Link 
            to="/work" 
            className="inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Archive
          </Link>
          
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted font-mono uppercase tracking-[0.3em]">{project.category}</span>
            </motion.div>
            <h1 className="reveal-text text-5xl md:text-8xl lg:text-9xl font-display italic leading-[0.85] tracking-tight text-text-primary mb-8">
              {project.title.split(' ')[0]} <br />
              <span className="text-text-primary/40 ml-[0.5em]">{project.title.split(' ').slice(1).join(' ')}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Structured Content Area */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* Abstract / Executive Summary */}
        <section className="py-24 md:py-32 border-b border-stroke fade-up-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                 <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Executive Summary</h2>
              </div>
              <p className="text-2xl md:text-4xl text-text-primary/90 leading-tight md:leading-snug font-light italic">
                 "{project.description}"
              </p>
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 gap-8 h-fit pt-8 lg:pt-14 border-t lg:border-t-0 lg:border-l border-stroke lg:pl-12">
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest mb-2">Year</h3>
                <div className="text-sm text-text-primary font-mono">{project.year}</div>
              </div>
              <div>
                <h3 className="text-[10px] text-muted uppercase tracking-widest mb-2">Client</h3>
                <div className="text-sm text-text-primary font-mono">{project.client}</div>
              </div>
              <div className="col-span-2">
                <h3 className="text-[10px] text-muted uppercase tracking-widest mb-2">Role</h3>
                <div className="text-sm text-text-primary font-mono">{project.role}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Discovery & Problem Context */}
        <section className="py-24 md:py-32 fade-up-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <div className="flex items-center gap-3 mb-8">
                 <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">01</span>
                 <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Background</h2>
              </div>
              <h3 className="text-3xl md:text-5xl text-text-primary mb-8 font-display italic leading-tight">{project.background.title}</h3>
              <p className="text-muted leading-relaxed text-lg md:text-xl font-light">
                {project.background.content}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-8">
                 <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">02</span>
                 <h2 className="text-xs text-muted uppercase tracking-[0.3em]">The Challenge</h2>
              </div>
              <h3 className="text-3xl md:text-5xl text-text-primary mb-8 font-display italic leading-tight">{project.problem.title}</h3>
              <p className="text-muted leading-relaxed text-lg md:text-xl font-light">
                {project.problem.content}
              </p>
            </div>
          </div>
        </section>

        {/* Full Bleed Parallax Visual */}
        {project.visuals[0] && (
          <section className="pb-32 fade-up-section">
             <div className="aspect-video w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-surface relative" style={{ clipPath: 'inset(0)' }}>
                <img 
                  src={project.visuals[0].url} 
                  alt={project.visuals[0].caption}
                  className="w-full h-[140%] absolute left-0 top-[-20%] object-cover parallax-img"
                />
                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 bg-bg/50 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/70 font-mono flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   {project.visuals[0].caption}
                </div>
             </div>
          </section>
        )}

        {/* Methodology (If exists) */}
        {project.methodology && (
          <section className="py-24 border-t border-stroke fade-up-section">
            <div className="flex items-center gap-3 mb-16">
               <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">03</span>
               <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Methodology</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-5">
                 <p className="text-2xl text-text-primary/90 font-light leading-relaxed">
                   {project.methodology.description}
                 </p>
              </div>
              <div className="lg:col-span-6 lg:col-start-7 stagger-list">
                 <div className="space-y-12">
                   {project.methodology.phases.map((phase, idx) => (
                     <div key={idx} className="relative pl-8 stagger-item">
                       <span className="absolute left-0 top-1 text-xs text-accent font-mono">0{idx + 1}</span>
                       <h4 className="text-xl text-text-primary mb-3 font-medium">{phase.name}</h4>
                       <p className="text-muted leading-relaxed">{phase.description}</p>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </section>
        )}

        {/* Solution & Tech - Layout */}
        <section className="py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            <div className="lg:col-span-6 space-y-32">
              <div className="fade-up-section">
                <div className="flex items-center gap-3 mb-8">
                   <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">04</span>
                   <h2 className="text-xs text-muted uppercase tracking-[0.3em]">The Solution</h2>
                </div>
                <h3 className="text-4xl md:text-5xl lg:text-6xl text-text-primary mb-8 font-display italic leading-[1.1]">{project.solution.title}</h3>
                <p className="text-muted leading-relaxed text-xl mb-12 font-light">
                  {project.solution.content}
                </p>
              </div>

              <div className="p-8 md:p-12 bg-surface rounded-[2rem] border border-stroke fade-up-section">
                 <div className="flex items-center gap-3 mb-8">
                   <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Architecture & Stack</h2>
                 </div>
                 <div className="flex flex-wrap gap-2 mb-8">
                   {project.technical.stack.map(tag => (
                     <span key={tag} className="px-4 py-2 bg-bg border border-stroke/50 rounded-full text-xs text-text-primary font-mono shadow-sm">
                       {tag}
                     </span>
                   ))}
                 </div>
                 <p className="text-muted leading-relaxed">
                   {project.technical.details}
                 </p>
              </div>

              {/* Outcomes (If exists) */}
              {project.outcomes && (
                <div className="fade-up-section border-t border-stroke pt-16">
                  <div className="flex items-center gap-3 mb-8">
                     <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">05</span>
                     <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Impact & Outcomes</h2>
                  </div>
                  <p className="text-xl text-text-primary/90 font-light leading-relaxed mb-12">
                    {project.outcomes.description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6" ref={metricsRef}>
                    {project.outcomes.metrics.map((metric, idx) => (
                      <div key={idx} className="p-6 bg-surface/50 border border-stroke rounded-2xl flex flex-col justify-center items-center text-center group hover:bg-surface transition-colors cursor-default">
                        <div className="text-3xl lg:text-4xl font-display italic text-text-primary mb-2 group-hover:scale-110 transition-transform">{metric.value}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Visual Column */}
            <div className="lg:col-span-6 relative">
              <div className="flex flex-col gap-16 lg:mt-12">
                {project.visuals.slice(1, 3).map((visual, idx) => (
                   <div key={idx} className="w-full">
                     <div className="aspect-[4/5] lg:aspect-[3/4] w-full rounded-[2rem] overflow-hidden bg-surface border border-stroke relative" style={{ clipPath: 'inset(0)' }}>
                        <img 
                          src={visual.url} 
                          alt={visual.caption}
                          className="w-full h-[140%] absolute left-0 top-[-20%] object-cover parallax-img"
                        />
                     </div>
                     <div className="mt-4 text-xs text-muted font-mono flex items-center gap-3 px-2">
                          <CheckCircle2 className="w-3 h-3 text-accent" />
                          {visual.caption}
                     </div>
                   </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Visit Project CTA */}
        <section className="py-32 fade-up-section">
           <div className="w-full rounded-[2rem] md:rounded-[3rem] bg-surface border border-stroke p-12 md:p-24 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display italic text-text-primary mb-10">See the system <br />in action.</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <a href="#" className="flex items-center gap-3 bg-text-primary text-bg px-8 py-4 rounded-full hover:scale-105 transition-transform text-sm font-medium">
                      Live Preview <ArrowUpRight className="w-4 h-4" />
                   </a>
                   <a href="#" className="flex items-center gap-3 border border-stroke text-text-primary px-8 py-4 rounded-full hover:bg-white/5 transition-colors text-sm">
                      Repository <Github className="w-4 h-4" />
                   </a>
                </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

