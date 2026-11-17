import { MaterialGalleryCategory, MaterialGallerySort } from './types';

export const MATERIAL_GALLERY_CATEGORIES = [
  { value: MaterialGalleryCategory.ALL, label: 'Todos os materiais', shortLabel: 'Todos' },
  { value: MaterialGalleryCategory.WEEKLY, label: 'Semanais', shortLabel: 'Semanais' },
  { value: MaterialGalleryCategory.SPECIAL, label: 'Especiais', shortLabel: 'Especiais' },
] as const;

export const MATERIAL_GALLERY_SORT_OPTIONS = [
  { value: MaterialGallerySort.NEWEST, label: 'Mais recentes' },
  { value: MaterialGallerySort.OLDEST, label: 'Mais antigos' },
  { value: MaterialGallerySort.TITLE, label: 'Título (A–Z)' },
] as const;

export const MATERIAL_GALLERY_SKELETONS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

export const MATERIAL_GALLERY_CONTENT_WIDTH = { xs: '98%', md: '95%' } as const;

export const MATERIAL_GALLERY_GRID = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'minmax(0, 1fr)',
    sm: 'repeat(2, minmax(0, 1fr))',
    lg: 'repeat(3, minmax(0, 1fr))',
  },
  gap: { xs: 2.5, md: 3 },
} as const;
