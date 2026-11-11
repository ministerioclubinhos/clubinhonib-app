import { MediaItem, MediaType, MediaUploadType } from '@/store/slices/types';
import { MEDIA_PLATFORM_LABELS } from '@/components/common/media/constants';
import {
  MATERIAL_DESCRIPTION_MARKERS,
  SPECIAL_MATERIAL_TAG,
  WEEK_MATERIAL_CARD_DESCRIPTION_MAX_CHARS,
  WEEK_MATERIAL_MEDIA_TABS,
  WEEK_MATERIAL_FALLBACK_FILE_EXTENSION,
  WEEK_MATERIAL_FILE_PREFIX,
  WEEK_MATERIAL_PAYLOAD_FIELD,
} from './constants';
import {
  WeekMaterialFormValues,
  WeekMaterialType,
  WeekMaterialMediaGroup,
  WeekMaterialMediaResponse,
  WeekMaterialMediaDraft,
  WeekMaterialMediaRequest,
  WeekMaterialPageRequest,
  WeekMaterialResponse,
  WeekMaterialSortField,
  WeekMaterialSortOrder,
} from './types';

/** Shortens a text for card display, appending an ellipsis when cut. */
export const truncate = (
  text: string,
  max = WEEK_MATERIAL_CARD_DESCRIPTION_MAX_CHARS,
): string => (text.length > max ? `${text.slice(0, max)}...` : text);

/**
 * Formats an ISO date for the pt-BR UI.
 *
 * Uma data inválida vira travessão em vez de "Invalid Date" no card.
 */
export const formatDate = (date?: string | null): string => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('pt-BR');
};

/** True when the item holds a file that must be uploaded with the request. */
export const isUploadedMedia = (item: MediaItem): boolean =>
  item.uploadType === MediaUploadType.UPLOAD;

/** Builds the multipart field name of an uploaded file. */
export const buildFileFieldName = (
  mediaType: MediaType,
  index: number,
  fileName: string,
): string => {
  const extension =
    fileName.split('.').pop() || WEEK_MATERIAL_FALLBACK_FILE_EXTENSION;
  return `${WEEK_MATERIAL_FILE_PREFIX[mediaType]}_${index}.${extension}`;
};

/**
 * Maps one media item to its request contract, appending its file to the form
 * data when the item carries a newly selected local file.
 */
export const toMediaRequest = (
  item: MediaItem,
  index: number,
  mediaType: MediaType,
  formData: FormData,
): WeekMaterialMediaRequest => {
  const isUpload = isUploadedMedia(item);
  const hasNewFile = isUpload && item.file instanceof File;
  const fieldKey = hasNewFile
    ? buildFileFieldName(mediaType, index, (item.file as File).name)
    : undefined;

  if (hasNewFile && fieldKey) {
    formData.append(fieldKey, item.file as File, fieldKey);
  }

  return {
    ...(item.id ? { id: item.id } : {}),
    title: item.title,
    description: item.description,
    mediaType,
    uploadType: item.uploadType,
    isLocalFile: isUpload,
    // A newly uploaded file has only a local blob URL, which the API must ignore.
    url: hasNewFile ? undefined : item.url,
    platformType: isUpload ? null : (item.platformType ?? null),
    ...(fieldKey ? { fieldKey } : {}),
    ...(isUpload && item.size ? { size: item.size } : {}),
  };
};

/** Builds the JSON payload of a create/update request. */
export const buildWeekMaterialPayload = (
  values: WeekMaterialFormValues,
  media: WeekMaterialMediaDraft,
  formData: FormData,
  pageId?: string,
): WeekMaterialPageRequest => ({
  ...(pageId ? { id: pageId } : {}),
  pageTitle: values.pageTitle,
  pageSubtitle: values.pageSubtitle,
  pageDescription: withSpecialMaterialTag(
    values.pageDescription,
    values.materialType === undefined
      ? isSpecialMaterialDescription(values.pageDescription)
      : values.materialType === WeekMaterialType.SPECIAL,
  ),
  currentWeek: values.currentWeek,
  videos: media.videos.map((item, index) =>
    toMediaRequest(item, index, MediaType.VIDEO, formData),
  ),
  documents: media.documents.map((item, index) =>
    toMediaRequest(item, index, MediaType.DOCUMENT, formData),
  ),
  images: media.images.map((item, index) =>
    toMediaRequest(item, index, MediaType.IMAGE, formData),
  ),
  audios: media.audios.map((item, index) =>
    toMediaRequest(item, index, MediaType.AUDIO, formData),
  ),
});

/** Builds the multipart body of a create/update request. */
export const buildWeekMaterialFormData = (
  values: WeekMaterialFormValues,
  media: WeekMaterialMediaDraft,
  pageId?: string,
): FormData => {
  const formData = new FormData();
  const payload = buildWeekMaterialPayload(values, media, formData, pageId);
  formData.append(WEEK_MATERIAL_PAYLOAD_FIELD, JSON.stringify(payload));
  return formData;
};

/** Reads the media lists of a page into the shape edited by the admin form. */
export const toMediaDraft = (
  material: WeekMaterialResponse | null,
): WeekMaterialMediaDraft => ({
  videos: (material?.videos ?? []) as MediaItem[],
  documents: (material?.documents ?? []) as MediaItem[],
  images: (material?.images ?? []) as MediaItem[],
  audios: (material?.audios ?? []) as MediaItem[],
});

/** Media list of a page for the given media type. */
export const selectMediaByType = (
  material: WeekMaterialResponse,
  mediaType: MediaType,
): WeekMaterialResponse['videos'] => {
  switch (mediaType) {
    case MediaType.VIDEO:
      return material.videos ?? [];
    case MediaType.DOCUMENT:
      return material.documents ?? [];
    case MediaType.IMAGE:
      return material.images ?? [];
    case MediaType.AUDIO:
      return material.audios ?? [];
    default:
      return [];
  }
};

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: WeekMaterialSortField;
  order: WeekMaterialSortOrder;
} {
  const [sort, order] = value.split(':');
  return {
    sort: sort === 'title' ? 'title' : 'createdAt',
    order: order === 'ASC' ? 'ASC' : 'DESC',
  };
}

/** Total de mídias da página, somando os quatro tipos. */
export function totalMediaCount(summary: {
  videoCount: number;
  documentCount: number;
  imageCount: number;
  audioCount: number;
}): number {
  return (
    summary.videoCount +
    summary.documentCount +
    summary.imageCount +
    summary.audioCount
  );
}


/**
 * Tamanho de um arquivo enviado, em KB ou MB.
 *
 * Só entra na tela quando a API mandou o tamanho: um "0 KB" ao lado do nome do
 * arquivo diz menos do que não dizer nada.
 */
export function formatMediaSize(size?: number): string {
  if (!size || size <= 0) return '';

  const kilobytes = size / 1024;
  if (kilobytes < 1024) return `${Math.round(kilobytes)} KB`;

  return `${(kilobytes / 1024).toFixed(1).replace('.', ',')} MB`;
}

/**
 * De onde a mídia vem, em uma linha.
 *
 * Os detalhes mostravam a URL crua: para um upload isso é o endereço do objeto
 * no S3, longo e sem sentido para quem administra. O que ajuda é saber se o
 * material é arquivo ou link — e, no arquivo, quanto ele pesa.
 */
export function mediaSourceLabel(item: WeekMaterialMediaResponse): string {
  const isUpload =
    item.uploadType === MediaUploadType.UPLOAD || item.isLocalFile === true;

  if (isUpload) {
    const size = formatMediaSize(item.size);
    return size ? `Arquivo enviado · ${size}` : 'Arquivo enviado';
  }

  const platform = item.platformType
    ? MEDIA_PLATFORM_LABELS[item.platformType]
    : undefined;

  return platform ? `Link · ${platform}` : 'Link';
}

/**
 * As mídias da página agrupadas por tipo, na ordem das abas, **sem os tipos
 * vazios**.
 *
 * Uma aba que não tem nada a mostrar só ocupa espaço na tela de detalhes; e
 * uma página sem mídia nenhuma devolve lista vazia, para a tela dizer isso uma
 * vez em vez de repetir quatro vazios.
 */
export function mediaGroupsOf(
  material: WeekMaterialResponse | null,
): WeekMaterialMediaGroup[] {
  if (!material) return [];

  return WEEK_MATERIAL_MEDIA_TABS.map((tab) => ({
    mediaType: tab.mediaType,
    label: tab.label,
    items: selectMediaByType(material, tab.mediaType),
  })).filter((group) => group.items.length > 0);
}

/** Quantas mídias a página tem, somando os quatro tipos. */
export function countMediaOf(material: WeekMaterialResponse | null): number {
  return mediaGroupsOf(material).reduce((total, group) => total + group.items.length, 0);
}

export { SPECIAL_MATERIAL_TAG };

export const isSpecialMaterialDescription = (description?: string | null): boolean =>
  Boolean(description?.includes(SPECIAL_MATERIAL_TAG));

/**
 * Descrição como o leitor deve vê-la: sem as marcas técnicas de tipo e de
 * origem. Toda exibição de descrição de material passa por aqui.
 */
export const cleanMaterialDescription = (description?: string | null): string =>
  MATERIAL_DESCRIPTION_MARKERS.reduce(
    (text, marker) => text.replace(marker, ' '),
    description ?? '',
  )
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+(\r?\n)/g, '$1')
    .trim();

/** Mantido para os chamadores antigos; remove todas as marcas técnicas. */
export const stripSpecialMaterialTag = cleanMaterialDescription;

/** Garante (ou remove) a marca de Material Especial; texto vazio permanece vazio. */
export const withSpecialMaterialTag = (description: string, special: boolean): string => {
  const clean = cleanMaterialDescription(description);
  if (!clean) return '';
  return special ? `${clean} ${SPECIAL_MATERIAL_TAG}` : clean;
};
