import api from '@/config/axiosConfig';
import { PHOTO_COMMENTS_ENDPOINT } from './constants';
import type {
  PhotoCommentNotification,
  PhotoCommentNotificationsPage,
  AdminPhotoCommentResponse,
  CreatePhotoCommentRequest,
  ModeratePhotoCommentRequest,
  OwnPhotoCommentResponse,
  PhotoCommentDeletedResponse,
  PhotoCommentModerationQuery,
  PhotoCommentResponse,
  PhotoCommentsPage,
  PhotoCommentsQuery,
} from './types';

// Each screen renders its own errors and retry controls; avoid duplicate global toasts.
export async function fetchPublishedPhotoComments(
  mediaId: string,
  params: PhotoCommentsQuery,
  signal?: AbortSignal
): Promise<PhotoCommentsPage<PhotoCommentResponse>> {
  const { data } = await api.get<PhotoCommentsPage<PhotoCommentResponse>>(
    `${PHOTO_COMMENTS_ENDPOINT}/photos/${mediaId}`,
    { params, signal, skipGlobalError: true }
  );
  return data;
}

export async function fetchOwnPhotoComments(
  mediaId: string,
  params: PhotoCommentsQuery,
  signal?: AbortSignal
): Promise<PhotoCommentsPage<OwnPhotoCommentResponse>> {
  const { data } = await api.get<PhotoCommentsPage<OwnPhotoCommentResponse>>(
    `${PHOTO_COMMENTS_ENDPOINT}/photos/${mediaId}/mine`,
    { params, signal, skipGlobalError: true }
  );
  return data;
}

export async function createPhotoComment(
  mediaId: string,
  payload: CreatePhotoCommentRequest
): Promise<OwnPhotoCommentResponse> {
  const { data } = await api.post<OwnPhotoCommentResponse>(
    `${PHOTO_COMMENTS_ENDPOINT}/photos/${mediaId}`,
    payload,
    { skipGlobalError: true }
  );
  return data;
}

export async function fetchPhotoCommentModeration(
  params: PhotoCommentModerationQuery,
  signal?: AbortSignal
): Promise<PhotoCommentsPage<AdminPhotoCommentResponse>> {
  const { data } = await api.get<PhotoCommentsPage<AdminPhotoCommentResponse>>(
    `${PHOTO_COMMENTS_ENDPOINT}/moderation`,
    { params, signal, skipGlobalError: true }
  );
  return data;
}

export async function moderatePhotoComment(
  id: string,
  payload: ModeratePhotoCommentRequest
): Promise<OwnPhotoCommentResponse> {
  const { data } = await api.patch<OwnPhotoCommentResponse>(
    `${PHOTO_COMMENTS_ENDPOINT}/${id}/moderation`,
    payload,
    { skipGlobalError: true }
  );
  return data;
}

export async function deletePhotoComment(id: string): Promise<PhotoCommentDeletedResponse> {
  const { data } = await api.delete<PhotoCommentDeletedResponse>(
    `${PHOTO_COMMENTS_ENDPOINT}/${id}`,
    { skipGlobalError: true }
  );
  return data;
}

export async function fetchPhotoCommentNotifications(
  params: PhotoCommentsQuery,
  signal?: AbortSignal
): Promise<PhotoCommentNotificationsPage> {
  const { data } = await api.get<PhotoCommentNotificationsPage>(
    `${PHOTO_COMMENTS_ENDPOINT}/notifications`,
    { params, signal, skipGlobalError: true }
  );
  return data;
}

export async function markPhotoCommentNotificationRead(
  id: string
): Promise<PhotoCommentNotification> {
  const { data } = await api.patch<PhotoCommentNotification>(
    `${PHOTO_COMMENTS_ENDPOINT}/notifications/${id}/read`,
    {},
    { skipGlobalError: true }
  );
  return data;
}
