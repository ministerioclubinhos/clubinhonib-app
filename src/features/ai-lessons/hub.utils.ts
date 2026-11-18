import { PRODUCTION_COMPLETED_STATUSES, getStudioStageOrder } from './constants';
import {
  STUDIO_HUB_ACTION_PRIORITY,
  STUDIO_HUB_ACTION_VERBS,
  STUDIO_HUB_METRICS,
  STUDIO_HUB_ROUTES,
  STUDIO_HUB_STAGE_TONES,
  STUDIO_HUB_TEXTS,
  STUDIO_HUB_TIME_UNITS,
  STUDIO_LIST_STATUS_PARAM,
} from './hub.constants';
import {
  LESSON_STAGE_LABELS,
  LESSON_STAGE_STATUS_LABELS,
  SPECIAL_STAGE_LABELS,
} from './presentation.constants';
import { STUDIO_STAGE_QUERY_PARAM } from './constants';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStatus,
  StudioHubAction,
  StudioHubMetric,
  type Lesson,
  type LessonDashboard,
  type LessonStage,
  type LessonStageType,
  type StudioHubQueueItem,
  type StudioHubStageDot,
} from './types';

/**
 * Pure rules of the Studio dashboard.
 *
 * The dashboard is a work queue: for each lesson still in the works it answers
 * "what do I do next, and where?". Everything here derives that answer from the
 * lesson as the API returns it — nothing is stored.
 */

/** Stage name as the lesson's category calls it. */
export function hubStageLabel(lesson: Pick<Lesson, 'category'>, type: LessonStageType): string {
  const special = lesson.category === LessonCategory.SPECIAL ? SPECIAL_STAGE_LABELS[type] : undefined;
  return special ?? LESSON_STAGE_LABELS[type];
}

/** The lesson's stages in production order, each reduced to a pipeline dot. */
export function hubStageDots(lesson: Pick<Lesson, 'category' | 'stages'>): StudioHubStageDot[] {
  return getStudioStageOrder(lesson.category).map((type) => {
    const status =
      lesson.stages.find((stage) => stage.type === type)?.status ?? LessonStageStatus.NOT_STARTED;
    return {
      type,
      label: hubStageLabel(lesson, type),
      statusLabel: LESSON_STAGE_STATUS_LABELS[status],
      tone: STUDIO_HUB_STAGE_TONES[status],
    };
  });
}

const stageWith = (lesson: Lesson, statuses: readonly LessonStageStatus[]): LessonStage | undefined =>
  getStudioStageOrder(lesson.category)
    .map((type) => lesson.stages.find((stage) => stage.type === type))
    .find((stage): stage is LessonStage => Boolean(stage && statuses.includes(stage.status)));

/** First stage, in production order, that the producer has not finished yet. */
function nextProductionStage(lesson: Lesson): LessonStageType | undefined {
  return getStudioStageOrder(lesson.category).find((type) => {
    const status = lesson.stages.find((stage) => stage.type === type)?.status;
    return !status || !PRODUCTION_COMPLETED_STATUSES.includes(status);
  });
}

const stageHref = (base: string, lessonId: string, stage?: LessonStageType): string =>
  stage
    ? `${base}/${lessonId}?${STUDIO_STAGE_QUERY_PARAM}=${stage}`
    : `${base}/${lessonId}`;

/**
 * What the lesson needs next, and where to do it.
 *
 * Order matters: a returned or failed item beats everything else, because it
 * blocks the package; then what only needs a click (publish), then what waits
 * for a person (review), then plain production.
 */
export function hubNextStep(
  lesson: Lesson
): Pick<StudioHubQueueItem, 'action' | 'actionLabel' | 'href'> {
  const verb = (action: StudioHubAction, stage?: LessonStageType) =>
    stage
      ? `${STUDIO_HUB_ACTION_VERBS[action]}: ${hubStageLabel(lesson, stage)}`
      : STUDIO_HUB_ACTION_VERBS[action];
  const step = (action: StudioHubAction, base: string, stage?: LessonStageType) => ({
    action,
    actionLabel: verb(action, stage),
    href: stageHref(base, lesson.id, stage),
  });

  if (lesson.status === LessonStatus.PUBLISHING) {
    return step(StudioHubAction.WAIT, STUDIO_HUB_ROUTES.review);
  }

  const returned = stageWith(lesson, [LessonStageStatus.CHANGES_REQUESTED]);
  if (returned || lesson.status === LessonStatus.CHANGES_REQUESTED) {
    return step(StudioHubAction.FIX_CHANGES, STUDIO_HUB_ROUTES.production, returned?.type);
  }

  const failed = stageWith(lesson, [LessonStageStatus.FAILED]);
  if (failed) return step(StudioHubAction.RETRY_FAILED, STUDIO_HUB_ROUTES.production, failed.type);

  if (lesson.status === LessonStatus.READY_FOR_PUBLICATION) {
    return step(StudioHubAction.PUBLISH, STUDIO_HUB_ROUTES.review);
  }

  if (lesson.status === LessonStatus.PACKAGE_READY || lesson.status === LessonStatus.IN_REVIEW) {
    const waiting = stageWith(lesson, [
      LessonStageStatus.IN_REVIEW,
      LessonStageStatus.PRODUCER_APPROVED,
    ]);
    return step(StudioHubAction.REVIEW, STUDIO_HUB_ROUTES.review, waiting?.type);
  }

  const next = nextProductionStage(lesson);
  const started = lesson.stages.some((stage) => stage.status !== LessonStageStatus.NOT_STARTED);
  return step(
    started ? StudioHubAction.CONTINUE : StudioHubAction.START,
    STUDIO_HUB_ROUTES.production,
    next
  );
}

/** The work queue: lessons in the works, most urgent action first, newest first within it. */
export function buildHubQueue(lessons: readonly Lesson[]): StudioHubQueueItem[] {
  return lessons
    .map((lesson) => {
      const stages = hubStageDots(lesson);
      const completed = lesson.stages.filter((stage) =>
        PRODUCTION_COMPLETED_STATUSES.includes(stage.status)
      ).length;
      return { lesson, ...hubNextStep(lesson), stages, completed, total: stages.length };
    })
    .sort(
      (a, b) =>
        STUDIO_HUB_ACTION_PRIORITY[a.action] - STUDIO_HUB_ACTION_PRIORITY[b.action] ||
        b.lesson.updatedAt.localeCompare(a.lesson.updatedAt)
    );
}

/** The counters, each with its value and where a click lands. */
export function hubMetrics(
  dashboard: Pick<LessonDashboard, 'byStatus'> | undefined
): { key: StudioHubMetric; label: string; value: number; href: string; color: string }[] {
  return STUDIO_HUB_METRICS.map((metric) => ({
    key: metric.key,
    label: metric.label,
    color: metric.color,
    value: metric.statuses.reduce((sum, status) => sum + (dashboard?.byStatus[status] ?? 0), 0),
    href: metric.status
      ? `${metric.route}?${STUDIO_LIST_STATUS_PARAM}=${metric.status}`
      : metric.route,
  }));
}

/** Status from the listing's URL; anything that is not a status filters nothing. */
export function parseListStatus(value: string | null | undefined): LessonStatus | '' {
  return (Object.values(LessonStatus) as string[]).includes(value ?? '')
    ? (value as LessonStatus)
    : '';
}

/** "há 2 dias", "há 3 horas"; under a minute, "agora há pouco". */
export function hubRelativeTime(iso: string, now: Date = new Date()): string {
  const elapsed = now.getTime() - new Date(iso).getTime();
  if (!Number.isFinite(elapsed)) return '';

  const match = STUDIO_HUB_TIME_UNITS.find(({ ms }) => elapsed >= ms);
  if (!match) return STUDIO_HUB_TEXTS.justNow;

  return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' }).format(
    -Math.floor(elapsed / match.ms),
    match.unit
  );
}

/** "Semana 12" or the material kind when the lesson has no week. */
export function hubLessonTag(lesson: Pick<Lesson, 'weekNumber' | 'category'>): string {
  if (lesson.category === LessonCategory.SPECIAL) return 'Material especial';
  return lesson.weekNumber ? `Semana ${lesson.weekNumber}` : 'Sem semana definida';
}
