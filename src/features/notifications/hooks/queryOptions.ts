import { getHttpStatus } from '@/utils/apiError';
import { notificationsRetryDelay, shouldRetryNotifications } from '../utils';

/** Backoff limitado; erros de autorização/ausência não se repetem. */
export const notificationRetry = (failureCount: number, error: Error): boolean =>
  shouldRetryNotifications(failureCount, getHttpStatus(error));

export const notificationRetryDelay = (attempt: number): number =>
  notificationsRetryDelay(attempt);
