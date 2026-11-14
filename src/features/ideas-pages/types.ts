import type {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';
import type { Type as RouteType } from '@/store/slices/route/routeSlice';

/** Mídia de uma seção, como a API devolve. */
export interface IdeasMediaResponse {
  id: string;
  title: string;
  description: string;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  platformType?: MediaPlatform;
  url: string;
  isLocalFile: boolean;
  originalName?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

/** Seção da página de ideias, como a API devolve. */
export interface IdeasSectionResponse {
  id: string;
  title: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  medias: IdeasMediaResponse[];
}

/**
 * Resumo da página na listagem do painel.
 *
 * A listagem não traz seções nem mídias: carregar o conteúdo inteiro de cada
 * página era o que fazia a tela demorar a abrir.
 */
export interface IdeasPageSummary {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  public: boolean;
  /** Endereço da página; `null` quando a rota não existe. */
  routePath: string | null;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Envelope paginado devolvido pela API. */
export interface PaginatedIdeasPages {
  data: IdeasPageSummary[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo pelo qual a listagem pode ser ordenada. */
export type IdeasPageSortField = 'createdAt' | 'title';

/** Direção da ordenação. */
export type IdeasPageSortOrder = 'ASC' | 'DESC';

/** Filtros aplicados pela API, não pela tela. */
export interface IdeasPageQuery {
  page?: number;
  limit?: number;
  searchString?: string;
  public?: boolean;
  sort?: IdeasPageSortField;
  order?: IdeasPageSortOrder;
}

/** Rota exposta por `/ideas-pages`. */
export interface IdeasRouteResponse {
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

/** Contrato de resposta de `/ideas-pages`. */
export interface IdeasPageResponse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  route: IdeasRouteResponse;
  sections: IdeasSectionResponse[];
}

/** Seção em edição no formulário. */
export interface IdeasSectionDraft {
  /** Presente apenas quando a seção já veio da API. */
  id?: string;
  title: string;
  description: string;
  public: boolean;
  medias: MediaItem[];
}

/** Campos da página editados no formulário. */
export interface IdeasPageFormValues {
  title: string;
  description: string;
}

/** Quais campos obrigatórios estão pendentes. */
export interface IdeasPageFormErrors {
  title: boolean;
  description: boolean;
  /** Nenhuma seção foi adicionada. */
  sections: boolean;
  /** Ao menos uma seção ficou sem título. */
  sectionTitles: boolean;
}

/** Mídia enviada no corpo da requisição. */
export interface IdeasMediaRequest {
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
export interface IdeasSectionRequest {
  id?: string;
  title: string;
  description: string;
  public: boolean;
  medias: IdeasMediaRequest[];
}

/** JSON enviado no campo multipart `ideasMaterialsPageData`. */
export interface IdeasPageRequest {
  id?: string;
  title: string;
  description: string;
  sections: IdeasSectionRequest[];
}
