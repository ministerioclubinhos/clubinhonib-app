import { STUDIO_STORAGE_MAX_CHARS, STUDIO_STORAGE_PREFIX } from './constants';
import { StudioSnapshotScope, type StudioStorage } from './types';

/**
 * Session-scoped recovery of unsaved Studio work. Content lives only in the tab's
 * sessionStorage, is namespaced by user, and never contains tokens or personal data.
 */
let persistenceSuppressed = false;

/** An explicit logout must not be undone by the unmount flush that follows it. */
export function suppressStudioPersistence(value: boolean): void {
  persistenceSuppressed = value;
}

export function resolveStudioStorage(): StudioStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function studioSnapshotKey(
  scope: StudioSnapshotScope,
  userId: string,
  entityId = ''
): string {
  return [STUDIO_STORAGE_PREFIX, userId, scope, entityId].filter(Boolean).join(':');
}

export function isEmptySnapshot(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.every(isEmptySnapshot);
  if (typeof value === 'object') return Object.values(value).every(isEmptySnapshot);
  return false;
}

/** Returns false when nothing was stored (storage unavailable, quota or size guard). */
export function writeStudioSnapshot(
  storage: StudioStorage | null,
  key: string,
  value: unknown
): boolean {
  if (!storage || !key || persistenceSuppressed) return false;
  try {
    if (isEmptySnapshot(value)) {
      storage.removeItem(key);
      return true;
    }
    const serialized = JSON.stringify(value);
    if (serialized.length > STUDIO_STORAGE_MAX_CHARS) {
      storage.removeItem(key);
      return false;
    }
    storage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function readStudioSnapshot<T>(
  storage: StudioStorage | null,
  key: string,
  isValid: (value: unknown) => value is T
): T | null {
  if (!storage || !key) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isValid(parsed) && !isEmptySnapshot(parsed)) return parsed;
    storage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

export function removeStudioSnapshot(storage: StudioStorage | null, key: string): void {
  if (!storage || !key) return;
  try {
    storage.removeItem(key);
  } catch {
    // Storage unavailable: nothing to clean.
  }
}

/** Drops every Studio snapshot that does not belong to `keepUserId` (all of them when omitted). */
export function purgeStudioSnapshots(storage: StudioStorage | null, keepUserId?: string): void {
  if (!storage) return;
  try {
    const keep = keepUserId ? `${STUDIO_STORAGE_PREFIX}:${keepUserId}:` : null;
    const doomed: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key || !key.startsWith(`${STUDIO_STORAGE_PREFIX}:`)) continue;
      if (keep && key.startsWith(keep)) continue;
      doomed.push(key);
    }
    doomed.forEach((key) => storage.removeItem(key));
  } catch {
    // Storage unavailable: nothing to clean.
  }
}
