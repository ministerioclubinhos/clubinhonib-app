import { createContext, useContext } from 'react';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../constants';
import { BrowserPermissionState, SoundPlayResult, type NotificationContextValue } from '../types';

const noop = () => undefined;

/** Valor fora do provider: central inerte. */
export const INERT_NOTIFICATION_CONTEXT: NotificationContextValue = {
  enabled: false,
  historyEnabled: false,
  userId: null,
  unreadCount: 0,
  pendingItems: [],
  summaryError: false,
  summaryLoading: false,
  pulse: false,
  centerOpen: false,
  anchorEl: null,
  openCenter: noop,
  closeCenter: noop,
  resolvePending: noop,
  refresh: noop,
  soundAvailable: false,
  browserAvailable: false,
  preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
  permission: BrowserPermissionState.UNSUPPORTED,
  soundBlocked: false,
  setSoundEnabled: async () => undefined,
  testSound: async () => SoundPlayResult.UNSUPPORTED,
  unlockSound: async () => undefined,
  setBrowserEnabled: async () => BrowserPermissionState.UNSUPPORTED,
  testBrowser: async () => false,
};

export const NotificationContext = createContext<NotificationContextValue>(
  INERT_NOTIFICATION_CONTEXT
);

export function useNotificationCenter(): NotificationContextValue {
  return useContext(NotificationContext);
}
