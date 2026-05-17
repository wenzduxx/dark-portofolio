import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing env vars. Data will fall back to static files.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const STORAGE_URL = supabaseUrl
  ? `${supabaseUrl}/storage/v1/object/public/portfolio-images`
  : '';
