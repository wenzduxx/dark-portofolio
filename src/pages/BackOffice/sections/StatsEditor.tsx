// StatsEditor.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import { Plus, Trash2 } from 'lucide-react';

export function StatsEditor() {
  const [stats, setStats] = useState<{ id: string; value: number; suffix: string; label: string; sort_order: number }[]>([]);
  const { saving, saved, error, withSave, setError } = useSaveState();

  useEffect(() => {
    supabase.from('stats').select('*').order('sort_order').then(({ data }) => setStats(data || []));
  }, []);

  const update = (i: number, k: string, v: any) => {
    const n = [...stats]; (n[i] as any)[k] = v; setStats(n);
  };

  const handleSave = () => withSave(async () => {
    await supabase.from('stats').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: err } = await supabase.from('stats').insert(
      stats.map((s, i) => ({ value: Number(s.value), suffix: s.suffix, label: s.label, sort_order: i }))
    );
    if (err) throw err;
    const { data } = await supabase.from('stats').select('*').order('sort_order');
    setStats(data || []);
  });

  return (
    <div className="space-y-6">
      <BOSectionHeader title="Stats" description="Numbers shown in the stats section." />
      {error && <BOAlert message={error} />}
      <BOCard>
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <BOInput value={String(s.value)} onChange={v => update(i, 'value', v)} placeholder="20" type="number" />
              <BOInput value={s.suffix} onChange={v => update(i, 'suffix', v)} placeholder="+" />
              <BOInput value={s.label} onChange={v => update(i, 'label', v)} placeholder="Years Experience" />
              <button onClick={() => setStats(stats.filter((_, idx) => idx !== i))} className="p-1.5 text-[#555] hover:text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <div className="text-xs text-[#555] mt-1">Format: value + suffix = "20+" label = "Years Experience"</div>
        </div>
        <button onClick={() => setStats([...stats, { id: '', value: 0, suffix: '+', label: '', sort_order: stats.length }])}
          className="mt-3 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]">
          <Plus className="w-3.5 h-3.5" /> Add stat
        </button>
      </BOCard>
      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />
    </div>
  );
}

export default StatsEditor;
