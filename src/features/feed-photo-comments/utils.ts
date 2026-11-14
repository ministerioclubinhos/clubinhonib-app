import { PHOTO_COMMENT_MAX_LENGTH } from './constants';
import {
  PhotoCommentStatus,
  type PhotoCommentModerationQuery,
  type AdminPhotoCommentResponse,
} from './types';
import { MediaType } from '@/store/slices/types';
import { getMediaPreviewUrl } from '@/utils/getMediaPreviewUrl';

export function getPhotoCommentPreviewUrl(
  comment: Pick<
    AdminPhotoCommentResponse,
    'photoUrl' | 'photoTitle' | 'photoUploadType' | 'photoPlatformType' | 'mediaType'
  >
): string {
  if (comment.mediaType === MediaType.VIDEO) return comment.photoUrl;
  return getMediaPreviewUrl({
    url: comment.photoUrl,
    title: comment.photoTitle,
    description: '',
    mediaType: MediaType.IMAGE,
    uploadType: comment.photoUploadType,
    platformType: comment.photoPlatformType ?? undefined,
  });
}

export function validatePhotoComment(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return 'Escreva um comentário antes de enviar.';
  if (trimmed.length > PHOTO_COMMENT_MAX_LENGTH)
    return `Use até ${PHOTO_COMMENT_MAX_LENGTH} caracteres.`;
  return null;
}

export function isPhotoCommentStatus(value: string): value is PhotoCommentStatus {
  return Object.values(PhotoCommentStatus).some((status) => status === value);
}

export function buildPhotoCommentModerationQuery(
  page: number,
  limit: number,
  search: string,
  status: PhotoCommentStatus | ''
): PhotoCommentModerationQuery {
  return {
    page,
    limit,
    ...(search.trim() ? { searchString: search.trim() } : {}),
    ...(status ? { status } : {}),
  };
}

export function formatPhotoCommentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
