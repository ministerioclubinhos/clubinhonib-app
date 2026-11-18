import { useCallback, useEffect, useRef, useState } from 'react';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

/**
 * Leave guard for Studio screens. BrowserRouter has no blocker, so a rejected history pop is
 * undone before the router sees it, and the shared unsaved-changes dialog decides.
 */
export function useStudioUnsavedChanges(dirty: boolean) {
  useUnsavedChangesGuard(dirty);
  const [open, setOpen] = useState(false);
  const pendingLeave = useRef<(() => void) | null>(null);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    if (!dirty) return;
    const index: unknown = window.history.state?.idx;
    let restoring = false;
    let allowed = false;
    const onPopState = (event: PopStateEvent) => {
      if (allowed) return;
      if (restoring) {
        restoring = false;
        event.stopImmediatePropagation();
        return;
      }
      const nextIndex: unknown = event.state?.idx;
      if (typeof index !== 'number' || typeof nextIndex !== 'number') return;
      event.stopImmediatePropagation();
      restoring = true;
      const delta = nextIndex - index;
      window.history.go(-delta);
      pendingLeave.current = () => {
        allowed = true;
        window.history.go(delta);
      };
      setOpen(true);
    };
    window.addEventListener('popstate', onPopState, true);
    return () => window.removeEventListener('popstate', onPopState, true);
  }, [dirty]);
  const requestLeave = useCallback((leave: () => void) => {
    if (!dirtyRef.current) {
      leave();
      return;
    }
    pendingLeave.current = leave;
    setOpen(true);
  }, []);
  return {
    requestLeave,
    dialog: {
      open,
      onStay: () => {
        pendingLeave.current = null;
        setOpen(false);
      },
      onLeave: () => {
        const leave = pendingLeave.current;
        pendingLeave.current = null;
        setOpen(false);
        leave?.();
      },
    },
  };
}
