import type { NotificationStatusFilter } from './types';

/** Toda chave começa pela conta: respostas de contas diferentes nunca se misturam. */
export const notificationKeys = {
  all: ['notifications'] as const,
  user: (userId: string) => ['notifications', userId] as const,
  summary: (userId: string) => ['notifications', userId, 'summary'] as const,
  lists: (userId: string) => ['notifications', userId, 'list'] as const,
  list: (userId: string, status: NotificationStatusFilter) =>
    ['notifications', userId, 'list', status] as const,
  details: (userId: string) => ['notifications', userId, 'detail'] as const,
  detail: (userId: string, id: string) => ['notifications', userId, 'detail', id] as const,
  emailPreferences: (userId: string) => ['notifications', userId, 'email-preferences'] as const,
};
