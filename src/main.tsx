import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { SupabaseGuard } from './components/SupabaseGuard.tsx';
import './index.css';

// Last-resort global error listener for mobile debugging
window.onerror = function(msg, url, lineNo, columnNo, error) {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="background: #1a1a1a; color: #ff5555; padding: 20px; font-family: monospace; font-size: 12px; min-height: 100vh;">
        <h1 style="font-size: 16px; margin-bottom: 10px;">Critical Startup Error</h1>
        <p style="margin-bottom: 10px;">${msg}</p>
        <pre style="background: #000; padding: 10px; overflow: auto;">${error?.stack || 'No stack trace'}</pre>
        <p style="margin-top: 10px; color: #888;">URL: ${url}:${lineNo}:${columnNo}</p>
      </div>
    `;
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SupabaseGuard>
        <App />
      </SupabaseGuard>
    </ErrorBoundary>
  </StrictMode>,
);
