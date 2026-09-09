import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { ApiClient, PNG_1X1 } from './api';

/**
 * Páginas de conteúdo criadas pela API para os cenários de edição e exclusão.
 *
 * Os testes que checam órfão no S3 precisam de arquivo de verdade no bucket —
 * uma mídia por link não prova nada, porque não há objeto para sobrar. Por
 * isso cada seed sobe pelo menos um upload e devolve a URL resultante.
 */

/** Endereços dos quatro tipos de página cobertos. */
export const PAGE_ENDPOINTS = {
  weekMaterial: '/week-material-pages',
  videoPage: '/video-pages',
  ideasPage: '/ideas-pages',
  imagePage: '/image-pages',
} as const;

/** Campo do multipart que carrega o JSON de cada tipo de página. */
export const PAGE_PAYLOAD_FIELDS = {
  weekMaterial: 'weekMaterialsPageData',
  videoPage: 'videosPageData',
  ideasPage: 'ideasMaterialsPageData',
  imagePage: 'imageData',
} as const;

/** Arquivo do multipart, no formato que o `ApiClient` espera. */
export interface SeedFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/** Item de mídia enviado no payload de criação. */
export interface SeedMediaInput {
  title: string;
  description: string;
  uploadType: MediaUploadType;
  mediaType: MediaType;
  isLocalFile: boolean;
  fieldKey?: string;
  url?: string;
  platformType?: MediaPlatform;
}

/** Mídia como a API devolve. */
export interface SeedMediaItem {
  id: string;
  title: string;
  url: string;
  isLocalFile: boolean;
  mediaType: MediaType;
}

export interface WeekMaterialSeed {
  id: string;
  title: string;
  videos: SeedMediaItem[];
  documents: SeedMediaItem[];
  images: SeedMediaItem[];
  audios: SeedMediaItem[];
}

export interface VideoPageSeed {
  id: string;
  title: string;
  videos: SeedMediaItem[];
}

export interface IdeasPageSeed {
  id: string;
  title: string;
  sections: { id: string; title: string; medias: SeedMediaItem[] }[];
}

export interface ImagePageSeed {
  id: string;
  title: string;
  sections: { id: string; caption: string; mediaItems: SeedMediaItem[] }[];
}

/** PNG mínimo com nome próprio, para o campo de arquivo do multipart. */
export function pngFile(name: string): SeedFile {
  return { name, mimeType: 'image/png', buffer: PNG_1X1 };
}

/**
 * Mídia enviada como arquivo.
 *
 * O `fieldKey` casa o item com o campo do multipart; sem ele a API recusa o
 * item (`MEDIA_FIELD_MISSING`) em vez de gravar uma mídia sem arquivo.
 */
export function uploadMedia(
  fieldKey: string,
  title: string,
  mediaType: MediaType = MediaType.IMAGE,
): SeedMediaInput {
  return {
    title,
    description: `Arquivo de ${title}`,
    uploadType: MediaUploadType.UPLOAD,
    mediaType,
    isLocalFile: true,
    fieldKey,
  };
}

/** Mídia por link: fica na página sem ocupar nada no bucket. */
export function linkMedia(title: string, mediaType: MediaType = MediaType.VIDEO): SeedMediaInput {
  return {
    title,
    description: `Link de ${title}`,
    uploadType: MediaUploadType.LINK,
    mediaType,
    isLocalFile: false,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platformType: MediaPlatform.YOUTUBE,
  };
}

/** Todas as mídias de arquivo de uma lista, já como URLs do bucket. */
export function uploadedUrls(items: readonly SeedMediaItem[]): string[] {
  return items.filter((item) => item.isLocalFile).map((item) => item.url);
}

/** Página de materiais da semana com as mídias informadas. */
export async function seedWeekMaterial(
  api: ApiClient,
  title: string,
  media: { videos?: SeedMediaInput[]; documents?: SeedMediaInput[]; images?: SeedMediaInput[] },
  files: Record<string, SeedFile>,
): Promise<WeekMaterialSeed> {
  return api.postMultipart<WeekMaterialSeed>(
    PAGE_ENDPOINTS.weekMaterial,
    {
      [PAGE_PAYLOAD_FIELDS.weekMaterial]: JSON.stringify({
        pageTitle: title,
        pageSubtitle: 'Tema da semana',
        pageDescription: 'Página criada pelo Playwright',
        videos: media.videos ?? [],
        documents: media.documents ?? [],
        images: media.images ?? [],
      }),
    },
    files,
  );
}

/** Galeria de vídeos com as mídias informadas. */
export async function seedVideoPage(
  api: ApiClient,
  title: string,
  videos: SeedMediaInput[],
  files: Record<string, SeedFile>,
): Promise<VideoPageSeed> {
  return api.postMultipart<VideoPageSeed>(
    PAGE_ENDPOINTS.videoPage,
    {
      [PAGE_PAYLOAD_FIELDS.videoPage]: JSON.stringify({
        title,
        description: 'Galeria criada pelo Playwright',
        public: true,
        videos,
      }),
    },
    files,
  );
}

/** Página de ideias com uma seção por lista de mídias. */
export async function seedIdeasPage(
  api: ApiClient,
  title: string,
  sections: { title: string; medias: SeedMediaInput[] }[],
  files: Record<string, SeedFile>,
): Promise<IdeasPageSeed> {
  return api.postMultipart<IdeasPageSeed>(
    PAGE_ENDPOINTS.ideasPage,
    {
      [PAGE_PAYLOAD_FIELDS.ideasPage]: JSON.stringify({
        title,
        description: 'Página criada pelo Playwright',
        public: true,
        sections: sections.map((section) => ({
          title: section.title,
          description: `Seção ${section.title}`,
          public: true,
          medias: section.medias,
        })),
      }),
    },
    files,
  );
}

/** Galeria de fotos com uma seção por lista de imagens. */
export async function seedImagePage(
  api: ApiClient,
  title: string,
  sections: { caption: string; mediaItems: SeedMediaInput[] }[],
  files: Record<string, SeedFile>,
): Promise<ImagePageSeed> {
  return api.postMultipart<ImagePageSeed>(
    PAGE_ENDPOINTS.imagePage,
    {
      [PAGE_PAYLOAD_FIELDS.imagePage]: JSON.stringify({
        title,
        description: 'Galeria criada pelo Playwright',
        public: true,
        sections: sections.map((section) => ({
          caption: section.caption,
          description: `Seção ${section.caption}`,
          public: true,
          mediaItems: section.mediaItems,
        })),
      }),
    },
    files,
  );
}
