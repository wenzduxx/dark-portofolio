import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Menu, X, ExternalLink, RefreshCw, Layout } from 'lucide-react';

export type BOSection =
  | 'site-settings' | 'hero' | 'projects' | 'journal'
  | 'experience' | 'academic' | 'activities'
  | 'stats' | 'navigation' | 'contact';

export default function BackOffice() {
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState<BOSection>('site-settings');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('/');
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const refreshPreview = useCallback(() => {
    if (previewRef.current) {
      previewRef.current.src = previewRef.current.src;
    }
  }, []);

  const notifyPreviewRefresh = useCallback(() => {
    setTimeout(() => refreshPreview(), 800); // Wait for Supabase write to settle
  }, [refreshPreview]);

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

  // DB connection status check
  useEffect(() => {
    supabase.from('site_settings').select('id').limit(1)
      .then(({ error }) => {
        setDbStatus(error ? 'error' : 'connected');
      });
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
          <button
            onClick={() => setPreviewOpen(v => !v)}
            className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-md ${previewOpen ? 'text-[#84CC16] bg-[#84CC16]/10' : 'text-[#888] hover:text-[#e5e5e5] hover:bg-[#1e1e1e]'}`}
          >
            <Layout className="w-3.5 h-3.5" />
            {previewOpen ? 'Hide Preview' : 'Live Preview'}
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#e5e5e5] transition-colors px-3 py-1.5 rounded-md hover:bg-[#1e1e1e]">
            <ExternalLink className="w-3.5 h-3.5" /> View Site
          </a>
          <div className="w-px h-4 bg-[#222]" />
          {/* DB Status Indicator */}
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
            dbStatus === 'connected' ? 'bg-green-500/10 text-green-400' :
            dbStatus === 'error' ? 'bg-red-500/10 text-red-400' :
            'bg-[#1a1a1a] text-[#555]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              dbStatus === 'connected' ? 'bg-green-400' :
              dbStatus === 'error' ? 'bg-red-400 animate-pulse' :
              'bg-[#555]'
            }`} />
            {dbStatus === 'connected' ? 'DB Connected' : dbStatus === 'error' ? 'DB Error — check .env' : 'Checking...'}
          </div>
          <div className="w-px h-4 bg-[#222]" />
          <span className="text-xs text-[#555]">{session.user?.email}</span>
          <button onClick={handleLogout} className="text-xs text-[#888] hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-[#1e1e1e]">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-0'} overflow-hidden border-r border-[#1e1e1e]`}>
          <Sidebar activeSection={activeSection} onSelect={(s) => { setActiveSection(s); }} />
        </div>

        {/* Editor Area */}
        <main className={`overflow-y-auto bg-[#0d0d0d] transition-all duration-300 ${previewOpen ? 'w-[420px] shrink-0' : 'flex-1'}`}>
          <div className="max-w-2xl mx-auto p-6">
            {SECTIONS[activeSection]}
          </div>
        </main>

        {/* Live Preview Panel */}
        {previewOpen && (
          <div className="flex-1 flex flex-col border-l border-[#1e1e1e] bg-[#0a0a0a]">
            {/* Preview toolbar */}
            <div className="h-10 bg-[#111] border-b border-[#1e1e1e] flex items-center gap-2 px-3 shrink-0">
              <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md p-0.5">
                {['/', '/work', '/resume'].map(url => (
                  <button
                    key={url}
                    onClick={() => setPreviewUrl(url)}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${previewUrl === url ? 'bg-[#84CC16] text-black font-medium' : 'text-[#888] hover:text-white'}`}
                  >
                    {url === '/' ? 'Home' : url.replace('/', '')}
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-[#1a1a1a] rounded px-2 py-1 text-xs text-[#555] font-mono">
                localhost:3000{previewUrl}
              </div>
              <button
                onClick={refreshPreview}
                className="p-1.5 text-[#555] hover:text-[#84CC16] transition-colors"
                title="Refresh preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 text-[#555] hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* iFrame */}
            <iframe
              ref={previewRef}
              src={previewUrl}
              className="flex-1 w-full border-0 bg-white"
              title="Portfolio Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
