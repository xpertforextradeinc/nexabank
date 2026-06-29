import React from 'react';
import { isSupabaseConfigured } from '../lib/supabase';

export const SupabaseGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-900 text-white">
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl max-w-md">
          <h2 className="text-xl font-display font-semibold mb-3">Configuration Required</h2>
          <p className="text-slate-400 text-sm mb-6">
            The application is not connected to a Supabase backend. Please check that all required environment variables are set correctly in your deployment environment.
          </p>
          <div className="text-[10px] font-mono text-slate-500 uppercase">
            System Status: Offline (Missing Credentials)
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
