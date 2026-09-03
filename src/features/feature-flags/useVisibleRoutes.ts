import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@/store/slices';
import type { RouteData } from '@/store/slices/route/routeSlice';
import { MediaTargetType } from '@/store/slices/types';

import { useFeatureFlagsContext } from './FeatureFlagsProvider';
import { FEATURE, type FeatureKey } from './features';

/**
 * A flag que libera cada tipo de página publicada.
 *
 * As páginas do site vêm do banco como rotas dinâmicas. Amarrar a flag ao tipo
 * resolve de uma vez a rota, o card na home e o atalho na área do professor —
 * em vez de repetir o mesmo filtro em cada tela e correr o risco de esquecer
 * um deles.
 *
 * Um tipo fora deste mapa não tem flag e aparece sempre.
 */
export const ROUTE_TYPE_FLAG: Partial<Record<MediaTargetType, FeatureKey>> = {
  [MediaTargetType.ImagesPage]: FEATURE.PUBLIC_GALLERIES,
  [MediaTargetType.VideosPage]: FEATURE.PUBLIC_VIDEOS,
  [MediaTargetType.Meditation]: FEATURE.WEEKLY_MEDITATION,
  [MediaTargetType.IdeasPage]: FEATURE.IDEAS_SHARING,
  [MediaTargetType.WeekMaterialsPage]: FEATURE.WEEKLY_MATERIALS,
  [MediaTargetType.Document]: FEATURE.DOCUMENTS_LIBRARY,
  [MediaTargetType.Informative]: FEATURE.INFORMATIVE_BANNERS,
  [MediaTargetType.Event]: FEATURE.EVENTS_SECTION,
};

/** True quando o tipo da rota não tem flag, ou a flag dela está ligada. */
export function isRouteTypeVisible(
  entityType: string | undefined,
  isEnabled: (key: string) => boolean,
): boolean {
  const flag = ROUTE_TYPE_FLAG[entityType as MediaTargetType];
  return !flag || isEnabled(flag);
}

/**
 * As rotas publicadas que a sessão atual enxerga.
 *
 * É a lista que as telas devem usar no lugar de `state.routes.routes`: uma
 * página cujo recurso foi desligado some da navegação inteira de uma vez.
 */
export function useVisibleRoutes(): RouteData[] {
  const routes = useSelector((state: RootState) => state.routes.routes);
  const { isEnabled } = useFeatureFlagsContext();

  return useMemo(
    () => routes.filter((route) => isRouteTypeVisible(route.entityType, isEnabled)),
    [routes, isEnabled],
  );
}
