import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder to prevent client-side initialization crash if environment variables aren't provided yet
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return (
    !!(import.meta as any).env.VITE_SUPABASE_URL && 
    (import.meta as any).env.VITE_SUPABASE_URL !== 'https://placeholder-url.supabase.co' &&
    !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY &&
    (import.meta as any).env.VITE_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  );
};
