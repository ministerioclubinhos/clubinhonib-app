import type { RouteData } from '@/store/slices/route/routeSlice';

import type { PublicMediaKind } from './constants';

/** Rota pública de fotos ou vídeos, já classificada. */
export interface PublicMediaItem {
  route: RouteData;
  kind: PublicMediaKind;
  /** Endereço público da página (nunca dentro da Área do Professor). */
  path: string;
}
