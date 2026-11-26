import { useMemo } from 'react';

import { useVisibleRoutes } from '@/features/feature-flags';

import { selectPublicMediaItems } from './utils';
import type { PublicMediaItem } from './types';

/** As coleções públicas de fotos e vídeos que o visitante pode abrir. */
export function usePublicMediaItems(): PublicMediaItem[] {
  const routes = useVisibleRoutes();
  return useMemo(() => {
    const feedId = import.meta.env.VITE_FEED_MINISTERIO_ID;
    return selectPublicMediaItems(routes, feedId ? [String(feedId)] : []);
  }, [routes]);
}
