import { useQuery } from '@tanstack/react-query';
import { getHttpStatus } from '@/utils/apiError';
import { fetchNotificationSummary } from '../api';
import { NOTIFICATIONS_SUMMARY_STALE_MS } from '../constants';
import { notificationKeys } from '../queryKeys';
import { isTerminalStatus, summaryPollInterval } from '../utils';
import { notificationRetry, notificationRetryDelay } from './queryOptions';

/**
 * Resumo da central: contador e IDs recentes para detectar novidades.
 * Política de background configurada aqui, sem depender dos defaults globais.
 */
export function useNotificationSummary(
  userId: string | null,
  enabled: boolean,
  hiddenChannelReady: boolean
) {
  return useQuery({
    queryKey: notificationKeys.summary(userId ?? ''),
    enabled: enabled && Boolean(userId),
    queryFn: ({ signal }) => fetchNotificationSummary(signal),
    staleTime: NOTIFICATIONS_SUMMARY_STALE_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
    refetchInterval: (query) =>
      summaryPollInterval({
        visible: typeof document === 'undefined' || document.visibilityState === 'visible',
        hiddenChannelReady,
        stopped: isTerminalStatus(getHttpStatus(query.state.error)),
      }),
    retry: notificationRetry,
    retryDelay: notificationRetryDelay,
  });
}
