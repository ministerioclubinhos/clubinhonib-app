import { useEffect, useState } from 'react';
import { STUDIO_ELAPSED_TICK_MS } from './constants';

/** Seconds since `active` became true in this screen; resets when it turns false. */
export function useElapsedSeconds(active: boolean): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    if (!active) return;
    const startedAt = Date.now();
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      STUDIO_ELAPSED_TICK_MS
    );
    return () => clearInterval(timer);
  }, [active]);
  return seconds;
}
