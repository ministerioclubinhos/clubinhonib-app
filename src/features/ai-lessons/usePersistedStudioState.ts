import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/slices';
import { STUDIO_STORAGE_DEBOUNCE_MS } from './constants';
import { resolveStudioStorage, writeStudioSnapshot } from './draftStorage';

/**
 * The authenticated user id, kept after the session is dropped so the unmount flush that
 * follows an expired session still writes under the right owner.
 */
export function useStudioUserId(): string {
  const userId = useSelector((state: RootState) => state.auth.user?.id ?? null);
  const sticky = useRef<string>('');
  if (userId) sticky.current = userId;
  return sticky.current;
}

/**
 * Mirrors unsaved Studio work to sessionStorage. Writes are debounced while typing and
 * flushed synchronously on unmount and `pagehide`, which is what protects the work when an
 * expired session unmounts the page.
 */
export function usePersistedStudioState(key: string, value: unknown): void {
  const values = useRef<Record<string, unknown>>({});
  if (key) values.current[key] = value;
  useEffect(() => {
    if (!key) return;
    const timer = setTimeout(
      () => writeStudioSnapshot(resolveStudioStorage(), key, value),
      STUDIO_STORAGE_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [key, value]);
  useEffect(() => {
    if (!key) return;
    const flush = () => writeStudioSnapshot(resolveStudioStorage(), key, values.current[key]);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
      delete values.current[key];
    };
  }, [key]);
}
