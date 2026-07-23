import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const CACHE_VERSION = 'vyntra-v1';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Always fetch fresh data on mount to guarantee user isolation & accurate balances
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    },
  },
});

export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: CACHE_VERSION,
  // Throttle writes so we don't hammer localStorage on every keystroke
  throttleTime: 1000,
});

export function clearUserCache() {
  queryClient.clear();
  try {
    window.localStorage.removeItem(CACHE_VERSION);
  } catch (err) {
    console.error('Failed to clear query cache from storage:', err);
  }
}
