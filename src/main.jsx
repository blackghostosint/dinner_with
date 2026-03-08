import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { logError } from './lib/errorLogger.js';

window.onerror = (message, _source, lineno, colno, error) => {
  logError(error ?? new Error(String(message)), 'global', { lineno, colno });
};

window.onunhandledrejection = (event) => {
  logError(event.reason ?? new Error('Unhandled promise rejection'), 'promise');
};

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </StrictMode>,
  );
}

if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    // Allow the native install prompt to show naturally
    window.deferredPrompt = event;
  });
}
