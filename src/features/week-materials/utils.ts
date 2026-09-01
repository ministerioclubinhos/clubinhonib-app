import { MediaItem, MediaType, MediaUploadType } from '@/store/slices/types';
import {
  WEEK_MATERIAL_CARD_DESCRIPTION_MAX_CHARS,
  WEEK_MATERIAL_FALLBACK_FILE_EXTENSION,
  WEEK_MATERIAL_FILE_PREFIX,
  WEEK_MATERIAL_PAYLOAD_FIELD,
} from './constants';
import {
  WeekMaterialFormValues,
  WeekMaterialMediaDraft,
  WeekMaterialMediaRequest,
  WeekMaterialPageRequest,
  WeekMaterialResponse,
} from './types';

/** Shortens a text for card display, appending an ellipsis when cut. */
export const truncate = (
  text: string,
  max = WEEK_MATERIAL_CARD_DESCRIPTION_MAX_CHARS,
): string => (text.length > max ? `${text.slice(0, max)}...` : text);

/** Formats an ISO date for the pt-BR UI. */
export const formatDate = (date?: string): string =>
  date ? new Date(date).toLocaleString('pt-BR') : 'Não disponível';

/** Filters pages by title, case-insensitively. */
export const filterByTitle = (
  materials: WeekMaterialResponse[],
  term: string,
): WeekMaterialResponse[] => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return materials;
  return materials.filter((material) =>
    (material.title || '').toLowerCase().includes(normalized),
  );
};

/** Sorts pages from the newest to the oldest. */
export const sortByCreationDesc = (
  materials: WeekMaterialResponse[],
): WeekMaterialResponse[] =>
  [...materials].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

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
  pageDescription: values.pageDescription,
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
