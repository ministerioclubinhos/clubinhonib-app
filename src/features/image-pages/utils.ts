import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
import { IMAGE_PAGE_PAYLOAD_FIELD } from './constants';
import {
  GalleryMediaRequest,
  ImagePageFormValues,
  ImagePageRequest,
  ImagePageResponse,
  ImagePageSortField,
  ImagePageSortOrder,
  ImageSectionDraft,
} from './types';

/** Recorta um texto para exibição em card. */
export const truncate = (text: string = '', max = 100): string =>
  text.length > max ? `${text.slice(0, max)}...` : text;

/** Copia um texto para a área de transferência. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Nome do campo multipart de uma imagem enviada. */
export const buildMediaFieldKey = (
  sectionIndex: number,
  mediaIndex: number,
): string => `file_sec${sectionIndex}_mid${mediaIndex}`;

/** True quando a imagem é um arquivo enviado, e não um link. */
export const isUploadedMedia = (media: MediaItem): boolean =>
  media.uploadType === MediaUploadType.UPLOAD || media.isLocalFile === true;

/**
 * Mapeia uma imagem para o contrato de requisição, anexando o arquivo apenas
 * quando ele é novo — uma imagem já salva é reenviada pela URL, e a API
 * preserva o objeto que está no S3.
 */
export const toMediaRequest = (
  media: MediaItem,
  sectionIndex: number,
  mediaIndex: number,
  formData: FormData,
): GalleryMediaRequest => {
  const hasNewFile = Boolean(media.file);
  const fieldKey = hasNewFile
    ? buildMediaFieldKey(sectionIndex, mediaIndex)
    : undefined;

  if (hasNewFile && fieldKey && media.file) {
    formData.append(fieldKey, media.file);
  }

  return {
    ...(media.id ? { id: media.id } : {}),
    title: media.title || '',
    description: media.description || '',
    mediaType: MediaType.IMAGE,
    uploadType: media.uploadType || MediaUploadType.UPLOAD,
    isLocalFile: isUploadedMedia(media),
    // Um upload novo só tem a URL local de pré-visualização, que a API ignora.
    url: hasNewFile ? '' : media.url || '',
    platformType: media.platformType || MediaPlatform.ANY,
    ...(media.originalName ? { originalName: media.originalName } : {}),
    ...(media.size ? { size: media.size } : {}),
    ...(fieldKey ? { fieldKey } : {}),
  };
};

/** Monta o JSON enviado no campo multipart. */
export const buildImagePagePayload = (
  values: ImagePageFormValues,
  sections: ImageSectionDraft[],
  formData: FormData,
  pageId?: string,
): ImagePageRequest => ({
  ...(pageId ? { id: pageId } : {}),
  title: values.title.trim(),
  description: values.description.trim(),
  public: values.public,
  sections: sections.map((section, sectionIndex) => ({
    ...(section.id ? { id: section.id } : {}),
    caption: section.caption,
    description: section.description,
    public: section.public,
    mediaItems: section.mediaItems.map((media, mediaIndex) =>
      toMediaRequest(media, sectionIndex, mediaIndex, formData),
    ),
  })),
});

/** Monta o corpo multipart de criação/edição. */
export const buildImagePageFormData = (
  values: ImagePageFormValues,
  sections: ImageSectionDraft[],
  pageId?: string,
): FormData => {
  const formData = new FormData();

  formData.append(
    IMAGE_PAGE_PAYLOAD_FIELD,
    JSON.stringify(buildImagePagePayload(values, sections, formData, pageId)),
  );

  return formData;
};

/** Valores iniciais do formulário a partir da galeria carregada. */
export const toFormValues = (
  page: ImagePageResponse | null,
): ImagePageFormValues => ({
  title: page?.title ?? '',
  description: page?.description ?? '',
  public: page?.public ?? true,
});

/** Seções da galeria no formato editável do formulário. */
export const toSectionDrafts = (
  page: ImagePageResponse | null,
): ImageSectionDraft[] =>
  (page?.sections ?? []).map((section) => ({
    id: section.id,
    caption: section.caption,
    description: section.description,
    public: section.public,
    mediaItems: (section.mediaItems ?? []).map((media) => ({
      ...media,
      title: media.title ?? '',
      description: media.description ?? '',
      url: media.url ?? '',
      file: undefined,
    })) as MediaItem[],
  }));

/** Total de imagens em todas as seções. */
export const countMedia = (sections: ImageSectionDraft[]): number =>
  sections.reduce((total, section) => total + section.mediaItems.length, 0);

/**
 * Formata a data que a API devolve em ISO.
 *
 * Uma data inválida vira travessão em vez de "Invalid Date" no card.
 */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

/** Duas letras do título, para o avatar do card. */
export function pageInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: ImagePageSortField;
  order: ImagePageSortOrder;
} {
  const [sort, order] = value.split(':');
  return {
    sort: sort === 'title' ? 'title' : 'createdAt',
    order: order === 'ASC' ? 'ASC' : 'DESC',
  };
}
