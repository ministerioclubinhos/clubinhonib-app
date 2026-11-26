import { MediaTargetType } from '@/store/slices/types';

/** Tipo de coleção pública: álbum de fotos ou galeria de vídeos. */
export enum PublicMediaKind {
  Photos = 'photos',
  Videos = 'videos',
}

/** Filtro da galeria: os dois tipos juntos ou um só. */
export enum PublicMediaFilter {
  All = 'all',
  Photos = 'photos',
  Videos = 'videos',
}

/** Largura das páginas públicas: 98% no celular e 95% no desktop (md+). */
export const PUBLIC_MEDIA_PAGE_WIDTH = { xs: '98%', md: '95%' } as const;

export const PUBLIC_MEDIA_BASE_PATH = '/fotos-e-videos';

export const PUBLIC_MEDIA_KIND_PATH: Record<PublicMediaKind, string> = {
  [PublicMediaKind.Photos]: `${PUBLIC_MEDIA_BASE_PATH}/fotos`,
  [PublicMediaKind.Videos]: `${PUBLIC_MEDIA_BASE_PATH}/videos`,
};

export const PUBLIC_MEDIA_KIND_BY_ENTITY: Partial<Record<string, PublicMediaKind>> = {
  [MediaTargetType.ImagesPage]: PublicMediaKind.Photos,
  [MediaTargetType.VideosPage]: PublicMediaKind.Videos,
};

export const PUBLIC_MEDIA_KIND_LABEL: Record<PublicMediaKind, { singular: string; plural: string }> = {
  [PublicMediaKind.Photos]: { singular: 'Álbum de fotos', plural: 'Fotos' },
  [PublicMediaKind.Videos]: { singular: 'Galeria de vídeos', plural: 'Vídeos' },
};

export const PUBLIC_MEDIA_FILTERS: readonly { value: PublicMediaFilter; label: string }[] = [
  { value: PublicMediaFilter.All, label: 'Todos' },
  { value: PublicMediaFilter.Photos, label: 'Fotos' },
  { value: PublicMediaFilter.Videos, label: 'Vídeos' },
];

export const PUBLIC_MEDIA_ACCENT: Record<PublicMediaKind, string> = {
  [PublicMediaKind.Photos]: '#16a34a',
  [PublicMediaKind.Videos]: '#dc2626',
};

/** Quantas capas a seção da home mostra como prévia. */
export const SHOWCASE_PREVIEW_COUNT = 3;

export const PUBLIC_MEDIA_COVER_GRADIENT: Record<PublicMediaKind, string> = {
  [PublicMediaKind.Photos]: 'linear-gradient(135deg, #81d742 0%, #2f7d1a 100%)',
  [PublicMediaKind.Videos]: 'linear-gradient(135deg, #f87171 0%, #b91c1c 100%)',
};

export const PUBLIC_MEDIA_CTA_LABEL: Record<PublicMediaKind, string> = {
  [PublicMediaKind.Photos]: 'Ver álbum',
  [PublicMediaKind.Videos]: 'Ver vídeos',
};

/** Cada tipo vira um bloco com título próprio quando o filtro é "Todos". */
export const PUBLIC_MEDIA_GROUP_TITLE: Record<PublicMediaKind, string> = {
  [PublicMediaKind.Photos]: 'Álbuns de fotos',
  [PublicMediaKind.Videos]: 'Galerias de vídeos',
};
