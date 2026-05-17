import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ArrayEditor, { PairEditor } from '../components/ArrayEditor';
import ImageUpload from '../components/ImageUpload';
import { Plus, Pencil, Trash2, ChevronLeft, Eye } from 'lucide-react';
import type { Experience } from '../../../lib/types';

type Mode = 'list' | 'edit' | 'create';

const empty = () => ({
  slug: '', role: '', company: '', period: '', location: '',
  short_desc: '', long_desc: '', hero_image: '', sort_order: 0,
});

export default function ExperienceEditor({ onSaved }: { onSaved?: () => void }) {
  const [mode, setMode] = useState<Mode>('list');
  const [items, setItems] = useState<Experience[]>([]);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [form, setForm] = useState<any>(empty());
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<{ label: string; value: string }[]>([]);
  const [gallery, setGallery] = useState<{ url: string; caption: string }[]>([]);
  const { saving, saved, error, withSave } = useSaveState();

  const load = async () => {
    const { data } = await supabase.from('experiences').select('*').order('sort_order');
    setItems(data || []);
  };

  useEffect(() => { load(); }, []);

  const openEdit = async (exp: Experience) => {
    setSelected(exp);
    setForm({ ...exp });
    const [r, t, m, g] = await Promise.all([
      supabase.from('experience_responsibilities').select('*').eq('experience_id', exp.id).order('sort_order'),
      supabase.from('experience_technologies').select('*').eq('experience_id', exp.id).order('sort_order'),
      supabase.from('experience_metrics').select('*').eq('experience_id', exp.id).order('sort_order'),
      supabase.from('experience_gallery').select('*').eq('experience_id', exp.id).order('sort_order'),
    ]);
    setResponsibilities((r.data || []).map(x => x.description));
    setTechnologies((t.data || []).map(x => x.tech));
    setMetrics((m.data || []).map(x => ({ label: x.label, value: x.value })));
    setGallery((g.data || []).map(x => ({ url: x.url, caption: x.caption })));
    setMode('edit');
  };

  const openCreate = () => {
    setSelected(null);
    setForm(empty());
    setResponsibilities([]); setTechnologies([]); setMetrics([]); setGallery([]);
    setMode('create');
  };

  const saveRelations = async (id: string) => {
    await supabase.from('experience_responsibilities').delete().eq('experience_id', id);
    await supabase.from('experience_technologies').delete().eq('experience_id', id);
    await supabase.from('experience_metrics').delete().eq('experience_id', id);
    await supabase.from('experience_gallery').delete().eq('experience_id', id);
    if (responsibilities.filter(Boolean).length)
      await supabase.from('experience_responsibilities').insert(responsibilities.filter(Boolean).map((d, i) => ({ experience_id: id, description: d, sort_order: i })));
    if (technologies.filter(Boolean).length)
      await supabase.from('experience_technologies').insert(technologies.filter(Boolean).map((t, i) => ({ experience_id: id, tech: t, sort_order: i })));
    if (metrics.filter(m => m.label).length)
      await supabase.from('experience_metrics').insert(metrics.filter(m => m.label).map((m, i) => ({ experience_id: id, ...m, sort_order: i })));
    if (gallery.filter(g => g.url).length)
      await supabase.from('experience_gallery').insert(gallery.filter(g => g.url).map((g, i) => ({ experience_id: id, ...g, sort_order: i })));
  };

  const handleSave = () => withSave(async () => {
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (mode === 'create') {
      const { data, error: err } = await supabase.from('experiences').insert(payload).select().single();
      if (err) throw err;
      await saveRelations(data.id);
    } else {
      const { error: err } = await supabase.from('experiences').update(payload).eq('id', selected!.id);
      if (err) throw err;
      await saveRelations(selected!.id);
    }
    await load();
    onSaved?.();
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    await supabase.from('experiences').delete().eq('id', id);
    await load();
  };

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BOSectionHeader title="Experience" description={`${items.length} entries`} />
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#84CC16] hover:bg-[#76b814] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
        {items.map(exp => (
          <BOCard key={exp.id} className="flex items-center gap-4">
            {exp.hero_image && <img src={exp.hero_image} alt={exp.company} className="w-20 h-14 rounded-lg object-cover shrink-0 border border-[#2a2a2a]" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e5e5e5]">{exp.role}</p>
              <p className="text-xs text-[#555] mt-0.5">{exp.company} · {exp.period} · {exp.location}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/experience/${exp.slug}`} target="_blank" className="p-2 text-[#555] hover:text-[#e5e5e5]"><Eye className="w-4 h-4" /></a>
              <button onClick={() => openEdit(exp)} className="p-2 text-[#555] hover:text-[#84CC16]"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(exp.id)} className="p-2 text-[#555] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
        <h2 className="text-lg font-semibold text-[#e5e5e5]">{mode === 'create' ? 'New Experience' : `Edit: ${form.role}`}</h2>
      </div>
      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Basic Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Role / Title"><BOInput value={form.role} onChange={set('role')} placeholder="Senior Product Designer" /></BOField>
          <BOField label="Slug"><BOInput value={form.slug} onChange={v => set('slug')(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} placeholder="linear-senior-product-designer" /></BOField>
          <BOField label="Company"><BOInput value={form.company} onChange={set('company')} placeholder="Linear" /></BOField>
          <BOField label="Period"><BOInput value={form.period} onChange={set('period')} placeholder="2023 — Present" /></BOField>
          <BOField label="Location"><BOInput value={form.location} onChange={set('location')} placeholder="San Francisco, CA" /></BOField>
          <BOField label="Sort Order"><BOInput value={String(form.sort_order)} onChange={v => set('sort_order')(Number(v))} type="number" /></BOField>
        </div>
        <div className="space-y-4 mt-4">
          <BOField label="Short Description"><BOInput value={form.short_desc} onChange={set('short_desc')} rows={2} /></BOField>
          <BOField label="Long Description"><BOInput value={form.long_desc} onChange={set('long_desc')} rows={4} /></BOField>
        </div>
      </BOCard>

      <BOCard><ImageUpload value={form.hero_image} onChange={set('hero_image')} label="Hero Image" /></BOCard>

      <BOCard><ArrayEditor label="Responsibilities" items={responsibilities} onChange={setResponsibilities} placeholder="Led the design of..." addLabel="Add responsibility" /></BOCard>
      <BOCard><ArrayEditor label="Technologies" items={technologies} onChange={setTechnologies} placeholder="Figma" addLabel="Add technology" /></BOCard>
      <BOCard><PairEditor label="Metrics" items={metrics} onChange={setMetrics} labelPlaceholder="Component Adoption" valuePlaceholder="95%" addLabel="Add metric" /></BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Gallery</h3>
        {gallery.map((g, i) => (
          <div key={i} className="border border-[#2a2a2a] rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555]">Photo {i + 1}</span>
              <button onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))} className="text-[#555] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <ImageUpload value={g.url} onChange={url => { const n = [...gallery]; n[i].url = url; setGallery(n); }} label="Image" />
            <div className="mt-2"><BOInput value={g.caption} onChange={cap => { const n = [...gallery]; n[i].caption = cap; setGallery(n); }} placeholder="Caption" /></div>
          </div>
        ))}
        <button onClick={() => setGallery([...gallery, { url: '', caption: '' }])} className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
          <Plus className="w-3.5 h-3.5" /> Add photo
        </button>
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} label={mode === 'create' ? 'Create Experience' : 'Save Changes'} />
    </div>
  );
}
