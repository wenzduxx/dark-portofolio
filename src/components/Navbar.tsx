import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import GlassSurface from './GlassSurface';
import { usePortfolioData } from '../contexts/PortfolioDataContext';
import { MusicToggle } from './MusicToggle';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { navLinks: NAV_LINKS, siteData } = usePortfolioData();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
      <GlassSurface 
        width="fit-content" 
        height="fit-content" 
        borderRadius={40}
        className={`pointer-events-auto transition-all duration-500 ease-in-out ${
          scrolled ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'
        }`}
        opacity={scrolled ? 0.9 : 0.8}
        blur={15}
        backgroundOpacity={scrolled ? 0.3 : 0.1}
      >
        <div className="inline-flex items-center px-4 py-2">
          {/* Logo */}
          <Link 
            to="/"
            className="group relative flex items-center justify-center w-9 h-9 rounded-full transition-transform duration-500 hover:scale-110 shrink-0"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#89AACC] to-[#4E85BF] opacity-50 group-hover:opacity-100 transition-opacity duration-500 [animation:gradient-shift_6s_linear_infinite] group-hover:[animation-direction:reverse]" />
            <div className="absolute inset-[2px] rounded-full bg-bg/80 backdrop-blur-md z-10 flex items-center justify-center">
               <span className="font-display italic text-[13px] text-text-primary">{siteData.logoInitials}</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-white/10 mx-3" />

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-300 relative group/link ${
                  location.pathname === link.path 
                    ? 'text-text-primary' 
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                {location.pathname === link.path && (
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-sm" />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-3" />

          {/* Music toggle */}
          <MusicToggle />

          {/* "Say hi" button */}
          <a 
            href={`mailto:${siteData.ownerEmail}`}
            className="group relative rounded-full inline-flex items-center justify-center text-xs sm:text-sm px-4 py-2 hover:bg-white/10 transition-colors duration-300"
          >
            <span className="relative flex items-center gap-2 text-text-primary">
              Say hi <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-primary" />
            </span>
          </a>
        </div>
      </GlassSurface>
    </nav>
  );
}
