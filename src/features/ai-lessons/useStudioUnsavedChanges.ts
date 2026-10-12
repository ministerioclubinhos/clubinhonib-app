import { useEffect } from 'react';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { STUDIO_LEAVE_MESSAGE } from './constants';

/** BrowserRouter has no blocker. Keep its history index and cancel rejected pop events before its listener runs. */
export function useStudioUnsavedChanges(dirty: boolean) {
  useUnsavedChangesGuard(dirty);
  useEffect(() => {
    if (!dirty) return;
    const index: unknown = window.history.state?.idx;
    let restoring = false;
    const onPopState = (event: PopStateEvent) => {
      if (restoring) {
        restoring = false;
        event.stopImmediatePropagation();
        return;
      }
      const nextIndex: unknown = event.state?.idx;
      if (typeof index !== 'number' || typeof nextIndex !== 'number') return;
      if (window.confirm(STUDIO_LEAVE_MESSAGE)) return;
      event.stopImmediatePropagation();
      restoring = true;
      window.history.go(index - nextIndex);
    };
    window.addEventListener('popstate', onPopState, true);
    return () => window.removeEventListener('popstate', onPopState, true);
  }, [dirty]);
  return () => !dirty || window.confirm(STUDIO_LEAVE_MESSAGE);
}
