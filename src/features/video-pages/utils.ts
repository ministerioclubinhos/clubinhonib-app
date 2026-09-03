import { MediaItem, MediaType, MediaUploadType } from '@/store/slices/types';
import {
  VIDEO_FILE_FIELD_PREFIX,
  VIDEO_PAGE_PAYLOAD_FIELD,
} from './constants';
import {
  VideoDraft,
  VideoItemRequest,
  VideoPageFormValues,
  VideoPageRequest,
  VideoPageResponse,
  VideoPageSortField,
  VideoPageSortOrder,
} from './types';

/** Recorta um texto para exibição em card. */
export const truncate = (text: string = '', len = 100): string =>
  text.length > len ? `${text.slice(0, len)}...` : text;

/** Copia um texto para a área de transferência. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** True quando o vídeo é um arquivo enviado, e não um link. */
export const isUploadedVideo = (video: MediaItem): boolean =>
  video.uploadType === MediaUploadType.UPLOAD;

/** Nome do campo multipart de um vídeo enviado. */
export const buildVideoFieldKey = (index: number): string =>
  `${VIDEO_FILE_FIELD_PREFIX}-${index}`;

/**
 * Mapeia um vídeo para o contrato de requisição, anexando o arquivo apenas
 * quando ele é novo — um upload já salvo é reenviado pela URL, e a API
 * preserva o objeto que está no S3.
 */
export const toVideoRequest = (
  video: VideoDraft,
  index: number,
  formData: FormData,
): VideoItemRequest => {
  const isUpload = isUploadedVideo(video);
  const isNewUpload = isUpload && Boolean(video.file) && !video.id;
  const fieldKey = isNewUpload ? buildVideoFieldKey(index) : undefined;

  if (isNewUpload && fieldKey && video.file) {
    formData.append(fieldKey, video.file);
  }

  return {
    ...(video.id ? { id: video.id } : {}),
    title: video.title,
    description: video.description,
    mediaType: MediaType.VIDEO,
    uploadType: video.uploadType,
    isLocalFile: isUpload,
    // O upload novo só tem uma URL local de pré-visualização, que a API ignora.
    ...(isNewUpload ? {} : { url: video.url }),
    ...(isUpload ? {} : { platformType: video.platformType }),
    ...(video.file ? { originalName: video.file.name } : {}),
    ...(fieldKey ? { fieldKey } : {}),
  };
};

/** Monta o JSON enviado no campo multipart. */
export const buildVideoPagePayload = (
  values: VideoPageFormValues,
  videos: VideoDraft[],
  formData: FormData,
  pageId?: string,
): VideoPageRequest => ({
  ...(pageId ? { id: pageId } : {}),
  title: values.title.trim(),
  description: values.description.trim(),
  public: values.public,
  videos: videos.map((video, index) => toVideoRequest(video, index, formData)),
});

/** Monta o corpo multipart de criação/edição. */
export const buildVideoPageFormData = (
  values: VideoPageFormValues,
  videos: VideoDraft[],
  pageId?: string,
): FormData => {
  const formData = new FormData();

  formData.append(
    VIDEO_PAGE_PAYLOAD_FIELD,
    JSON.stringify(buildVideoPagePayload(values, videos, formData, pageId)),
  );

  return formData;
};

/** Valores iniciais do formulário a partir da página carregada. */
export const toFormValues = (
  page: VideoPageResponse | null,
): VideoPageFormValues => ({
  title: page?.title ?? '',
  description: page?.description ?? '',
  public: page?.public ?? true,
});

/** Vídeos da página no formato editável do formulário. */
export const toVideoDrafts = (
  page: VideoPageResponse | null,
): VideoDraft[] =>
  (page?.videos ?? []).map((video) => ({ ...video, file: undefined }));

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
  sort: VideoPageSortField;
  order: VideoPageSortOrder;
} {
  const [sort, order] = value.split(':');
  return {
    sort: sort === 'title' ? 'title' : 'createdAt',
    order: order === 'ASC' ? 'ASC' : 'DESC',
  };
}
