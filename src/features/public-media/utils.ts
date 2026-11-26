import type { RouteData } from '@/store/slices/route/routeSlice';

import {
  PUBLIC_MEDIA_KIND_BY_ENTITY,
  PUBLIC_MEDIA_KIND_PATH,
  PublicMediaFilter,
  PublicMediaKind,
} from './constants';
import type { PublicMediaItem } from './types';

export function getPublicMediaKind(entityType: string): PublicMediaKind | null {
  return PUBLIC_MEDIA_KIND_BY_ENTITY[entityType] ?? null;
}

/** `/fotos-e-videos/<fotos|videos>/:id` — a página pública da coleção. */
export function getPublicMediaPath(kind: PublicMediaKind, idToFetch: string): string {
  return `${PUBLIC_MEDIA_KIND_PATH[kind]}/${idToFetch}`;
}

/**
 * Coleções públicas de fotos e vídeos. `excludedIds` tira a galeria que
 * alimenta o feed do ministério, que tem tela própria.
 */
export function selectPublicMediaItems(
  routes: readonly RouteData[],
  excludedIds: readonly string[] = []
): PublicMediaItem[] {
  return routes.flatMap((route) => {
    const kind = getPublicMediaKind(route.entityType);
    if (!kind || !route.public || excludedIds.includes(route.idToFetch)) return [];
    return [{ route, kind, path: getPublicMediaPath(kind, route.idToFetch) }];
  });
}

export function filterPublicMediaItems(
  items: readonly PublicMediaItem[],
  filter: PublicMediaFilter,
  search: string
): PublicMediaItem[] {
  const term = search.trim().toLowerCase();
  return items.filter((item) => {
    if (filter === PublicMediaFilter.Photos && item.kind !== PublicMediaKind.Photos) return false;
    if (filter === PublicMediaFilter.Videos && item.kind !== PublicMediaKind.Videos) return false;
    if (!term) return true;
    return (
      item.route.title?.toLowerCase().includes(term) ||
      item.route.description?.toLowerCase().includes(term)
    );
  });
}

export function countByKind(items: readonly PublicMediaItem[], kind: PublicMediaKind): number {
  return items.filter((item) => item.kind === kind).length;
}
