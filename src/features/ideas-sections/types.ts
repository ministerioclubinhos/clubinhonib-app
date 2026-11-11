import type { IdeasPageSummary } from '@/features/ideas-pages/types';
import type { MediaItem } from '@/store/slices/types';

/**
 * Contratos de ideias compartilhadas.
 *
 * Espelham `src/modules/pages/ideas-section/dto` da API, campo a campo.
 */

/** Uma mídia da ideia (`IdeasSectionMediaResponseDto`). */
export interface IdeasSectionMedia {
  id: string;
  title: string | null;
  description: string | null;
  uploadType: string;
  mediaType: string;
  isLocalFile: boolean;
  url: string;
  platformType: string | null;
  originalName: string | null;
  size: number | null;
}

/** Ideia compartilhada (`IdeasSectionResponseDto`). */
export interface IdeasSectionResponse {
  aiEnhancement?: IdeaAiDetail;
  aiStatus?: IdeaAiStatus | null;
  id: string;
  title: string;
  description: string;
  public: boolean;
  /** Página onde foi publicada; `null` enquanto aguarda decisão. */
  pageId: string | null;
  medias: IdeasSectionMedia[];
  createdAt: string;
  updatedAt: string;
}

/** Página devolvida por `GET /ideas-sections`. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo de ordenação aceito pela API. */
export type IdeasSectionSortField = 'createdAt' | 'title';
export type IdeasSectionSortOrder = 'ASC' | 'DESC';

/** Filtros da fila. */
export interface IdeasSectionFilters {
  searchString?: string;
}

/** Query string de `GET /ideas-sections` (`QueryIdeasSectionsDto`). */
export interface IdeasSectionsQueryParams {
  page: number;
  limit: number;
  searchString?: string;
  sort: IdeasSectionSortField;
  order: IdeasSectionSortOrder;
}

/**
 * Corpo do JSON que viaja no multipart, em `sectionData`.
 *
 * Os arquivos vão em campos separados, cada um endereçado pelo `fieldKey` da
 * mídia correspondente.
 */
export interface IdeasSectionPayload {
  aiDecisions?: IdeaAiDecisions;
  ignoreAiEnhancement?: boolean;
  title: string;
  description: string;
  public: boolean;
  medias: IdeasSectionMediaInput[];
}

/** Plataformas aceitas pela API em uma mídia de link (`PlatformType`). */
export type IdeasSectionPlatform = 'youtube' | 'googledrive' | 'onedrive' | 'dropbox' | 'ANY';

/** Uma mídia na entrada (`IdeasSectionMediaItemDto`). */
export interface IdeasSectionMediaInput {
  /** Presente só quando a mídia já existe e está sendo editada. */
  id?: string;
  title?: string;
  description?: string;
  uploadType: 'upload' | 'link';
  mediaType: 'image' | 'video' | 'document';
  isLocalFile: boolean;
  url?: string;
  platformType?: IdeasSectionPlatform;
  originalName?: string;
  /** Nome do campo do multipart que carrega o arquivo desta mídia. */
  fieldKey?: string;
  size?: number;
}

export enum IdeaMaterialKind {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum IdeaVideoSource {
  UPLOAD = 'upload',
  YOUTUBE = 'youtube',
}

export enum IdeaMaterialItemStatus {
  READY = 'ready',
  UPLOADING = 'uploading',
  FAILED = 'failed',
}

export enum IdeaShareStatus {
  EDITING = 'editing',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface IdeaShareMaterial {
  id: string;
  file?: File;
  kind: IdeaMaterialKind;
  name: string;
  url?: string;
  previewUrl?: string;
}

export interface IdeaShareFormValues {
  title: string;
  description: string;
}

/** Arquivo a enviar, com o campo que o liga à sua mídia. */
export interface IdeasSectionUpload {
  fieldKey: string;
  file: File;
}

/**
 * Página de ideias onde a administração pode publicar.
 *
 * O seletor usa o resumo da listagem: ele traz o título sem carregar as seções
 * e as mídias de cada página.
 */
export type IdeasPage = IdeasPageSummary;

/** Resposta das rotas que só confirmam a operação. */
export interface ApiMessage {
  message: string;
}

/**
 * A ideia em revisão: os campos editáveis mais as mídias.
 *
 * As mídias usam `MediaItem`, o formato dos editores compartilhados: um
 * arquivo escolhido no navegador viaja em `file` e ainda não tem `url`.
 */
export interface IdeasSectionDraft {
  aiDecisions?: IdeaAiDecisions;
  ignoreAiEnhancement?: boolean;
  id?: string;
  title: string;
  description: string;
  public: boolean;
  medias: MediaItem[];
}

/** O que sobe numa publicação: o JSON e os arquivos que ele endereça. */
export interface IdeasSectionSubmission {
  payload: IdeasSectionPayload;
  uploads: IdeasSectionUpload[];
}

export enum IdeaAiStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}
export enum IdeaAiDecision {
  PENDING = 'PENDING',
  ORIGINAL = 'ORIGINAL',
  ENHANCED = 'ENHANCED',
}
export enum IdeaAiMediaStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ENHANCED = 'ENHANCED',
  SKIPPED = 'SKIPPED',
  REJECTED_BY_GUARD = 'REJECTED_BY_GUARD',
  FAILED = 'FAILED',
}
export interface IdeaAiGuard {
  approved: boolean;
  violations: string[];
}
export interface IdeaAiSnapshot {
  title: string;
  description: string;
  submittedAt: string;
  source: 'SUBMISSION' | 'LEGACY_CAPTURE';
  medias: IdeasSectionMedia[];
}
export interface IdeaAiMediaResult {
  sourceMediaId: string;
  status: IdeaAiMediaStatus;
  skipReason: string | null;
  guard: IdeaAiGuard | null;
  decision: IdeaAiDecision;
  enhancedMedia: IdeasSectionMedia | null;
  editableMedia: IdeasSectionMedia | null;
}
export interface IdeaAiAttempt {
  id: string;
  attempt: number;
  status: IdeaAiStatus;
  requestedAt: string;
  finishedAt: string | null;
  errorCode: string | null;
  enhancedTitle: string | null;
  enhancedDescription: string | null;
  textGuard: IdeaAiGuard | null;
  titleDecision: IdeaAiDecision;
  descriptionDecision: IdeaAiDecision;
  medias: IdeaAiMediaResult[];
}
export interface IdeaAiDetail {
  publicationChoices?: IdeaAiPublicationChoice[];
  snapshot: IdeaAiSnapshot | null;
  activeAttempt: IdeaAiAttempt | null;
  currentResult: IdeaAiAttempt | null;
  attemptHistory: IdeaAiAttempt[];
  maxAttempts: number;
}
export interface IdeaAiDecisions {
  enhancementId: string;
  title: IdeaAiDecision;
  description: IdeaAiDecision;
  medias: Array<{ sourceMediaId: string; decision: IdeaAiDecision }>;
}
export interface IdeaAiQueued {
  id: string;
  attempt: number;
  status: IdeaAiStatus;
}
export interface IdeaWordDiff {
  text: string;
  changed: boolean;
}
/** Etapa 2 da revisão: a comparação item a item. */
export interface IdeaAiCompareProps {
  excludedMediaIds?: string[];
  section: IdeasSectionResponse;
  decisions: IdeaAiDecisions | null;
  onChange: (value: IdeaAiDecisions) => void;
  disabled: boolean;
}
/** Etapa 1 da revisão: estado da melhoria por IA e o pedido de nova tentativa. */
export interface IdeaAiStatusPanelProps {
  section: IdeasSectionResponse;
  onRetry: () => void;
  retrying: boolean;
  disabled: boolean;
  error: string;
}
export interface IdeaAiTextCompareProps {
  label: string;
  original: string;
  enhanced: string | null;
  decision: IdeaAiDecision;
  onChange: (value: IdeaAiDecision) => void;
  disabled: boolean;
}
export interface IdeaAiMediaCompareProps {
  original: IdeasSectionMedia;
  result?: IdeaAiMediaResult;
  decision: IdeaAiDecision;
  onChange: (value: IdeaAiDecision) => void;
  disabled: boolean;
}
export interface IdeaAiChoiceProps {
  label: string;
  decision: IdeaAiDecision;
  enhanced: boolean;
  disabled: boolean;
  onChange: (value: IdeaAiDecision) => void;
}
export interface IdeaAiStatusProps {
  status?: IdeaAiStatus | null;
}
export interface IdeaAiGuardWarningProps {
  guard?: IdeaAiGuard | null;
}
export interface IdeaAiSkippedNoticeProps {
  reason?: string | null;
  failed?: boolean;
}

export interface IdeaShareFormFields extends IdeaShareFormValues {
  materials: IdeaShareMaterial[];
}
export interface IdeaShareMaterialsProps {
  materials: IdeaShareMaterial[];
  removed: IdeaShareMaterial | null;
  disabled: boolean;
  onRemove: (item: IdeaShareMaterial) => void;
  onUndo: () => void;
}
export interface IdeaAiPublicationChoice {
  field: 'TITLE' | 'DESCRIPTION' | 'MEDIA';
  sourceMediaId: string | null;
  enhancementId: string | null;
  decision: IdeaAiDecision;
}
