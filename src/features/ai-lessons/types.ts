export enum LessonStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PACKAGE_READY = 'PACKAGE_READY',
  IN_REVIEW = 'IN_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  READY_FOR_PUBLICATION = 'READY_FOR_PUBLICATION',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum LessonCategory {
  REGULAR = 'REGULAR', // Material Semanal (8 etapas)
  SPECIAL = 'SPECIAL', // Material Especial (3 etapas: LESSON, LESSON_VISUALS, VERSE_VISUALS)
}

export enum LessonStageStatus {
  NOT_STARTED = 'NOT_STARTED',
  GENERATING = 'GENERATING',
  DRAFT = 'DRAFT',
  PRODUCER_APPROVED = 'PRODUCER_APPROVED',
  IN_REVIEW = 'IN_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  FAILED = 'FAILED',
  STALE = 'STALE',
}

export enum LessonStageType {
  LESSON = 'LESSON',
  LESSON_VISUALS = 'LESSON_VISUALS',
  STANDARD_GAME = 'STANDARD_GAME',
  VERSE_VISUALS = 'VERSE_VISUALS',
  VERSE_FIXATION = 'VERSE_FIXATION',
  MEDITATION_YOUNGER = 'MEDITATION_YOUNGER',
  MEDITATION_OLDER = 'MEDITATION_OLDER',
  MANUAL_WORK = 'MANUAL_WORK',
}

export enum LessonVisualType {
  CUTOUT_KIT = 'CUTOUT_KIT',
  STORY_SEQUENCE = 'STORY_SEQUENCE',
  CHARACTER_AND_EMOTION = 'CHARACTER_AND_EMOTION',
  VISUAL_ANCHORS = 'VISUAL_ANCHORS',
  INTERACTIVE_COLORING = 'INTERACTIVE_COLORING',
}

export enum CutoutCategory {
  CHARACTERS = 'CHARACTERS',
  ANIMALS = 'ANIMALS',
  BUILDINGS = 'BUILDINGS',
  SCENERY = 'SCENERY',
  SKY_AND_NATURE = 'SKY_AND_NATURE',
  OBJECTS = 'OBJECTS',
}

export interface CutoutKitItem {
  label: string;
  description?: string;
  category?: CutoutCategory;
  storyEvidence?: string;
  variantOf?: string | null;
  extra?: boolean;
  size?: 'LARGE' | 'MEDIUM' | 'SMALL';
}

export enum LessonVisualOrientation {
  LANDSCAPE = 'LANDSCAPE',
  PORTRAIT = 'PORTRAIT',
}

export interface VisualAsset {
  id?: string;
  stepNumber?: number;
  instruction?: string;
  purpose?: string;
  sourceExcerpt?: string;
  category?: CutoutCategory;
  title?: string;
  items?: CutoutKitItem[];
  layoutPlan?: string;
  altText?: string;
  displayText?: string;
  url?: string;
  identityReference?: boolean;
}

export interface VisualCarouselProps {
  assets: VisualAsset[];
  orientation: LessonVisualOrientation | '';
  title?: string;
  ariaLabel?: string;
  testIdPrefix?: string;
}

export interface StoryVisualConfigurationProps {
  visualType: LessonVisualType | '';
  isSpecial?: boolean;
  visualOrientation: LessonVisualOrientation | '';
  visualQuantity: number | '';
  instructions: string;
  hasVersion: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
  onVisualTypeChange: (value: LessonVisualType) => void;
  onVisualOrientationChange: (value: LessonVisualOrientation) => void;
  onVisualQuantityChange: (value: number | '') => void;
  onInstructionsChange: (value: string) => void;
  onGenerate: () => void;
}

export interface TiptapDocument {
  type: 'doc';
  content?: Array<Record<string, unknown>>;
}
export interface LessonVersion {
  id: string;
  versionNumber: number;
  tiptapAstJson: TiptapDocument;
  structuredDataJson: Record<string, unknown> | null;
  changeSummary: string;
  createdAt: string;
}
export interface LessonStage {
  id: string;
  type: LessonStageType;
  status: LessonStageStatus;
  currentVersionId: string | null;
  lockVersion: number;
  failureCode?: string | null;
  failureMessage: string | null;
  versions: LessonVersion[];
}
export enum LessonPublicationState {
  IDLE = 'IDLE',
  PUBLISHING = 'PUBLISHING',
  FAILED = 'FAILED',
  PUBLISHED = 'PUBLISHED',
}
export interface Lesson {
  id: string;
  theme: string;
  biblicalReference: string;
  weekNumber: number | null;
  category?: LessonCategory;
  specialContext?: string | null;
  status: LessonStatus;
  weekMaterialId: string | null;
  publicationFailureMessage?: string | null;
  publicationState?: LessonPublicationState;
  createdAt: string;
  updatedAt: string;
  stages: LessonStage[];
  comments: LessonComment[];
}
export interface LessonComment {
  id: string;
  sectionKey: string;
  commentText: string;
  isResolved: boolean;
  authorId: string;
  createdAt: string;
}
export interface LessonDashboard {
  total: number;
  byStatus: Partial<Record<LessonStatus, number>>;
  /** Lessons still in the works (not published, not archived), newest first. */
  active?: Lesson[];
  recent: Lesson[];
}

/** What the dashboard asks the user to do next with a lesson, most urgent first. */
export enum StudioHubAction {
  FIX_CHANGES = 'FIX_CHANGES',
  RETRY_FAILED = 'RETRY_FAILED',
  PUBLISH = 'PUBLISH',
  REVIEW = 'REVIEW',
  CONTINUE = 'CONTINUE',
  START = 'START',
  WAIT = 'WAIT',
}

/** How far a stage is, reduced to what one dot of the pipeline can show. */
export enum StudioHubStageTone {
  DONE = 'DONE',
  PRODUCED = 'PRODUCED',
  WORKING = 'WORKING',
  PROBLEM = 'PROBLEM',
  STALE = 'STALE',
  TODO = 'TODO',
}

/** The buckets of the dashboard's counters. */
export enum StudioHubMetric {
  CHANGES = 'CHANGES',
  PRODUCTION = 'PRODUCTION',
  REVIEW = 'REVIEW',
  READY = 'READY',
  PUBLISHED = 'PUBLISHED',
}

export interface StudioHubStageDot {
  type: LessonStageType;
  label: string;
  statusLabel: string;
  tone: StudioHubStageTone;
}

/** One row of the dashboard's work queue. */
export interface StudioHubQueueItem {
  lesson: Lesson;
  action: StudioHubAction;
  /** Button text, e.g. "Continuar: 3. Brincadeira". */
  actionLabel: string;
  /** Where the button goes. */
  href: string;
  stages: StudioHubStageDot[];
  completed: number;
  total: number;
}
export interface GenerateLessonPayload {
  theme: string;
  biblicalReference: string;
  weekNumber?: number | null;
  category?: LessonCategory;
  specialContext?: string | null;
}
export interface SaveTiptapPayload {
  stage: LessonStageType;
  lockVersion: number;
  tiptapAstJson: TiptapDocument;
  structuredDataJson?: Record<string, unknown>;
  changeSummary?: string;
}
export interface RegenerateSectionPayload {
  stage: LessonStageType;
  revisionInstructions?: string;
  visualType?: LessonVisualType;
  visualOrientation?: LessonVisualOrientation;
  visualQuantity?: number;
}
export interface AdminPromptPreference {
  stage: LessonStageType;
  basePrompt: string;
  customPrompt: string | null;
  effectivePrompt: string;
  lockVersion: number | null;
  /** When this admin last saved or reset the stage; `null` when never customised. */
  updatedAt?: string | null;
}
export interface GetLessonDraftsParams {
  status?: LessonStatus;
  category?: LessonCategory;
  statuses?: LessonStatus[];
  /** Lições planejadas para esta semana; serve ao aviso de semana repetida. */
  weekNumber?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: LessonSortField;
  order?: LessonSortOrder;
}

export enum LessonSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  THEME = 'theme',
  WEEK_NUMBER = 'weekNumber',
}
export enum LessonSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
export enum LessonStageAction {
  COMPLETE = 'complete',
  APPROVE = 'approve',
  CHANGES = 'changes',
  REOPEN = 'reopen',
}
export enum LessonArchiveAction {
  ARCHIVE = 'archive',
  UNARCHIVE = 'unarchive',
}
export interface ResolveCommentVariables {
  id: string;
  commentId: string;
}
export enum LessonConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  DENIED = 'denied',
  NOT_FOUND = 'not_found',
  PAUSED = 'paused',
}
export enum LessonStreamEnd {
  CANCELLED = 'cancelled',
  TRANSIENT = 'transient',
  DENIED = 'denied',
  NOT_FOUND = 'not_found',
  ROTATED = 'rotated',
  BYTE_LIMIT = 'byte_limit',
}
export interface LessonStreamMetrics {
  bytes: number;
  snapshots: number;
  durationMs: number;
}
export interface LessonStreamCallbacks {
  onLesson: (lesson: Lesson) => void;
  onDisconnect: (reason: LessonStreamEnd) => void;
  onMetrics?: (metrics: LessonStreamMetrics) => void;
}
export interface LessonListResponse {
  items: Lesson[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface LessonDeleteResponse {
  success: boolean;
  message: string;
}
export interface LessonPublicationResponse {
  lesson: Lesson;
  weekMaterialId: string;
}
/** Weekly material page linked to the lesson, as the API sees it right now. */
export interface LessonPublicationMaterial {
  id: string;
  /** False when the page was deleted in Materiais Semanais after the publication. */
  exists: boolean;
  routePath: string | null;
  currentWeek: boolean;
}
export interface LessonPublicationDuplicate {
  id: string;
  title: string;
  routePath: string | null;
}
/** `GET /lessons/:id/publication-preview`. */
export interface LessonPublicationPreview {
  title: string;
  isSpecial: boolean;
  documentCount: number;
  weekMaterial: LessonPublicationMaterial | null;
  duplicates: LessonPublicationDuplicate[];
}
export interface LessonPublishConfirmDialogProps {
  open: boolean;
  lessonTheme: string;
  /** Fallbacks used while the preview loads or when it could not be loaded. */
  fallbackIsSpecial: boolean;
  fallbackDocumentCount: number;
  republish: boolean;
  preview: LessonPublicationPreview | undefined;
  previewLoading: boolean;
  previewFailed: boolean;
  onConfirm: () => void;
  onClose: () => void;
}
export interface LessonPublishedPanelProps {
  isSpecial: boolean;
  preview: LessonPublicationPreview | undefined;
  previewLoading: boolean;
  busy: boolean;
  settingCurrentWeek: boolean;
  currentWeekError: string | null;
  onOpenWeekMaterials: () => void;
  onSetCurrentWeek: () => void;
  onRepublish: () => void;
}
export interface SaveLessonVariables {
  id: string;
  payload: SaveTiptapPayload;
}
export interface GenerateStageVariables {
  id: string;
  payload: RegenerateSectionPayload;
}
export interface StageActionVariables {
  id: string;
  stage: LessonStageType;
  lockVersion: number;
  note?: string;
  /** Confirms an outdated item is still valid without regeneration. */
  acknowledgeStale?: boolean;
}
export interface LessonLocalDraft {
  lessonId: string;
  stage: LessonStageType;
  lockVersion: number;
  document: TiptapDocument;
  structuredData: Record<string, unknown> | null;
}
export interface SubscribeLessonStreamOptions {
  maxDurationMs?: number;
  maxBytes?: number;
}
export interface StudioStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}
export enum StudioSnapshotScope {
  LESSON_DRAFTS = 'drafts',
  REVIEW_FEEDBACK = 'review',
  PROMPT_DRAFTS = 'prompts',
}
export interface PersistedPromptDraft {
  value: string;
  lockVersion: number | null;
}
export type PersistedPromptDrafts = Partial<
  Record<LessonCategory, Partial<Record<LessonStageType, PersistedPromptDraft>>>
>;
export type ReviewFeedbackMap = Partial<Record<LessonStageType, string>>;
export type AcknowledgedStageVersions = Partial<Record<LessonStageType, string | null>>;
export enum StageAssetIssue {
  NONE = 'none',
  MISSING = 'missing',
  BROKEN = 'broken',
}
export type LessonLocalDrafts = Record<string, LessonLocalDraft | undefined>;
export interface PromptLocalDraft {
  value: string;
  base: AdminPromptPreference;
}
export type PromptLocalDrafts = Partial<Record<LessonStageType, PromptLocalDraft>>;
export interface SavePromptVariables {
  item: AdminPromptPreference;
  draft: PromptLocalDraft;
}
export enum StudioFeedbackSeverity {
  SUCCESS = 'success',
  ERROR = 'error',
}
export interface StudioFeedback {
  severity: StudioFeedbackSeverity;
  text: string;
}
export interface ParsedSseChunk {
  messages: string[];
  remainder: string;
  heartbeats: number;
}

export interface LessonStreamTransport {
  (config: import('axios').AxiosRequestConfig): Promise<unknown>;
}

export interface LessonStageContentViewerProps {
  stage: LessonStage;
  version: LessonVersion | null | undefined;
  document: TiptapDocument;
  structuredData: Record<string, unknown>;
  visualOrientation?: LessonVisualOrientation | '';
  editable?: boolean;
  onChangeDocument?: (document: TiptapDocument) => void;
  onOpenPdfPreview?: () => void;
  pdfPreviewLoading?: boolean;
  pdfPreviewDisabled?: boolean;
  pdfPreviewLabel?: string;
  /** Computed by the screen so the viewer notice and the action gate never disagree. */
  assetIssue?: StageAssetIssue | null;
  /** True for the read-only review screen. */
  readOnly?: boolean;
  onLayoutOverflowChange?: (overflow: boolean) => void;
}

export interface LessonDraftDialogsProps {
  lesson: Lesson;
  stage?: LessonStage;
  canGenerate: boolean;
  generationLocked: boolean;
  llmErrorOpen: boolean;
  previewUrl: string | null;
  previewError: string | null;
  previewLoading: boolean;
  deleteConfirmOpen: boolean;
  deletePending: boolean;
  deleteError: string | null;
  onCloseLlmError: () => void;
  onRetryGeneration: () => void;
  onClosePreview: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
}

export type PromptCategoryDrafts = Partial<Record<LessonCategory, PromptLocalDrafts>>;

export enum StudioScreenKind {
  PRODUCTION = 'production',
  REVIEW = 'review',
}
export interface LessonConnectionAlertProps {
  state: LessonConnectionState;
  screen: StudioScreenKind;
  onBackToList: () => void;
}
export interface LessonCommentsPanelProps {
  comments: LessonComment[];
  title: string;
  'data-testid': string;
  /** When given, open notes can be marked as handled. */
  onResolve?: (commentId: string) => void;
  resolvingId?: string | null;
}
export interface LessonPdfPreviewDialogProps {
  title: string;
  fileName: string;
  url: string | null;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  'data-testid'?: string;
}
export interface StageImpactListProps {
  stages: LessonStage[];
  category?: LessonCategory;
}
export type StudioChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';
export enum StageNavigationMode {
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
}
export interface LessonStageNavigationProps {
  stages: LessonStage[];
  category?: LessonCategory;
  selectedType: LessonStageType;
  mode: StageNavigationMode;
  draftStages?: LessonStageType[];
  onSelect: (type: LessonStageType) => void;
}
export enum ProductionConfirmationKind {
  SAVE = 'save',
  COMPLETE_OUTDATED = 'complete_outdated',
  REGENERATE = 'regenerate',
  DISCARD = 'discard',
  REBASE = 'rebase',
}
export interface ProductionConfirmation {
  kind: ProductionConfirmationKind;
}
export interface LessonAiGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (lessonId: string) => void;
}

/** Recortes da fila de revisão, do que espera o revisor ao que já saiu. */
export enum ReviewQueueView {
  ALL = 'ALL',
  TO_REVIEW = 'TO_REVIEW',
  RETURNED = 'RETURNED',
  READY = 'READY',
  PUBLISHED = 'PUBLISHED',
}

/** Onde uma lição está na revisão, em números. */
export interface ReviewLessonSummary {
  approved: number;
  /** Itens com o revisor, aguardando decisão. */
  awaiting: number;
  /** Itens devolvidos para a produção. */
  returned: number;
  total: number;
  percent: number;
}

/** O botão do cartão da fila de revisão. */
export interface ReviewCardAction {
  label: string;
  variant: 'contained' | 'outlined';
  color: 'primary' | 'success' | 'warning';
}
