import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Minus, ArrowRight } from 'lucide-react';
import Noise from '../components/Noise';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

gsap.registerPlugin(ScrollTrigger);



export default function Work() {
  const { allProjects: ALL_PROJECTS, experienceList, activitiesList, clients: CLIENTS } = usePortfolioData();
  const EXPERIENCE_LIST = experienceList;
  const ACTIVITIES_LIST = activitiesList;
  const pageRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      if (horizontalRef.current && containerRef.current) {
        const totalWidth = horizontalRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const amountToScroll = totalWidth - viewportWidth;

        gsap.to(horizontalRef.current, {
          x: -amountToScroll,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${amountToScroll}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });
      }

      gsap.from(".work-reveal", {
        y: 60,
        opacity: 0,
        rotateX: 10,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out"
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="pt-32 pb-20 px-6 md:px-12 relative">
      <Noise
        patternSize={250}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={15}
      />
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto mb-24 md:mb-32 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
            </motion.div>
            <h1 className="work-reveal text-6xl md:text-8xl lg:text-9xl font-display italic leading-none tracking-tight text-text-primary mb-8">
              Proof of <span className="text-text-primary/40">concept.</span>
            </h1>
            <p className="work-reveal text-lg md:text-xl text-muted max-w-lg">
              A comprehensive archive of solutions built at the intersection of aesthetic precision and functional excellence.
            </p>
          </div>
          
          <div className="work-reveal hidden lg:flex flex-col items-end text-right">
             <div className="text-4xl font-display italic text-text-primary mb-2">024—026</div>
             <div className="text-xs text-muted uppercase tracking-[0.2em]">Active Archive</div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="max-w-[1200px] mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h2 className="text-xs text-muted uppercase tracking-[0.3em] sticky top-40">Experience</h2>
          </div>
          <div className="md:col-span-8 flex flex-col gap-12">
            {EXPERIENCE_LIST.map((exp, i) => (
              <motion.div 
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative pb-12 border-b border-stroke last:border-0"
              >
                <Link to={`/experience/${exp.id}`} className="block">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-2xl md:text-3xl text-text-primary group-hover:text-white transition-colors flex items-center gap-3">
                      {exp.role} <span className="font-display italic text-muted">@ {exp.company}</span>
                    </h3>
                    <span className="text-sm text-muted font-mono">{exp.period}</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <p className="text-muted max-w-xl leading-relaxed">
                      {exp.shortDesc}
                    </p>
                    <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full border border-stroke items-center justify-center group-hover:bg-white group-hover:border-transparent transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-text-primary group-hover:text-bg group-hover:-rotate-45 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Blog Section */}
      <div ref={containerRef} className="bg-surface overflow-hidden mb-32 h-screen flex flex-col justify-center w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="max-w-[1200px] mx-auto w-full px-6 md:px-12 mb-12 shrink-0">
          <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Activities & Insights</h2>
        </div>
        <div ref={horizontalRef} className="flex gap-8 px-6 md:px-12 w-max mx-auto md:ml-auto">
          {ACTIVITIES_LIST.map((post) => (
            <Link 
              key={post.id} 
              to={`/activity/${post.id}`}
              className="w-[350px] md:w-[450px] group flex flex-col shrink-0"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-stroke mb-8">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="px-2">
                <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider mb-3">
                  <span>{post.category}</span>
                  <span className="w-1 h-1 rounded-full bg-stroke" />
                  <span>{post.date}</span>
                </div>
                <h3 className="text-2xl md:text-3xl text-text-primary leading-tight group-hover:text-white transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
          <div className="w-[300px] flex items-center justify-center pointer-events-none">
             <div className="text-[120px] font-display italic text-text-primary/5 select-none rotate-90">END.</div>
          </div>
        </div>
      </div>

      {/* Full Project Archive */}
      <section className="max-w-[1200px] mx-auto mb-32">
        <div className="flex items-center gap-3 mb-12">
           <h2 className="text-xs text-muted uppercase tracking-[0.3em]">Full Portfolio</h2>
           <div className="flex-1 h-px bg-stroke" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {ALL_PROJECTS.map((project, i) => {
            const patterns = [
              { span: "lg:col-span-8", aspect: "aspect-[16/9]" },
              { span: "lg:col-span-4", aspect: "aspect-[3/4]" },
              { span: "lg:col-span-4", aspect: "aspect-[4/5]" },
              { span: "lg:col-span-8", aspect: "aspect-[21/9]" },
              { span: "lg:col-span-6", aspect: "aspect-[1/1]" },
              { span: "lg:col-span-6", aspect: "aspect-[16/10]" }
            ];
            const pattern = patterns[i % patterns.length];
            return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              viewport={{ once: true }}
              className={`md:col-span-1 ${pattern.span}`}
            >
              <Link
                to={`/project/${project.id}`}
                className="group flex flex-col"
              >
                <div className={`w-full overflow-hidden rounded-2xl bg-surface mb-6 relative ${pattern.aspect}`}>
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-bg/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl text-text-primary mb-1 group-hover:translate-x-1 transition-transform">{project.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider">
                      <span>{project.category}</span>
                      <Minus className="w-3 h-3" />
                      <span>{project.year}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-stroke flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all shrink-0">
                    <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-bg transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )})}
        </div>
      </section>

      {/* Principles Section */}
      <section className="max-w-[1200px] mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-display italic text-text-primary mb-8 tracking-tight">
              Design <span className="text-text-primary/40">Philosophy.</span>
            </h2>
            <div className="space-y-12">
              {[
                { title: "Technical Sincerity", desc: "No fake infrastructure. Every animation, transition, and interaction should reflect the underlying logic of the system." },
                { title: "Visual Quiet", desc: "Removing the unnecessary until only the essential remains. Clarity over decoration, always." },
                { title: "Human Nuance", desc: "Digital products shouldn't feel like machines. Adding character through small, thoughtful details." }
              ].map((item, i) => (
                <div key={i} className="group flex gap-6">
                  <span className="text-xs text-muted font-mono mt-1">0{i+1}</span>
                  <div>
                    <h3 className="text-lg text-text-primary mb-2">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="aspect-square bg-surface border border-stroke rounded-[3rem] overflow-hidden relative">
             <img 
               src="https://images.unsplash.com/photo-1558655146-23b01c7bc161?auto=format&fit=crop&q=80&w=1000" 
               alt="" 
               className="w-full h-full object-cover mix-blend-luminosity opacity-40"
             />
             <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-[120px] font-display italic text-text-primary/10 select-none">WP</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      {CLIENTS.length > 0 && (
      <section className="max-w-[1200px] mx-auto pt-20 border-t border-stroke">
        <h2 className="text-xs text-muted uppercase tracking-[0.3em] mb-12 text-center">Trusted By</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {CLIENTS.map((client, i) => (
            <div 
              key={i}
              className="text-2xl md:text-3xl font-display italic text-muted/30 hover:text-text-primary transition-colors cursor-default text-center"
            >
              {client}
            </div>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}
