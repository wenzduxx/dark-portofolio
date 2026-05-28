import React, { useRef, useState } from 'react';
import { supabase, deleteStorageFile } from '../../../lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';

interface AudioUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket: 'music-home' | 'music-work' | 'music-resume';
}

const MAX_SIZE_BYTES = 52428800; // 50MB

export default function AudioUpload({ value, onChange, label = 'Audio', bucket }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'url' | 'upload'>('url');

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error('File terlalu besar (maksimal 50MB)');
      }
      if (!file.type.startsWith('audio/')) {
        throw new Error('File harus berupa audio');
      }
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      if (value) {
        await deleteStorageFile(value);
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload gagal');
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
            placeholder="https://...mp3"
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
            accept="audio/*"
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
            <span className="text-xs">{uploading ? 'Uploading...' : 'Click to upload audio (max 50MB)'}</span>
          </button>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
      )}

      {value && (
        <div className="mt-3 rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a] p-2 flex items-center gap-2">
          <audio src={value} controls preload="none" className="w-full h-9" />
          <button
            onClick={handleRemove}
            className="p-1.5 text-[#555] hover:text-red-400 transition-colors shrink-0"
            title="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
