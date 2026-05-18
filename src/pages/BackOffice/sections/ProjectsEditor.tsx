import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ArrayEditor, { PairEditor } from '../components/ArrayEditor';
import ImageUpload from '../components/ImageUpload';
import { Plus, Pencil, Trash2, ChevronLeft, Eye } from 'lucide-react';
import type { Project } from '../../../lib/types';

type Mode = 'list' | 'edit' | 'create';

const emptyProject = () => ({
  slug: '', title: '', category: '', year: '', client: '', role: '',
  hero_image: '', description: '',
  background_title: 'Background', background_content: '',
  problem_title: 'The Problem', problem_content: '',
  solution_title: 'The Solution', solution_content: '',
  methodology_description: '', technical_details: '',
  outcomes_description: '', is_featured: false, grid_col_span: 'md:col-span-7', sort_order: 0,
});

export default function ProjectsEditor({ onSaved }: { onSaved?: () => void }) {
  const [mode, setMode] = useState<Mode>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [form, setForm] = useState<any>(emptyProject());
  const [techStack, setTechStack] = useState<string[]>([]);
  const [phases, setPhases] = useState<{ name: string; description: string }[]>([]);
  const [metrics, setMetrics] = useState<{ label: string; value: string }[]>([]);
  const [visuals, setVisuals] = useState<{ url: string; caption: string }[]>([]);
  const { saving, saved, error, withSave, setError } = useSaveState();

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('sort_order');
    setProjects(data || []);
  };

  useEffect(() => { loadProjects(); }, []);

  const openEdit = async (p: Project) => {
    setSelected(p);
    setForm({ ...p });
    const [ts, ph, me, vi] = await Promise.all([
      supabase.from('project_tech_stack').select('*').eq('project_id', p.id).order('sort_order'),
      supabase.from('project_methodology_phases').select('*').eq('project_id', p.id).order('sort_order'),
      supabase.from('project_metrics').select('*').eq('project_id', p.id).order('sort_order'),
      supabase.from('project_visuals').select('*').eq('project_id', p.id).order('sort_order'),
    ]);
    setTechStack((ts.data || []).map(t => t.tech));
    setPhases((ph.data || []).map(p => ({ name: p.name, description: p.description })));
    setMetrics((me.data || []).map(m => ({ label: m.label, value: m.value })));
    setVisuals((vi.data || []).map(v => ({ url: v.url, caption: v.caption })));
    setMode('edit');
  };

  const openCreate = () => {
    setSelected(null);
    setForm(emptyProject());
    setTechStack([]); setPhases([]); setMetrics([]); setVisuals([]);
    setMode('create');
  };

  const saveRelations = async (projectId: string) => {
    await supabase.from('project_tech_stack').delete().eq('project_id', projectId);
    await supabase.from('project_methodology_phases').delete().eq('project_id', projectId);
    await supabase.from('project_metrics').delete().eq('project_id', projectId);
    await supabase.from('project_visuals').delete().eq('project_id', projectId);

    if (techStack.length > 0)
      await supabase.from('project_tech_stack').insert(techStack.filter(Boolean).map((t, i) => ({ project_id: projectId, tech: t, sort_order: i })));
    if (phases.length > 0)
      await supabase.from('project_methodology_phases').insert(phases.filter(p => p.name).map((p, i) => ({ project_id: projectId, ...p, sort_order: i })));
    if (metrics.length > 0)
      await supabase.from('project_metrics').insert(metrics.filter(m => m.label).map((m, i) => ({ project_id: projectId, ...m, sort_order: i })));
    if (visuals.length > 0)
      await supabase.from('project_visuals').insert(visuals.filter(v => v.url).map((v, i) => ({ project_id: projectId, ...v, sort_order: i })));
  };

  const handleSave = () => withSave(async () => {
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (mode === 'create') {
      const { data, error: err } = await supabase.from('projects').insert(payload).select().single();
      if (err) throw err;
      await saveRelations(data.id);
    } else {
      const { error: err } = await supabase.from('projects').update(payload).eq('id', selected!.id);
      if (err) throw err;
      await saveRelations(selected!.id);
    }
    await loadProjects();
    onSaved?.();
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    await loadProjects();
  };

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BOSectionHeader title="Projects" description={`${projects.length} project(s) total`} />
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#84CC16] hover:bg-[#76b814] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
        {projects.length === 0 && (
          <BOCard><p className="text-sm text-[#555] text-center py-8">No projects yet. Create your first one!</p></BOCard>
        )}
        {projects.map(p => (
          <BOCard key={p.id} className="flex items-center gap-4">
            {p.hero_image && (
              <img src={p.hero_image} alt={p.title} className="w-20 h-14 rounded-lg object-cover shrink-0 border border-[#2a2a2a]" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#e5e5e5] truncate">{p.title}</p>
                {p.is_featured && <span className="text-[10px] bg-[#84CC16]/20 text-[#84CC16] px-1.5 py-0.5 rounded">Featured</span>}
              </div>
              <p className="text-xs text-[#555] mt-0.5">{p.category} · {p.year} · {p.client}</p>
              <p className="text-xs text-[#444] mt-0.5 font-mono">/{p.slug}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/project/${p.slug}`} target="_blank" className="p-2 text-[#555] hover:text-[#e5e5e5] transition-colors">
                <Eye className="w-4 h-4" />
              </a>
              <button onClick={() => openEdit(p)} className="p-2 text-[#555] hover:text-[#84CC16] transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 text-[#555] hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </BOCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#e5e5e5] transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-[#333]">/</span>
        <h2 className="text-lg font-semibold text-[#e5e5e5]">{mode === 'create' ? 'New Project' : `Edit: ${form.title}`}</h2>
      </div>

      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Basic Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Title"><BOInput value={form.title} onChange={set('title')} placeholder="Automotive Motion" /></BOField>
          <BOField label="Slug (URL)" hint="/project/your-slug">
            <BOInput value={form.slug} onChange={(v) => set('slug')(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} placeholder="automotive-motion" />
          </BOField>
          <BOField label="Category"><BOInput value={form.category} onChange={set('category')} placeholder="Motion Design" /></BOField>
          <BOField label="Year"><BOInput value={form.year} onChange={set('year')} placeholder="2024" /></BOField>
          <BOField label="Client"><BOInput value={form.client} onChange={set('client')} placeholder="Porsche Digital" /></BOField>
          <BOField label="Your Role"><BOInput value={form.role} onChange={set('role')} placeholder="Lead Visual Designer" /></BOField>
        </div>
        <div className="mt-4">
          <BOField label="Short Description">
            <BOInput value={form.description} onChange={set('description')} placeholder="A high-performance digital showcase..." rows={2} />
          </BOField>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <BOField label="Grid Col Span (Home page)" hint="md:col-span-7 or md:col-span-5">
            <select value={form.grid_col_span} onChange={e => set('grid_col_span')(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16]">
              <option value="md:col-span-7">Wide (7/12)</option>
              <option value="md:col-span-5">Narrow (5/12)</option>
              <option value="md:col-span-12">Full (12/12)</option>
              <option value="md:col-span-6">Half (6/12)</option>
            </select>
          </BOField>
          <BOField label="Sort Order"><BOInput value={String(form.sort_order)} onChange={v => set('sort_order')(Number(v))} placeholder="0" type="number" /></BOField>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => set('is_featured')(e.target.checked)}
            className="w-4 h-4 rounded accent-[#84CC16]" />
          <label htmlFor="featured" className="text-sm text-[#888]">Show in Featured (home page grid)</label>
        </div>
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Hero Image</h3>
        <ImageUpload value={form.hero_image} onChange={set('hero_image')} label="Hero Image URL" bucket="projects" />
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Case Study Content</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <BOField label="Background Title"><BOInput value={form.background_title} onChange={set('background_title')} /></BOField>
            <BOField label="Background Content"><BOInput value={form.background_content} onChange={set('background_content')} rows={3} /></BOField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <BOField label="Problem Title"><BOInput value={form.problem_title} onChange={set('problem_title')} /></BOField>
            <BOField label="Problem Content"><BOInput value={form.problem_content} onChange={set('problem_content')} rows={3} /></BOField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <BOField label="Solution Title"><BOInput value={form.solution_title} onChange={set('solution_title')} /></BOField>
            <BOField label="Solution Content"><BOInput value={form.solution_content} onChange={set('solution_content')} rows={3} /></BOField>
          </div>
          <BOField label="Methodology Description (optional)">
            <BOInput value={form.methodology_description || ''} onChange={set('methodology_description')} rows={2} placeholder="Our approach merged..." />
          </BOField>
          <BOField label="Technical Details">
            <BOInput value={form.technical_details} onChange={set('technical_details')} rows={2} placeholder="Leveraged custom shaders..." />
          </BOField>
          <BOField label="Outcomes Description (optional)">
            <BOInput value={form.outcomes_description || ''} onChange={set('outcomes_description')} rows={2} placeholder="The platform redefined..." />
          </BOField>
        </div>
      </BOCard>

      <BOCard>
        <ArrayEditor label="Tech Stack" items={techStack} onChange={setTechStack} placeholder="React" addLabel="Add technology" />
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Methodology Phases</h3>
        {phases.map((ph, i) => (
          <div key={i} className="border border-[#2a2a2a] rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555]">Phase {i + 1}</span>
              <button onClick={() => setPhases(phases.filter((_, idx) => idx !== i))} className="text-[#555] hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <BOInput value={ph.name} onChange={v => { const n = [...phases]; n[i].name = v; setPhases(n); }} placeholder="Phase name" />
            <div className="mt-2">
              <BOInput value={ph.description} onChange={v => { const n = [...phases]; n[i].description = v; setPhases(n); }} placeholder="Phase description" rows={2} />
            </div>
          </div>
        ))}
        <button onClick={() => setPhases([...phases, { name: '', description: '' }])}
          className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
          <Plus className="w-3.5 h-3.5" /> Add phase
        </button>
      </BOCard>

      <BOCard>
        <PairEditor label="Outcome Metrics" items={metrics} onChange={setMetrics} labelPlaceholder="Label e.g. Conversion Rate" valuePlaceholder="Value e.g. +22%" addLabel="Add metric" />
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Visual Gallery</h3>
        {visuals.map((v, i) => (
          <div key={i} className="border border-[#2a2a2a] rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555]">Image {i + 1}</span>
              <button onClick={() => setVisuals(visuals.filter((_, idx) => idx !== i))} className="text-[#555] hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <ImageUpload value={v.url} onChange={url => { const n = [...visuals]; n[i].url = url; setVisuals(n); }} label="Image URL" bucket="projects" />
            <div className="mt-2">
              <BOInput value={v.caption} onChange={cap => { const n = [...visuals]; n[i].caption = cap; setVisuals(n); }} placeholder="Image caption" />
            </div>
          </div>
        ))}
        <button onClick={() => setVisuals([...visuals, { url: '', caption: '' }])}
          className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
          <Plus className="w-3.5 h-3.5" /> Add visual
        </button>
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} label={mode === 'create' ? 'Create Project' : 'Save Changes'} />
    </div>
  );
}
