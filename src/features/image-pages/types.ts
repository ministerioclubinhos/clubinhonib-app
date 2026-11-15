import type { SectionApiErrors } from '@/components/common/section-outline/types';
import type { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
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

/**
 * Resumo da galeria na listagem do painel.
 *
 * A listagem não traz seções nem imagens: carregar o conteúdo inteiro de cada
 * galeria era o que fazia a tela demorar a abrir.
 */
export interface ImagePageSummary {
  id: string;
  title: string;
  description: string;
  public: boolean;
  /** Endereço público da galeria; `null` quando a rota não existe. */
  routePath: string | null;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Envelope paginado devolvido pela API. */
export interface PaginatedImagePages {
  data: ImagePageSummary[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo pelo qual a listagem pode ser ordenada. */
export type ImagePageSortField = 'createdAt' | 'title';

/** Direção da ordenação. */
export type ImagePageSortOrder = 'ASC' | 'DESC';

/** Filtros aplicados pela API, não pela tela. */
export interface ImagePageQuery {
  page?: number;
  limit?: number;
  searchString?: string;
  public?: boolean;
  sort?: ImagePageSortField;
  order?: ImagePageSortOrder;
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
  /** Identifica a seção nova enquanto ela ainda não tem id. */
  clientId?: string;
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
  /** Nenhuma seção foi adicionada. */
  sections: boolean;
  /** Ao menos uma legenda passou do limite de caracteres. */
  captions: boolean;
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

/** Props do editor de uma seção da galeria. */
export interface ImageSectionEditorProps {
  section: ImageSectionDraft;
  index: number;
  onChange: (section: ImageSectionDraft) => void;
  onRemove: () => void;
  onAddImages: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** A legenda passou do limite e precisa de revisão. */
  captionError?: boolean;
  /** Mensagens que a API recusou nesta seção no último salvamento. */
  apiErrors?: string[];
}

export interface ImagePageFormProps {
  /** True quando o admin cria a galeria a partir da galeria de modelos. */
  fromTemplatePage?: boolean;
}

export interface ImagePageFeedback {
  message: string;
  severity: 'success' | 'error';
}

export interface UseImagePageFormParams {
  isCreation: boolean;
  page: ImagePageResponse | null;
}

export interface UseImagePageFormResult {
  values: ImagePageFormValues;
  setValue: <K extends keyof ImagePageFormValues>(key: K, value: ImagePageFormValues[K]) => void;
  sections: ImageSectionDraft[];
  setSections: (sections: ImageSectionDraft[]) => void;
  errors: ImagePageFormErrors;
  /** Erros por seção devolvidos pela API; limpos ao editar ou salvar de novo. */
  sectionApiErrors: SectionApiErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: ImagePageFeedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}
