import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import { PairEditor } from '../components/ArrayEditor';

export default function ContactEditor() {
  const [id, setId] = useState('');
  const [form, setForm] = useState({ cta_label: '', cta_heading: '', email: '', availability_text: '' });
  const [socials, setSocials] = useState<{ label: string; value: string }[]>([]);
  const { saving, saved, error, withSave, setError } = useSaveState();

  useEffect(() => {
    supabase.from('contact_settings').select('*').single().then(({ data, error: err }) => {
      if (err) { setError(err.message); return; }
      if (data) {
        setId(data.id);
        setForm({ cta_label: data.cta_label, cta_heading: data.cta_heading, email: data.email, availability_text: data.availability_text });
        const sl = Array.isArray(data.social_links) ? data.social_links : JSON.parse(data.social_links || '[]');
        setSocials(sl.map((s: any) => ({ label: s.label, value: s.url })));
      }
    });
  }, []);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => withSave(async () => {
    const social_links = socials.filter(s => s.label).map(s => ({ label: s.label, url: s.value }));
    const { error: err } = await supabase.from('contact_settings')
      .update({ ...form, social_links, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) throw err;
  });

  return (
    <div className="space-y-6">
      <BOSectionHeader title="Contact / Footer" description="Edit the footer CTA, email, and social links." />
      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Call to Action</h3>
        <div className="space-y-4">
          <BOField label="Label (small text above)" ><BOInput value={form.cta_label} onChange={set('cta_label')} placeholder="What's next?" /></BOField>
          <BOField label="Heading"><BOInput value={form.cta_heading} onChange={set('cta_heading')} placeholder="Let's build something." /></BOField>
          <BOField label="Contact Email"><BOInput value={form.email} onChange={set('email')} placeholder="hello@example.com" type="email" /></BOField>
          <BOField label="Availability Badge Text"><BOInput value={form.availability_text} onChange={set('availability_text')} placeholder="Available for projects" /></BOField>
        </div>
      </BOCard>

      <BOCard>
        <PairEditor
          label="Social Links"
          items={socials}
          onChange={setSocials}
          labelPlaceholder="Twitter"
          valuePlaceholder="https://twitter.com/..."
          addLabel="Add social link"
        />
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />
    </div>
  );
}
