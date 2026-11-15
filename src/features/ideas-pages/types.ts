import type { SectionApiErrors } from '@/components/common/section-outline/types';
import type { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
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
  clientId?: string;
  /** Presente apenas quando a seção já veio da API. */
  id?: string;
  title: string;
  description: string;
  public: boolean;
  medias: MediaItem[];
}

/** Campos da página editados no formulário. */
export interface IdeasPageFormValues {
  subtitle?: string;
  public?: boolean;
  title: string;
  description: string;
}

/** Quais campos obrigatórios estão pendentes. */
export interface IdeasPageFormErrors {
  title: boolean;
  subtitle: boolean;
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
  subtitle?: string;
  public?: boolean;
  id?: string;
  title: string;
  description: string;
  sections: IdeasSectionRequest[];
}

/** Erro de campo devolvido pela API em `error.details.fieldErrors`. */
export interface IdeasApiFieldError {
  field: string;
  message: string;
}

export interface IdeasPageFormProps {
  fromTemplatePage?: boolean;
}
export interface IdeasSectionEditorProps {
  section: IdeasSectionDraft;
  index: number;
  onChange: (section: IdeasSectionDraft) => void;
  onRemove: () => void;
  titleError?: boolean;
  /** Mensagens que a API recusou nesta seção no último salvamento. */
  apiErrors?: string[];
  /** Estado controlado pela página, que sabe expandir/recolher todas. */
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onDraftChange?: (hasDraft: boolean, mediaTypes: MediaType[]) => void;
  focusRequest?: IdeasMediaFocusRequest;
}
export interface IdeasMediaFocusRequest {
  sectionKey: string;
  mediaType: MediaType;
  sequence: number;
}
export interface IdeasPendingMedia {
  sectionKey: string;
  sectionLabel: string;
  mediaType: MediaType;
  mediaLabel: string;
}
export interface IdeasSectionFieldsValue {
  title: string;
  description: string;
  medias: MediaItem[];
}
export interface IdeasSectionFieldsProps<T extends IdeasSectionFieldsValue> {
  section: T;
  onUpdate: (section: T) => void;
  isCreationMode?: boolean;
  titleError?: boolean;
  onDraftChange?: (hasDraft: boolean, mediaTypes: MediaType[]) => void;
  focusRequest?: IdeasMediaFocusRequest;
}
export interface IdeasPageListFilters {
  visibility: string;
  sort: IdeasPageSortField;
  order: IdeasPageSortOrder;
}
export interface UseIdeasPageFormParams {
  isCreation: boolean;
  page: IdeasPageResponse | null;
}
export interface IdeasPageFeedback {
  message: string;
  severity: 'success' | 'error';
}
export interface UseIdeasPageFormResult {
  values: IdeasPageFormValues;
  setValue: <K extends keyof IdeasPageFormValues>(key: K, value: IdeasPageFormValues[K]) => void;
  sections: IdeasSectionDraft[];
  setSections: (sections: IdeasSectionDraft[]) => void;
  errors: IdeasPageFormErrors;
  /** Erros por seção devolvidos pela API; limpos ao editar ou salvar de novo. */
  sectionApiErrors: SectionApiErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: IdeasPageFeedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}
