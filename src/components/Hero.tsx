import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Aurora from './Aurora';
import ShinyText from './ShinyText';
import GlassSurface from './GlassSurface';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const { roles: ROLES, heroData, siteData } = usePortfolioData();

  useEffect(() => {
    if (ROLES.length === 0) return;
    // Rotating roles every 2s
    const roleInterval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2000);
    return () => clearInterval(roleInterval);
  }, [ROLES.length]);

  useEffect(() => {
    // GSAP Entrance Animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".name-reveal", 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      )
      .fromTo(".blur-in",
        { opacity: 0, filter: "blur(10px)", y: 20 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 },
        "-=0.9" // start earlier
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center pt-20 pb-32">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Aurora
          colorStops={[heroData.auroraColor1, heroData.auroraColor2, heroData.auroraColor3]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="z-10 flex flex-col items-center text-center px-4 mt-auto mb-auto w-full max-w-4xl">
        <p className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8">
          {siteData.collectionLabel}
        </p>
        
        <h1 className="name-reveal text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight mb-6">
          <ShinyText
            text={heroData.headlineName}
            speed={4}
          />
        </h1>
        
        <p className="blur-in text-lg md:text-2xl text-text-primary/90 mb-6 font-light">
          {heroData.taglinePrefix} <span key={roleIndex} className="font-display italic text-text-primary animate-role-fade-in inline-block">{ROLES[roleIndex]}</span> {heroData.taglineSuffix}
        </p>
        
        <p className="blur-in text-sm md:text-base text-muted max-w-md mb-12">
          {heroData.description}
        </p>

        <div className="blur-in flex flex-wrap items-center justify-center gap-4">
          <button className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300">
            <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative px-7 py-3.5 rounded-full bg-text-primary group-hover:bg-bg text-bg group-hover:text-text-primary transition-colors duration-300 z-10 mx-[2px] my-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)] flex items-center justify-center">
              {heroData.button1Text}
            </div>
          </button>
          
          <button className="group relative rounded-full text-sm hover:scale-105 transition-all duration-300">
            <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <GlassSurface width="fit-content" height="fit-content" borderRadius={30} opacity={0.2} blur={10}>
              <div className="relative px-7 py-3 rounded-full text-text-primary flex items-center justify-center">
                {heroData.button2Text}
              </div>
            </GlassSurface>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="z-10 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <span className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.2em] pl-[0.2em]">SCROLL</span>
        <div className="w-px h-10 bg-stroke relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-accent animate-scroll-down" />
        </div>
      </div>
    </section>
  );
}
