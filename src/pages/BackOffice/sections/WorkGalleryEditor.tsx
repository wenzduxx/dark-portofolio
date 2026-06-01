import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ImageUpload from '../components/ImageUpload';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface WorkGalleryItem {
  image_url: string;
  caption: string;
  sort_order: number;
}

export default function WorkGalleryEditor({ onSaved }: { onSaved?: () => void }) {
  const [items, setItems] = useState<WorkGalleryItem[]>([]);
  const { saving, saved, error, withSave } = useSaveState();

  useEffect(() => {
    supabase
      .from('work_gallery')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(
            data.map((d: any) => ({ image_url: d.image_url, caption: d.caption || '', sort_order: d.sort_order }))
          );
        }
      });
  }, []);

  const update = (i: number, key: keyof WorkGalleryItem, value: any) => {
    const next = [...items];
    (next[i] as any)[key] = value;
    setItems(next);
  };

  const addItem = () => setItems([...items, { image_url: '', caption: '', sort_order: items.length }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const handleSave = () => withSave(async () => {
    const { data: existing } = await supabase.from('work_gallery').select('id');
    const existingIds = (existing || []).map((r: any) => r.id);
    if (existingIds.length > 0) {
      await supabase.from('work_gallery').delete().in('id', existingIds);
    }

    const toInsert = items
      .filter((item) => item.image_url.trim())
      .map((item, i) => ({ image_url: item.image_url, caption: item.caption || null, sort_order: i }));

    if (toInsert.length > 0) {
      const { error: err } = await supabase.from('work_gallery').insert(toInsert);
      if (err) throw err;
    }

    onSaved?.();
  });

  return (
    <div className="space-y-6">
      <BOSectionHeader
        title="Work Gallery"
        description="Auto-rotating gallery in the Work page 'Design Philosophy' card. Images crossfade in order; add a caption for each."
      />
      {error && <BOAlert message={error} />}

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#555]">{items.length} image{items.length !== 1 ? 's' : ''}</p>
        <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add image
        </button>
      </div>

      {items.map((item, i) => (
        <BOCard key={i}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#888] font-mono">Image {i + 1}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-[#555] hover:text-[#e5e5e5] disabled:opacity-30 transition-colors">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1.5 text-[#555] hover:text-[#e5e5e5] disabled:opacity-30 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={() => removeItem(i)} className="p-1.5 text-[#555] hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ImageUpload value={item.image_url} onChange={(v) => update(i, 'image_url', v)} label="Image URL or upload" bucket="projects" />
          <div className="mt-3">
            <BOField label="Caption (optional)">
              <BOInput value={item.caption} onChange={(v) => update(i, 'caption', v)} placeholder="Editorial layout study" />
            </BOField>
          </div>
        </BOCard>
      ))}

      {items.length === 0 && (
        <BOCard>
          <p className="text-sm text-[#555] text-center py-4">No images yet. Click "Add image" to get started.</p>
        </BOCard>
      )}

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />
    </div>
  );
}
