import { MediaItem } from 'store/slices/types';

// mantém os re-exports como já corrigimos
export { MediaPlatform, MediaUploadType, MediaType } from 'store/slices/types';
export type { MediaItem } from 'store/slices/types';

export interface DocumentItem {
  id: string;
  name: string;
  description?: string;
  media: MediaItem | null; // <- aqui: obrigatório, mas pode ser null
  createdAt?: string;
  updatedAt?: string;
}
