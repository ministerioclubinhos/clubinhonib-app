import { useEffect, useState } from 'react';
import { STUDIO_ELAPSED_TICK_MS } from './constants';
import { generationElapsedSeconds } from './generation.utils';

/**
 * Seconds a generation has been running. With the server's `startedAt` the count
 * survives a page reload; without it, it counts from when this screen saw it start.
 */
export function useElapsedSeconds(active: boolean, startedAt?: string | null): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    if (!active) return;
    const mountedAt = Date.now();
    const read = () =>
      generationElapsedSeconds(startedAt) ?? Math.floor((Date.now() - mountedAt) / 1000);
    setSeconds(read());
    const timer = setInterval(() => setSeconds(read()), STUDIO_ELAPSED_TICK_MS);
    return () => clearInterval(timer);
  }, [active, startedAt]);
  return seconds;
}
