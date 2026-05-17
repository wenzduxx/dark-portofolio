import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function BOCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#111111] border border-[#1e1e1e] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function BOSectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-[#e5e5e5]">{title}</h2>
      {description && <p className="text-sm text-[#555] mt-1">{description}</p>}
    </div>
  );
}

export function BOField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#888] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#444] mt-1">{hint}</p>}
    </div>
  );
}

export function BOInput({
  value, onChange, placeholder = '', type = 'text', rows
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  rows?: number;
}) {
  const cls = "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] transition-colors";
  if (rows) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cls + ' resize-none'}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={cls}
    />
  );
}

export function BOSaveButton({
  onClick, loading, saved, label = 'Save changes'
}: {
  onClick: () => void;
  loading: boolean;
  saved: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 bg-[#84CC16] hover:bg-[#76b814] text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : null}
      {loading ? 'Saving...' : saved ? 'Saved!' : label}
    </button>
  );
}

export function BOAlert({ message, type = 'error' }: { message: string; type?: 'error' | 'success' }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${
      type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'
    }`}>
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      {message}
    </div>
  );
}

export function useSaveState() {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState('');

  const withSave = async (fn: () => Promise<void>) => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return { saving, saved, error, withSave, setError };
}
