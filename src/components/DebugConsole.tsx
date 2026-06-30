import React, { useState, useEffect } from 'react';
import { Terminal, X, ChevronDown, ChevronUp, Bug } from 'lucide-react';

export const DebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<{ type: string; message: string; timestamp: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if debug mode is requested via URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true' || window.location.hostname === 'localhost') {
      setIsVisible(true);
    }

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: string, ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev.slice(-49), { 
        type, 
        message, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };
    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };
    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="w-[90vw] md:w-[400px] h-[300px] bg-black/90 border border-zinc-800 rounded-xl mb-2 flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-500" />
              <span className="text-xs font-mono font-medium text-zinc-300">System Logs</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-2">
            {logs.length === 0 && <div className="text-zinc-600 italic">No logs recorded yet...</div>}
            {logs.map((log, i) => (
              <div key={i} className={`flex flex-col border-b border-zinc-800/50 pb-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'warn' ? 'text-amber-400' : 
                'text-zinc-300'
              }`}>
                <div className="flex justify-between items-center opacity-50 mb-1">
                  <span>[{log.type.toUpperCase()}]</span>
                  <span>{log.timestamp}</span>
                </div>
                <pre className="whitespace-pre-wrap break-all">{log.message}</pre>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
            <button 
              onClick={() => setLogs([])}
              className="text-[10px] text-zinc-500 hover:text-white underline"
            >
              Clear Logs
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full shadow-lg hover:bg-zinc-800 transition-all group"
      >
        <Bug size={16} className={`${isOpen ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-emerald-500'}`} />
        <span className="text-xs font-medium text-zinc-300">Debug</span>
        {isOpen ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronUp size={14} className="text-zinc-500" />}
      </button>
    </div>
  );
};
