import React, { Suspense, lazy } from 'react';
import { ArrowUpRight } from 'lucide-react';
import LogoLoop from './LogoLoop';
import GlassSurface from './GlassSurface';
import FooterStatus from './FooterStatus';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiGithub, SiDocker, SiSupabase, SiPrisma, SiJavascript, SiFirebase, SiVercel } from 'react-icons/si';
import { usePortfolioData } from '../contexts/PortfolioDataContext';

// Beams pulls in three.js (~300 KB gzipped). It only ever renders at the
// bottom of the page so we defer its download — falls back to a plain black
// fill, which matches the surrounding bg-black until the chunk arrives.
const Beams = lazy(() => import('./Beams'));

export function Contact() {
  const { contact } = usePortfolioData();
  const techLogos = [
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiReact className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "React" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiNextdotjs className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "Next.js" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiTypescript className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "TypeScript" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiTailwindcss className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "Tailwind CSS" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiJavascript className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "JavaScript" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiGithub className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "GitHub" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiDocker className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "Docker" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiSupabase className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "Supabase" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiPrisma className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "Prisma" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiFirebase className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "Firebase" },
    { node: <div className="text-text-primary/10 hover:text-text-primary transition-colors duration-300 mx-8"><SiVercel className="w-16 h-16 md:w-20 md:h-20" /></div>, title: "Vercel" },
  ];

  return (
    <footer className="relative bg-bg pt-20 md:pt-32 pb-8 overflow-hidden min-h-[80vh] flex flex-col justify-end">
      {/* Background Beams */}
      <div className="absolute inset-0 z-0 bg-black">
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          <Suspense fallback={null}>
            <Beams
              beamWidth={2}
              beamHeight={15}
              beamNumber={12}
              lightColor="#ffffff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={0}
            />
          </Suspense>
        </div>
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-bg to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Marquee */}
        <div className="w-full overflow-hidden mb-12 flex items-center justify-center">
          <LogoLoop
            logos={techLogos}
            speed={50}
            direction="left"
            logoHeight={120}
            gap={40}
            hoverSpeed={0}
            ariaLabel="Technology stack"
          />
        </div>

        {/* CTA */}
        <div className="text-center px-4 mb-20 md:mb-32">
          <p className="text-sm text-muted uppercase tracking-[0.3em] mb-4">{contact.ctaLabel}</p>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display italic text-text-primary mb-10">
            {contact.ctaHeading}
          </h2>
          <a 
            href={`mailto:${contact.email}`}
            className="inline-flex group relative rounded-full text-base sm:text-lg hover:scale-105 transition-all duration-300"
          >
            <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <GlassSurface width="fit-content" height="fit-content" borderRadius={40} opacity={0.2} blur={10}>
              <div className="relative px-8 py-4 rounded-full text-text-primary flex items-center justify-center gap-3 z-10">
                 {contact.email} <ArrowUpRight className="w-5 h-5 text-text-primary" />
              </div>
            </GlassSurface>
          </a>
        </div>

        {/* Footer Bar */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted">
          <div className="flex items-center gap-6">
            {contact.socialLinks.map(link => (
              <a
                key={link.label}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <FooterStatus />

            <div className="flex items-center gap-3 bg-surface/50 px-4 py-2 rounded-full border border-stroke backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span>{contact.availabilityText}</span>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
