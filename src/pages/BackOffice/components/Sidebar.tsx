import React from 'react';
import type { BOSection } from '../index';
import {
  Settings, Layout, Briefcase, BookOpen, Award,
  BarChart3, Navigation, Mail, Layers, FileText, Images
} from 'lucide-react';

interface SidebarProps {
  activeSection: BOSection;
  onSelect: (s: BOSection) => void;
}

const SECTIONS: { id: BOSection; label: string; icon: React.ElementType<{ className?: string }>; group: string }[] = [
  { id: 'site-settings', label: 'Site Settings', icon: Settings, group: 'Global' },
  { id: 'hero', label: 'Hero Section', icon: Layout, group: 'Global' },
  { id: 'stats', label: 'Stats', icon: BarChart3, group: 'Global' },
  { id: 'navigation', label: 'Navigation', icon: Navigation, group: 'Global' },
  { id: 'contact', label: 'Contact / Footer', icon: Mail, group: 'Global' },
  { id: 'explorations', label: 'Explorations Gallery', icon: Images, group: 'Global' },
  { id: 'resume', label: 'Resume / About', icon: FileText, group: 'Content' },
  { id: 'projects', label: 'Projects', icon: Briefcase, group: 'Content' },
  { id: 'posts', label: 'Journal & Activities', icon: BookOpen, group: 'Content' },
  { id: 'experience', label: 'Experience', icon: Award, group: 'Content' },
  { id: 'academic', label: 'Academic', icon: Layers, group: 'Content' },
];

const groups = ['Global', 'Content'];

export default function Sidebar({ activeSection, onSelect }: SidebarProps) {
  return (
    <aside className="h-full bg-[#111111] border-r border-[#1e1e1e] overflow-y-auto py-4">
      {groups.map(group => (
        <div key={group} className="mb-4">
          <p className="text-[10px] font-semibold text-[#444] uppercase tracking-widest px-4 mb-1">
            {group}
          </p>
          {SECTIONS.filter(s => s.group === group).map(section => {
            const Icon = section.icon;
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSelect(section.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors text-left ${
                  active
                    ? 'text-[#84CC16] bg-[#84CC16]/8'
                    : 'text-[#888] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#84CC16]' : ''}`} />
                <span>{section.label}</span>
                {active && <div className="ml-auto w-1 h-4 rounded-full bg-[#84CC16]" />}
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
