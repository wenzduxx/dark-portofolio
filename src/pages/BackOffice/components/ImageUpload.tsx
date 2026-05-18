import React, { useRef, useState } from 'react';
import { supabase, deleteStorageFile } from '../../../lib/supabase';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image', bucket = 'general' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'url' | 'upload'>('url');

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      // If replacing an existing image, try to delete the old one first
      if (value) {
        await deleteStorageFile(value);
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (value) {
      await deleteStorageFile(value);
    }
    onChange('');
  };

  return (
    <div>
      <label className="block text-xs text-[#888] mb-2">{label}</label>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-3">
        {(['url', 'upload'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              tab === t ? 'bg-[#84CC16] text-black font-medium' : 'bg-[#1a1a1a] text-[#888] hover:text-[#e5e5e5]'
            }`}
          >
            {t === 'url' ? 'URL' : 'Upload file'}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors"
          />
          {value && (
            <button onClick={handleRemove} className="p-2 text-[#555] hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] hover:border-[#84CC16] rounded-lg p-6 flex flex-col items-center gap-2 text-[#888] hover:text-[#e5e5e5] transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#84CC16]" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span className="text-xs">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
          </button>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-3 relative group rounded-lg overflow-hidden border border-[#2a2a2a] h-32 bg-[#1a1a1a]">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
