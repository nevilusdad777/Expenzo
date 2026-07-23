import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const CACHE_VERSION = 'vyntra-v1';

export const queryClient = new QueryClient({
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
