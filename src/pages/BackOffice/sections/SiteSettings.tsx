import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ArrayEditor from '../components/ArrayEditor';
import AudioUpload from '../components/AudioUpload';
import { Save } from 'lucide-react';

export default function SiteSettingsSection({ onSaved }: { onSaved?: () => void }) {
  const { saving, saved, error, withSave, setError } = useSaveState();
  const [form, setForm] = useState({
    owner_name: '', owner_initials: '', owner_email: '', owner_location: '',
    logo_initials: '', collection_label: '', seo_title: '', seo_description: '',
    home_music_url: '', work_music_url: '', resume_music_url: ''
  });
  const [id, setId] = useState('');
  const [clients, setClients] = useState<string[]>([]);
  const [clientsSaving, setClientsSaving] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data, error: err }) => {
      if (err) { setError(err.message); return; }
      if (data) { setId(data.id); setForm({ ...data }); }
    });
    supabase.from('clients').select('*').order('sort_order').then(({ data }) => {
      if (data) setClients(data.map((c: any) => c.name));
    });
  }, []);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => withSave(async () => {
    const { error: err } = await supabase.from('site_settings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) throw err;
    onSaved?.();
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

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-1">Background Music</h3>
        <p className="text-xs text-[#555] mb-4">
          Upload audio for each section (max 50MB). Empty slots fall back to Home music. Leave all empty to disable.
        </p>
        <div className="space-y-4">
          <AudioUpload
            label="Home Music"
            bucket="music-home"
            value={form.home_music_url}
            onChange={v => setForm(f => ({ ...f, home_music_url: v }))}
          />
          <AudioUpload
            label="Work Music"
            bucket="music-work"
            value={form.work_music_url}
            onChange={v => setForm(f => ({ ...f, work_music_url: v }))}
          />
          <AudioUpload
            label="Resume Music"
            bucket="music-resume"
            value={form.resume_music_url}
            onChange={v => setForm(f => ({ ...f, resume_music_url: v }))}
          />
        </div>
      </BOCard>

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />

      <BOCard>
        <ArrayEditor
          label="Trusted By / Clients"
          items={clients}
          onChange={setClients}
          placeholder="e.g. Apple"
          addLabel="Add client"
        />
        <div className="mt-4">
          <button
            onClick={async () => {
              setClientsSaving(true);
              try {
                await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                if (clients.filter(Boolean).length > 0) {
                  const { error: err } = await supabase.from('clients').insert(
                    clients.filter(Boolean).map((name, i) => ({ name, sort_order: i }))
                  );
                  if (err) setError(err.message);
                }
                onSaved?.();
              } catch (e: any) {
                setError(e.message);
              } finally {
                setClientsSaving(false);
              }
            }}
            disabled={clientsSaving}
            className="flex items-center gap-1.5 text-xs bg-[#84CC16] hover:bg-[#76b814] text-black font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {clientsSaving ? 'Saving...' : 'Save clients'}
          </button>
        </div>
      </BOCard>
    </div>
  );
}
