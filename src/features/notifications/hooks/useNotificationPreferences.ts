import { useCallback, useSyncExternalStore } from 'react';
import { notificationPreferencesStore } from '../services/notificationPreferencesStore';
import type { NotificationPreferences } from '../types';

export function useNotificationPreferences(userId: string | null) {
  const preferences = useSyncExternalStore(
    notificationPreferencesStore.subscribe,
    () => notificationPreferencesStore.get(userId),
    () => notificationPreferencesStore.get(null)
  );
  const update = useCallback(
    (patch: Partial<NotificationPreferences>) => {
      if (!userId) return;
      notificationPreferencesStore.set(userId, {
        ...notificationPreferencesStore.get(userId),
        ...patch,
      });
    },
    [userId]
  );
  return { preferences, update };
}
