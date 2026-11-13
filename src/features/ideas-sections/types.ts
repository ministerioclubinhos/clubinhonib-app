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
  aiStatus?: IdeaAiQueueFilter;
}

/** Query string de `GET /ideas-sections` (`QueryIdeasSectionsDto`). */
export interface IdeasSectionsQueryParams {
  page: number;
  limit: number;
  searchString?: string;
  aiStatus?: IdeaAiQueueFilter;
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
/** O que uma (re)geração refaz (`IdeaAiScope` da API). */
export enum IdeaAiScope {
  FULL = 'FULL',
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  FAILED = 'FAILED',
}
/** Recorte da fila pelo estado da IA (`IdeaAiQueueFilter` da API). */
export enum IdeaAiQueueFilter {
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  NONE = 'NONE',
}
/** Códigos técnicos persistidos nas tentativas e nos materiais. */
export enum IdeaAiErrorCode {
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',
  PROVIDER_REQUEST_FAILED = 'PROVIDER_REQUEST_FAILED',
  INVALID_PROVIDER_RESPONSE = 'INVALID_PROVIDER_RESPONSE',
  GUARD_REJECTED = 'GUARD_REJECTED',
  LIMIT_REACHED = 'LIMIT_REACHED',
  CANCELLED = 'CANCELLED',
  STALLED = 'STALLED',
  SNAPSHOT_MISSING = 'SNAPSHOT_MISSING',
  QUEUE_UNAVAILABLE = 'QUEUE_UNAVAILABLE',
}
export enum IdeaAiSkipReason {
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  ESSENTIAL_VISUALS = 'ESSENTIAL_VISUALS',
  TOO_LARGE = 'TOO_LARGE',
  ALREADY_GOOD = 'ALREADY_GOOD',
  CONTAINS_PEOPLE = 'CONTAINS_PEOPLE',
  LIMIT_REACHED = 'LIMIT_REACHED',
}
export enum IdeaAiSnapshotSource {
  SUBMISSION = 'SUBMISSION',
  LEGACY_CAPTURE = 'LEGACY_CAPTURE',
}
export enum IdeaAiPublicationField {
  TITLE = 'TITLE',
  DESCRIPTION = 'DESCRIPTION',
  MEDIA = 'MEDIA',
}
/** Trecho do diff de palavras. */
export enum IdeaWordDiffKind {
  SAME = 'same',
  ADDED = 'added',
  REMOVED = 'removed',
}
/** Campos de texto comparados na etapa 2. */
export enum IdeaAiTextField {
  TITLE = 'title',
  DESCRIPTION = 'description',
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
/** Guarda do texto com o veredito de cada campo (tentativas novas). */
export interface IdeaAiTextGuard extends IdeaAiGuard {
  fields?: Record<IdeaAiTextField, IdeaAiGuard>;
}
export interface IdeaAiSnapshot {
  title: string;
  description: string;
  submittedAt: string;
  source: IdeaAiSnapshotSource;
  medias: IdeasSectionMedia[];
}
export interface IdeaAiMediaResult {
  sourceMediaId: string;
  status: IdeaAiMediaStatus;
  skipReason: IdeaAiSkipReason | null;
  guard: IdeaAiGuard | null;
  decision: IdeaAiDecision;
  enhancedMedia: IdeasSectionMedia | null;
  editableMedia: IdeasSectionMedia | null;
  /** Falha técnica; com `carriedOver`, a versão anterior foi mantida. */
  errorCode: IdeaAiErrorCode | null;
  /** Veio da tentativa base, sem nova chamada à IA. */
  carriedOver: boolean;
}
export interface IdeaAiAttempt {
  id: string;
  attempt: number;
  status: IdeaAiStatus;
  requestedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorCode: IdeaAiErrorCode | null;
  scope: IdeaAiScope;
  includeText: boolean;
  targetMediaIds: string[] | null;
  baseAttempt: number | null;
  instructions: string | null;
  progressDone: number;
  progressTotal: number;
  countsTowardLimit: boolean;
  enhancedTitle: string | null;
  enhancedDescription: string | null;
  textGuard: IdeaAiTextGuard | null;
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
  attemptsUsed: number;
  providerReady: boolean;
  /** Flag `idea_ai_enhancement`: desligada, nada vai à IA. */
  enabled: boolean;
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
  kind: IdeaWordDiffKind;
}
/** Entrada de `POST /ideas-sections/:id/ai-enhancement`. */
export interface IdeaAiEnhancementRequest {
  scope: IdeaAiScope;
  mediaIds?: string[];
  instructions?: string;
}
/** Etapa 2 da revisão: a comparação item a item. */
export interface IdeaAiCompareProps {
  excludedMediaIds?: string[];
  section: IdeasSectionResponse;
  decisions: IdeaAiDecisions | null;
  onChange: (value: IdeaAiDecisions) => void;
  /** Texto final de título e descrição, já com as edições da revisão. */
  text: IdeaAiFinalText;
  onTextChange: (patch: Partial<IdeaAiFinalText>) => void;
  disabled: boolean;
}
export interface IdeaAiFinalText {
  title: string;
  description: string;
}
/** Etapa 1 da revisão: estado da melhoria por IA e as ações sobre ela. */
export interface IdeaAiStatusPanelProps {
  section: IdeasSectionResponse;
  onRegenerate: () => void;
  onCancel: () => void;
  onRestore: (attemptId: string) => void;
  busy: boolean;
  disabled: boolean;
  error: string;
}
export interface IdeaAiTextCompareProps {
  field: IdeaAiTextField;
  label: string;
  original: string;
  enhanced: string | null;
  decision: IdeaAiDecision;
  onChange: (value: IdeaAiDecision) => void;
  /** Texto final, editável, que será publicado. */
  value: string;
  maxLength: number;
  onValueChange: (value: string) => void;
  guard?: IdeaAiGuard | null;
  disabled: boolean;
}
export interface IdeaAiRegenerateDialogProps {
  open: boolean;
  section: IdeasSectionResponse;
  busy: boolean;
  onClose: () => void;
  onConfirm: (request: IdeaAiEnhancementRequest) => void;
}
export interface IdeaAiAttemptHistoryProps {
  attempts: IdeaAiAttempt[];
  currentId: string | null;
  canRestore: boolean;
  busy: boolean;
  onRestore: (attemptId: string) => void;
}
export interface IdeaAiMediaNoticeProps {
  result?: IdeaAiMediaResult;
  baseAttempt: number | null;
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
  reason?: IdeaAiSkipReason | null;
  failed?: boolean;
  errorCode?: IdeaAiErrorCode | null;
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
  field: IdeaAiPublicationField;
  sourceMediaId: string | null;
  enhancementId: string | null;
  decision: IdeaAiDecision;
  edited: boolean;
}

export interface IdeasSectionFetchOptions {
  silent?: boolean;
}

/** Filtros da fila enviados à API. */
export interface IdeasSectionListFilters {
  sort: IdeasSectionSortField;
  order: IdeasSectionSortOrder;
  aiStatus?: IdeaAiQueueFilter;
}

export interface IdeasSectionReviewFieldsProps {
  title: string;
  description: string;
  /** Marca os erros só depois da primeira tentativa de publicar. */
  submitted: boolean;
  disabled?: boolean;
  onChange: (patch: { title?: string; description?: string }) => void;
}

export interface IdeaAiDiffSideProps {
  parts: IdeaWordDiff[];
  /** Trechos destacados neste lado; o oposto é omitido. */
  marked: IdeaWordDiffKind.ADDED | IdeaWordDiffKind.REMOVED;
}
