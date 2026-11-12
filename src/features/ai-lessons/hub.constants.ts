import { LESSON_STAGE_DESCRIPTIONS, LESSON_STAGE_LABELS } from './presentation.constants';
import { STUDIO_STAGE_ORDER } from './constants';
import {
  LessonStageStatus,
  LessonStatus,
  StudioHubAction,
  StudioHubMetric,
  StudioHubStageTone,
  type StudioChipColor,
} from './types';

/** Routes the dashboard sends the user to. */
export const STUDIO_HUB_ROUTES = {
  production: '/adm/estudio/licoes',
  review: '/adm/estudio/revisao',
  guidelines: '/adm/estudio/orientacoes',
} as const;

/** Query parameter the listings read to open already filtered by status. */
export const STUDIO_LIST_STATUS_PARAM = 'status';

/** Rows of the work queue shown before "Ver todas". */
export const STUDIO_HUB_QUEUE_LIMIT = 6;

/** Published lessons shown in the side column. */
export const STUDIO_HUB_PUBLISHED_LIMIT = 3;

/** Urgency of each action: lower comes first in the queue. */
export const STUDIO_HUB_ACTION_PRIORITY: Record<StudioHubAction, number> = {
  [StudioHubAction.FIX_CHANGES]: 0,
  [StudioHubAction.RETRY_FAILED]: 1,
  [StudioHubAction.PUBLISH]: 2,
  [StudioHubAction.REVIEW]: 3,
  [StudioHubAction.CONTINUE]: 4,
  [StudioHubAction.START]: 5,
  [StudioHubAction.WAIT]: 6,
};

/** Verb of the action button; the stage name is appended when there is one. */
export const STUDIO_HUB_ACTION_VERBS: Record<StudioHubAction, string> = {
  [StudioHubAction.FIX_CHANGES]: 'Corrigir',
  [StudioHubAction.RETRY_FAILED]: 'Tentar de novo',
  [StudioHubAction.PUBLISH]: 'Publicar',
  [StudioHubAction.REVIEW]: 'Revisar',
  [StudioHubAction.CONTINUE]: 'Continuar',
  [StudioHubAction.START]: 'Começar',
  [StudioHubAction.WAIT]: 'Acompanhar publicação',
};

/** Short reason shown above the row, in the user's words. */
export const STUDIO_HUB_ACTION_HINTS: Record<StudioHubAction, string> = {
  [StudioHubAction.FIX_CHANGES]: 'O revisor pediu ajustes',
  [StudioHubAction.RETRY_FAILED]: 'Uma geração falhou',
  [StudioHubAction.PUBLISH]: 'Aprovada — falta publicar',
  [StudioHubAction.REVIEW]: 'Aguardando revisão',
  [StudioHubAction.CONTINUE]: 'Em produção',
  [StudioHubAction.START]: 'Ainda não começou',
  [StudioHubAction.WAIT]: 'Publicando agora',
};

export const STUDIO_HUB_ACTION_COLORS: Record<StudioHubAction, StudioChipColor> = {
  [StudioHubAction.FIX_CHANGES]: 'error',
  [StudioHubAction.RETRY_FAILED]: 'error',
  [StudioHubAction.PUBLISH]: 'success',
  [StudioHubAction.REVIEW]: 'warning',
  [StudioHubAction.CONTINUE]: 'primary',
  [StudioHubAction.START]: 'primary',
  [StudioHubAction.WAIT]: 'info',
};

/** What each stage status looks like as a pipeline dot. */
export const STUDIO_HUB_STAGE_TONES: Record<LessonStageStatus, StudioHubStageTone> = {
  [LessonStageStatus.NOT_STARTED]: StudioHubStageTone.TODO,
  [LessonStageStatus.GENERATING]: StudioHubStageTone.WORKING,
  [LessonStageStatus.DRAFT]: StudioHubStageTone.WORKING,
  [LessonStageStatus.PRODUCER_APPROVED]: StudioHubStageTone.PRODUCED,
  [LessonStageStatus.IN_REVIEW]: StudioHubStageTone.PRODUCED,
  [LessonStageStatus.CHANGES_REQUESTED]: StudioHubStageTone.PROBLEM,
  [LessonStageStatus.APPROVED]: StudioHubStageTone.DONE,
  [LessonStageStatus.FAILED]: StudioHubStageTone.PROBLEM,
  [LessonStageStatus.STALE]: StudioHubStageTone.STALE,
};

/** Legend of the pipeline dots. */
export const STUDIO_HUB_TONE_LABELS: Record<StudioHubStageTone, string> = {
  [StudioHubStageTone.DONE]: 'Aprovada',
  [StudioHubStageTone.PRODUCED]: 'Concluída, aguarda revisão',
  [StudioHubStageTone.WORKING]: 'Em produção',
  [StudioHubStageTone.PROBLEM]: 'Precisa de atenção',
  [StudioHubStageTone.STALE]: 'Desatualizada',
  [StudioHubStageTone.TODO]: 'Não iniciada',
};

/**
 * The counters and the lesson statuses each one adds up.
 *
 * `route` and `status` say where a click on the counter lands; a counter that
 * adds up more than one status opens the listing without a status filter.
 */
export const STUDIO_HUB_METRICS: readonly {
  key: StudioHubMetric;
  label: string;
  statuses: readonly LessonStatus[];
  route: string;
  status?: LessonStatus;
  color: 'error' | 'warning' | 'secondary' | 'success' | 'info';
}[] = [
  {
    key: StudioHubMetric.CHANGES,
    label: 'Ajustes solicitados',
    statuses: [LessonStatus.CHANGES_REQUESTED],
    route: STUDIO_HUB_ROUTES.production,
    status: LessonStatus.CHANGES_REQUESTED,
    color: 'error',
  },
  {
    key: StudioHubMetric.PRODUCTION,
    label: 'Em produção',
    statuses: [LessonStatus.DRAFT, LessonStatus.IN_PROGRESS],
    route: STUDIO_HUB_ROUTES.production,
    color: 'warning',
  },
  {
    key: StudioHubMetric.REVIEW,
    label: 'Aguardando revisão',
    statuses: [LessonStatus.PACKAGE_READY, LessonStatus.IN_REVIEW],
    route: STUDIO_HUB_ROUTES.review,
    color: 'secondary',
  },
  {
    key: StudioHubMetric.READY,
    label: 'Prontas para publicar',
    statuses: [LessonStatus.READY_FOR_PUBLICATION, LessonStatus.PUBLISHING],
    route: STUDIO_HUB_ROUTES.review,
    status: LessonStatus.READY_FOR_PUBLICATION,
    color: 'success',
  },
  {
    key: StudioHubMetric.PUBLISHED,
    label: 'Publicadas',
    statuses: [LessonStatus.PUBLISHED],
    route: STUDIO_HUB_ROUTES.production,
    status: LessonStatus.PUBLISHED,
    color: 'info',
  },
];

/** The editorial flow, for the reference section: the 8 items plus the weekly material. */
export const STUDIO_HUB_FLOW_STEPS: readonly { name: string; description: string }[] = [
  ...STUDIO_STAGE_ORDER.map((type) => ({
    name: LESSON_STAGE_LABELS[type],
    description: LESSON_STAGE_DESCRIPTIONS[type],
  })),
  {
    name: '9. Material semanal',
    description: 'Depois da aprovação, o pacote é compilado e publicado como material da semana.',
  },
];

export const STUDIO_HUB_STANDARDS = ['5 a 11 anos', 'Bíblia NVI', 'A4 Paisagem', 'A4 Retrato'] as const;

/** Steps of "há quanto tempo", from the largest unit down. */
export const STUDIO_HUB_TIME_UNITS: readonly { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

export const STUDIO_HUB_TEXTS = {
  title: 'Estúdio Clubinho',
  queueTitle: 'Fila de trabalho',
  queueSubtitle: 'O que cada lição precisa agora, do mais urgente ao menos.',
  queueEmptyTitle: 'Nada pendente',
  queueEmptyText: 'Nenhuma lição em andamento. Que tal começar a próxima?',
  publishedTitle: 'Publicadas recentemente',
  publishedEmpty: 'Nenhuma lição publicada ainda.',
  referenceTitle: 'Como funciona o fluxo editorial',
  referenceText:
    'O pacote tem 8 itens encadeados. Depois da aprovação, é compilado no material semanal. Conteúdo para crianças de 5 a 11 anos, com a Bíblia NVI.',
  justNow: 'agora há pouco',
  error: 'Não foi possível carregar o painel do estúdio.',
} as const;
