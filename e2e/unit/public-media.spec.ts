import { expect, test } from '@playwright/test';

import { PublicMediaFilter, PublicMediaKind } from '../../src/features/public-media/constants';
import {
  filterPublicMediaItems,
  getPublicMediaPath,
  selectPublicMediaItems,
} from '../../src/features/public-media/utils';
import type { RouteData } from '../../src/store/slices/route/routeSlice';

const route = (over: Partial<RouteData>): RouteData =>
  ({ id: 'r', title: 'Título', description: '', public: true, idToFetch: 'p1', entityType: 'ImagesPage', path: 'x', image: null, ...over }) as RouteData;

test.describe('galeria pública de fotos e vídeos', () => {
  test('só entra rota pública de fotos ou vídeos, sem a do feed', () => {
    const items = selectPublicMediaItems(
      [
        route({ id: '1', idToFetch: 'a', entityType: 'ImagesPage' }),
        route({ id: '2', idToFetch: 'b', entityType: 'VideosPage' }),
        route({ id: '3', idToFetch: 'c', entityType: 'ImagesPage', public: false }),
        route({ id: '4', idToFetch: 'd', entityType: 'IdeasPage' }),
        route({ id: '5', idToFetch: 'feed', entityType: 'ImagesPage' }),
      ],
      ['feed']
    );
    expect(items.map((i) => i.route.idToFetch)).toEqual(['a', 'b']);
    expect(items[1].path).toBe('/fotos-e-videos/videos/b');
  });

  test('endereço público nunca fica na Área do Professor', () => {
    expect(getPublicMediaPath(PublicMediaKind.Photos, 'x')).toBe('/fotos-e-videos/fotos/x');
  });

  test('filtra por tipo e por busca', () => {
    const items = selectPublicMediaItems([
      route({ id: '1', idToFetch: 'a', entityType: 'ImagesPage', title: 'Natal' }),
      route({ id: '2', idToFetch: 'b', entityType: 'VideosPage', title: 'Páscoa' }),
    ]);
    expect(filterPublicMediaItems(items, PublicMediaFilter.Videos, '')).toHaveLength(1);
    expect(filterPublicMediaItems(items, PublicMediaFilter.All, 'nat')).toHaveLength(1);
  });
});
