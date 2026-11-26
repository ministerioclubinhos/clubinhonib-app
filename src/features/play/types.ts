import type { MediaPlatform, MediaUploadType } from '@/store/slices/types';
import type { PLAY_SCOPE, PLAY_SECTION, PLAY_SORT } from './constants';

export type PlayScope = (typeof PLAY_SCOPE)[keyof typeof PLAY_SCOPE];
export type PlaySort = (typeof PLAY_SORT)[keyof typeof PLAY_SORT];
export type PlaySectionKind = (typeof PLAY_SECTION)[keyof typeof PLAY_SECTION];

/** Onde o professor parou. */
export interface PlayProgress {
  positionSeconds: number;
  durationSeconds: number | null;
  completed: boolean;
}

/** Vídeo do Play, como a API devolve. */
export interface PlayVideo {
  id: string;
  title: string;
  description: string;
  uploadType: MediaUploadType;
  platformType?: MediaPlatform;
  url: string;
  isLocalFile: boolean;
  originalName?: string;
  size?: number;
  galleryId: string;
  galleryTitle: string;
  featured: boolean;
  createdAt: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categoryId: string | null;
  categoryName: string | null;
  viewCount: number;
  favorite: boolean;
  progress: PlayProgress | null;
}

export interface PaginatedPlayVideos {
  data: PlayVideo[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface PlayVideoQuery {
  page?: number;
  limit?: number;
  search?: string;
  galleryId?: string;
  categoryId?: string;
  favorites?: boolean;
  inProgress?: boolean;
  featured?: boolean;
  sort?: PlaySort;
}

export interface PlayHomeSection {
  id: string;
  kind: PlaySectionKind;
  title: string;
  categoryId?: string;
  galleryId?: string;
  videos: PlayVideo[];
}

export interface PlayHome {
  sections: PlayHomeSection[];
}

export interface PlayCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  videoCount: number;
}

export interface PlayVideoStat {
  id: string;
  title: string;
  galleryTitle: string;
  views: number;
  viewers: number;
  completed: number;
  lastViewedAt: string | null;
}

export interface PlayStats {
  totalVideos: number;
  totalViews: number;
  totalViewers: number;
  videos: PlayVideoStat[];
}
