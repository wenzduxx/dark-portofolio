import React from 'react';
import { Check } from 'lucide-react';
import { BOField } from './BOUtils';
import type { Appearance } from '../../../lib/blocks';

const inputCls =
  'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors';

const SWATCHES: { color: string; name: string }[] = [
  { color: '', name: 'Default (white)' },
  { color: '#84CC16', name: 'Lime' },
  { color: '#4E85BF', name: 'Blue' },
  { color: '#8B5CF6', name: 'Violet' },
  { color: '#EC4899', name: 'Pink' },
  { color: '#EAB308', name: 'Amber' },
  { color: '#F97316', name: 'Orange' },
  { color: '#10B981', name: 'Emerald' },
];

export default function AppearanceEditor({
  value,
  onChange,
  headerStyle = true,
  decor = true,
}: {
  value: Appearance | null | undefined;
  onChange: (a: Appearance) => void;
  headerStyle?: boolean;
  decor?: boolean;
}) {
  const a = value || {};
  const set = (patch: Partial<Appearance>) => onChange({ ...a, ...patch });
  const accent = a.accentColor || '';

  return (
    <div className="space-y-5">
      <BOField label="Accent color" hint="Recolors buttons, links, callouts and highlights on this page.">
        <div className="flex flex-wrap items-center gap-2">
          {SWATCHES.map((s) => {
            const active = accent.toLowerCase() === s.color.toLowerCase();
            return (
              <button
                key={s.name}
                title={s.name}
                onClick={() => set({ accentColor: s.color })}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-transform hover:scale-110 ${
                  active ? 'border-white' : 'border-[#2a2a2a]'
                }`}
                style={{ background: s.color || 'linear-gradient(135deg,#f5f5f5,#999)' }}
              >
                {active && <Check className="w-4 h-4 text-black/70" />}
              </button>
            );
          })}
          <div className="flex items-center gap-2 ml-1">
            <input
              type="color"
              value={accent || '#ffffff'}
              onChange={(e) => set({ accentColor: e.target.value })}
              className="w-8 h-8 rounded bg-transparent border border-[#2a2a2a] cursor-pointer"
              title="Custom color"
            />
            <input
              type="text"
              value={accent}
              onChange={(e) => set({ accentColor: e.target.value })}
              placeholder="#84CC16"
              className={inputCls + ' w-28 font-mono'}
            />
          </div>
        </div>
      </BOField>

      <div className="grid grid-cols-2 gap-4">
        {headerStyle && (
          <BOField label="Header style">
            <select value={a.headerStyle || 'left'} onChange={(e) => set({ headerStyle: e.target.value as Appearance['headerStyle'] })} className={inputCls}>
              <option value="left">Left aligned</option>
              <option value="centered">Centered</option>
              <option value="full-hero">Full-bleed hero</option>
            </select>
          </BOField>
        )}
        <BOField label="Content width">
          <select value={a.contentWidth || 'narrow'} onChange={(e) => set({ contentWidth: e.target.value as Appearance['contentWidth'] })} className={inputCls}>
            <option value="narrow">Narrow (focused reading)</option>
            <option value="wide">Wide</option>
          </select>
        </BOField>
      </div>

      {decor && (
        <label className="flex items-center gap-2 text-sm text-[#888] cursor-pointer">
          <input
            type="checkbox"
            checked={a.showDecor !== false}
            onChange={(e) => set({ showDecor: e.target.checked })}
            className="w-4 h-4 rounded accent-[#84CC16]"
          />
          Show decorative graphics
        </label>
      )}
    </div>
  );
}
