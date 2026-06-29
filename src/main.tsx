import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { SupabaseGuard } from './components/SupabaseGuard.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SupabaseGuard>
        <App />
      </SupabaseGuard>
    </ErrorBoundary>
  </StrictMode>,
);
