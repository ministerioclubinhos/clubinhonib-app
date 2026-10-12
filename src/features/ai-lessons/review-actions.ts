import { LessonStageStatus, LessonStatus } from './types';

export function lessonReviewActions(
  lessonStatus: LessonStatus,
  stageStatus: LessonStageStatus | undefined,
  hasVersion: boolean
) {
  return {
    canStartReview: lessonStatus === LessonStatus.PACKAGE_READY,
    canReviewItem:
      [LessonStatus.IN_REVIEW, LessonStatus.CHANGES_REQUESTED].includes(lessonStatus) &&
      stageStatus === LessonStageStatus.IN_REVIEW &&
      hasVersion,
  };
}
