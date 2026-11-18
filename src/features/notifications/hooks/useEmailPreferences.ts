import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyEmailPreferences, updateMyEmailPreferences } from '../api';
import { notificationKeys } from '../queryKeys';
import type { MyEmailPreferencesDto } from '../types';
import { notificationRetry, notificationRetryDelay } from './queryOptions';

/**
 * "Receber avisos por e-mail": a preferência fica na conta (servidor), e não
 * no navegador. A chave muda na hora e volta ao valor anterior se o servidor
 * recusar.
 */
export function useEmailPreferences(userId: string | null) {
  const client = useQueryClient();
  const key = notificationKeys.emailPreferences(userId ?? 'anonymous');

  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => fetchMyEmailPreferences(signal),
    enabled: Boolean(userId),
    retry: notificationRetry,
    retryDelay: notificationRetryDelay,
  });

  const update = useMutation({
    mutationFn: (noticesEnabled: boolean) => updateMyEmailPreferences({ noticesEnabled }),
    onMutate: async (noticesEnabled) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<MyEmailPreferencesDto>(key);
      client.setQueryData<MyEmailPreferencesDto>(key, { noticesEnabled });
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
    },
    onSuccess: (saved) => client.setQueryData(key, saved),
  });

  return { query, update };
}
