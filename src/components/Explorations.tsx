import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

gsap.registerPlugin(ScrollTrigger);

export function Explorations() {
  const { explorations: EXPLORATIONS, contact } = usePortfolioData();
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const column1Ref = useRef<HTMLDivElement>(null);
  const column2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the center content
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: contentRef.current,
        pinSpacing: false
      });

      // Parallax for Column 1
      gsap.fromTo(column1Ref.current, 
        { y: '0%' },
        {
          y: '-50%',
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );

      // Parallax for Column 2 (moves slower or starts differently)
      gsap.fromTo(column2Ref.current,
        { y: '20%' },
        {
          y: '-80%',
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[300vh] bg-bg overflow-hidden flex justify-center pt-[50vh]">
      
      {/* Pinned Center Content */}
      <div 
        ref={contentRef} 
        className="absolute top-0 left-0 w-full h-screen z-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="flex flex-col items-center text-center px-4 pointer-events-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Explorations</span>
            <div className="w-8 h-px bg-stroke" />
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl text-text-primary tracking-tight mb-6">
            Visual <span className="font-display italic text-text-primary/90">playground</span>
          </h2>
          <p className="text-muted text-sm md:text-base max-w-sm mb-8">
            Daily experiments, 3D renders, and interaction ideas that didn't make it to production.
          </p>
          
          {(() => {
            const dribbbleLink = contact.socialLinks.find(s => s.label.toLowerCase().includes('dribbble'));
            if (dribbbleLink && dribbbleLink.url && dribbbleLink.url !== '#') {
              return (
                <a href={dribbbleLink.url} target="_blank" rel="noopener noreferrer" className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300">
                  <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative px-7 py-3.5 rounded-full bg-surface border border-stroke text-text-primary flex items-center justify-center gap-2 group-hover:bg-bg/90 backdrop-blur-sm z-10 mx-[2px] my-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)]">
                     Dribbble <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-text-primary transition-colors" />
                  </div>
                </a>
              );
            }
            return (
              <Link to="/work" className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300">
                <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative px-7 py-3.5 rounded-full bg-surface border border-stroke text-text-primary flex items-center justify-center gap-2 group-hover:bg-bg/90 backdrop-blur-sm z-10 mx-[2px] my-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)]">
                   View Work <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-text-primary transition-colors" />
                </div>
              </Link>
            );
          })()}
        </div>
      </div>

      {/* Parallax Gallery Grid */}
      <div className="absolute top-[20vh] left-0 right-0 z-10 h-full w-full pointer-events-none">
        <div className="max-w-[1400px] mx-auto px-6 w-full h-full relative">
          
          {/* Column 1 */}
          <div ref={column1Ref} className="absolute left-6 md:left-[10%] top-0 flex flex-col gap-12 md:gap-40 pointer-events-auto">
            {EXPLORATIONS.filter(e => e.col === 1).map((item, i) => (
              <div 
                key={item.id} 
                className="group relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-3xl overflow-hidden cursor-crosshair"
                style={{ transform: `rotate(${i % 2 === 0 ? '-3deg' : '2deg'})` }}
              >
                <img src={item.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-bg/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div ref={column2Ref} className="absolute right-6 md:right-[10%] top-[20vh] flex flex-col gap-16 md:gap-48 pointer-events-auto">
            {EXPLORATIONS.filter(e => e.col === 2).map((item, i) => (
              <div 
                key={item.id} 
                className="group relative w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-3xl overflow-hidden cursor-crosshair"
                style={{ transform: `rotate(${i % 2 === 0 ? '4deg' : '-2deg'})` }}
              >
                <img src={item.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-bg/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

        </div>
      </div>

    </section>
  );
}
