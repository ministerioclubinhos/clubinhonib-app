import { LessonStageStatus, LessonStatus } from './types';

export function lessonReviewActions(
  lessonStatus: string,
  stageStatus: LessonStageStatus | undefined,
  hasVersion: boolean
) {
  return {
    canStartReview: lessonStatus === LessonStatus.PACKAGE_READY,
    canReviewItem:
      lessonStatus === LessonStatus.IN_REVIEW &&
      stageStatus === LessonStageStatus.IN_REVIEW &&
      hasVersion,
  };
}
