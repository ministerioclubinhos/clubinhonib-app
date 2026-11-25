import type { SectionApiErrors } from '@/components/common/section-outline/types';
import type { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
import type { PlayScope } from '@/features/play/types';
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
  /** Atributos do Play; só vêm quando a galeria tem o Play configurado. */
  inPlay?: boolean;
  featured?: boolean;
  position?: number | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
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
  play?: { scope: PlayScope; categoryId: string | null };
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
  playScope: PlayScope;
  playCategoryId: string | null;
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
  inPlay?: boolean;
  featured?: boolean;
  position?: number;
  thumbnailField?: string;
  durationSeconds?: number;
}

/** JSON enviado no campo multipart `videosPageData`. */
export interface VideoPageRequest {
  id?: string;
  title: string;
  description: string;
  public: boolean;
  play: { scope: PlayScope; categoryId: string | null };
  videos: VideoItemRequest[];
}

/** Vídeo em edição no formulário. */
/** Atributos do Clubinho Play de um vídeo em edição. */
export interface VideoPlayAttributes {
  inPlay?: boolean;
  featured?: boolean;
  position?: number | null;
  /** Miniatura escolhida ou capturada nesta sessão (vai no multipart). */
  thumbnailFile?: File;
  /** Miniatura já gravada, ou a prévia da nova. */
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
}

export type VideoDraft = MediaItem & VideoPlayAttributes;

export interface VideoPageFormProps {
  /** True quando o admin cria a galeria a partir da galeria de modelos. */
  fromTemplatePage?: boolean;
}

export interface VideoPageFeedback {
  message: string;
  severity: 'success' | 'error';
}

export interface UseVideoPageFormParams {
  isCreation: boolean;
  page: VideoPageResponse | null;
}

export interface UseVideoPageFormResult {
  values: VideoPageFormValues;
  setValue: <K extends keyof VideoPageFormValues>(key: K, value: VideoPageFormValues[K]) => void;
  videos: VideoDraft[];
  setVideos: (videos: VideoDraft[]) => void;
  errors: VideoPageFormErrors;
  /** Erros por vídeo devolvidos pela API; limpos ao editar ou salvar de novo. */
  videoApiErrors: SectionApiErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: VideoPageFeedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}

export interface VideoEditorProps {
  videos: VideoDraft[];
  onChange: (videos: VideoDraft[]) => void;
  /** Informa ao formulário que há um vídeo em edição ou começado. */
  onDraftChange?: (hasDraft: boolean) => void;
  /** Mensagens que a API recusou, agrupadas pela posição do vídeo. */
  apiErrors?: SectionApiErrors;
  /** Modo do Play da galeria; define os controles por vídeo. */
  playScope?: PlayScope;
}
