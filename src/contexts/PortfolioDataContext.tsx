/**
 * PortfolioDataContext
 * 
 * Fetches all data from Supabase and maps it to the EXACT same shapes
 * used by the original hardcoded constants in each component.
 * Falls back to empty arrays (components handle empty gracefully).
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProjectCaseStudy } from '../data/projects';
import type { JournalEntry } from '../data/journal';
import type { ExperienceEntry } from '../data/experience';
import type { AcademicEntry } from '../data/academic';
import type { Activity } from '../data/activities';

// ─── Types matching original component data shapes ──────────────────────────

export interface HomeProject {
  id: string;
  title: string;
  col: string;        // e.g. "md:col-span-7"
  image: string;
}

export interface HomeJournalEntry {
  id: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface NavLinkItem {
  name: string;
  path: string;
}

export interface WorkProject {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
}

export interface WorkActivity {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface ContactData {
  ctaLabel: string;
  ctaHeading: string;
  email: string;
  availabilityText: string;
  socialLinks: string[];
}

export interface HeroSettingsData {
  headlineName: string;
  taglinePrefix: string;
  taglineSuffix: string;
  description: string;
  button1Text: string;
  button2Text: string;
  auroraColor1: string;
  auroraColor2: string;
  auroraColor3: string;
}

export interface SiteSettingsData {
  collectionLabel: string;
  logoInitials: string;
  ownerEmail: string;
  ownerName: string;
}

// ─── Context Shape ───────────────────────────────────────────────────────────

interface PortfolioContextType {
  // Hero.tsx — replaces: const ROLES = [...]
  roles: string[];

  // Navbar.tsx — replaces: const NAV_LINKS = [...]
  navLinks: NavLinkItem[];

  // Stats.tsx — replaces: const STATS = [...]
  stats: StatItem[];

  // SelectedWorks.tsx — replaces: const PROJECTS = [...]
  homeProjects: HomeProject[];

  // Journal.tsx — replaces: const JOURNAL_ENTRIES = [...]
  homeJournal: HomeJournalEntry[];

  // Contact.tsx — replaces hardcoded strings
  contact: ContactData;

  // Hero.tsx — replaces all hardcoded hero strings
  heroData: HeroSettingsData;

  // Navbar.tsx + Hero.tsx — replaces hardcoded site-level strings
  siteData: SiteSettingsData;

  // ProjectDetail.tsx — replaces: import { DETAILED_PROJECTS }
  detailedProjects: Record<string, ProjectCaseStudy>;

  // JournalDetail.tsx — replaces: import { JOURNAL_ENTRIES }
  journalMap: Record<string, JournalEntry>;

  // ExperienceDetail.tsx — replaces: import { EXPRIENCES }
  experiencesMap: Record<string, ExperienceEntry>;

  // Work.tsx — replaces: const EXPERIENCE_LIST = Object.values(EXPRIENCES)
  experienceList: ExperienceEntry[];

  // ActivityDetail.tsx — replaces: import { ACTIVITIES }
  activitiesMap: Record<string, Activity>;

  // Work.tsx — replaces: const ACTIVITIES_LIST = [...]
  activitiesList: WorkActivity[];

  // AcademicDetail.tsx — replaces: import { ACADEMICS }
  academicsMap: Record<string, AcademicEntry>;

  // Work.tsx — replaces: const ALL_PROJECTS = [...]
  allProjects: WorkProject[];

  // Resume.tsx — replaces: const EDUCATION = [...]
  education: EducationItem[];

  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Defaults (same as originals) ────────────────────────────────────────────

const DEFAULT_CONTEXT: PortfolioContextType = {
  roles: ['Creative', 'Fullstack', 'Founder', 'Scholar'],
  navLinks: [
    { name: 'Home', path: '/' },
    { name: 'Work', path: '/work' },
    { name: 'Resume', path: '/resume' },
  ],
  stats: [
    { value: 20, suffix: '+', label: 'Years Experience' },
    { value: 95, suffix: '+', label: 'Projects Done' },
    { value: 200, suffix: '%', label: 'Satisfied Clients' },
  ],
  homeProjects: [
    { id: 'automotive-motion', title: 'Automotive Motion', col: 'md:col-span-7', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200' },
    { id: 'urban-architecture', title: 'Urban Architecture', col: 'md:col-span-5', image: '/src/assets/images/regenerated_image_1778905589186.jpg' },
    { id: 'human-perspective', title: 'Human Perspective', col: 'md:col-span-5', image: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&q=80&w=1200' },
    { id: 'brand-identity', title: 'Brand Identity', col: 'md:col-span-7', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200' },
  ],
  homeJournal: [
    { id: 'future-of-interface', title: 'The architecture of interaction', date: 'Oct 12, 2025', readTime: '4 min read', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=200' },
    { id: 'brutalist-renaissance', title: 'Finding rhythm in motion design', date: 'Sep 28, 2025', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200' },
  ],
  contact: {
    ctaLabel: "What's next?",
    ctaHeading: "Let's build something.",
    email: 'hello@michaelsmith.com',
    availabilityText: 'Available for projects',
    socialLinks: ['Twitter', 'LinkedIn', 'Dribbble', 'GitHub'],
  },
  heroData: {
    headlineName: 'Michael Smith',
    taglinePrefix: 'A',
    taglineSuffix: 'lives in Chicago.',
    description: 'Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.',
    button1Text: 'See Works',
    button2Text: 'Reach out...',
    auroraColor1: '#84CC16',
    auroraColor2: '#EAB308',
    auroraColor3: '#f32222',
  },
  siteData: {
    collectionLabel: "COLLECTION '26",
    logoInitials: 'JA',
    ownerEmail: 'hello@michaelsmith.com',
    ownerName: 'Michael Smith',
  },
  detailedProjects: {},
  journalMap: {},
  experiencesMap: {},
  experienceList: [],
  activitiesMap: {},
  activitiesList: [],
  academicsMap: {},
  allProjects: [],
  education: [
    { id: 'master-hci-cmu', degree: 'Master of Human-Computer Interaction', school: 'Carnegie Mellon University', year: '2018 — 2019' },
    { id: 'bfa-risd', degree: 'BFA in Graphic Design', school: 'Rhode Island School of Design', year: '2014 — 2018' },
  ],
  loading: true,
  error: null,
  refetch: () => {},
};

// ─── Context ──────────────────────────────────────────────────────────────────

const PortfolioDataContext = createContext<PortfolioContextType>(DEFAULT_CONTEXT);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
  const [ctx, setCtx] = useState<Omit<PortfolioContextType, 'refetch'>>(DEFAULT_CONTEXT);

  const fetchAll = useCallback(async () => {
    setCtx(prev => ({ ...prev, loading: true }));
    try {
      const [
        { data: siteSettings },
        { data: heroSettings },
        { data: heroRoles },
        { data: navLinks },
        { data: statsData },
        { data: contactSettings },
        { data: projects },
        { data: projectTechStack },
        { data: projectPhases },
        { data: projectMetrics },
        { data: projectVisuals },
        { data: journalEntries },
        { data: journalContent },
        { data: journalTags },
        { data: experiences },
        { data: expResp },
        { data: expTech },
        { data: expMetrics },
        { data: expGallery },
        { data: academics },
        { data: acadActivities },
        { data: acadMetrics },
        { data: acadGallery },
        { data: activities },
        { data: activityLinks },
      ] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('hero_settings').select('*').single(),
        supabase.from('hero_roles').select('*').order('sort_order'),
        supabase.from('nav_links').select('*').order('sort_order'),
        supabase.from('stats').select('*').order('sort_order'),
        supabase.from('contact_settings').select('*').single(),
        supabase.from('projects').select('*').order('sort_order'),
        supabase.from('project_tech_stack').select('*').order('sort_order'),
        supabase.from('project_methodology_phases').select('*').order('sort_order'),
        supabase.from('project_metrics').select('*').order('sort_order'),
        supabase.from('project_visuals').select('*').order('sort_order'),
        supabase.from('journal_entries').select('*').order('sort_order'),
        supabase.from('journal_content').select('*').order('sort_order'),
        supabase.from('journal_tags').select('*'),
        supabase.from('experiences').select('*').order('sort_order'),
        supabase.from('experience_responsibilities').select('*').order('sort_order'),
        supabase.from('experience_technologies').select('*').order('sort_order'),
        supabase.from('experience_metrics').select('*').order('sort_order'),
        supabase.from('experience_gallery').select('*').order('sort_order'),
        supabase.from('academics').select('*').order('sort_order'),
        supabase.from('academic_activities').select('*').order('sort_order'),
        supabase.from('academic_metrics').select('*').order('sort_order'),
        supabase.from('academic_gallery').select('*').order('sort_order'),
        supabase.from('activities').select('*').order('sort_order'),
        supabase.from('activity_links').select('*').order('sort_order'),
      ]);

      // ── Hero Settings (was fetched but DISCARDED — now mapped!) ────────────
      const heroData: HeroSettingsData = heroSettings ? {
        headlineName: heroSettings.headline_name,
        taglinePrefix: heroSettings.tagline_prefix,
        taglineSuffix: heroSettings.tagline_suffix,
        description: heroSettings.description,
        button1Text: heroSettings.button1_text,
        button2Text: heroSettings.button2_text,
        auroraColor1: heroSettings.aurora_color1,
        auroraColor2: heroSettings.aurora_color2,
        auroraColor3: heroSettings.aurora_color3,
      } : DEFAULT_CONTEXT.heroData;

      // ── Site Settings (was fetched but DISCARDED — now mapped!) ────────────
      const siteData: SiteSettingsData = siteSettings ? {
        collectionLabel: siteSettings.collection_label,
        logoInitials: siteSettings.logo_initials,
        ownerEmail: siteSettings.owner_email,
        ownerName: siteSettings.owner_name,
      } : DEFAULT_CONTEXT.siteData;

      // ── Hero roles ────────────────────────────────────────────────────────
      const roles = (heroRoles && heroRoles.length > 0)
        ? heroRoles.map((r: any) => r.role)
        : DEFAULT_CONTEXT.roles;

      // ── Nav links ─────────────────────────────────────────────────────────
      const resolvedNavLinks = (navLinks && navLinks.length > 0)
        ? navLinks.map((l: any) => ({ name: l.name, path: l.path }))
        : DEFAULT_CONTEXT.navLinks;

      // ── Stats ─────────────────────────────────────────────────────────────
      const resolvedStats = (statsData && statsData.length > 0)
        ? statsData.map((s: any) => ({ value: s.value, suffix: s.suffix, label: s.label }))
        : DEFAULT_CONTEXT.stats;

      // ── Home Projects (featured, with fallback) ───────────────────────────
      const featuredProjects = (projects || []).filter((p: any) => p.is_featured);
      const displayProjects = featuredProjects.length > 0 ? featuredProjects : (projects || []).slice(0, 4);
      const homeProjects = displayProjects.length > 0
        ? displayProjects.sort((a: any, b: any) => a.sort_order - b.sort_order).map((p: any) => ({
            id: p.slug,
            title: p.title,
            col: p.grid_col_span || 'md:col-span-7',
            image: p.hero_image,
          }))
        : DEFAULT_CONTEXT.homeProjects;

      // ── Home Journal (featured, with fallback) ────────────────────────────
      const featuredJournal = (journalEntries || []).filter((e: any) => e.is_featured);
      const displayJournal = featuredJournal.length > 0 ? featuredJournal : (journalEntries || []).slice(0, 4);
      const homeJournal = displayJournal.length > 0
        ? displayJournal.sort((a: any, b: any) => a.sort_order - b.sort_order).map((e: any) => ({
            id: e.slug,
            title: e.title,
            date: e.date,
            readTime: e.reading_time,
            image: e.hero_image,
          }))
        : DEFAULT_CONTEXT.homeJournal;

      // ── Contact ───────────────────────────────────────────────────────────
      const socialLinksRaw = contactSettings?.social_links;
      const socialLinks = Array.isArray(socialLinksRaw)
        ? socialLinksRaw.map((s: any) => s.label)
        : DEFAULT_CONTEXT.contact.socialLinks;

      const contact: ContactData = contactSettings
        ? {
            ctaLabel: contactSettings.cta_label,
            ctaHeading: contactSettings.cta_heading,
            email: contactSettings.email,
            availabilityText: contactSettings.availability_text,
            socialLinks,
          }
        : DEFAULT_CONTEXT.contact;

      // ── Detail Projects map (ProjectDetail.tsx shape) ─────────────────────
      const detailedProjects: Record<string, ProjectCaseStudy> = {};
      if (projects) {
        for (const p of projects) {
          const stack = (projectTechStack || []).filter((t: any) => t.project_id === p.id).map((t: any) => t.tech);
          const phases = (projectPhases || []).filter((ph: any) => ph.project_id === p.id).map((ph: any) => ({ name: ph.name, description: ph.description }));
          const metrics = (projectMetrics || []).filter((m: any) => m.project_id === p.id).map((m: any) => ({ label: m.label, value: m.value }));
          const visuals = (projectVisuals || []).filter((v: any) => v.project_id === p.id).map((v: any) => ({ url: v.url, caption: v.caption }));
          detailedProjects[p.slug] = {
            id: p.slug,
            title: p.title,
            category: p.category,
            year: p.year,
            client: p.client,
            role: p.role,
            heroImage: p.hero_image,
            description: p.description,
            background: { title: p.background_title, content: p.background_content },
            problem: { title: p.problem_title, content: p.problem_content },
            solution: { title: p.solution_title, content: p.solution_content },
            methodology: p.methodology_description
              ? { description: p.methodology_description, phases }
              : undefined,
            technical: { stack, details: p.technical_details },
            outcomes: (metrics.length > 0 || p.outcomes_description)
              ? { description: p.outcomes_description || '', metrics }
              : undefined,
            visuals,
          };
        }
      }

      // ── Journal map (JournalDetail.tsx shape) ─────────────────────────────
      const journalMap: Record<string, JournalEntry> = {};
      if (journalEntries) {
        for (const e of journalEntries) {
          const content = (journalContent || []).filter((c: any) => c.entry_id === e.id).map((c: any) => c.paragraph);
          const tags = (journalTags || []).filter((t: any) => t.entry_id === e.id).map((t: any) => t.tag);
          journalMap[e.slug] = {
            id: e.slug,
            title: e.title,
            category: e.category,
            date: e.date,
            readingTime: e.reading_time,
            heroImage: e.hero_image,
            excerpt: e.excerpt,
            content,
            tags,
          };
        }
      }

      // ── Experiences map (ExperienceDetail.tsx shape) ──────────────────────
      const experiencesMap: Record<string, ExperienceEntry> = {};
      const experienceList: ExperienceEntry[] = [];
      if (experiences) {
        for (const e of experiences) {
          const responsibilities = (expResp || []).filter((r: any) => r.experience_id === e.id).map((r: any) => r.description);
          const technologies = (expTech || []).filter((t: any) => t.experience_id === e.id).map((t: any) => t.tech);
          const metrics = (expMetrics || []).filter((m: any) => m.experience_id === e.id).map((m: any) => ({ label: m.label, value: m.value }));
          const gallery = (expGallery || []).filter((g: any) => g.experience_id === e.id).map((g: any) => ({ url: g.url, caption: g.caption }));
          const entry: ExperienceEntry = {
            id: e.slug,
            role: e.role,
            company: e.company,
            period: e.period,
            location: e.location,
            shortDesc: e.short_desc,
            longDesc: e.long_desc,
            heroImage: e.hero_image,
            responsibilities,
            technologies,
            metrics: metrics.length > 0 ? metrics : undefined,
            gallery: gallery.length > 0 ? gallery : undefined,
          };
          experiencesMap[e.slug] = entry;
          experienceList.push(entry);
        }
      }

      // ── Activities map (ActivityDetail.tsx shape) ─────────────────────────
      const activitiesMap: Record<string, Activity> = {};
      const activitiesList: WorkActivity[] = [];
      if (activities) {
        for (const a of activities) {
          const links = (activityLinks || []).filter((l: any) => l.activity_id === a.id).map((l: any) => ({ label: l.label, url: l.url }));
          const entry: Activity = {
            id: a.slug,
            title: a.title,
            type: a.type,
            status: a.status,
            date: a.date,
            description: a.description,
            longDescription: a.long_description,
            impact: a.impact || undefined,
            links: links.length > 0 ? links : undefined,
          };
          activitiesMap[a.slug] = entry;
          activitiesList.push({
            id: a.slug,
            title: a.title,
            category: a.type,
            date: a.date,
            image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&q=80&w=600',
          });
        }
      }

      // ── Academics map (AcademicDetail.tsx shape) ──────────────────────────
      const academicsMap: Record<string, AcademicEntry> = {};
      if (academics) {
        for (const a of academics) {
          const acts = (acadActivities || []).filter((ac: any) => ac.academic_id === a.id).map((ac: any) => ac.description);
          const metrics = (acadMetrics || []).filter((m: any) => m.academic_id === a.id).map((m: any) => ({ label: m.label, value: m.value }));
          const gallery = (acadGallery || []).filter((g: any) => g.academic_id === a.id).map((g: any) => ({ url: g.url, caption: g.caption }));
          academicsMap[a.slug] = {
            id: a.slug,
            degree: a.degree,
            school: a.school,
            period: a.period,
            location: a.location,
            shortDesc: a.short_desc,
            longDesc: a.long_desc,
            heroImage: a.hero_image,
            activities: acts,
            metrics: metrics.length > 0 ? metrics : undefined,
            gallery: gallery.length > 0 ? gallery : undefined,
          };
        }
      }

      // ── All Projects (Work.tsx shape) ─────────────────────────────────────
      const allProjects = (projects && projects.length > 0)
        ? projects.sort((a: any, b: any) => a.sort_order - b.sort_order).map((p: any) => ({
            id: p.slug,
            title: p.title,
            category: p.category,
            year: p.year,
            image: p.hero_image,
          }))
        : DEFAULT_CONTEXT.allProjects;

      // ── Education (Resume.tsx shape) ──────────────────────────────────────
      const education = (academics && academics.length > 0)
        ? academics.sort((a: any, b: any) => a.sort_order - b.sort_order).map((a: any) => ({
            id: a.slug,
            degree: a.degree,
            school: a.school,
            year: a.period,
          }))
        : DEFAULT_CONTEXT.education;

      setCtx({
        roles,
        navLinks: resolvedNavLinks,
        stats: resolvedStats,
        homeProjects,
        homeJournal,
        contact,
        heroData,
        siteData,
        detailedProjects,
        journalMap,
        experiencesMap,
        experienceList,
        activitiesMap,
        activitiesList,
        academicsMap,
        allProjects,
        education,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('[PortfolioData] Fetch error:', err);
      setCtx(prev => ({ 
        ...prev, 
        loading: false,
        error: err?.message || 'Failed to load data from Supabase. Check your .env variables and that schema.sql has been run.'
      }));
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Supabase Realtime: auto-refresh when Back Office saves data ──────────
  useEffect(() => {
    const WATCHED_TABLES = [
      'site_settings', 'hero_settings', 'hero_roles', 'nav_links', 'stats',
      'contact_settings', 'projects', 'project_tech_stack', 'project_methodology_phases',
      'project_metrics', 'project_visuals', 'journal_entries', 'journal_content',
      'journal_tags', 'experiences', 'experience_responsibilities', 'experience_technologies',
      'experience_metrics', 'experience_gallery', 'academics', 'academic_activities',
      'academic_metrics', 'academic_gallery', 'activities', 'activity_links'
    ];

    const channels = WATCHED_TABLES.map(table =>
      supabase
        .channel(`realtime_${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          fetchAll();
        })
        .subscribe()
    );

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [fetchAll]);

  return (
    <PortfolioDataContext.Provider value={{ ...ctx, refetch: fetchAll }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData(): PortfolioContextType {
  return useContext(PortfolioDataContext);
}
