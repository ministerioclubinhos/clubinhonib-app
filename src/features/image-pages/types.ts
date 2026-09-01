import type {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';
import type { Type as RouteType } from '@/store/slices/route/routeSlice';

/** Imagem de uma seção, como a API devolve. */
export interface GalleryMediaResponse {
  id?: string;
  title?: string;
  description?: string;
  uploadType: MediaUploadType;
  mediaType: MediaType;
  isLocalFile: boolean;
  url?: string;
  platformType?: MediaPlatform;
  originalName?: string;
  size?: number;
}

/** Seção da galeria, como a API devolve. */
export interface ImageSectionResponse {
  id: string;
  caption: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  mediaItems: GalleryMediaResponse[];
}

/** Rota exposta por `/image-pages`. */
export interface ImageRouteResponse {
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

/** Contrato de resposta de `/image-pages`. */
export interface ImagePageResponse {
  id: string;
  title: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  route: ImageRouteResponse;
  sections: ImageSectionResponse[];
}

/** Resposta paginada de seções de uma galeria. */
export interface PaginatedImageSectionsResponse {
  id: string;
  title: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  sections: ImageSectionResponse[];
  page: number;
  limit: number;
  total: number;
}

/** Seção em edição no formulário. */
export interface ImageSectionDraft {
  /** Presente apenas quando a seção já veio da API. */
  id?: string;
  caption: string;
  description: string;
  public: boolean;
  mediaItems: MediaItem[];
}

/** Campos da galeria editados no formulário. */
export interface ImagePageFormValues {
  title: string;
  description: string;
  public: boolean;
}

/** Quais campos obrigatórios estão pendentes. */
export interface ImagePageFormErrors {
  title: boolean;
  description: boolean;
}

/** Imagem enviada no corpo da requisição. */
export interface GalleryMediaRequest {
  id?: string;
  title: string;
  description: string;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  isLocalFile: boolean;
  url: string;
  platformType: MediaPlatform;
  originalName?: string;
  size?: number;
  fieldKey?: string;
}

/** Seção enviada no corpo da requisição. */
export interface ImageSectionRequest {
  id?: string;
  caption: string;
  description: string;
  public: boolean;
  mediaItems: GalleryMediaRequest[];
}

/** JSON enviado no campo multipart `imageData`. */
export interface ImagePageRequest {
  id?: string;
  title: string;
  description: string;
  public: boolean;
  sections: ImageSectionRequest[];
}
