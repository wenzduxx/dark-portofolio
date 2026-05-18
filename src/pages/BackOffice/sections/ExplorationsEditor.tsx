import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ImageUpload from '../components/ImageUpload';
import { Plus, Trash2 } from 'lucide-react';

interface ExplorationItem {
  image_url: string;
  column_position: 1 | 2;
  sort_order: number;
}

export default function ExplorationsEditor({ onSaved }: { onSaved?: () => void }) {
  const [items, setItems] = useState<ExplorationItem[]>([]);
  const { saving, saved, error, withSave } = useSaveState();

  useEffect(() => {
    supabase
      .from('explorations_gallery')
      .select('*')
      .order('column_position')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(data.map((d: any) => ({
            image_url: d.image_url,
            column_position: d.column_position as 1 | 2,
            sort_order: d.sort_order,
          })));
        }
      });
  }, []);

  const update = (i: number, key: keyof ExplorationItem, value: any) => {
    const next = [...items];
    (next[i] as any)[key] = value;
    setItems(next);
  };

  const addItem = () => {
    setItems([...items, { image_url: '', column_position: 1, sort_order: items.length }]);
  };

  const removeItem = (i: number) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  const handleSave = () => withSave(async () => {
    // Get existing IDs first
    const { data: existing } = await supabase.from('explorations_gallery').select('id');
    const existingIds = (existing || []).map((r: any) => r.id);

    // Delete all existing rows
    if (existingIds.length > 0) {
      await supabase.from('explorations_gallery').delete().in('id', existingIds);
    }

    // Insert new rows (skip items with no image)
    const toInsert = items
      .filter(item => item.image_url.trim())
      .map((item, i) => ({
        image_url: item.image_url,
        column_position: item.column_position,
        sort_order: i,
      }));

    if (toInsert.length > 0) {
      const { error: err } = await supabase.from('explorations_gallery').insert(toInsert);
      if (err) throw err;
    }

    onSaved?.();
  });

  const col1 = items.filter(item => item.column_position === 1);
  const col2 = items.filter(item => item.column_position === 2);

  return (
    <div className="space-y-6">
      <BOSectionHeader
        title="Explorations Gallery"
        description="Parallax gallery images on the home page. Assign each image to column 1 (left) or column 2 (right)."
      />
      {error && <BOAlert message={error} />}

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#555]">{items.length} images · {col1.length} in col 1 · {col2.length} in col 2</p>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add image
        </button>
      </div>

      {items.map((item, i) => (
        <BOCard key={i}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#888] font-mono">Image {i + 1}</span>
            <div className="flex items-center gap-3">
              <BOField label="Column">
                <select
                  value={item.column_position}
                  onChange={e => update(i, 'column_position', Number(e.target.value) as 1 | 2)}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16]"
                >
                  <option value={1}>Column 1 (left)</option>
                  <option value={2}>Column 2 (right)</option>
                </select>
              </BOField>
              <button
                onClick={() => removeItem(i)}
                className="p-1.5 text-[#555] hover:text-red-400 transition-colors mt-5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ImageUpload
            value={item.image_url}
            onChange={v => update(i, 'image_url', v)}
            label="Image URL or upload"
          />
        </BOCard>
      ))}

      {items.length === 0 && (
        <BOCard>
          <p className="text-sm text-[#555] text-center py-4">
            No images yet. Click "Add image" to get started.
          </p>
        </BOCard>
      )}

      <BOSaveButton onClick={handleSave} loading={saving} saved={saved} />
    </div>
  );
}
