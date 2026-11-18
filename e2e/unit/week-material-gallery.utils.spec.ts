import { expect, test } from '@playwright/test';

import {
  filterMaterialGallery,
  getMaterialGalleryPath,
  getPublicWeekMaterialRoutes,
} from '@/features/week-materials/gallery.utils';
import {
  MaterialGalleryCategory,
  MaterialGallerySort,
  type MaterialGalleryFilters,
} from '@/features/week-materials/types';
import { Type, type RouteData } from '@/store/slices/route/routeSlice';
import { MediaTargetType } from '@/store/slices/types';

const route = (overrides: Partial<RouteData> = {}): RouteData => ({
  id: 'weekly',
  title: 'Semana 2 — Oração',
  subtitle: 'Lucas 15',
  description: 'Atividades para o encontro. [origem:licao:internal-id]',
  public: true,
  current: false,
  path: 'materiais_semana_2',
  idToFetch: 'page-weekly',
  entityId: 'page-weekly',
  entityType: MediaTargetType.WeekMaterialsPage,
  type: Type.Page,
  image: null,
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
  ...overrides,
});
const weekly = route();
const special = route({
  id: 'special',
  title: 'Semana 10 — Família',
  subtitle: 'Salmos 23',
  description: '[tipo:especial] Encontro em família',
  createdAt: '2026-11-02T00:00:00Z',
});
const filters: MaterialGalleryFilters = {
  search: '',
  category: MaterialGalleryCategory.ALL,
  sort: MaterialGallerySort.NEWEST,
};

test('a galeria mostra apenas rotas públicas de materiais', () => {
  expect(
    getPublicWeekMaterialRoutes([
      weekly,
      route({ public: false }),
      route({ entityType: MediaTargetType.IdeasPage }),
    ])
  ).toEqual([weekly]);
});

test('busca título, referência e descrição sem depender de acentos ou espaços', () => {
  for (const search of ['  ORACAO  ', 'lucas 15', 'atividades']) {
    expect(filterMaterialGallery([weekly, special], { ...filters, search })).toEqual([weekly]);
  }
  for (const search of ['origem:licao', 'internal-id', 'tipo:especial']) {
    expect(filterMaterialGallery([weekly, special], { ...filters, search })).toEqual([]);
  }
});

test('combina busca e categoria e ordena sem alterar os dados compartilhados', () => {
  const materials = [weekly, special];
  expect(filterMaterialGallery(materials, filters)).toEqual([special, weekly]);
  expect(
    filterMaterialGallery(materials, { ...filters, sort: MaterialGallerySort.OLDEST })
  ).toEqual([weekly, special]);
  expect(filterMaterialGallery(materials, { ...filters, sort: MaterialGallerySort.TITLE })).toEqual(
    [weekly, special]
  );
  expect(
    filterMaterialGallery(materials, {
      ...filters,
      category: MaterialGalleryCategory.SPECIAL,
      search: 'familia',
    })
  ).toEqual([special]);
  expect(
    filterMaterialGallery(materials, { ...filters, category: MaterialGalleryCategory.WEEKLY })
  ).toEqual([weekly]);
  expect(materials).toEqual([weekly, special]);
});

test('preserva o desvio do Dia da Família somente com a flag ligada e o ID correspondente', () => {
  expect(getMaterialGalleryPath(weekly, true, weekly.idToFetch)).toBe('/dia-especial-familia');
  expect(getMaterialGalleryPath(weekly, false, weekly.idToFetch)).toBe('/materiais_semana_2');
  expect(getMaterialGalleryPath(weekly, true, 'other')).toBe('/materiais_semana_2');
  expect(getMaterialGalleryPath(weekly, true, '')).toBe('/materiais_semana_2');
  expect(getMaterialGalleryPath(route({ path: '/materiais_semana_2' }), false, '')).toBe(
    '/materiais_semana_2'
  );
});
