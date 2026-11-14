import { expect, test } from '@playwright/test';

import {
  isReviewDecisionOpen,
  pendingReviewStages,
  reviewCardAction,
  reviewHeaderStatus,
  reviewLessonSummary,
  reviewProgressText,
  reviewPublishButtonLabel,
  reviewQueueCounts,
  reviewViewFromStatus,
  reviewViewStatuses,
} from '@/features/ai-lessons/review.utils';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  ReviewQueueView,
  type LessonStage,
} from '@/features/ai-lessons/types';

const stage = (type: LessonStageType, status: LessonStageStatus): LessonStage => ({
  id: `${type}-id`,
  type,
  status,
  currentVersionId: 'v1',
  lockVersion: 1,
  failureMessage: null,
  versions: [],
});

const stages = [
  stage(LessonStageType.LESSON, LessonStageStatus.APPROVED),
  stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.IN_REVIEW),
  stage(LessonStageType.STANDARD_GAME, LessonStageStatus.CHANGES_REQUESTED),
  stage(LessonStageType.VERSE_VISUALS, LessonStageStatus.IN_REVIEW),
];

test.describe('revisão: fila', () => {
  test('cada recorte reúne os status certos, e "Todas" os reúne todos', () => {
    expect(reviewViewStatuses(ReviewQueueView.TO_REVIEW)).toEqual([
      LessonStatus.PACKAGE_READY,
      LessonStatus.IN_REVIEW,
    ]);
    expect(reviewViewStatuses(ReviewQueueView.ALL)).toHaveLength(6);
    // Rascunho e arquivada não são da fila de revisão.
    expect(reviewViewStatuses(ReviewQueueView.ALL)).not.toContain(LessonStatus.DRAFT);
    expect(reviewViewStatuses(ReviewQueueView.ALL)).not.toContain(LessonStatus.ARCHIVED);
  });

  test('o status da URL abre o recorte correspondente', () => {
    expect(reviewViewFromStatus(LessonStatus.READY_FOR_PUBLICATION)).toBe(ReviewQueueView.READY);
    expect(reviewViewFromStatus(LessonStatus.PUBLISHED)).toBe(ReviewQueueView.PUBLISHED);
    expect(reviewViewFromStatus(LessonStatus.IN_REVIEW)).toBe(ReviewQueueView.TO_REVIEW);
    expect(reviewViewFromStatus(LessonStatus.DRAFT)).toBe(ReviewQueueView.ALL);
    expect(reviewViewFromStatus('')).toBe(ReviewQueueView.ALL);
  });

  test('conta as lições de cada recorte a partir da contagem por status', () => {
    const counts = reviewQueueCounts({ PACKAGE_READY: 1, IN_REVIEW: 2, CHANGES_REQUESTED: 1, PUBLISHED: 4, DRAFT: 9 });

    expect(counts[ReviewQueueView.TO_REVIEW]).toBe(3);
    expect(counts[ReviewQueueView.RETURNED]).toBe(1);
    expect(counts[ReviewQueueView.READY]).toBe(0);
    expect(counts[ReviewQueueView.PUBLISHED]).toBe(4);
    expect(counts[ReviewQueueView.ALL]).toBe(8);
    expect(reviewQueueCounts(undefined)[ReviewQueueView.ALL]).toBe(0);
  });

  test('o botão do cartão diz o que a lição precisa', () => {
    expect(reviewCardAction({ status: LessonStatus.PACKAGE_READY }).label).toBe('Iniciar revisão');
    expect(reviewCardAction({ status: LessonStatus.IN_REVIEW }).label).toBe('Continuar revisão');
    expect(reviewCardAction({ status: LessonStatus.READY_FOR_PUBLICATION })).toEqual({
      label: 'Publicar',
      variant: 'contained',
      color: 'success',
    });
    expect(reviewCardAction({ status: LessonStatus.PUBLISHED }).variant).toBe('outlined');
  });
});

test.describe('revisão: situação do pacote', () => {
  test('resume aprovados, aguardando decisão e devolvidos', () => {
    const summary = reviewLessonSummary({ stages, category: LessonCategory.REGULAR });

    expect(summary).toEqual({ approved: 1, awaiting: 2, returned: 1, total: 4, percent: 25 });
    expect(reviewProgressText(summary)).toBe(
      '1 de 4 itens aprovados · 2 aguardam sua decisão · 1 devolvido'
    );
  });

  test('sem etapas carregadas, o total é o do tipo de material', () => {
    expect(reviewLessonSummary({ stages: [], category: LessonCategory.REGULAR }).total).toBe(8);
    expect(reviewLessonSummary({ stages: [], category: LessonCategory.SPECIAL }).total).toBe(3);
    expect(reviewProgressText({ approved: 8, awaiting: 0, returned: 0, total: 8, percent: 100 })).toBe(
      '8 de 8 itens aprovados'
    );
  });

  test('o cabeçalho resume o pacote em poucas palavras', () => {
    const partial = reviewLessonSummary({ stages, category: LessonCategory.REGULAR });
    const done = { approved: 8, awaiting: 0, returned: 0, total: 8, percent: 100 };

    expect(reviewHeaderStatus({ status: LessonStatus.IN_REVIEW }, partial)).toEqual({
      label: '1 de 4 itens aprovados',
      color: 'warning',
    });
    expect(reviewHeaderStatus({ status: LessonStatus.READY_FOR_PUBLICATION }, done).label).toBe(
      'Todos os itens aprovados'
    );
    expect(reviewHeaderStatus({ status: LessonStatus.PUBLISHED }, done).label).toBe('Publicada');
    expect(reviewHeaderStatus({ status: LessonStatus.ARCHIVED }, done).label).toBe('Arquivada');
  });

  test('só há decisão a tomar enquanto o pacote está no ciclo de revisão', () => {
    expect(isReviewDecisionOpen(LessonStatus.IN_REVIEW)).toBe(true);
    expect(isReviewDecisionOpen(LessonStatus.READY_FOR_PUBLICATION)).toBe(true);
    expect(isReviewDecisionOpen(LessonStatus.PUBLISHED)).toBe(false);
    expect(isReviewDecisionOpen(LessonStatus.ARCHIVED)).toBe(false);
    expect(isReviewDecisionOpen(LessonStatus.IN_PROGRESS)).toBe(false);
  });

  test('lista os itens que esperam decisão, na ordem do pacote', () => {
    expect(pendingReviewStages({ stages, category: LessonCategory.REGULAR })).toEqual([
      LessonStageType.LESSON_VISUALS,
      LessonStageType.VERSE_VISUALS,
    ]);
  });
});

test.describe('reviewPublishButtonLabel', () => {
  test('publicação em andamento prevalece sobre os demais rótulos', () => {
    expect(reviewPublishButtonLabel({ publishing: true, republish: true, isSpecial: true })).toBe(
      'Publicando…'
    );
  });

  test('republicar, especial e regular têm rótulos próprios', () => {
    expect(reviewPublishButtonLabel({ publishing: false, republish: true, isSpecial: false })).toBe(
      'Publicar novamente'
    );
    expect(reviewPublishButtonLabel({ publishing: false, republish: false, isSpecial: true })).toBe(
      'Publicar como Material Especial'
    );
    expect(reviewPublishButtonLabel({ publishing: false, republish: false, isSpecial: false })).toBe(
      'Enviar ao Materiais Semanais'
    );
  });
});
