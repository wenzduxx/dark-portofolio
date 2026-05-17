import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-ref')) {
  console.error('[Supabase] ⚠️ ENV VARS NOT SET! Please copy .env.example to .env and fill in your Supabase credentials. Data will show as static dummy data until this is fixed.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const STORAGE_URL = supabaseUrl
  ? `${supabaseUrl}/storage/v1/object/public/portfolio-images`
  : '';
