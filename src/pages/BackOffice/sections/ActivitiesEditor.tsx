import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import { PairEditor } from '../components/ArrayEditor';
import ImageUpload from '../components/ImageUpload';
import { Plus, Pencil, Trash2, ChevronLeft, Eye } from 'lucide-react';
import type { Activity } from '../../../lib/types';

type Mode = 'list' | 'edit' | 'create';
const empty = () => ({ slug: '', title: '', type: 'Experiment' as const, status: '', date: '', description: '', long_description: '', impact: '', image_url: '', sort_order: 0 });

export default function ActivitiesEditor({ onSaved }: { onSaved?: () => void }) {
  const [mode, setMode] = useState<Mode>('list');
  const [items, setItems] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [form, setForm] = useState<any>(empty());
  const [links, setLinks] = useState<{ label: string; value: string }[]>([]);
  const { saving, saved, error, withSave } = useSaveState();

  const load = async () => {
    const { data } = await supabase.from('activities').select('*').order('sort_order');
    setItems(data || []);
  };

  useEffect(() => { load(); }, []);

  const openEdit = async (act: Activity) => {
    setSelected(act); setForm({ ...act });
    const { data } = await supabase.from('activity_links').select('*').eq('activity_id', act.id).order('sort_order');
    setLinks((data || []).map(l => ({ label: l.label, value: l.url })));
    setMode('edit');
  };

  const openCreate = () => { setSelected(null); setForm(empty()); setLinks([]); setMode('create'); };

  const saveRelations = async (id: string) => {
    await supabase.from('activity_links').delete().eq('activity_id', id);
    if (links.filter(l => l.label).length)
      await supabase.from('activity_links').insert(links.filter(l => l.label).map((l, i) => ({ activity_id: id, label: l.label, url: l.value, sort_order: i })));
  };

  const handleSave = () => withSave(async () => {
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (mode === 'create') {
      const { data, error: err } = await supabase.from('activities').insert(payload).select().single();
      if (err) throw err;
      await saveRelations(data.id);
    } else {
      const { error: err } = await supabase.from('activities').update(payload).eq('id', selected!.id);
      if (err) throw err;
      await saveRelations(selected!.id);
    }
    await load();
    onSaved?.();
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('activities').delete().eq('id', id);
    await load();
  };

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const TYPE_BADGE: Record<string, string> = { Insight: 'bg-blue-500/20 text-blue-400', Event: 'bg-purple-500/20 text-purple-400', Experiment: 'bg-yellow-500/20 text-yellow-400' };

  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BOSectionHeader title="Activities & Explorations" description={`${items.length} entries`} />
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#84CC16] hover:bg-[#76b814] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Activity
          </button>
        </div>
        {items.map(act => (
          <BOCard key={act.id} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#e5e5e5]">{act.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_BADGE[act.type] || ''}`}>{act.type}</span>
              </div>
              <p className="text-xs text-[#555] mt-0.5">{act.status} · {act.date}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/activity/${act.slug}`} target="_blank" className="p-2 text-[#555] hover:text-[#e5e5e5]"><Eye className="w-4 h-4" /></a>
              <button onClick={() => openEdit(act)} className="p-2 text-[#555] hover:text-[#84CC16]"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(act.id)} className="p-2 text-[#555] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </BOCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#e5e5e5]"><ChevronLeft className="w-4 h-4" /> Back</button>
        <span className="text-[#333]">/</span>
        <h2 className="text-lg font-semibold text-[#e5e5e5]">{mode === 'create' ? 'New Activity' : `Edit: ${form.title}`}</h2>
      </div>
      {error && <BOAlert message={error} />}
      <BOCard>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Title"><BOInput value={form.title} onChange={set('title')} placeholder="Generative Design Patterns" /></BOField>
          <BOField label="Slug"><BOInput value={form.slug} onChange={v => set('slug')(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} /></BOField>
          <BOField label="Type">
            <select value={form.type} onChange={e => set('type')(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16]">
              <option>Insight</option><option>Event</option><option>Experiment</option>
            </select>
          </BOField>
          <BOField label="Status"><BOInput value={form.status} onChange={set('status')} placeholder="In Progress" /></BOField>
          <BOField label="Date"><BOInput value={form.date} onChange={set('date')} placeholder="Spring 2024" /></BOField>
          <BOField label="Sort Order"><BOInput value={String(form.sort_order)} onChange={v => set('sort_order')(Number(v))} type="number" /></BOField>
        </div>
        <div className="space-y-4 mt-4">
          <BOField label="Short Description"><BOInput value={form.description} onChange={set('description')} rows={2} /></BOField>
          <BOField label="Long Description"><BOInput value={form.long_description} onChange={set('long_description')} rows={4} /></BOField>
          <BOField label="Impact (optional)"><BOInput value={form.impact || ''} onChange={set('impact')} rows={2} /></BOField>
          <ImageUpload value={form.image_url || ''} onChange={set('image_url')} label="Cover Image" bucket="activities" />
        </div>
      </BOCard>
      <BOCard>
        <PairEditor label="Links" items={links} onChange={setLinks} labelPlaceholder="Link label" valuePlaceholder="https://..." addLabel="Add link" />
      </BOCard>
      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} label={mode === 'create' ? 'Create Activity' : 'Save Changes'} />
    </div>
  );
}
