import { LessonStageStatus, LessonStatus, type Lesson, type LessonStage } from './types';
import {
  EDITABLE_STAGE_STATUSES,
  GENERATION_BLOCKED_LESSON_STATUSES,
  PRODUCTION_COMPLETED_STATUSES,
  getStudioStageOrder,
} from './constants';

export function lessonProductionActions(
  lesson: Lesson,
  stage: LessonStage | undefined,
  hasDraft: boolean,
  pending: boolean
) {
  const busy =
    pending ||
    lesson.status === LessonStatus.PUBLISHING ||
    lesson.stages.some((item) => item.status === LessonStageStatus.GENERATING);
  const stageOrder = getStudioStageOrder(lesson.category);
  const index = stage ? stageOrder.indexOf(stage.type) : -1;
  const previous = lesson.stages.find((item) => item.type === stageOrder[index - 1]);
  const dependencyReady =
    index === 0 || Boolean(previous && PRODUCTION_COMPLETED_STATUSES.includes(previous.status));
  const editable = Boolean(stage && EDITABLE_STAGE_STATUSES.includes(stage.status));
  return {
    canEdit: editable && Boolean(stage?.currentVersionId) && !busy,
    canSave: editable && hasDraft && !busy,
    canGenerate:
      Boolean(stage) &&
      dependencyReady &&
      !GENERATION_BLOCKED_LESSON_STATUSES.includes(lesson.status) &&
      !busy &&
      !hasDraft,
    canComplete: editable && Boolean(stage?.currentVersionId) && !busy && !hasDraft,
    dependencyReady,
  };
}

export function canPublishLesson(lesson: Lesson): boolean {
  return (
    lesson.status === LessonStatus.READY_FOR_PUBLICATION &&
    lesson.stages.length === getStudioStageOrder(lesson.category).length &&
    lesson.stages.every(
      (stage) => stage.status === LessonStageStatus.APPROVED && Boolean(stage.currentVersionId)
    )
  );
}
