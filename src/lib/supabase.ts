import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Strip trailing /rest/v1 or trailing slashes if present
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  supabaseAnonKey &&
  !cleanUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Initialized Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey)
  : createClient('https://mock-educloud-placeholder.supabase.co', 'mock-anon-key-placeholder');
