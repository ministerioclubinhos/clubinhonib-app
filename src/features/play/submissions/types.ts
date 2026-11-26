import type { MediaPlatform, MediaUploadType } from '@/store/slices/types';

export type PlaySubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface PlaySubmitter {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PlaySubmission {
  id: string;
  title: string;
  description: string;
  uploadType: MediaUploadType;
  platformType: MediaPlatform | null;
  url: string;
  originalName: string | null;
  size: number | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  status: PlaySubmissionStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  mediaItemId: string | null;
  /** Só na visão do administrador. */
  submitter?: PlaySubmitter | null;
}

export interface PlaySubmissionCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export interface PlaySubmissionsPage {
  data: PlaySubmission[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
  counts: PlaySubmissionCounts;
}

export interface PlayGalleryOption {
  id: string;
  title: string;
  scope: string;
}

/** O que o formulário de envio coleta. */
export interface PlaySubmissionDraft {
  title: string;
  description: string;
  mode: 'link' | 'upload';
  url: string;
  file: File | null;
  thumbnail: File | null;
  durationSeconds: number | null;
}
