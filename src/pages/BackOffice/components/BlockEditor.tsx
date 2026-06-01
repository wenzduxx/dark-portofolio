import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { BOField, BOInput } from './BOUtils';
import ImageUpload from './ImageUpload';
import ArrayEditor, { PairEditor } from './ArrayEditor';
import type { Block, BlockType } from '../../../lib/blocks';
import { newBlock, cloneBlock, BLOCK_TYPES, BLOCK_CATEGORIES } from './blockDefaults';

const inputCls =
  'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors';

const ALIGN_OPTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
];

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[#888] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-[#84CC16]"
      />
      {label}
    </label>
  );
}

// ── Per-type field editors ────────────────────────────────────────────────
function BlockFields({
  block,
  update,
  bucket,
}: {
  block: any;
  update: (patch: any) => void;
  bucket: string;
}) {
  switch (block.type as BlockType) {
    case 'heading':
      return (
        <div className="grid grid-cols-2 gap-3">
          <BOField label="Level">
            <Select
              value={String(block.level)}
              onChange={(v) => update({ level: Number(v) })}
              options={[
                { value: '2', label: 'H2 — large' },
                { value: '3', label: 'H3 — medium' },
                { value: '4', label: 'H4 — small' },
              ]}
            />
          </BOField>
          <BOField label="Align">
            <Select value={block.align || 'left'} onChange={(v) => update({ align: v })} options={ALIGN_OPTS} />
          </BOField>
          <div className="col-span-2">
            <BOField label="Text">
              <BOInput value={block.text} onChange={(v) => update({ text: v })} placeholder="Section heading" />
            </BOField>
          </div>
        </div>
      );

    case 'paragraph':
      return (
        <div className="space-y-3">
          <BOField label="Text" hint="Markdown: **bold**, _italic_, [link](url), lists, `code`">
            <BOInput value={block.text} onChange={(v) => update({ text: v })} rows={4} placeholder="Write your paragraph..." />
          </BOField>
          <div className="flex items-center gap-6">
            <Check checked={!!block.dropcap} onChange={(v) => update({ dropcap: v })} label="Drop cap" />
            <div className="flex items-center gap-2 text-xs text-[#888]">
              <span>Align</span>
              <div className="w-28">
                <Select value={block.align || 'left'} onChange={(v) => update({ align: v })} options={ALIGN_OPTS} />
              </div>
            </div>
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-3">
          <BOField label="Quote">
            <BOInput value={block.text} onChange={(v) => update({ text: v })} rows={3} placeholder="The memorable line..." />
          </BOField>
          <BOField label="Attribution (optional)">
            <BOInput value={block.attribution || ''} onChange={(v) => update({ attribution: v })} placeholder="Jane Doe, CEO" />
          </BOField>
        </div>
      );

    case 'callout':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <BOField label="Style">
              <Select
                value={block.variant}
                onChange={(v) => update({ variant: v })}
                options={[
                  { value: 'info', label: 'Info' },
                  { value: 'impact', label: 'Impact (accent)' },
                  { value: 'warning', label: 'Warning' },
                ]}
              />
            </BOField>
            <BOField label="Title (optional)">
              <BOInput value={block.title || ''} onChange={(v) => update({ title: v })} placeholder="Impact & Outcomes" />
            </BOField>
          </div>
          <BOField label="Text" hint="Markdown supported">
            <BOInput value={block.text} onChange={(v) => update({ text: v })} rows={3} placeholder="The key takeaway..." />
          </BOField>
        </div>
      );

    case 'list':
      return (
        <div className="space-y-3">
          <Check checked={!!block.ordered} onChange={(v) => update({ ordered: v })} label="Numbered list" />
          <ArrayEditor label="Items" items={block.items || []} onChange={(items) => update({ items })} placeholder="List item" addLabel="Add item" />
        </div>
      );

    case 'divider':
      return <p className="text-xs text-[#555]">No options — renders a decorative separator.</p>;

    case 'image':
      return (
        <div className="space-y-3">
          <ImageUpload value={block.url} onChange={(url) => update({ url })} label="Image" bucket={bucket} />
          <BOField label="Caption (optional)">
            <BOInput value={block.caption || ''} onChange={(v) => update({ caption: v })} placeholder="Image caption" />
          </BOField>
          <div className="grid grid-cols-2 gap-3 items-end">
            <BOField label="Width">
              <Select
                value={block.width}
                onChange={(v) => update({ width: v })}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'wide', label: 'Wide' },
                  { value: 'full', label: 'Full width' },
                ]}
              />
            </BOField>
            <Check checked={block.rounded !== false} onChange={(v) => update({ rounded: v })} label="Rounded corners" />
          </div>
        </div>
      );

    case 'gallery': {
      const imgs: { url: string; caption?: string }[] = block.images || [];
      const setImgs = (n: typeof imgs) => update({ images: n });
      return (
        <div className="space-y-3">
          <BOField label="Layout">
            <Select
              value={block.layout}
              onChange={(v) => update({ layout: v })}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'carousel', label: 'Carousel' },
                { value: 'masonry', label: 'Masonry' },
              ]}
            />
          </BOField>
          {imgs.map((im, idx) => (
            <div key={idx} className="border border-[#2a2a2a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#555]">Image {idx + 1}</span>
                <button onClick={() => setImgs(imgs.filter((_, i) => i !== idx))} className="text-[#555] hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <ImageUpload value={im.url} onChange={(url) => setImgs(imgs.map((x, i) => (i === idx ? { ...x, url } : x)))} label="Image" bucket={bucket} />
              <div className="mt-2">
                <BOInput value={im.caption || ''} onChange={(cap) => setImgs(imgs.map((x, i) => (i === idx ? { ...x, caption: cap } : x)))} placeholder="Caption" />
              </div>
            </div>
          ))}
          <button onClick={() => setImgs([...imgs, { url: '', caption: '' }])} className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
            <Plus className="w-3.5 h-3.5" /> Add image
          </button>
        </div>
      );
    }

    case 'video':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <BOField label="Provider">
              <Select
                value={block.provider}
                onChange={(v) => update({ provider: v })}
                options={[
                  { value: 'youtube', label: 'YouTube' },
                  { value: 'vimeo', label: 'Vimeo' },
                  { value: 'file', label: 'Direct file (.mp4)' },
                ]}
              />
            </BOField>
            <BOField label="Caption (optional)">
              <BOInput value={block.caption || ''} onChange={(v) => update({ caption: v })} placeholder="Caption" />
            </BOField>
          </div>
          <BOField label="URL" hint="Paste the full video URL or file link">
            <BOInput value={block.url} onChange={(v) => update({ url: v })} placeholder="https://youtube.com/watch?v=..." />
          </BOField>
        </div>
      );

    case 'embed':
      return (
        <div className="space-y-3">
          <BOField label="Embed URL" hint="CodePen, Figma, Maps, etc. (must allow embedding)">
            <BOInput value={block.url} onChange={(v) => update({ url: v })} placeholder="https://..." />
          </BOField>
          <BOField label="Height (px)">
            <BOInput value={String(block.height || 480)} onChange={(v) => update({ height: Number(v) || 480 })} type="number" />
          </BOField>
        </div>
      );

    case 'code':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <BOField label="Language" hint="e.g. tsx, python, bash">
              <BOInput value={block.language} onChange={(v) => update({ language: v })} placeholder="tsx" />
            </BOField>
            <BOField label="Filename (optional)">
              <BOInput value={block.filename || ''} onChange={(v) => update({ filename: v })} placeholder="App.tsx" />
            </BOField>
          </div>
          <BOField label="Code">
            <textarea
              value={block.code}
              onChange={(e) => update({ code: e.target.value })}
              rows={8}
              spellCheck={false}
              placeholder="// your source code"
              className={inputCls + ' font-mono resize-y'}
            />
          </BOField>
        </div>
      );

    case 'techStack':
      return <ArrayEditor label="Technologies" items={block.items || []} onChange={(items) => update({ items })} placeholder="React" addLabel="Add technology" />;

    case 'buttons': {
      const items: any[] = block.items || [];
      const setItems = (n: any[]) => update({ items: n });
      return (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="border border-[#2a2a2a] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#555]">Button {idx + 1}</span>
                <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-[#555] hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <BOInput value={it.label} onChange={(v) => setItems(items.map((x, i) => (i === idx ? { ...x, label: v } : x)))} placeholder="Button label (e.g. View Source)" />
              <BOInput value={it.url} onChange={(v) => setItems(items.map((x, i) => (i === idx ? { ...x, url: v } : x)))} placeholder="https://github.com/..." />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={it.variant || 'primary'}
                  onChange={(v) => setItems(items.map((x, i) => (i === idx ? { ...x, variant: v } : x)))}
                  options={[
                    { value: 'primary', label: 'Primary (filled)' },
                    { value: 'ghost', label: 'Ghost (outline)' },
                  ]}
                />
                <Select
                  value={it.icon || 'link'}
                  onChange={(v) => setItems(items.map((x, i) => (i === idx ? { ...x, icon: v } : x)))}
                  options={[
                    { value: 'link', label: 'Link icon' },
                    { value: 'live', label: 'Live / external' },
                    { value: 'github', label: 'GitHub' },
                    { value: 'download', label: 'Download' },
                  ]}
                />
              </div>
            </div>
          ))}
          <button onClick={() => setItems([...items, { label: '', url: '', variant: 'primary', icon: 'link' }])} className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
            <Plus className="w-3.5 h-3.5" /> Add button
          </button>
        </div>
      );
    }

    case 'stats':
      return (
        <PairEditor
          label="Stats"
          items={(block.items || []).map((s: any) => ({ label: s.label, value: s.value }))}
          onChange={(items) => update({ items: items.map((i) => ({ label: i.label, value: i.value })) })}
          labelPlaceholder="Label e.g. Users"
          valuePlaceholder="Value e.g. +140%"
          addLabel="Add stat"
        />
      );

    case 'columns':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#2a2a2a] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#555] mb-2">Left column</div>
            <BlockEditor value={block.left || []} onChange={(left) => update({ left })} bucket={bucket} label="" />
          </div>
          <div className="border border-[#2a2a2a] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#555] mb-2">Right column</div>
            <BlockEditor value={block.right || []} onChange={(right) => update({ right })} bucket={bucket} label="" />
          </div>
        </div>
      );

    case 'table': {
      const headers: string[] = block.headers || [];
      const rows: string[][] = block.rows || [];
      const cols = Math.max(headers.length, 1);
      const setHeaders = (h: string[]) => update({ headers: h });
      const setRows = (r: string[][]) => update({ rows: r });
      const addColumn = () => {
        setHeaders([...headers, '']);
        setRows(rows.map((r) => [...r, '']));
      };
      const removeColumn = (ci: number) => {
        setHeaders(headers.filter((_, i) => i !== ci));
        setRows(rows.map((r) => r.filter((_, i) => i !== ci)));
      };
      const addRow = () => setRows([...rows, Array(cols).fill('')]);
      return (
        <div className="space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#555] mb-2">Headers</div>
            <div className="space-y-2">
              {headers.map((h, ci) => (
                <div key={ci} className="flex items-center gap-2">
                  <input value={h} onChange={(e) => setHeaders(headers.map((x, i) => (i === ci ? e.target.value : x)))} placeholder={`Column ${ci + 1}`} className={inputCls} />
                  <button onClick={() => removeColumn(ci)} className="p-1.5 text-[#555] hover:text-red-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addColumn} className="mt-2 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
              <Plus className="w-3.5 h-3.5" /> Add column
            </button>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#555] mb-2">Rows</div>
            <div className="space-y-2">
              {rows.map((row, ri) => (
                <div key={ri} className="flex items-center gap-2">
                  {Array.from({ length: cols }).map((_, ci) => (
                    <input
                      key={ci}
                      value={row[ci] || ''}
                      onChange={(e) => setRows(rows.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? e.target.value : c)) : r)))}
                      placeholder={`R${ri + 1}C${ci + 1}`}
                      className={inputCls}
                    />
                  ))}
                  <button onClick={() => setRows(rows.filter((_, i) => i !== ri))} className="p-1.5 text-[#555] hover:text-red-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addRow} className="mt-2 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
              <Plus className="w-3.5 h-3.5" /> Add row
            </button>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

// ── Add-block popover ───────────────────────────────────────────────────────
function AddBlockMenu({ onAdd }: { onAdd: (t: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add block
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-72 bg-[#111111] border border-[#2a2a2a] rounded-xl p-2 shadow-2xl">
            {BLOCK_CATEGORIES.map((cat) => (
              <div key={cat} className="mb-2 last:mb-0">
                <div className="text-[10px] uppercase tracking-wider text-[#555] px-2 py-1">{cat}</div>
                <div className="grid grid-cols-2 gap-1">
                  {BLOCK_TYPES.filter((t) => t.category === cat).map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.type}
                        onClick={() => {
                          onAdd(t.type);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-[#bbb] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors text-left"
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────
export default function BlockEditor({
  value,
  onChange,
  bucket = 'general',
  label = 'Content blocks',
}: {
  value: Block[];
  onChange: (b: Block[]) => void;
  bucket?: string;
  label?: string;
}) {
  const blocks = value || [];
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const addBlock = (type: BlockType) => onChange([...blocks, newBlock(type)]);
  const updateAt = (i: number, patch: any) =>
    onChange(blocks.map((b, idx) => (idx === i ? ({ ...b, ...patch } as Block) : b)));
  const removeAt = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));
  const duplicateAt = (i: number) => {
    const n = [...blocks];
    n.splice(i + 1, 0, cloneBlock(blocks[i]));
    onChange(n);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const n = [...blocks];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  const labelFor = (t: BlockType) => BLOCK_TYPES.find((b) => b.type === t)?.label || t;
  const iconFor = (t: BlockType) => BLOCK_TYPES.find((b) => b.type === t)?.icon;

  return (
    <div>
      {label !== '' && (
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs text-[#888]">{label}</label>
          <span className="text-[10px] text-[#555]">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((b, i) => {
          const isCollapsed = collapsed[b.id];
          const Icon = iconFor(b.type);
          return (
            <div key={b.id} className="border border-[#2a2a2a] rounded-xl bg-[#0d0d0d] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border-b border-[#2a2a2a]">
                <GripVertical className="w-3.5 h-3.5 text-[#444] shrink-0" />
                {Icon && <Icon className="w-3.5 h-3.5 text-[#84CC16] shrink-0" />}
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [b.id]: !c[b.id] }))}
                  className="flex items-center gap-1 text-xs font-medium text-[#e5e5e5] hover:text-white"
                >
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {labelFor(b.type)}
                </button>
                <div className="flex-1" />
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-[#555] hover:text-[#e5e5e5] disabled:opacity-30">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="p-1 text-[#555] hover:text-[#e5e5e5] disabled:opacity-30">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => duplicateAt(i)} className="p-1 text-[#555] hover:text-[#84CC16]" title="Duplicate">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeAt(i)} className="p-1 text-[#555] hover:text-red-400" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {!isCollapsed && (
                <div className="p-4">
                  <BlockFields block={b} update={(patch) => updateAt(i, patch)} bucket={bucket} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {blocks.length === 0 && label !== '' && (
        <p className="text-xs text-[#555] py-3">No blocks yet — add your first below.</p>
      )}

      <div className="mt-3">
        <AddBlockMenu onAdd={addBlock} />
      </div>
    </div>
  );
}
