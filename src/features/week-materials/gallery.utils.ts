import type { RouteData } from '@/store/slices/route/routeSlice';
import { getRoutePagePath } from '@/pages/TeacherArea/pagePaths';
import { MediaTargetType } from '@/store/slices/types';

import { MaterialGalleryCategory, MaterialGallerySort, type MaterialGalleryFilters } from './types';
import { cleanMaterialDescription, isSpecialMaterialDescription } from './utils';

const normalizeSearch = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();

export const getPublicWeekMaterialRoutes = (routes: readonly RouteData[]): RouteData[] =>
  routes.filter((route) => route.public && route.entityType === MediaTargetType.WeekMaterialsPage);

export function filterMaterialGallery(
  routes: readonly RouteData[],
  { search, category, sort }: MaterialGalleryFilters
): RouteData[] {
  const term = normalizeSearch(search);
  return routes
    .filter((route) => {
      const special = isSpecialMaterialDescription(route.description);
      if (category === MaterialGalleryCategory.SPECIAL && !special) return false;
      if (category === MaterialGalleryCategory.WEEKLY && special) return false;
      return normalizeSearch(
        `${route.title} ${route.subtitle ?? ''} ${cleanMaterialDescription(route.description)}`
      ).includes(term);
    })
    .sort((a, b) => {
      if (sort === MaterialGallerySort.TITLE)
        return a.title.localeCompare(b.title, 'pt-BR', { numeric: true });
      const difference = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return sort === MaterialGallerySort.OLDEST ? -difference : difference;
    });
}

export function getMaterialGalleryPath(
  route: RouteData,
  showSpecialFamilyDay: boolean,
  specialFamilyDayId: string
): string {
  return showSpecialFamilyDay && specialFamilyDayId && route.idToFetch === specialFamilyDayId
    ? '/dia-especial-familia'
    : getRoutePagePath(route);
}
