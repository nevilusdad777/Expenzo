import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Data is "fresh" for 3 minutes — no background refetch during this window
      staleTime: 1000 * 60 * 3,
      // Keep data in memory for 10 minutes even when unused
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      // Show cached data immediately while refetching silently in background
      refetchOnMount: true,
    },
  },
});

// Persist cache to localStorage so page refresh shows instant data
// Cache is versioned — bump CACHE_VERSION to force a clear on breaking changes
const CACHE_VERSION = 'vyntra-v1';

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: CACHE_VERSION,
  // Throttle writes so we don't hammer localStorage on every keystroke
  throttleTime: 1000,
});

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
