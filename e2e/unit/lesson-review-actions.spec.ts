import { expect, test } from '@playwright/test';
import { lessonReviewActions } from '@/features/ai-lessons/review-actions';
import { LessonStageStatus as Stage, LessonStatus as Lesson } from '@/features/ai-lessons/types';

test('pacote pronto oferece início de revisão antes de aprovar cada item', () => {
  expect(lessonReviewActions(Lesson.PACKAGE_READY, Stage.PRODUCER_APPROVED, true)).toEqual({
    canStartReview: true,
    canReviewItem: false,
  });
  expect(lessonReviewActions(Lesson.IN_REVIEW, Stage.IN_REVIEW, true)).toEqual({
    canStartReview: false,
    canReviewItem: true,
  });
});
test('não habilita aprovação de rascunhos, itens sem versão, aprovados ou publicados', () => {
  for (const state of [Stage.DRAFT, Stage.PRODUCER_APPROVED, Stage.APPROVED, Stage.FAILED])
    expect(lessonReviewActions(Lesson.IN_REVIEW, state, true).canReviewItem).toBe(false);
  expect(lessonReviewActions(Lesson.IN_REVIEW, Stage.IN_REVIEW, false).canReviewItem).toBe(false);
  expect(lessonReviewActions(Lesson.PUBLISHED, Stage.IN_REVIEW, true).canReviewItem).toBe(false);
});

test('itens ainda em revisão continuam revisáveis durante solicitação de ajustes conforme API', () => {
  expect(lessonReviewActions(Lesson.CHANGES_REQUESTED, Stage.IN_REVIEW, true).canReviewItem).toBe(
    true
  );
  expect(
    lessonReviewActions(Lesson.CHANGES_REQUESTED, Stage.CHANGES_REQUESTED, true).canReviewItem
  ).toBe(false);
});
