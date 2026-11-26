import { PhotoCommentStatus, type PhotoCommentModerationQuery } from './types';

export const PHOTO_COMMENTS_ENDPOINT = '/feed-photo-comments';
export const PHOTO_COMMENT_MAX_LENGTH = 1000;
export const PHOTO_COMMENT_REASON_MAX_LENGTH = 500;
export const PHOTO_COMMENTS_PAGE_SIZE = 10;
export const PHOTO_COMMENTS_PAGE_SIZES = [10, 20, 50];
export const PHOTO_COMMENTS_INITIAL_PAGE = 1;
export const PHOTO_COMMENTS_STALE_TIME_MS = 15_000;
export const PHOTO_COMMENTS_TOUCH_TARGET = 44;
export const PHOTO_COMMENTS_ALL_STATUSES = '';

export const PHOTO_COMMENT_STATUS_LABELS: Record<PhotoCommentStatus, string> = {
  [PhotoCommentStatus.PENDING]: 'Aguardando aprovação',
  [PhotoCommentStatus.APPROVED]: 'Publicado',
  [PhotoCommentStatus.REJECTED]: 'Não aprovado',
};

export const PHOTO_COMMENT_STATUS_COLORS = {
  [PhotoCommentStatus.PENDING]: 'warning',
  [PhotoCommentStatus.APPROVED]: 'success',
  [PhotoCommentStatus.REJECTED]: 'error',
} as const;

export const photoCommentKeys = {
  all: ['feed-photo-comments'] as const,
  published: (mediaId: string | undefined, userId: string | null) =>
    ['feed-photo-comments', 'published', mediaId, userId] as const,
  mine: (mediaId: string | undefined, userId: string | null) =>
    ['feed-photo-comments', 'mine', mediaId, userId] as const,
  moderation: (userId: string | null, query: PhotoCommentModerationQuery) =>
    ['feed-photo-comments', 'moderation', userId, query] as const,
};

export const PHOTO_NOTIFICATIONS_POLL_MS = 30_000;
export const photoNotificationKey = (userId: string | null) =>
  ['feed-photo-comments', 'notifications', userId] as const;
