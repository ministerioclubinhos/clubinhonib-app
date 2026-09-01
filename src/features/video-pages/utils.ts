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
} from './types';

/** Recorta um texto para exibição em card. */
export const truncate = (text: string = '', len = 100): string =>
  text.length > len ? `${text.slice(0, len)}...` : text;

/** Formata uma data ISO para o pt-BR. */
export const formatDate = (date?: string): string =>
  date ? new Date(date).toLocaleString('pt-BR') : 'Não disponível';

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

/** Filtra páginas por título. */
export const filterByTitle = (
  pages: VideoPageResponse[],
  term: string,
): VideoPageResponse[] => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return pages;
  return pages.filter((page) =>
    (page.title || '').toLowerCase().includes(normalized),
  );
};
