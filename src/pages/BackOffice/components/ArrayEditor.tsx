import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ArrayEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export default function ArrayEditor({
  label, items, onChange, placeholder = 'Add item...', addLabel = 'Add'
}: ArrayEditorProps) {
  const add = () => onChange([...items, '']);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };

  return (
    <div>
      <label className="block text-xs text-[#888] mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical className="w-3.5 h-3.5 text-[#444] shrink-0" />
            <input
              type="text"
              value={item}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors"
            />
            <button
              onClick={() => remove(i)}
              className="p-1.5 text-[#555] hover:text-red-400 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="mt-2 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </button>
    </div>
  );
}

// Pair editor: label + value
interface PairEditorProps {
  label: string;
  items: { label: string; value: string }[];
  onChange: (items: { label: string; value: string }[]) => void;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
}

export function PairEditor({
  label, items, onChange, labelPlaceholder = 'Label', valuePlaceholder = 'Value', addLabel = 'Add'
}: PairEditorProps) {
  const add = () => onChange([...items, { label: '', value: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'label' | 'value', val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div>
      <label className="block text-xs text-[#888] mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item.label}
              onChange={e => update(i, 'label', e.target.value)}
              placeholder={labelPlaceholder}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors"
            />
            <input
              type="text"
              value={item.value}
              onChange={e => update(i, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors"
            />
            <button onClick={() => remove(i)} className="p-1.5 text-[#555] hover:text-red-400 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-2 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040] transition-colors">
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
