import api from '@/config/axiosConfig';
import {
  PLAY_SUBMISSION_TIMEOUT_MS,
  PLAY_SUBMISSIONS_ADMIN_ENDPOINT,
  PLAY_SUBMISSIONS_ENDPOINT,
} from './constants';
import type {
  PlayGalleryOption,
  PlaySubmission,
  PlaySubmissionStatus,
  PlaySubmissionsPage,
} from './types';

/** Envia o vídeo; `onProgress` recebe 0–100 enquanto o arquivo sobe. */
export async function apiCreatePlaySubmission(
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<PlaySubmission> {
  const { data } = await api.post<PlaySubmission>(PLAY_SUBMISSIONS_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: PLAY_SUBMISSION_TIMEOUT_MS,
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}

export async function apiListMyPlaySubmissions(): Promise<PlaySubmission[]> {
  const { data } = await api.get<PlaySubmission[]>(`${PLAY_SUBMISSIONS_ENDPOINT}/mine`);
  return data;
}

export async function apiWithdrawPlaySubmission(id: string): Promise<void> {
  await api.delete(`${PLAY_SUBMISSIONS_ENDPOINT}/${id}`);
}

export async function apiListPlaySubmissionsAdmin(
  status: PlaySubmissionStatus,
  page: number
): Promise<PlaySubmissionsPage> {
  const { data } = await api.get<PlaySubmissionsPage>(PLAY_SUBMISSIONS_ADMIN_ENDPOINT, {
    params: { status, page },
  });
  return data;
}

export async function apiListPlayGalleries(): Promise<PlayGalleryOption[]> {
  const { data } = await api.get<PlayGalleryOption[]>('/play/admin/galleries');
  return data;
}

export async function apiApprovePlaySubmission(
  id: string,
  galleryId: string,
  featured: boolean
): Promise<PlaySubmission> {
  const { data } = await api.post<PlaySubmission>(
    `${PLAY_SUBMISSIONS_ADMIN_ENDPOINT}/${id}/approve`,
    { galleryId, featured }
  );
  return data;
}

export async function apiRejectPlaySubmission(id: string, reason: string): Promise<PlaySubmission> {
  const { data } = await api.post<PlaySubmission>(
    `${PLAY_SUBMISSIONS_ADMIN_ENDPOINT}/${id}/reject`,
    { reason: reason.trim() || undefined }
  );
  return data;
}
