import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2 * 60 * 1000,
    },
    mutations: {
      // Repetir automaticamente uma mutação pode duplicar geração de IA,
      // publicação ou consumo. O usuário decide quando tentar novamente.
      retry: false,
    },
  },
});
