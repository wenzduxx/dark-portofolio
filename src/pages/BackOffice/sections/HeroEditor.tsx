import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ArrayEditor from '../components/ArrayEditor';
import { Plus, Trash2, Save } from 'lucide-react';

export default function HeroEditor({ onSaved }: { onSaved?: () => void }) {
  const { saving, saved, error, withSave, setError } = useSaveState();
  const [form, setForm] = useState({
    headline_name: '', tagline_prefix: '', tagline_suffix: '', description: '',
    button1_text: '', button2_text: '',
    aurora_color1: '#84CC16', aurora_color2: '#EAB308', aurora_color3: '#f32222'
  });
  const [id, setId] = useState('');
  const [roles, setRoles] = useState<{ id: string; role: string; sort_order: number }[]>([]);
  const [rolesSaving, setRolesSaving] = useState(false);

  useEffect(() => {
    supabase.from('hero_settings').select('*').single().then(({ data }) => {
      if (data) { setId(data.id); setForm({ ...data }); }
    });
    supabase.from('hero_roles').select('*').order('sort_order').then(({ data }) => {
      if (data) setRoles(data);
    });
  }, []);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => withSave(async () => {
    const { error: err } = await supabase.from('hero_settings')
      .update({ ...form, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) throw err;
    onSaved?.();
  });

  const saveRoles = async () => {
    setRolesSaving(true);
    // Delete all and re-insert (simple strategy)
    await supabase.from('hero_roles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (roles.length > 0) {
      const { error: err } = await supabase.from('hero_roles').insert(
        roles.map((r, i) => ({ role: r.role, sort_order: i }))
      );
      if (err) { setError(err.message); }
    }
    setRolesSaving(false);
    onSaved?.();
  };

  return (
    <div className="space-y-6">
      <BOSectionHeader title="Hero Section" description="Edit the main hero content, rotating roles, and background aurora." />
      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Headline</h3>
        <div className="space-y-4">
          <BOField label="Name / Main Headline">
            <BOInput value={form.headline_name} onChange={set('headline_name')} placeholder="Michael Smith" />
          </BOField>
          <div className="grid grid-cols-2 gap-4">
            <BOField label="Tagline Prefix" hint='e.g. "A"'>
              <BOInput value={form.tagline_prefix} onChange={set('tagline_prefix')} placeholder="A" />
            </BOField>
            <BOField label="Tagline Suffix" hint='e.g. "lives in Chicago."'>
              <BOInput value={form.tagline_suffix} onChange={set('tagline_suffix')} placeholder="lives in Chicago." />
            </BOField>
          </div>
          <BOField label="Description Paragraph">
            <BOInput value={form.description} onChange={set('description')} placeholder="Designing seamless digital interactions..." rows={3} />
          </BOField>
        </div>
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">CTA Buttons</h3>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Button 1 (Primary)">
            <BOInput value={form.button1_text} onChange={set('button1_text')} placeholder="See Works" />
          </BOField>
          <BOField label="Button 2 (Glass)">
            <BOInput value={form.button2_text} onChange={set('button2_text')} placeholder="Reach out..." />
          </BOField>
        </div>
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Aurora Colors</h3>
        <div className="grid grid-cols-3 gap-4">
          {(['aurora_color1', 'aurora_color2', 'aurora_color3'] as const).map((key, i) => (
            <BOField key={key} label={`Color ${i + 1}`}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form[key]}
                  onChange={e => set(key)(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] cursor-pointer"
                />
                <BOInput value={form[key]} onChange={set(key)} placeholder="#84CC16" />
              </div>
            </BOField>
          ))}
        </div>
        <div className="mt-4 h-12 rounded-lg overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${form.aurora_color1}, ${form.aurora_color2}, ${form.aurora_color3})` }}
        />
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />

      {/* Roles */}
      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-1">Rotating Roles</h3>
        <p className="text-xs text-[#555] mb-4">These cycle in the hero tagline (Creative, Fullstack, etc.)</p>
        <div className="space-y-2">
          {roles.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r.role}
                onChange={e => {
                  const next = [...roles];
                  next[i] = { ...next[i], role: e.target.value };
                  setRoles(next);
                }}
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16] transition-colors"
              />
              <button onClick={() => setRoles(roles.filter((_, idx) => idx !== i))} className="p-1.5 text-[#555] hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => setRoles([...roles, { id: '', role: '', sort_order: roles.length }])}
            className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
            <Plus className="w-3.5 h-3.5" /> Add role
          </button>
          <button
            onClick={saveRoles}
            disabled={rolesSaving}
            className="flex items-center gap-1.5 text-xs bg-[#84CC16] hover:bg-[#76b814] text-black font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {rolesSaving ? 'Saving...' : 'Save roles'}
          </button>
        </div>
      </BOCard>
    </div>
  );
}
