import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';

export default function SiteSettingsSection() {
  const { saving, saved, error, withSave, setError } = useSaveState();
  const [form, setForm] = useState({
    owner_name: '', owner_initials: '', owner_email: '', owner_location: '',
    logo_initials: '', collection_label: '', seo_title: '', seo_description: ''
  });
  const [id, setId] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data, error: err }) => {
      if (err) { setError(err.message); return; }
      if (data) { setId(data.id); setForm({ ...data }); }
    });
  }, []);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => withSave(async () => {
    const { error: err } = await supabase.from('site_settings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) throw err;
  });

  return (
    <div className="space-y-6">
      <BOSectionHeader title="Site Settings" description="Global settings that appear across the entire portfolio." />

      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Owner Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Full Name">
            <BOInput value={form.owner_name} onChange={set('owner_name')} placeholder="Michael Smith" />
          </BOField>
          <BOField label="Initials (displayed in card badges)">
            <BOInput value={form.owner_initials} onChange={set('owner_initials')} placeholder="MS" />
          </BOField>
          <BOField label="Email">
            <BOInput value={form.owner_email} onChange={set('owner_email')} placeholder="hello@example.com" type="email" />
          </BOField>
          <BOField label="Location">
            <BOInput value={form.owner_location} onChange={set('owner_location')} placeholder="Chicago" />
          </BOField>
        </div>
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Branding</h3>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Logo Initials (navbar badge)" hint="Shows in the navbar circle">
            <BOInput value={form.logo_initials} onChange={set('logo_initials')} placeholder="JA" />
          </BOField>
          <BOField label="Collection Label" hint="Shows at top of Hero section">
            <BOInput value={form.collection_label} onChange={set('collection_label')} placeholder="COLLECTION '26" />
          </BOField>
        </div>
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">SEO</h3>
        <div className="space-y-4">
          <BOField label="Page Title">
            <BOInput value={form.seo_title} onChange={set('seo_title')} placeholder="Portfolio — Michael Smith" />
          </BOField>
          <BOField label="Meta Description">
            <BOInput value={form.seo_description} onChange={set('seo_description')} placeholder="Creative designer & developer." rows={2} />
          </BOField>
        </div>
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />
    </div>
  );
}
