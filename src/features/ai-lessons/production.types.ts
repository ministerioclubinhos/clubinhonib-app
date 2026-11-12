import type {
  Lesson,
  LessonCategory,
  LessonGenerationProgress,
  LessonStage,
  LessonStageType,
  LessonVersion,
  LessonVisualOrientation,
  LessonVisualStyle,
  LessonVisualType,
  ProductionConfirmation,
  TiptapDocument,
} from './types';
import type { ImageRegeneration } from './useImageRegeneration';
import type { useLessonPdfPreview } from './useLessonPdfPreview';
import type { useProductionStage } from './useProductionStage';
import type { useProductionWorkflow } from './useProductionWorkflow';

/** The actions of an item that can be the highlighted (contained) one. */
export enum ProductionStageAction {
  GENERATE = 'generate',
  SAVE = 'save',
  COMPLETE = 'complete',
}

/** Where the header's highlighted button takes the producer. */
export enum ProductionHeaderTarget {
  STAGE = 'stage',
  REVIEW = 'review',
}

export interface ProductionHeaderStep {
  target: ProductionHeaderTarget;
  /** Button text, e.g. "Continuar: 3. Brincadeira". */
  label: string;
  /** Item to open when the target is a stage. */
  stage: LessonStageType | null;
}

export interface ProductionProgress {
  count: number;
  total: number;
  percent: number;
  /** In the review cycle the bar counts approvals instead of concluded items. */
  finalReview: boolean;
}

/** Shown after an item is concluded; `next` is null when the package is complete. */
export interface ProductionCompletionNotice {
  completed: LessonStageType;
  next: LessonStageType | null;
}

export type ProductionInstructionsMap = Partial<Record<LessonStageType, string>>;

/** Instructions sent with a generation, kept until the background job ends. */
export interface PendingInstructions {
  text: string;
  /** Version the item had when the generation was requested. */
  versionId: string | null;
}

export enum InstructionsOutcome {
  /** The job is still running (or was not picked up yet). */
  WAIT = 'wait',
  /** A new version arrived: the text did its job. */
  CLEAR = 'clear',
  /** The generation failed: the text stays for the retry. */
  KEEP = 'keep',
}

export interface VisualConfigForm {
  visualType: LessonVisualType | '';
  visualOrientation: LessonVisualOrientation | '';
  visualQuantity: number | '';
  visualStyle: LessonVisualStyle;
}

export interface ProductionConfirmCopy {
  title: (stageLabel: string) => string;
  confirmText: string;
  confirmColor: 'primary' | 'error';
}

export interface SaveShortcutEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export type ProductionStageData = ReturnType<typeof useProductionStage>;
export type ProductionWorkflow = ReturnType<typeof useProductionWorkflow>;
export type ProductionPdfPreview = ReturnType<typeof useLessonPdfPreview>;

export interface ProductionHeaderProps {
  lesson: Lesson;
  step: ProductionHeaderStep;
  progress: ProductionProgress;
  canDelete: boolean;
  deleteDisabled: boolean;
  onOpenStage: (stage: LessonStageType) => void;
  onGoToReview: () => void;
  onDelete: () => void;
}

export interface ProductionDetailSkeletonProps {
  'data-testid': string;
}

export interface ProductionNoticesProps {
  recovered: boolean;
  hasDrafts: boolean;
  draftOutdated: boolean;
  rebaseDisabled: boolean;
  onDismissRecovered: () => void;
  onViewRemote: () => void;
  onRebase: () => void;
}

export interface ProductionStageCardProps {
  lesson: Lesson;
  data: ProductionStageData;
  workflow: ProductionWorkflow;
  refetch: () => unknown;
  preview: ProductionPdfPreview;
  resolvingCommentId: string | null;
  onResolveComment: (commentId: string) => void;
  onShowFailureDetails: () => void;
  onGoToReview: () => void;
  onOpenProviderSettings: () => void;
}

export interface ImageRegenerationDialogProps {
  regeneration: ImageRegeneration;
  /** "2. Visuais da história". */
  stageLabel: string;
  /** Only where the item has its own generation choices (story visuals). */
  fullRegeneration?: {
    canKeepChoices: boolean;
    onKeepChoices: () => void;
    onChangeChoices: () => void;
  };
}

export interface ProductionStageGuidanceProps {
  stage: LessonStage;
  category?: LessonCategory;
  verse: { reference: string; text: string } | null;
  staleOrigin: LessonStageType | null;
  stageGenerating: boolean;
  generationLocked: boolean;
  generation: LessonGenerationProgress | null;
  elapsedSeconds: number;
  dependencyReady: boolean;
  completionNotice: ProductionCompletionNotice | null;
  canRetry: boolean;
  onRetry: () => void;
  onShowFailureDetails: () => void;
  onDismissCompletionNotice: () => void;
  onGoToReview: () => void;
}

export interface ProductionStageActionsProps {
  stage: LessonStage;
  primary: ProductionStageAction | null;
  completed: boolean;
  stageGenerating: boolean;
  canGenerate: boolean;
  edited: boolean;
  saveEnabled: boolean;
  savePending: boolean;
  canComplete: boolean;
  completePending: boolean;
  previewLoading: boolean;
  providerCaption: string | null;
  regenerationLock: string | null;
  completeBlockedReason: string | null;
  saveError: string | null;
  completeError: string | null;
  onGenerate: () => void;
  onSave: () => void;
  onPreview: () => void;
  onComplete: () => void;
  onDiscard: () => void;
  onOpenProviderSettings: () => void;
  /** Absent when the item has no images. */
  imageRegeneration: {
    enabled: boolean;
    blockedReason: string | null;
    onOpen: () => void;
  } | null;
}

export interface ProductionUnsavedBarProps {
  visible: boolean;
  saveEnabled: boolean;
  savePending: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export interface ProductionConfirmDialogProps {
  confirmation: ProductionConfirmation | null;
  stage?: LessonStage;
  stageLabel: string;
  category?: LessonCategory;
  impactedStages: LessonStage[];
  reviewCycleActive: boolean;
  staleOrigin: LessonStageType | null;
  onConfirm: () => void;
  onClose: () => void;
}

export interface RemoteVersionDialogProps {
  open: boolean;
  stage?: LessonStage;
  stageLabel: string;
  version?: LessonVersion;
  document: TiptapDocument;
  onClose: () => void;
}

export interface UseProductionWorkflowInput {
  id: string;
  lesson: Lesson | undefined;
  data: ProductionStageData;
  selectedType: LessonStageType;
  selectStage: (type: LessonStageType) => void;
  /** The lesson was deleted in another session: nothing can be written anymore. */
  lessonGone: boolean;
  refetch: () => unknown;
  onDeleted: () => void;
}
