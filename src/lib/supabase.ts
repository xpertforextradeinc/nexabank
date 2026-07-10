import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface ImportMeta {
    readonly env: Record<string, string>;
  }
}

// Helper to retrieve env variables safely. By using literal static lookups,
// Vite's build-time static replacement engine can match the tokens and replace them
// with the actual environment variable values during compile time.
export const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
  if (url && url !== 'https://placeholder-url.supabase.co') return url;
  
  // Fallback to process.env if available
  if (typeof process !== 'undefined' && process.env) {
    const pUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (pUrl && pUrl !== 'https://placeholder-url.supabase.co') return pUrl;
  }
  
  return 'https://placeholder-url.supabase.co';
};

export const getSupabaseAnonKey = (): string => {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
  if (key && key !== 'placeholder-anon-key') return key;

  // Fallback to process.env if available
  if (typeof process !== 'undefined' && process.env) {
    const pKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (pKey && pKey !== 'placeholder-anon-key') return pKey;
  }

  return 'placeholder-anon-key';
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  try {
    if (!supabaseClient) {
      const supabaseUrl = getSupabaseUrl();
      const supabaseAnonKey = getSupabaseAnonKey();

      console.log("Initializing Supabase client with URL:", supabaseUrl?.substring(0, 15) + "...");

      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'placeholder-url') {
        throw new Error('Supabase configuration is incomplete.');
      }

      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
    return supabaseClient;
  } catch (error) {
    console.error("CRITICAL: Failed to initialize Supabase client:", error);
    // Return a dummy client or let the guard handle it
    throw error;
  }
};
export const supabase = getSupabase();

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return (
    !!url && 
    url !== 'https://placeholder-url.supabase.co' &&
    !!key && 
    key !== 'placeholder-anon-key'
  );
};
