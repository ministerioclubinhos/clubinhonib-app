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

/**
 * Resumo da página na listagem do painel.
 *
 * A listagem não traz os vídeos: só a contagem, que é o que o card mostra.
 */
export interface VideoPageSummary {
  id: string;
  title: string;
  description: string;
  public: boolean;
  /** Endereço público da página; `null` quando a rota não existe. */
  routePath: string | null;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Envelope paginado devolvido pela API. */
export interface PaginatedVideoPages {
  data: VideoPageSummary[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo pelo qual a listagem pode ser ordenada. */
export type VideoPageSortField = 'createdAt' | 'title';

/** Direção da ordenação. */
export type VideoPageSortOrder = 'ASC' | 'DESC';

/** Filtros aplicados pela API, não pela tela. */
export interface VideoPageQuery {
  page?: number;
  limit?: number;
  searchString?: string;
  public?: boolean;
  sort?: VideoPageSortField;
  order?: VideoPageSortOrder;
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
