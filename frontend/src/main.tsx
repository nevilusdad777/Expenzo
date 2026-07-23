import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Unregister broken service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Bust any old broken service worker caches
if ('caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) {
      caches.delete(name);
    }
  });
}

import { queryClient, localStoragePersister } from '@/lib/queryClient';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found - check index.html for <div id="root">');
}

createRoot(rootElement).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        // Cache survives for 24 hours across refreshes
        maxAge: 1000 * 60 * 60 * 24,
        // Only persist queries, not mutations
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Persist dashboard and accounts — the heaviest/slowest data
            const key = query.queryKey[0];
            return (
              query.state.status === 'success' &&
              (key === 'dashboard' || key === 'accounts' || key === 'categories')
            );
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c1c26',
            color: '#f4f4f5',
            border: '1px solid #26262f',
          },
        }}
      />
    </PersistQueryClientProvider>
  </StrictMode>
);
