import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Login from './Login';
import Sidebar from './components/Sidebar';
import SiteSettingsSection from './sections/SiteSettings';
import HeroEditor from './sections/HeroEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import JournalEditor from './sections/JournalEditor';
import ExperienceEditor from './sections/ExperienceEditor';
import AcademicEditor from './sections/AcademicEditor';
import ActivitiesEditor from './sections/ActivitiesEditor';
import StatsEditor from './sections/StatsEditor';
import ContactEditor from './sections/ContactEditor';
import NavigationEditor from './sections/NavigationEditor';
import { Menu, X, ExternalLink, RefreshCw } from 'lucide-react';

export type BOSection =
  | 'site-settings' | 'hero' | 'projects' | 'journal'
  | 'experience' | 'academic' | 'activities'
  | 'stats' | 'navigation' | 'contact';

export default function BackOffice() {
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState<BOSection>('site-settings');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Login />;

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const SECTIONS: Record<BOSection, React.ReactNode> = {
    'site-settings': <SiteSettingsSection />,
    'hero': <HeroEditor />,
    'projects': <ProjectsEditor />,
    'journal': <JournalEditor />,
    'experience': <ExperienceEditor />,
    'academic': <AcademicEditor />,
    'activities': <ActivitiesEditor />,
    'stats': <StatsEditor />,
    'navigation': <NavigationEditor />,
    'contact': <ContactEditor />,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Bar */}
      <header className="h-14 bg-[#111111] border-b border-[#1e1e1e] flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(v => !v)} className="p-1.5 rounded-md hover:bg-[#1e1e1e] transition-colors">
            {sidebarOpen ? <X className="w-4 h-4 text-[#888]" /> : <Menu className="w-4 h-4 text-[#888]" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#84CC16] to-[#EAB308] flex items-center justify-center">
              <span className="text-[10px] font-bold text-black">P</span>
            </div>
            <span className="text-sm font-semibold text-[#e5e5e5]">Portfolio CMS</span>
            <span className="text-xs text-[#555] border border-[#222] rounded px-1.5 py-0.5">Back Office</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#e5e5e5] transition-colors px-3 py-1.5 rounded-md hover:bg-[#1e1e1e]">
            <ExternalLink className="w-3.5 h-3.5" /> View Site
          </a>
          <div className="w-px h-4 bg-[#222]" />
          <span className="text-xs text-[#555]">{session.user?.email}</span>
          <button onClick={handleLogout} className="text-xs text-[#888] hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-[#1e1e1e]">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-0'} overflow-hidden`}>
          <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
        </div>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0d0d0d]">
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            {SECTIONS[activeSection]}
          </div>
        </main>
      </div>
    </div>
  );
}
