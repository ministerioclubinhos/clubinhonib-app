import {
  LessonCategory,
  LessonSortField,
  LessonSortOrder,
  LessonStageType,
  LessonStatus,
  type GetLessonDraftsParams,
  type Lesson,
  type ParsedSseChunk,
  type VisualAsset,
} from './types';

export const parseSseChunk = (text: string): ParsedSseChunk => {
  const events = text.replace(/\r\n/g, '\n').split('\n\n');
  const remainder = events.pop() ?? '';
  let heartbeats = 0;
  const messages: string[] = [];

  for (const item of events) {
    const lines = item
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const isHeartbeatEvent = lines.some(
      (line) =>
        line.startsWith(': heartbeat') ||
        line === ':heartbeat' ||
        /^event:\s*heartbeat$/i.test(line)
    );
    if (isHeartbeatEvent) {
      heartbeats += 1;
      continue;
    }

    const dataPayload = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('');
    if (dataPayload) {
      messages.push(dataPayload);
    }
  }

  return {
    messages,
    remainder,
    heartbeats,
    hasActivity: messages.length > 0 || heartbeats > 0,
  };
};

export const objectValue = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const visualAssets = (
  value: Record<string, unknown> | null | undefined,
  stage: LessonStageType
): VisualAsset[] => {
  const key = [
    LessonStageType.VERSE_VISUALS,
    LessonStageType.MEDITATION_YOUNGER,
    LessonStageType.MEDITATION_OLDER,
    LessonStageType.MANUAL_WORK,
  ].includes(stage)
    ? 'printableAssets'
    : 'assets';
  return Array.isArray(value?.[key])
    ? value[key].map((item) => objectValue(item) as VisualAsset)
    : [];
};

export function hasCompleteStageAssets(
  stage: LessonStageType,
  structuredData: Record<string, unknown> | null | undefined
): boolean {
  if (stage === LessonStageType.LESSON) return true;
  if (!structuredData) return false;
  if (Object.keys(structuredData).length === 0) return true;

  if (
    stage === LessonStageType.STANDARD_GAME ||
    stage === LessonStageType.VERSE_FIXATION
  ) {
    if (!('assets' in structuredData)) return true;
    const assets = visualAssets(structuredData, stage);
    return assets.length > 0 && assets.every((asset) => Boolean(asset.url?.trim()));
  }

  if (
    stage === LessonStageType.MEDITATION_YOUNGER ||
    stage === LessonStageType.MEDITATION_OLDER
  ) {
    if (!('printableAssets' in structuredData)) return true;
    const assets = visualAssets(structuredData, stage);
    return assets.length > 0 && assets.every((asset) => Boolean(asset.url?.trim()));
  }

  const assets = visualAssets(structuredData, stage);
  return assets.length > 0 && assets.every((asset) => Boolean(asset.url?.trim()));
}

export function computeLessonSnapshotSignature(lesson: Lesson): string {
  const stagesPart = (lesson.stages ?? [])
    .slice()
    .sort((a, b) => a.type.localeCompare(b.type))
    .map(
      (stage) =>
        `${stage.type}:${stage.status}:${stage.lockVersion}:${stage.currentVersionId ?? ''}:${stage.failureMessage ?? ''}`
    )
    .join('|');
  const commentsCount = lesson.comments?.length ?? 0;
  return `${lesson.id}:${lesson.status}:${lesson.weekMaterialId ?? ''}:${lesson.publicationFailureMessage ?? ''}:${commentsCount}:${stagesPart}`;
}

export function isLessonSnapshotNewerOrEqual(
  previous: Lesson | undefined,
  next: Lesson
): boolean {
  if (!previous || previous.id !== next.id) return true;
  return !previous.stages.some((prevStage) => {
    const nextStage = next.stages.find((item) => item.type === prevStage.type);
    return Boolean(nextStage && nextStage.lockVersion < prevStage.lockVersion);
  });
}

export function buildLessonListParams(params: GetLessonDraftsParams) {
  return { ...params, statuses: params.statuses?.join(',') };
}

export function parseLessonSortOption(value: string) {
  const [sort, order] = value.split(':');
  return {
    sort:
      Object.values(LessonSortField).find((item) => item === sort) ?? LessonSortField.UPDATED_AT,
    order: Object.values(LessonSortOrder).find((item) => item === order) ?? LessonSortOrder.DESC,
  };
}
export function parseLessonStatus(value: string): LessonStatus | '' {
  return Object.values(LessonStatus).find((item) => item === value) ?? '';
}

export function formatLessonBadgeLabel(lesson: Pick<Lesson, 'category' | 'weekNumber'>): string {
  if (lesson.category === LessonCategory.SPECIAL) {
    return lesson.weekNumber ? `Material Especial · Semana ${lesson.weekNumber}` : 'Material Especial';
  }
  return lesson.weekNumber ? `Semana ${lesson.weekNumber}` : 'Material Semanal';
}

export function parseLessonCategory(value: string): LessonCategory | '' {
  return Object.values(LessonCategory).find((item) => item === value) ?? '';
}
