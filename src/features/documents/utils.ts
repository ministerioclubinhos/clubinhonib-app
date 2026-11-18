import {
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';

import {
  DOCUMENT_FILE_FIELD,
  DOCUMENT_PAYLOAD_FIELD,
} from './constants';
import type { MediaItem } from '@/store/slices/types';

import type {
  DocumentFormErrors,
  DocumentMediaResponse,
  DocumentFormValues,
  DocumentMediaRequest,
  DocumentRequest,
  DocumentResponse,
  DocumentSortField,
  DocumentSortOrder,
} from './types';

export const platformLabel = (
  platform?: MediaPlatform | null,
): string => {
  switch (platform) {
    case MediaPlatform.GOOGLE_DRIVE:
      return 'Google Drive';
    case MediaPlatform.ONEDRIVE:
      return 'OneDrive';
    case MediaPlatform.DROPBOX:
      return 'Dropbox';
    case MediaPlatform.ANY:
      return 'Outro';
    default:
      return '—';
  }
};

export const uploadTypeLabel = (
  type?: MediaUploadType | null,
): string => {
  switch (type) {
    case MediaUploadType.LINK:
      return 'Link';
    case MediaUploadType.UPLOAD:
      return 'Upload';
    default:
      return '—';
  }
};

export const mediaTypeLabel = (type?: MediaType | null): string => {
  switch (type) {
    case MediaType.DOCUMENT:
      return 'Documento';
    default:
      return type ?? '—';
  }
};

/** Formata o tamanho do arquivo para leitura humana. */
export function formatFileSize(size?: number | null): string {
  if (!size || size <= 0) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

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

/** Duas letras do nome, para o avatar do card. */
export function documentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Converte a mídia da API no formato dos componentes de mídia compartilhados.
 *
 * O contrato usa `null` para o que pode faltar; `MediaItem` usa campos
 * opcionais. A tradução fica num lugar só, em vez de espalhar `?? undefined`.
 */
export function toMediaItem(media: DocumentMediaResponse | null): MediaItem | null {
  if (!media) return null;

  return {
    id: media.id,
    title: media.title ?? '',
    description: media.description ?? '',
    mediaType: media.mediaType,
    uploadType: media.uploadType,
    platformType: media.platformType ?? undefined,
    url: media.url,
    isLocalFile: media.isLocalFile,
    originalName: media.originalName ?? undefined,
    size: media.size ?? undefined,
  };
}

/** Estado inicial do formulário, para criação ou a partir do documento. */
export function toFormValues(
  document: DocumentResponse | null,
): DocumentFormValues {
  const media = document?.media ?? null;

  return {
    name: document?.name ?? '',
    description: document?.description ?? '',
    uploadType: media?.uploadType ?? MediaUploadType.LINK,
    url: media && !media.isLocalFile ? media.url : '',
    platformType: media?.platformType ?? MediaPlatform.ANY,
    file: null,
    storedMedia: media,
  };
}

/** Quais campos obrigatórios ainda estão pendentes. */
export function validateForm(values: DocumentFormValues): DocumentFormErrors {
  const missingMedia =
    values.uploadType === MediaUploadType.LINK
      ? !values.url.trim()
      : !values.file && !values.storedMedia?.isLocalFile;

  return {
    name: !values.name.trim(),
    description: !values.description.trim(),
    media: missingMedia,
  };
}

/** True quando algum campo obrigatório está pendente. */
export function hasErrors(errors: DocumentFormErrors): boolean {
  return errors.name || errors.description || errors.media;
}

/** Monta a mídia enviada no corpo da requisição. */
export function toMediaRequest(
  values: DocumentFormValues,
): DocumentMediaRequest {
  const isUpload = values.uploadType === MediaUploadType.UPLOAD;
  const name = values.name.trim();

  return {
    // O id da mídia atual mantém o arquivo no S3 quando a edição não o troca.
    ...(values.storedMedia?.id ? { id: values.storedMedia.id } : {}),
    title: name,
    description: values.description.trim(),
    mediaType: MediaType.DOCUMENT,
    uploadType: values.uploadType,
    isLocalFile: isUpload,
    // Num upload sem arquivo novo a url volta vazia de propósito: quem
    // reaproveita o objeto guardado é o servidor, pelo id da mídia.
    url: isUpload ? '' : values.url.trim(),
    ...(isUpload ? {} : { platformType: values.platformType }),
    ...(isUpload && values.file
      ? { originalName: values.file.name, size: values.file.size }
      : {}),
    ...(isUpload ? { fileField: DOCUMENT_FILE_FIELD } : {}),
  };
}

/** Corpo multipart de criação e de edição. */
export function buildDocumentFormData(
  values: DocumentFormValues,
  documentId?: string,
): FormData {
  const payload: DocumentRequest = {
    ...(documentId ? { id: documentId } : {}),
    name: values.name.trim(),
    description: values.description.trim(),
    media: toMediaRequest(values),
  };

  const formData = new FormData();

  if (values.uploadType === MediaUploadType.UPLOAD && values.file) {
    formData.append(DOCUMENT_FILE_FIELD, values.file);
  }

  formData.append(DOCUMENT_PAYLOAD_FIELD, JSON.stringify(payload));

  return formData;
}

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: DocumentSortField;
  order: DocumentSortOrder;
} {
  const [sort, order] = value.split(':');
  return {
    sort: sort === 'name' ? 'name' : 'createdAt',
    order: order === 'ASC' ? 'ASC' : 'DESC',
  };
}
