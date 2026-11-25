import { PLAY_SCOPE } from '@/features/play/constants';
import type { PlayScope } from '@/features/play/types';
import { MediaItem, MediaType, MediaUploadType } from '@/store/slices/types';
import {
  VIDEO_FILE_FIELD_PREFIX,
  VIDEO_THUMBNAIL_FIELD_PREFIX,
  VIDEO_PAGE_PAYLOAD_FIELD,
  VIDEO_TITLE_MAX_LENGTH,
} from './constants';
import {
  VideoDraft,
  VideoItemRequest,
  VideoPageFormErrors,
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
export const buildVideoFieldKey = (index: number): string => `${VIDEO_FILE_FIELD_PREFIX}-${index}`;

/**
 * Atributos de Play enviados por vídeo. A API recusa campo que o modo não
 * aceita, então só viaja o que o modo atual permite.
 */
export const toPlayRequest = (
  video: VideoDraft,
  scope: PlayScope,
  index: number,
  formData: FormData
): Pick<
  VideoItemRequest,
  'inPlay' | 'featured' | 'position' | 'thumbnailField' | 'durationSeconds'
> => {
  if (scope === PLAY_SCOPE.NONE) return {};
  const inPlay = scope === PLAY_SCOPE.SELECTED ? Boolean(video.inPlay) : undefined;
  const withAttributes = scope === PLAY_SCOPE.ALL || inPlay === true;

  let thumbnailField: string | undefined;
  if (withAttributes && video.thumbnailFile) {
    thumbnailField = `${VIDEO_THUMBNAIL_FIELD_PREFIX}-${index}`;
    formData.append(thumbnailField, video.thumbnailFile);
  }

  return {
    ...(inPlay !== undefined ? { inPlay } : {}),
    ...(withAttributes
      ? {
          featured: Boolean(video.featured),
          ...(typeof video.position === 'number' ? { position: video.position } : {}),
          ...(thumbnailField ? { thumbnailField } : {}),
          ...(typeof video.durationSeconds === 'number'
            ? { durationSeconds: video.durationSeconds }
            : {}),
        }
      : {}),
  };
};

/**
 * Mapeia um vídeo para o contrato de requisição, anexando o arquivo apenas
 * quando ele é novo — um upload já salvo é reenviado pela URL, e a API
 * preserva o objeto que está no S3.
 */
export const toVideoRequest = (
  video: VideoDraft,
  index: number,
  formData: FormData,
  playScope: PlayScope = PLAY_SCOPE.NONE
): VideoItemRequest => {
  const isUpload = isUploadedVideo(video);
  // Um arquivo escolhido nesta sessão sempre viaja, inclusive para um vídeo já
  // salvo (troca de arquivo ou link virando upload). Sem isso a URL local de
  // pré-visualização (`blob:`) era gravada como se fosse o vídeo.
  const isNewUpload = isUpload && Boolean(video.file);
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
    ...toPlayRequest(video, playScope, index, formData),
  };
};

/** Monta o JSON enviado no campo multipart. */
export const buildVideoPagePayload = (
  values: VideoPageFormValues,
  videos: VideoDraft[],
  formData: FormData,
  pageId?: string
): VideoPageRequest => ({
  ...(pageId ? { id: pageId } : {}),
  title: values.title.trim(),
  description: values.description.trim(),
  public: values.public,
  play: { scope: values.playScope, categoryId: values.playCategoryId },
  videos: videos.map((video, index) =>
    toVideoRequest(video, index, formData, values.playScope)
  ),
});

/** Monta o corpo multipart de criação/edição. */
export const buildVideoPageFormData = (
  values: VideoPageFormValues,
  videos: VideoDraft[],
  pageId?: string
): FormData => {
  const formData = new FormData();

  formData.append(
    VIDEO_PAGE_PAYLOAD_FIELD,
    JSON.stringify(buildVideoPagePayload(values, videos, formData, pageId))
  );

  return formData;
};

/** Valores iniciais do formulário a partir da página carregada. */
export const toFormValues = (page: VideoPageResponse | null): VideoPageFormValues => ({
  title: page?.title ?? '',
  description: page?.description ?? '',
  public: page?.public ?? true,
  playScope: page?.play?.scope ?? PLAY_SCOPE.NONE,
  playCategoryId: page?.play?.categoryId ?? null,
});

/** Vídeos da página no formato editável do formulário. */
export const toVideoDrafts = (page: VideoPageResponse | null): VideoDraft[] =>
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

/** Valida o que a API também cobra, para o erro aparecer antes do envio. */
export const validateVideoPageForm = (values: VideoPageFormValues): VideoPageFormErrors => ({
  title: !values.title.trim() || values.title.length > VIDEO_TITLE_MAX_LENGTH,
  description: !values.description.trim(),
});

/** True quando o título (ou a descrição) do vídeo contém a busca. */
export const videoMatchesQuery = (video: VideoDraft, query: string): boolean => {
  const term = query.trim().toLocaleLowerCase('pt-BR');
  if (!term) return true;
  return (
    video.title.toLocaleLowerCase('pt-BR').includes(term) ||
    video.description.toLocaleLowerCase('pt-BR').includes(term)
  );
};
