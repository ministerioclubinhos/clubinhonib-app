import type {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';
import type { Type as RouteType } from '@/store/slices/route/routeSlice';

/** Vídeo exatamente como a API devolve. */
export interface VideoItemResponse {
  id: string;
  title: string;
  description: string;
  uploadType: MediaUploadType;
  mediaType: MediaType;
  platformType?: MediaPlatform;
  url: string;
  isLocalFile: boolean;
  originalName?: string;
  size?: number;
}

/** Rota exposta por `/video-pages`. */
export interface VideoRouteResponse {
  title: string;
  public: boolean;
  subtitle: string;
  image: string;
  idToFetch: string;
  path: string;
  entityType: string;
  description: string;
  entityId: string;
  type: RouteType;
}

/** Contrato de resposta de `/video-pages`. */
export interface VideoPageResponse {
  id: string;
  title: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  route: VideoRouteResponse;
  videos: VideoItemResponse[];
}

/** Campos da página editados no formulário. */
export interface VideoPageFormValues {
  title: string;
  description: string;
  public: boolean;
}

/** Quais campos obrigatórios estão pendentes. */
export interface VideoPageFormErrors {
  title: boolean;
  description: boolean;
}

/** Vídeo enviado no corpo da requisição. */
export interface VideoItemRequest {
  id?: string;
  title: string;
  description: string;
  uploadType: MediaUploadType;
  mediaType: MediaType;
  isLocalFile: boolean;
  url?: string;
  platformType?: MediaPlatform;
  originalName?: string;
  fieldKey?: string;
}

/** JSON enviado no campo multipart `videosPageData`. */
export interface VideoPageRequest {
  id?: string;
  title: string;
  description: string;
  public: boolean;
  videos: VideoItemRequest[];
}

/** Vídeo em edição no formulário. */
export type VideoDraft = MediaItem;
