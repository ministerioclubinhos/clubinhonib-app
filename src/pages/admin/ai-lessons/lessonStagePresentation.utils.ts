import { LessonCategory, LessonStageType } from '@/features/ai-lessons/types';
import {
  LESSON_STAGE_LABELS,
  LESSON_STAGE_SHORT_LABELS,
  SPECIAL_STAGE_LABELS,
  SPECIAL_STAGE_SHORT_LABELS,
} from './lessonDraftDetail.constants';

export function lessonStageLabel(
  stage: LessonStageType,
  category?: LessonCategory,
  short = false,
): string {
  const regular = short ? LESSON_STAGE_SHORT_LABELS : LESSON_STAGE_LABELS;
  const special = short ? SPECIAL_STAGE_SHORT_LABELS : SPECIAL_STAGE_LABELS;
  return category === LessonCategory.SPECIAL ? special[stage] ?? regular[stage] : regular[stage];
}
