import { QueryClient } from '@tanstack/react-query';

/**
 * Satu instance QueryClient dipakai di seluruh aplikasi, di-pasang lewat
 * QueryClientProvider di app/_layout.tsx.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
