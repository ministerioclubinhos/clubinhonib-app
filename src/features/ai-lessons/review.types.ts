import type { ReactNode, RefObject } from 'react';
import type {
  Lesson,
  LessonComment,
  LessonStage,
  LessonStageType,
  LessonVersion,
  ReviewLessonSummary,
  StageAssetIssue,
  StudioFeedback,
  TiptapDocument,
} from './types';
import type { reviewHeaderStatus } from './review.utils';
import type { useReviewFeedback } from './useReviewFeedback';

export type ReviewFeedbackNotes = ReturnType<typeof useReviewFeedback>;

export interface UseReviewWorkflowInput {
  lesson: Lesson;
  /** Reloads the lesson after a conflict or an uncertain publication outcome. */
  refetch: () => unknown;
  notes: ReviewFeedbackNotes;
}

export interface LessonReviewWorkspaceProps extends UseReviewWorkflowInput {
  /** Leaves to the review list, asking first when there are unsent notes. */
  onBack: () => void;
}

export interface ReviewNoticesProps {
  recovered: boolean;
  onDismissRecovered: () => void;
  publishing: boolean;
  kindLabel: string;
  /** Rendered between the publishing and archived notices, as on the original page. */
  publishedPanel: ReactNode;
  archived: boolean;
  restoring: boolean;
  restoreDisabled: boolean;
  onRestore: () => void;
  publishErrorMessage: string | null;
  onDismissPublishError: () => void;
  publicationFailureMessage: string | null;
  canStartReview: boolean;
  startingReview: boolean;
  startReviewDisabled: boolean;
  onStartReview: () => void;
  isSpecial: boolean;
  actionErrorMessage: string | null;
  notice: StudioFeedback | null;
  onDismissNotice: () => void;
  downloadError: string | null;
  onDismissDownloadError: () => void;
}

export interface ReviewHeaderProps {
  lesson: Lesson;
  isSpecial: boolean;
  summary: ReviewLessonSummary;
  headerStatus: ReturnType<typeof reviewHeaderStatus>;
  allApproved: boolean;
  showPublish: boolean;
  showPublishHint: boolean;
  publishLabel: string;
  publishDisabled: boolean;
  onPublish: () => void;
  canDownload: boolean;
  downloading: boolean;
  onDownload: () => void;
  showArchive: boolean;
  archiving: boolean;
  archiveDisabled: boolean;
  onArchive: () => void;
}

export interface ReviewStageTabsProps {
  lesson: Lesson;
  stageOrder: readonly LessonStageType[];
  selectedType: LessonStageType;
  onSelect: (type: LessonStageType) => void;
}

export interface ReviewStagePanelProps {
  category: Lesson['category'];
  stage: LessonStage | undefined;
  stageLabel: string;
  currentVersion: LessonVersion | null;
  document: TiptapDocument;
  structuredData: Record<string, unknown>;
  assetIssue: StageAssetIssue;
  previewLoading: boolean;
  onOpenPreview: () => void;
  versionChanged: boolean;
  onAcknowledgeVersion: () => void;
  newerUpstream: LessonStageType | null;
}

export interface ReviewDecisionCardProps {
  decisionOpen: boolean;
  blockReason: string | null;
  feedback: string;
  onFeedbackChange: (text: string) => void;
  feedbackInputRef: RefObject<HTMLInputElement | null>;
  approving: boolean;
  approveDisabled: boolean;
  stageApproved: boolean;
  onApprove: () => void;
  approvePdfErrorMessage: string | null;
  onDismissApprovePdfError: () => void;
  previewDisabled: boolean;
  onOpenPreview: () => void;
  canRequestChanges: boolean;
  requestingChanges: boolean;
  requestChangesDisabled: boolean;
  onRequestChanges: () => void;
  showReopen: boolean;
  reopening: boolean;
  reopenDisabled: boolean;
  onReopen: () => void;
  nextPending: LessonStageType | null;
  pendingCount: number;
  onSelectStage: (type: LessonStageType) => void;
  comments: LessonComment[];
}

export interface ReviewReadyNoticeProps {
  isSpecial: boolean;
  disabled: boolean;
  onPublish: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}

export interface ReviewMobileBarProps {
  approving: boolean;
  approveDisabled: boolean;
  requestChangesDisabled: boolean;
  onApprove: () => void;
  onFocusFeedback: () => void;
}

export interface ReviewConfirmDialogsProps {
  currentWeekOpen: boolean;
  onConfirmCurrentWeek: () => void;
  onCloseCurrentWeek: () => void;
  archiveOpen: boolean;
  onConfirmArchive: () => void;
  onCloseArchive: () => void;
}
