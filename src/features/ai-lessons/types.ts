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
  failureMessage: string | null;
  versions: LessonVersion[];
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
  publicationState?: string;
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
  byStatus: Record<string, number>;
  recent: Lesson[];
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
}
export interface GetLessonDraftsParams {
  status?: LessonStatus;
  category?: LessonCategory;
  statuses?: LessonStatus[];
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
}
export enum LessonConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  DENIED = 'denied',
}
export enum LessonStreamEnd {
  CANCELLED = 'cancelled',
  TRANSIENT = 'transient',
  DENIED = 'denied',
  ROTATED = 'rotated',
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
}
export interface LessonLocalDraft {
  lessonId: string;
  stage: LessonStageType;
  lockVersion: number;
  document: TiptapDocument;
  structuredData: Record<string, unknown> | null;
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
  hasActivity: boolean;
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
  onCloseLlmError: () => void;
  onRetryGeneration: () => void;
  onClosePreview: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void>;
}

export type PromptCategoryDrafts = Partial<Record<LessonCategory, PromptLocalDrafts>>;
