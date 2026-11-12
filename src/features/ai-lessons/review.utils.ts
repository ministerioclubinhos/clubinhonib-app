import { getStudioStageOrder } from './constants';
import { REVIEW_DECISION_STATUSES, REVIEW_QUEUE_VIEWS } from './review.constants';
import {
  LessonStageStatus,
  LessonStatus,
  ReviewQueueView,
  type Lesson,
  type LessonStageType,
  type ReviewCardAction,
  type ReviewLessonSummary,
} from './types';

/**
 * Regras puras da fila e da tela de revisão.
 *
 * Tudo sai da lição como a API a devolve: quantos itens o revisor já decidiu,
 * quantos esperam por ele, e o que o botão de cada cartão deve dizer.
 */

/** Status de lição que um recorte da fila reúne. */
export function reviewViewStatuses(view: ReviewQueueView): readonly LessonStatus[] {
  return (REVIEW_QUEUE_VIEWS.find((item) => item.view === view) ?? REVIEW_QUEUE_VIEWS[0]).statuses;
}

/**
 * Recorte que corresponde a um status vindo da URL (`?status=`).
 *
 * O painel do Estúdio abre a fila já filtrada; um status que não é da revisão
 * cai em "Todas".
 */
export function reviewViewFromStatus(status: LessonStatus | '' | null | undefined): ReviewQueueView {
  if (!status) return ReviewQueueView.ALL;
  return (
    REVIEW_QUEUE_VIEWS.find(
      (item) => item.view !== ReviewQueueView.ALL && item.statuses.includes(status)
    )?.view ?? ReviewQueueView.ALL
  );
}

/** Quantas lições há em cada recorte, a partir da contagem por status do painel. */
export function reviewQueueCounts(
  byStatus: Partial<Record<LessonStatus, number>> | undefined
): Record<ReviewQueueView, number> {
  return Object.fromEntries(
    REVIEW_QUEUE_VIEWS.map((item) => [
      item.view,
      item.statuses.reduce((sum, status) => sum + (byStatus?.[status] ?? 0), 0),
    ])
  ) as Record<ReviewQueueView, number>;
}

/** Onde a lição está na revisão: aprovados, aguardando decisão e devolvidos. */
export function reviewLessonSummary(lesson: Pick<Lesson, 'stages' | 'category'>): ReviewLessonSummary {
  const stages = lesson.stages ?? [];
  const count = (status: LessonStageStatus) =>
    stages.filter((stage) => stage.status === status).length;
  const total = stages.length || getStudioStageOrder(lesson.category).length;
  const approved = count(LessonStageStatus.APPROVED);

  return {
    approved,
    awaiting: count(LessonStageStatus.IN_REVIEW),
    returned: count(LessonStageStatus.CHANGES_REQUESTED),
    total,
    percent: total > 0 ? Math.round((approved / total) * 100) : 0,
  };
}

/** Uma linha que diz o que falta, no lugar de repetir a mesma fração três vezes. */
export function reviewProgressText(summary: ReviewLessonSummary): string {
  const parts = [`${summary.approved} de ${summary.total} itens aprovados`];
  if (summary.awaiting > 0) {
    parts.push(`${summary.awaiting} ${summary.awaiting === 1 ? 'aguarda' : 'aguardam'} sua decisão`);
  }
  if (summary.returned > 0) {
    parts.push(`${summary.returned} ${summary.returned === 1 ? 'devolvido' : 'devolvidos'}`);
  }
  return parts.join(' · ');
}

/** O que o botão do cartão diz e como se destaca, conforme o que a lição precisa. */
export function reviewCardAction(lesson: Pick<Lesson, 'status'>): ReviewCardAction {
  switch (lesson.status) {
    case LessonStatus.PACKAGE_READY:
      return { label: 'Iniciar revisão', variant: 'contained', color: 'primary' };
    case LessonStatus.IN_REVIEW:
      return { label: 'Continuar revisão', variant: 'contained', color: 'primary' };
    case LessonStatus.CHANGES_REQUESTED:
      return { label: 'Acompanhar ajustes', variant: 'outlined', color: 'warning' };
    case LessonStatus.READY_FOR_PUBLICATION:
      return { label: 'Publicar', variant: 'contained', color: 'success' };
    case LessonStatus.PUBLISHING:
      return { label: 'Acompanhar publicação', variant: 'outlined', color: 'primary' };
    default:
      return { label: 'Ver lição publicada', variant: 'outlined', color: 'primary' };
  }
}

/** Situação do pacote no cabeçalho da revisão, em poucas palavras. */
export function reviewHeaderStatus(
  lesson: Pick<Lesson, 'status'>,
  summary: ReviewLessonSummary
): { label: string; color: 'success' | 'info' | 'warning' | 'default' } {
  if (lesson.status === LessonStatus.ARCHIVED) return { label: 'Arquivada', color: 'default' };
  if (lesson.status === LessonStatus.PUBLISHED) return { label: 'Publicada', color: 'success' };
  if (lesson.status === LessonStatus.PUBLISHING) return { label: 'Publicando…', color: 'info' };
  if (summary.approved === summary.total) {
    return { label: 'Todos os itens aprovados', color: 'success' };
  }
  return { label: `${summary.approved} de ${summary.total} itens aprovados`, color: 'warning' };
}

/** O revisor ainda tem o que decidir neste pacote? */
export function isReviewDecisionOpen(status: LessonStatus): boolean {
  return REVIEW_DECISION_STATUSES.includes(status);
}

/** Itens que esperam a decisão do revisor, na ordem do pacote. */
export function pendingReviewStages(lesson: Pick<Lesson, 'stages' | 'category'>): LessonStageType[] {
  return getStudioStageOrder(lesson.category).filter(
    (type) =>
      lesson.stages.find((stage) => stage.type === type)?.status === LessonStageStatus.IN_REVIEW
  );
}
