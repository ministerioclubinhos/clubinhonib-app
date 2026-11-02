import { LessonStageStatus, LessonStatus } from './types';

export interface LessonReviewActionsOptions {
  busy?: boolean;
  assetsComplete?: boolean;
}

export function lessonReviewActions(
  lessonStatus: LessonStatus,
  stageStatus: LessonStageStatus | undefined,
  hasVersion: boolean,
  options?: LessonReviewActionsOptions
) {
  const busy = Boolean(options?.busy);
  const assetsComplete = options?.assetsComplete ?? true;
  return {
    canStartReview: lessonStatus === LessonStatus.PACKAGE_READY && !busy,
    canReviewItem:
      [LessonStatus.IN_REVIEW, LessonStatus.CHANGES_REQUESTED].includes(lessonStatus) &&
      stageStatus === LessonStageStatus.IN_REVIEW &&
      hasVersion &&
      !busy &&
      assetsComplete,
  };
}
