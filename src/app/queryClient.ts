import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // reuse data for 30s instead of refetching on every page change
        retry: 1,
        refetchOnWindowFocus: true, // pick up other staff's changes when you return to the tab
      },
      // Never silently replay a status change.
      mutations: { retry: false },
    },
  });
}
