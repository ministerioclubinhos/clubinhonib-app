import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MediaTargetType } from '@/store/slices/types';

/** Rotas simuladas no store, e o mapa de flags da sessão. */
let routes: { id: string; entityType: string }[] = [];
let ligadas: Record<string, boolean> = {};

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ routes: { routes } }),
}));

vi.mock('./FeatureFlagsProvider', () => ({
  useFeatureFlagsContext: () => ({
    isEnabled: (key: string) => Boolean(ligadas[key]),
  }),
}));

import { isRouteTypeVisible, useVisibleRoutes } from './useVisibleRoutes';

describe('useVisibleRoutes', () => {
  it('esconde as páginas do tipo cuja flag está desligada', () => {
    routes = [
      { id: 'a', entityType: MediaTargetType.ImagesPage },
      { id: 'b', entityType: MediaTargetType.VideosPage },
    ];
    ligadas = { public_galleries: false, public_videos: true };

    const { result } = renderHook(() => useVisibleRoutes());

    expect(result.current.map((route) => route.id)).toEqual(['b']);
  });

  it('deixa passar o tipo que não tem flag', () => {
    // Um tipo fora do mapa não é escondido por engano.
    routes = [{ id: 'x', entityType: MediaTargetType.IdeasSection }];
    ligadas = {};

    const { result } = renderHook(() => useVisibleRoutes());

    expect(result.current).toHaveLength(1);
  });

  it('decide por tipo, e não por rota', () => {
    routes = [
      { id: 'a', entityType: MediaTargetType.ImagesPage },
      { id: 'b', entityType: MediaTargetType.ImagesPage },
    ];
    ligadas = { public_galleries: false };

    const { result } = renderHook(() => useVisibleRoutes());

    expect(result.current).toHaveLength(0);
  });
});

describe('isRouteTypeVisible', () => {
  const ligada = (key: string) => key === 'public_galleries';

  it('responde pela flag do tipo', () => {
    expect(isRouteTypeVisible(MediaTargetType.ImagesPage, ligada)).toBe(true);
    expect(isRouteTypeVisible(MediaTargetType.VideosPage, ligada)).toBe(false);
  });

  it('aceita tipo desconhecido, que não tem flag', () => {
    expect(isRouteTypeVisible('OutroTipo', ligada)).toBe(true);
    expect(isRouteTypeVisible(undefined, ligada)).toBe(true);
  });
});
