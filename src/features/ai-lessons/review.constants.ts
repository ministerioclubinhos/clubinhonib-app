import { LessonStatus, ReviewQueueView } from './types';

/**
 * Os recortes da fila de revisão e os status de lição que cada um reúne.
 *
 * "Para revisar" é o que espera uma decisão do revisor; "Devolvidas" está com
 * a produção; "Prontas para publicar" só precisa de um clique.
 */
export const REVIEW_QUEUE_VIEWS: readonly {
  view: ReviewQueueView;
  label: string;
  statuses: readonly LessonStatus[];
  /** Destaca o recorte quando há lição nele: é trabalho esperando. */
  urgent?: boolean;
}[] = [
  {
    view: ReviewQueueView.TO_REVIEW,
    label: 'Para revisar',
    statuses: [LessonStatus.PACKAGE_READY, LessonStatus.IN_REVIEW],
    urgent: true,
  },
  {
    view: ReviewQueueView.READY,
    label: 'Prontas para publicar',
    statuses: [LessonStatus.READY_FOR_PUBLICATION, LessonStatus.PUBLISHING],
    urgent: true,
  },
  {
    view: ReviewQueueView.RETURNED,
    label: 'Devolvidas à produção',
    statuses: [LessonStatus.CHANGES_REQUESTED],
  },
  {
    view: ReviewQueueView.PUBLISHED,
    label: 'Publicadas',
    statuses: [LessonStatus.PUBLISHED],
  },
  {
    view: ReviewQueueView.ALL,
    label: 'Todas',
    statuses: [
      LessonStatus.PACKAGE_READY,
      LessonStatus.IN_REVIEW,
      LessonStatus.CHANGES_REQUESTED,
      LessonStatus.READY_FOR_PUBLICATION,
      LessonStatus.PUBLISHING,
      LessonStatus.PUBLISHED,
    ],
  },
];

/** Status em que o revisor ainda tem o que decidir no pacote. */
export const REVIEW_DECISION_STATUSES: readonly LessonStatus[] = [
  LessonStatus.PACKAGE_READY,
  LessonStatus.IN_REVIEW,
  LessonStatus.CHANGES_REQUESTED,
  LessonStatus.READY_FOR_PUBLICATION,
];

/** O que dizer quando um recorte da fila está vazio. */
export const REVIEW_EMPTY_TEXTS: Record<ReviewQueueView, { title: string; subtitle: string }> = {
  [ReviewQueueView.ALL]: {
    title: 'Nenhuma lição pronta para revisão',
    subtitle:
      'As lições aparecem aqui quando a produção conclui todos os itens do pacote.',
  },
  [ReviewQueueView.TO_REVIEW]: {
    title: 'Nada aguardando revisão',
    subtitle: 'Nenhum pacote espera a sua decisão agora.',
  },
  [ReviewQueueView.RETURNED]: {
    title: 'Nenhuma lição devolvida',
    subtitle: 'Não há pacote com ajustes pendentes na produção.',
  },
  [ReviewQueueView.READY]: {
    title: 'Nada pronto para publicar',
    subtitle: 'Um pacote fica pronto quando todos os itens são aprovados.',
  },
  [ReviewQueueView.PUBLISHED]: {
    title: 'Nenhuma lição publicada',
    subtitle: 'As lições publicadas pelo Estúdio aparecem aqui.',
  },
};

export const REVIEW_TEXTS = {
  listTitle: 'Revisão e aprovação',
  listSummary:
    'Revise cada item do pacote, aprove ou devolva com ajustes. Com tudo aprovado, publique o material.',
  decisionTitle: 'Sua decisão sobre este item',
  decisionHint: 'Aprove o item ou descreva o ajuste e devolva-o para a produção.',
  feedbackLabel: 'Ajuste necessário',
  feedbackPlaceholder: 'Ex.: Deixar o parágrafo inicial mais claro para as crianças.',
  feedbackNeeded: 'Escreva o ajuste para poder devolver o item.',
  approve: 'Aprovar este item',
  approved: 'Item Aprovado',
  requestChanges: 'Devolver com ajustes',
  reopen: 'Reabrir este item para ajustes',
  nextPending: 'Ir para o próximo item pendente',
  noDecisionTitle: 'Sem decisão pendente',
} as const;
