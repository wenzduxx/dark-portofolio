import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ImageUpload from '../components/ImageUpload';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';

interface SkillRow {
  id: string;
  category: string;
  items: string[];
  column_index: number;
  sort_order: number;
}

interface CertRow {
  id: string;
  title: string;
  issuer: string;
  date: string;
  sort_order: number;
}

export default function ResumeEditor({ onSaved }: { onSaved?: () => void }) {
  const { saving, saved, error, withSave, setError } = useSaveState();
  const [id, setId] = useState('');
  const [form, setForm] = useState({
    bio_name: '', bio_paragraph1: '', bio_paragraph2: '',
    profile_image: '', location: '', cv_url: '',
    form_heading: '', form_subtext: '', formspree_id: '',
    page_heading: '',
  });
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [certsSaving, setCertsSaving] = useState(false);

  useEffect(() => {
    // Fetch resume settings
    supabase.from('resume_settings').select('*').single().then(({ data, error: err }) => {
      if (err) {
        // Table might not exist yet
        if (err.code === 'PGRST116' || err.message?.includes('does not exist')) {
          setError('Resume tables not found. Please run the SQL migration first (see walkthrough).');
        }
        return;
      }
      if (data) {
        setId(data.id);
        setForm({
          bio_name: data.bio_name || '',
          bio_paragraph1: data.bio_paragraph1 || '',
          bio_paragraph2: data.bio_paragraph2 || '',
          profile_image: data.profile_image || '',
          location: data.location || '',
          cv_url: data.cv_url || '',
          form_heading: data.form_heading || '',
          form_subtext: data.form_subtext || '',
          formspree_id: data.formspree_id || '',
          page_heading: data.page_heading || '',
        });
      }
    });

    // Fetch skills
    supabase.from('resume_skills').select('*').order('column_index').order('sort_order').then(({ data }) => {
      if (data) setSkills(data.map((s: any) => ({
        ...s,
        items: Array.isArray(s.items) ? s.items : JSON.parse(s.items || '[]'),
      })));
    });

    // Fetch certifications
    supabase.from('resume_certifications').select('*').order('sort_order').then(({ data }) => {
      if (data) setCerts(data);
    });
  }, []);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => withSave(async () => {
    if (!id) {
      // Insert new row
      const { data, error: err } = await supabase.from('resume_settings')
        .insert({ ...form })
        .select('id')
        .single();
      if (err) throw err;
      if (data) setId(data.id);
    } else {
      const { error: err } = await supabase.from('resume_settings')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
    }
    onSaved?.();
  });

  // ── Skills CRUD ───────────────────────────────────────────────────────────
  const addSkill = (colIdx: number) => {
    setSkills([...skills, {
      id: `temp-${Date.now()}`,
      category: '',
      items: [''],
      column_index: colIdx,
      sort_order: skills.filter(s => s.column_index === colIdx).length,
    }]);
  };

  const updateSkill = (idx: number, field: string, value: any) => {
    const next = [...skills];
    next[idx] = { ...next[idx], [field]: value };
    setSkills(next);
  };

  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const addSkillItem = (skillIdx: number) => {
    const next = [...skills];
    next[skillIdx] = { ...next[skillIdx], items: [...next[skillIdx].items, ''] };
    setSkills(next);
  };

  const updateSkillItem = (skillIdx: number, itemIdx: number, value: string) => {
    const next = [...skills];
    const items = [...next[skillIdx].items];
    items[itemIdx] = value;
    next[skillIdx] = { ...next[skillIdx], items };
    setSkills(next);
  };

  const removeSkillItem = (skillIdx: number, itemIdx: number) => {
    const next = [...skills];
    next[skillIdx] = { ...next[skillIdx], items: next[skillIdx].items.filter((_, i) => i !== itemIdx) };
    setSkills(next);
  };

  const saveSkills = async () => {
    setSkillsSaving(true);
    try {
      await supabase.from('resume_skills').delete().not('id', 'is', null);
      if (skills.length > 0) {
        const { error: err } = await supabase.from('resume_skills').insert(
          skills.map((s, i) => ({
            category: s.category,
            items: s.items.filter(item => item.trim()),
            column_index: s.column_index,
            sort_order: i,
          }))
        );
        if (err) setError(err.message);
      }
      onSaved?.();
    } catch (err: any) {
      setError(err.message);
    }
    setSkillsSaving(false);
  };

  // ── Certifications CRUD ───────────────────────────────────────────────────
  const addCert = () => {
    setCerts([...certs, {
      id: `temp-${Date.now()}`,
      title: '', issuer: '', date: '',
      sort_order: certs.length,
    }]);
  };

  const updateCert = (idx: number, field: string, value: string) => {
    const next = [...certs];
    next[idx] = { ...next[idx], [field]: value };
    setCerts(next);
  };

  const removeCert = (idx: number) => {
    setCerts(certs.filter((_, i) => i !== idx));
  };

  const saveCerts = async () => {
    setCertsSaving(true);
    try {
      await supabase.from('resume_certifications').delete().not('id', 'is', null);
      if (certs.length > 0) {
        const { error: err } = await supabase.from('resume_certifications').insert(
          certs.filter(c => c.title.trim()).map((c, i) => ({
            title: c.title,
            issuer: c.issuer,
            date: c.date,
            sort_order: i,
          }))
        );
        if (err) setError(err.message);
      }
      onSaved?.();
    } catch (err: any) {
      setError(err.message);
    }
    setCertsSaving(false);
  };

  const COLUMN_LABELS = ['Column 1 (Left)', 'Column 2 (Center)', 'Column 3 (Right)'];

  return (
    <div className="space-y-6">
      <BOSectionHeader title="Resume / About" description="Edit the Resume page content: bio, profile image, skills, certifications, and contact form." />
      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">About Me</h3>
        <div className="space-y-4">
          <BOField label="Page Heading" hint='Main heading on the Resume page, e.g. "A curious mind."'>
            <BOInput value={form.page_heading} onChange={set('page_heading')} placeholder="A curious mind." />
          </BOField>
          <BOField label="Display Name" hint='e.g. "Michael" — used in "I am Michael, a..."'>
            <BOInput value={form.bio_name} onChange={set('bio_name')} placeholder="Michael" />
          </BOField>
          <BOField label="Bio Paragraph 1">
            <BOInput value={form.bio_paragraph1} onChange={set('bio_paragraph1')} placeholder="I am Michael, a designer and developer..." rows={3} />
          </BOField>
          <BOField label="Bio Paragraph 2">
            <BOInput value={form.bio_paragraph2} onChange={set('bio_paragraph2')} placeholder="Outside of client work..." rows={3} />
          </BOField>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <ImageUpload value={form.profile_image} onChange={set('profile_image')} label="Profile Photo" />
            </div>
            <div className="space-y-4">
              <BOField label="Location">
                <BOInput value={form.location} onChange={set('location')} placeholder="Chicago, IL, USA" />
              </BOField>
              <BOField label="CV / Resume File URL" hint="Link to downloadable PDF. Leave empty to show 'Get in Touch' instead.">
                <BOInput value={form.cv_url} onChange={set('cv_url')} placeholder="https://drive.google.com/..." />
              </BOField>
            </div>
          </div>
        </div>
      </BOCard>

      {/* Contact Form Settings */}
      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Contact Form</h3>
        <div className="space-y-4">
          <BOField label="Form Heading">
            <BOInput value={form.form_heading} onChange={set('form_heading')} placeholder="Start a conversation." />
          </BOField>
          <BOField label="Form Subtext">
            <BOInput value={form.form_subtext} onChange={set('form_subtext')} placeholder="Feel free to reach out..." />
          </BOField>
          <BOField label="Formspree Form ID" hint='Your Formspree form ID (e.g. "xwpkzjql"). Leave empty to fallback to mailto: link.'>
            <BOInput value={form.formspree_id} onChange={set('formspree_id')} placeholder="xwpkzjql" />
          </BOField>
        </div>
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />

      {/* Skills Editor */}
      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-1">Skills & Competencies</h3>
        <p className="text-xs text-[#555] mb-4">Skills are displayed in 3 columns with rotating categories. Each category cycles within its column.</p>

        {COLUMN_LABELS.map((colLabel, colIdx) => {
          const colSkills = skills.filter(s => s.column_index === colIdx);
          return (
            <div key={colIdx} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-[#84CC16]">{colLabel}</span>
                <div className="flex-1 h-px bg-[#1e1e1e]" />
              </div>
              
              {colSkills.map((skill) => {
                const globalIdx = skills.indexOf(skill);
                return (
                  <div key={globalIdx} className="mb-4 bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        value={skill.category}
                        onChange={e => updateSkill(globalIdx, 'category', e.target.value)}
                        placeholder="Category name (e.g. Languages)"
                        className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16] transition-colors"
                      />
                      <button onClick={() => removeSkill(globalIdx)} className="p-1 text-[#555] hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5 ml-4">
                      {skill.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3 text-[#333] shrink-0" />
                          <input
                            value={item}
                            onChange={e => updateSkillItem(globalIdx, itemIdx, e.target.value)}
                            placeholder="Skill name"
                            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1 text-xs text-[#e5e5e5] focus:outline-none focus:border-[#84CC16] transition-colors"
                          />
                          <button onClick={() => removeSkillItem(globalIdx, itemIdx)} className="p-0.5 text-[#444] hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addSkillItem(globalIdx)} className="flex items-center gap-1 text-[10px] text-[#555] hover:text-[#84CC16] mt-1">
                        <Plus className="w-3 h-3" /> Add skill
                      </button>
                    </div>
                  </div>
                );
              })}

              <button onClick={() => addSkill(colIdx)} className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
                <Plus className="w-3.5 h-3.5" /> Add category to {colLabel}
              </button>
            </div>
          );
        })}

        <button
          onClick={saveSkills}
          disabled={skillsSaving}
          className="mt-4 flex items-center gap-1.5 text-xs bg-[#84CC16] hover:bg-[#76b814] text-black font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          {skillsSaving ? 'Saving...' : 'Save skills'}
        </button>
      </BOCard>

      {/* Certifications Editor */}
      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-1">Certifications</h3>
        <p className="text-xs text-[#555] mb-4">Displayed in rotating groups of 3 on the Resume page.</p>

        <div className="space-y-2">
          {certs.map((cert, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={cert.title}
                onChange={e => updateCert(i, 'title', e.target.value)}
                placeholder="Certification title"
                className="flex-[2] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16] transition-colors"
              />
              <input
                value={cert.issuer}
                onChange={e => updateCert(i, 'issuer', e.target.value)}
                placeholder="Issuer"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16] transition-colors"
              />
              <input
                value={cert.date}
                onChange={e => updateCert(i, 'date', e.target.value)}
                placeholder="Year"
                className="w-20 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16] transition-colors"
              />
              <button onClick={() => removeCert(i)} className="p-1.5 text-[#555] hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button onClick={addCert} className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
            <Plus className="w-3.5 h-3.5" /> Add certification
          </button>
          <button
            onClick={saveCerts}
            disabled={certsSaving}
            className="flex items-center gap-1.5 text-xs bg-[#84CC16] hover:bg-[#76b814] text-black font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {certsSaving ? 'Saving...' : 'Save certifications'}
          </button>
        </div>
      </BOCard>
    </div>
  );
}
