import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-ref')) {
  console.error('[Supabase] ⚠️ ENV VARS NOT SET! Please copy .env.example to .env and fill in your Supabase credentials. Data will show as static dummy data until this is fixed.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const deleteStorageFile = async (url: string) => {
  if (!url || !supabaseUrl) return;
  
  const prefix = `${supabaseUrl}/storage/v1/object/public/`;
  if (url.startsWith(prefix)) {
    const relativePath = url.slice(prefix.length); // "[bucket]/[path]"
    const firstSlash = relativePath.indexOf('/');
    if (firstSlash !== -1) {
      const bucket = relativePath.slice(0, firstSlash);
      const path = relativePath.slice(firstSlash + 1);
      
      try {
        await supabase.storage.from(bucket).remove([path]);
      } catch (e) {
        console.error('Failed to delete old storage file:', e);
      }
    }
  }
};
