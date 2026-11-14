import { DEFAULT_NOTIFICATION_PREFERENCES, notificationPreferencesKey } from '../constants';
import type { NotificationPreferences } from '../types';
import { parsePreferences, serializePreferences } from '../utils';

type Listener = () => void;

/**
 * Preferências por conta e navegador, em `localStorage` versionado, com
 * fallback em memória (modo privado, storage cheio ou bloqueado).
 * Mudanças em outra aba chegam pelo evento `storage`.
 */
class NotificationPreferencesStore {
  private readonly memory = new Map<string, string>();
  private readonly snapshots = new Map<string, { raw: string | null; value: NotificationPreferences }>();
  private readonly listeners = new Set<Listener>();
  private readonly defaults: NotificationPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };

  private readRaw(key: string): string | null {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return stored;
    } catch {
      /* Usa a memória. */
    }
    return this.memory.get(key) ?? null;
  }

  get(userId: string | null): NotificationPreferences {
    if (!userId) return this.defaults;
    const key = notificationPreferencesKey(userId);
    const raw = this.readRaw(key);
    const cached = this.snapshots.get(key);
    if (cached && cached.raw === raw) return cached.value;
    const value = parsePreferences(raw);
    this.snapshots.set(key, { raw, value });
    return value;
  }

  set(userId: string, preferences: NotificationPreferences): void {
    const key = notificationPreferencesKey(userId);
    const raw = serializePreferences(preferences);
    this.memory.set(key, raw);
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      /* Fica só na memória desta aba. */
    }
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith(notificationPreferencesKey(''))) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      this.listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  };
}

export const notificationPreferencesStore = new NotificationPreferencesStore();
