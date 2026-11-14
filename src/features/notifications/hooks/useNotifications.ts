import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api';
import { NOTIFICATIONS_INITIAL_PAGE, NOTIFICATIONS_PAGE_SIZE } from '../constants';
import { notificationKeys } from '../queryKeys';
import type { NotificationStatusFilter } from '../types';
import { dedupeById } from '../utils';
import { notificationRetry, notificationRetryDelay } from './queryOptions';

/** Histórico sob demanda: só busca com a central aberta. */
export function useNotifications(
  userId: string | null,
  status: NotificationStatusFilter,
  enabled: boolean
) {
  const query = useInfiniteQuery({
    queryKey: notificationKeys.list(userId ?? '', status),
    enabled: enabled && Boolean(userId),
    initialPageParam: NOTIFICATIONS_INITIAL_PAGE,
    queryFn: ({ pageParam, signal }) =>
      fetchNotifications({ page: pageParam, limit: NOTIFICATIONS_PAGE_SIZE, status }, signal),
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
    refetchOnWindowFocus: true,
    retry: notificationRetry,
    retryDelay: notificationRetryDelay,
  });
  // Inserções entre páginas deslocam o offset: o mesmo aviso pode vir duas vezes.
  const items = useMemo(
    () => dedupeById(query.data?.pages.flatMap((page) => page.data) ?? []),
    [query.data]
  );
  return { query, items };
}
