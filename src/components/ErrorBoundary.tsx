import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, LogOut, Terminal, HelpCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Console error logging for development only
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.error('NexaBank Error Boundary caught an exception:', error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSession = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin;
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden select-none">
          {/* Ambient light grids */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full max-w-lg z-10 space-y-8 text-center">
            {/* Elegant Header Visual */}
            <div className="flex flex-col items-center">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-3xl text-rose-500 shadow-2xl relative">
                <ShieldAlert className="w-10 h-10 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl tracking-tight text-white mt-6">
                System Interface Interruption
              </h1>
              <p className="text-zinc-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                NexaBank's ledger node encountered a runtime handshake exception. Security protocol has safely isolated the environment.
              </p>
            </div>

            {/* Error Diagnostics Box (Safe, collapsed layout) */}
            <div className="bg-zinc-900/60 border border-zinc-900 rounded-2xl p-5 text-left space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono font-medium text-zinc-500">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-rose-500" />
                  Sentry Diagnostics
                </span>
                <span className="text-[10px] text-zinc-600 bg-zinc-950/60 px-2.5 py-1 rounded-lg">
                  ERR_CODE_HEX_500
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200">
                  {this.state.error?.message || 'Unknown internal rendering anomaly.'}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Secure local micro-ledger failed to complete an atomic UI update frame.
                </p>
              </div>

              {/* Dev Only: Tech Stack Trace */}
              {isDev && this.state.errorInfo && (
                <div className="mt-4 pt-3 border-t border-zinc-850/50 space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-widest block">
                    Developer Stack Trace
                  </span>
                  <pre className="text-[10px] text-rose-400/80 font-mono bg-zinc-950 p-3 rounded-xl overflow-auto max-h-40 leading-relaxed">
                    {this.state.error?.stack}
                    {'\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            {/* Core Sentry Handshake Action Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-xs rounded-xl tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Terminal
              </button>

              <button
                onClick={this.handleResetSession}
                className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Reset Security Session
              </button>
            </div>

            {/* Assistance footer */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
              <span>CUSTODY SYSTEM COMPLIANCE AND SAFETY IS FIRST</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
