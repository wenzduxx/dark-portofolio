import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function NavigationEditor() {
  const [links, setLinks] = useState<{ id: string; name: string; path: string; sort_order: number }[]>([]);
  const { saving, saved, error, withSave } = useSaveState();

  useEffect(() => {
    supabase.from('nav_links').select('*').order('sort_order').then(({ data }) => setLinks(data || []));
  }, []);

  const update = (i: number, k: string, v: string) => {
    const n = [...links]; (n[i] as any)[k] = v; setLinks(n);
  };

  const handleSave = () => withSave(async () => {
    await supabase.from('nav_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: err } = await supabase.from('nav_links').insert(
      links.map((l, i) => ({ name: l.name, path: l.path, sort_order: i }))
    );
    if (err) throw err;
    const { data } = await supabase.from('nav_links').select('*').order('sort_order');
    setLinks(data || []);
  });

  return (
    <div className="space-y-6">
      <BOSectionHeader title="Navigation" description="Edit navbar links and their URLs." />
      {error && <BOAlert message={error} />}
      <BOCard>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-[#444] shrink-0" />
              <BOInput value={l.name} onChange={v => update(i, 'name', v)} placeholder="Home" />
              <BOInput value={l.path} onChange={v => update(i, 'path', v)} placeholder="/" />
              <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="p-1.5 text-[#555] hover:text-red-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setLinks([...links, { id: '', name: '', path: '/', sort_order: links.length }])}
          className="mt-3 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
          <Plus className="w-3.5 h-3.5" /> Add link
        </button>
      </BOCard>
      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />
    </div>
  );
}
