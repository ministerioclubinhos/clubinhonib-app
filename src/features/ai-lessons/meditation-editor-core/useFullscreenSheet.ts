import { useEffect, useRef, useState } from 'react';
import { FOCUSABLE_SELECTOR, MEDITATION_FULLSCREEN_LABEL } from './constants';

/**
 * Fullscreen mode for the meditation sheets, behaving like a modal dialog: focus moves in,
 * Tab stays inside, Escape closes from anywhere and focus returns to where it was.
 */
export function useFullscreenSheet() {
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fullscreen) return;
    const container = containerRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (container && !container.contains(document.activeElement)) container.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false);
        return;
      }
      if (event.key !== 'Tab' || !container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!container.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [fullscreen]);
  return {
    fullscreen,
    toggleFullscreen: () => setFullscreen((value) => !value),
    containerRef,
    dialogProps: fullscreen
      ? ({
          role: 'dialog',
          'aria-modal': true,
          'aria-label': MEDITATION_FULLSCREEN_LABEL,
          tabIndex: -1,
        } as const)
      : {},
  };
}
