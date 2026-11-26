import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllNotificationsRead, markNotificationRead } from '../api';
import { notificationKeys } from '../queryKeys';
import type { NotificationDetailDto } from '../types';

/**
 * Leituras explícitas. Nenhuma se repete sozinha; respostas que chegam depois
 * de trocar de conta são ignoradas.
 */
export function useNotificationMutations(userId: string | null) {
  const client = useQueryClient();
  const currentUser = useRef(userId);
  currentUser.current = userId;

  const markRead = useMutation({
    mutationFn: async (id: string) => ({ owner: userId, notice: await markNotificationRead(id) }),
    onSuccess: ({ owner, notice }) => {
      if (!owner || owner !== currentUser.current) return;
      client.setQueryData<NotificationDetailDto>(
        notificationKeys.detail(owner, notice.id),
        (previous) => (previous ? { ...previous, readAt: notice.readAt } : previous)
      );
      void client.invalidateQueries({ queryKey: notificationKeys.summary(owner) });
      void client.invalidateQueries({ queryKey: notificationKeys.lists(owner) });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => ({ owner: userId, result: await markAllNotificationsRead() }),
    onSuccess: ({ owner, result }) => {
      if (!owner || owner !== currentUser.current) return;
      client.setQueryData(notificationKeys.summary(owner), result.summary);
      void client.invalidateQueries({ queryKey: notificationKeys.lists(owner) });
      void client.invalidateQueries({ queryKey: notificationKeys.details(owner) });
    },
    // Em timeout o servidor pode ter concluído: reconsulta antes de nova tentativa.
    onError: () => {
      if (!userId || userId !== currentUser.current) return;
      void client.invalidateQueries({ queryKey: notificationKeys.summary(userId) });
      void client.invalidateQueries({ queryKey: notificationKeys.lists(userId) });
    },
  });

  return { markRead, markAllRead };
}
