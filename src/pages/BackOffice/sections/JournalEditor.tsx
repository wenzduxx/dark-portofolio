import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ArrayEditor from '../components/ArrayEditor';
import ImageUpload from '../components/ImageUpload';
import { Plus, Pencil, Trash2, ChevronLeft, Eye } from 'lucide-react';
import type { JournalEntry } from '../../../lib/types';

type Mode = 'list' | 'edit' | 'create';

const empty = () => ({
  slug: '', title: '', category: '', date: '', reading_time: '5 min read',
  hero_image: '', excerpt: '', is_featured: false, sort_order: 0,
});

export default function JournalEditor({ onSaved }: { onSaved?: () => void }) {
  const [mode, setMode] = useState<Mode>('list');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState<any>(empty());
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const { saving, saved, error, withSave } = useSaveState();

  const load = async () => {
    const { data } = await supabase.from('journal_entries').select('*').order('sort_order');
    setEntries(data || []);
  };

  useEffect(() => { load(); }, []);

  const openEdit = async (e: JournalEntry) => {
    setSelected(e);
    setForm({ ...e });
    const [c, t] = await Promise.all([
      supabase.from('journal_content').select('*').eq('entry_id', e.id).order('sort_order'),
      supabase.from('journal_tags').select('*').eq('entry_id', e.id),
    ]);
    setParagraphs((c.data || []).map(p => p.paragraph));
    setTags((t.data || []).map(t => t.tag));
    setMode('edit');
  };

  const openCreate = () => {
    setSelected(null);
    setForm(empty());
    setParagraphs([]);
    setTags([]);
    setMode('create');
  };

  const saveRelations = async (entryId: string) => {
    await supabase.from('journal_content').delete().eq('entry_id', entryId);
    await supabase.from('journal_tags').delete().eq('entry_id', entryId);
    if (paragraphs.filter(Boolean).length > 0)
      await supabase.from('journal_content').insert(
        paragraphs.filter(Boolean).map((p, i) => ({ entry_id: entryId, paragraph: p, sort_order: i }))
      );
    if (tags.filter(Boolean).length > 0)
      await supabase.from('journal_tags').insert(
        tags.filter(Boolean).map(t => ({ entry_id: entryId, tag: t }))
      );
  };

  const handleSave = () => withSave(async () => {
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (mode === 'create') {
      const { data, error: err } = await supabase.from('journal_entries').insert(payload).select().single();
      if (err) throw err;
      await saveRelations(data.id);
    } else {
      const { error: err } = await supabase.from('journal_entries').update(payload).eq('id', selected!.id);
      if (err) throw err;
      await saveRelations(selected!.id);
    }
    await load();
    onSaved?.();
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;
    await supabase.from('journal_entries').delete().eq('id', id);
    await load();
  };

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BOSectionHeader title="Journal" description={`${entries.length} entries`} />
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#84CC16] hover:bg-[#76b814] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
        {entries.map(e => (
          <BOCard key={e.id} className="flex items-center gap-4">
            {e.hero_image && (
              <img src={e.hero_image} alt={e.title} className="w-20 h-14 rounded-lg object-cover shrink-0 border border-[#2a2a2a]" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#e5e5e5] truncate">{e.title}</p>
                {e.is_featured && <span className="text-[10px] bg-[#84CC16]/20 text-[#84CC16] px-1.5 py-0.5 rounded">Featured</span>}
              </div>
              <p className="text-xs text-[#555] mt-0.5">{e.category} · {e.date} · {e.reading_time}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/journal/${e.slug}`} target="_blank" className="p-2 text-[#555] hover:text-[#e5e5e5]">
                <Eye className="w-4 h-4" />
              </a>
              <button onClick={() => openEdit(e)} className="p-2 text-[#555] hover:text-[#84CC16]"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(e.id)} className="p-2 text-[#555] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </BOCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#e5e5e5]">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-[#333]">/</span>
        <h2 className="text-lg font-semibold text-[#e5e5e5]">{mode === 'create' ? 'New Entry' : `Edit: ${form.title}`}</h2>
      </div>
      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Entry Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Title"><BOInput value={form.title} onChange={set('title')} placeholder="The Future of Interface" /></BOField>
          <BOField label="Slug"><BOInput value={form.slug} onChange={v => set('slug')(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} placeholder="future-of-interface" /></BOField>
          <BOField label="Category"><BOInput value={form.category} onChange={set('category')} placeholder="Design Theory" /></BOField>
          <BOField label="Date"><BOInput value={form.date} onChange={set('date')} placeholder="Dec 14, 2024" /></BOField>
          <BOField label="Reading Time"><BOInput value={form.reading_time} onChange={set('reading_time')} placeholder="6 min read" /></BOField>
          <BOField label="Sort Order"><BOInput value={String(form.sort_order)} onChange={v => set('sort_order')(Number(v))} type="number" /></BOField>
        </div>
        <div className="mt-4">
          <BOField label="Excerpt / Preview"><BOInput value={form.excerpt} onChange={set('excerpt')} rows={2} placeholder="Short description shown in cards..." /></BOField>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input type="checkbox" id="jfeat" checked={form.is_featured} onChange={e => set('is_featured')(e.target.checked)} className="w-4 h-4 rounded accent-[#84CC16]" />
          <label htmlFor="jfeat" className="text-sm text-[#888]">Show in Featured (home page)</label>
        </div>
      </BOCard>

      <BOCard>
        <ImageUpload value={form.hero_image} onChange={set('hero_image')} label="Hero Image" />
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-2">Article Content</h3>
        <p className="text-xs text-[#555] mb-4">Each paragraph will be rendered as a separate block.</p>
        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                value={p}
                onChange={e => { const n = [...paragraphs]; n[i] = e.target.value; setParagraphs(n); }}
                rows={3}
                placeholder={`Paragraph ${i + 1}...`}
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] resize-none transition-colors"
              />
              <button onClick={() => setParagraphs(paragraphs.filter((_, idx) => idx !== i))} className="p-1.5 text-[#555] hover:text-red-400 self-start mt-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setParagraphs([...paragraphs, ''])} className="mt-2 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
          <Plus className="w-3.5 h-3.5" /> Add paragraph
        </button>
      </BOCard>

      <BOCard>
        <ArrayEditor label="Tags" items={tags} onChange={setTags} placeholder="Interface" addLabel="Add tag" />
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} label={mode === 'create' ? 'Create Entry' : 'Save Changes'} />
    </div>
  );
}
