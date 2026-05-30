import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Building2, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { experiencesMap: EXPRIENCES, loading } = usePortfolioData();
  const exp = id ? EXPRIENCES[id] : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loading && !exp) {
      navigate('/work');
      return;
    }

    // Wait for the loaded content to actually render before wiring up
    // animations — during the loading render only the spinner is mounted, so
    // containerRef is null and the selectors below match nothing. The effect
    // re-runs once `loading` flips to false (it's in the dependency array).
    if (loading || !exp) return;

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
      if (gsap.utils.toArray('.stagger-item').length) {
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
  }, [exp, navigate, loading]);

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!exp) return null;

  return (
    <div className="bg-bg min-h-screen" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex flex-col justify-end mb-24 md:mb-32 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
        >
          <img
            src={exp.heroImage}
            alt={exp.role}
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 pb-16 pt-32">
          {/* Navigation */}
          <div className="mb-12">
            <Link 
              to="/work" 
              className="inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors group text-sm font-mono uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Work
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs text-muted font-mono uppercase tracking-[0.3em]">{exp.company}</span>
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-accent font-mono uppercase tracking-[0.3em]">{exp.period}</span>
          </motion.div>
          
          <h1 className="reveal-text text-5xl md:text-7xl lg:text-8xl font-display italic leading-tight tracking-tight text-text-primary mb-8">
            {exp.role}
          </h1>

          <div className="reveal-text flex flex-wrap gap-6 text-sm text-muted font-mono">
             <div className="flex items-center gap-2">
               <Building2 className="w-4 h-4" />
               {exp.company}
             </div>
             <div className="flex items-center gap-2">
               <MapPin className="w-4 h-4" />
               {exp.location}
             </div>
             <div className="flex items-center gap-2">
               <Calendar className="w-4 h-4" />
               {exp.period}
             </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-8 space-y-24">
            {/* Overview */}
            <section className="fade-up-section">
              <div className="flex items-center gap-3 mb-8">
                 <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">01</span>
                 <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Overview</h2>
              </div>
              <p className="text-2xl md:text-3xl lg:text-4xl text-text-primary/90 leading-tight md:leading-snug font-light italic mb-8">
                 "{exp.shortDesc}"
              </p>
              <p className="text-muted leading-relaxed text-lg md:text-xl font-light">
                {exp.longDesc}
              </p>
            </section>

            {/* Responsibilities */}
            <section className="fade-up-section stagger-list border-t border-stroke pt-24">
              <div className="flex items-center gap-3 mb-10">
                 <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">02</span>
                 <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Key Responsibilities</h2>
              </div>
              <ul className="space-y-6">
                {exp.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex gap-4 items-start stagger-item">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <span className="text-lg text-text-primary/90">{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
            
            {/* Image Gallery */}
            {exp.gallery && exp.gallery.length > 0 && (
              <section className="fade-up-section border-t border-stroke pt-24">
                <div className="flex items-center gap-3 mb-10">
                   <span className="text-xs text-muted font-mono bg-stroke/30 px-2 py-1 rounded">03</span>
                   <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Visual Context</h2>
                </div>
                <div className="flex flex-col gap-12">
                  {exp.gallery.map((img, idx) => (
                    <div key={idx}>
                       <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-surface relative filter grayscale hover:grayscale-0 transition-all duration-700" style={{ clipPath: 'inset(0)' }}>
                          <img
                            src={img.url}
                            alt={img.caption}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-[140%] absolute left-0 top-[-20%] object-cover parallax-img"
                          />
                       </div>
                       <div className="mt-4 text-xs text-muted font-mono flex items-center gap-3 px-4">
                          <div className="w-4 h-px bg-stroke" />
                          {img.caption}
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">
              
              {/* Stack / Tech block */}
              <div className="p-8 rounded-[2rem] border border-stroke bg-surface/50 fade-up-section">
                <h3 className="text-xs text-muted uppercase tracking-[0.2em] mb-6">Technologies & Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-bg border border-stroke/50 rounded-md text-xs text-text-primary font-mono shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics block */}
              {exp.metrics && exp.metrics.length > 0 && (
                <div className="fade-up-section space-y-4">
                  {exp.metrics.map((metric, idx) => (
                    <div key={idx} className="p-6 bg-surface/30 border border-stroke rounded-[2rem] flex flex-row justify-between items-center group">
                      <div className="text-[10px] uppercase tracking-widest text-muted max-w-[50%]">{metric.label}</div>
                      <div className="text-3xl font-display italic text-text-primary group-hover:scale-110 transition-transform">{metric.value}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
