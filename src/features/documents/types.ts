import { MediaItem } from 'store/slices/types';

export { MediaPlatform, MediaUploadType, MediaType } from 'store/slices/types';
export type { MediaItem } from 'store/slices/types';

export interface DocumentItem {
  id: string;
  name: string;
  description?: string;
  media: MediaItem | null;
  createdAt?: string;
  updatedAt?: string;
}
