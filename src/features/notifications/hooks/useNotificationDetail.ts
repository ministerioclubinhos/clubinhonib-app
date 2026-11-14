import { useQuery } from '@tanstack/react-query';
import { fetchNotificationDetail } from '../api';
import { notificationKeys } from '../queryKeys';
import { isNotificationId } from '../utils';
import { notificationRetry, notificationRetryDelay } from './queryOptions';

/** Detalhe autorizado, mesmo fora da página carregada. */
export function useNotificationDetail(userId: string | null, id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.detail(userId ?? '', id ?? ''),
    enabled: enabled && Boolean(userId) && isNotificationId(id),
    queryFn: ({ signal }) => fetchNotificationDetail(id ?? '', signal),
    retry: notificationRetry,
    retryDelay: notificationRetryDelay,
  });
}
