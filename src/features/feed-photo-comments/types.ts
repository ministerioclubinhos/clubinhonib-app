import type { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

export enum PhotoCommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PhotoCommentTab {
  PUBLISHED = 'published',
  MINE = 'mine',
}

export enum CommentModerationTab {
  TESTIMONIALS = 'testimonials',
  PHOTOS = 'photos',
}

export interface PhotoCommentResponse {
  id: string;
  mediaId: string;
  text: string;
  authorName: string;
  createdAt: string;
}

export interface OwnPhotoCommentResponse extends PhotoCommentResponse {
  status: PhotoCommentStatus;
  moderationReason: string | null;
  version: number;
}

export interface AdminPhotoCommentResponse extends OwnPhotoCommentResponse {
  /** Missing on older API responses, which only contain photos. */
  mediaType?: MediaType;
  authorId: string;
  photoUrl: string;
  photoUploadType: MediaUploadType;
  photoPlatformType: MediaPlatform | null;
  photoTitle: string;
  sectionId: string;
  sectionCaption: string;
  reviewedAt: string | null;
  moderatedByName: string | null;
}

export interface PhotoCommentsPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface PhotoCommentsQuery {
  page: number;
  limit: number;
}

export interface PhotoCommentModerationQuery extends PhotoCommentsQuery {
  status?: PhotoCommentStatus;
  searchString?: string;
}

export interface CreatePhotoCommentRequest {
  text: string;
  requestId: string;
}

export interface ModeratePhotoCommentRequest {
  status: PhotoCommentStatus.APPROVED | PhotoCommentStatus.REJECTED;
  expectedVersion: number;
  reason?: string;
}

export interface PhotoCommentDeletedResponse {
  message: string;
}

export interface PhotoCommentsPanelProps {
  mediaId: string | undefined;
}

export interface PhotoCommentDraft {
  text: string;
  requestId: string;
}

export interface SubmitPhotoCommentVariables {
  mediaId: string;
  payload: CreatePhotoCommentRequest;
}

export interface ModeratePhotoCommentVariables {
  id: string;
  payload: ModeratePhotoCommentRequest;
}

export interface PhotoCommentCardProps {
  comment: PhotoCommentResponse | OwnPhotoCommentResponse;
  onDelete?: () => void;
  deleting?: boolean;
}

export interface PhotoCommentReviewDialogProps {
  comment: AdminPhotoCommentResponse | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onModerate: (
    comment: AdminPhotoCommentResponse,
    status: ModeratePhotoCommentRequest['status'],
    reason?: string
  ) => Promise<boolean>;
}

export interface PhotoCommentNotification {
  id: string;
  commentId: string;
  commentText: string;
  reason: string;
  createdAt: string;
  readAt: string | null;
}

export interface PhotoCommentNotificationsPage extends PhotoCommentsPage<PhotoCommentNotification> {
  unreadCount: number;
}

export interface PhotoCommentNotificationDialogProps {
  notification: PhotoCommentNotification | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onRead: (id: string) => Promise<void>;
}
