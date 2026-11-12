import { useEffect, useRef } from 'react';
import { isSaveShortcut } from './production.utils';

/**
 * Ctrl/Cmd+S saves the current edit. The browser's "save page" dialog is always
 * suppressed here: in an editor it is never what the shortcut is meant to do.
 */
export function useSaveShortcut(onSave: () => void): void {
  const handler = useRef(onSave);
  handler.current = onSave;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSaveShortcut(event)) return;
      event.preventDefault();
      // A held key repeats; one save per press is enough.
      if (!event.repeat) handler.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
