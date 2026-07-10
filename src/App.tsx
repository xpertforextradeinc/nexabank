import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { DashboardLayout } from './components/DashboardLayout';
import { AuthScreens } from './components/AuthScreens';
import { FullPageLoader } from './components/ui/FullPageLoader';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Safe, non-blocking check for an active user session on app boot
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    }).catch((err) => {
      console.error("Auth hydration failed securely:", err);
      setIsLoading(false);
    });

    // 2. Real-time URL and session synchronization guard
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setIsLoading(false);
      
      // Clean up temporary auth callback hashes smoothly from the address bar
      if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Prevent UI flashing or false-negative redirects during boot up
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Strictly bifurcated layout routing—no intermediate states to break links
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white antialiased">
      {session ? <DashboardLayout session={session} /> : <AuthScreens />}
    </div>
  );
}
