import { LESSON_GAME_SUMMARY_ASSET_ID } from './constants';
import { generationSignature } from './generation.utils';
import {
  LessonCategory,
  LessonSortField,
  LessonSortOrder,
  LessonStageType,
  LessonStatus,
  StageAssetIssue,
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

  return { messages, remainder, heartbeats };
};

export const objectValue = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** True when the fun game carries the single compiled image instead of one image per step. */
export const isGameSummaryAssets = (assets: readonly VisualAsset[]): boolean =>
  assets.length === 1 && assets[0].id === LESSON_GAME_SUMMARY_ASSET_ID;

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

const OPTIONAL_ASSET_KEYS: Partial<Record<LessonStageType, 'assets' | 'printableAssets'>> = {
  [LessonStageType.STANDARD_GAME]: 'assets',
  [LessonStageType.VERSE_FIXATION]: 'assets',
  [LessonStageType.MEDITATION_YOUNGER]: 'printableAssets',
  [LessonStageType.MEDITATION_OLDER]: 'printableAssets',
};

/** The single rule for "this item has all its required art", used by gates and viewers alike. */
export function hasCompleteStageAssets(
  stage: LessonStageType,
  structuredData: Record<string, unknown> | null | undefined
): boolean {
  if (stage === LessonStageType.LESSON) return true;
  const data = structuredData ?? {};
  const optionalKey = OPTIONAL_ASSET_KEYS[stage];
  // Legacy text-first items saved before art existed carry no asset list at all.
  if (optionalKey && !(optionalKey in data)) return true;
  const assets = visualAssets(data, stage);
  return assets.length > 0 && assets.every((asset) => Boolean(asset.url?.trim()));
}

export function stageAssetUrls(
  stage: LessonStageType,
  structuredData: Record<string, unknown> | null | undefined
): string[] {
  return visualAssets(structuredData, stage)
    .map((asset) => asset.url?.trim() ?? '')
    .filter(Boolean);
}

export function resolveStageAssetIssue(
  stage: LessonStageType,
  structuredData: Record<string, unknown> | null | undefined,
  brokenUrls: readonly string[] = []
): StageAssetIssue {
  if (!hasCompleteStageAssets(stage, structuredData)) return StageAssetIssue.MISSING;
  const urls = stageAssetUrls(stage, structuredData);
  return urls.some((url) => brokenUrls.includes(url))
    ? StageAssetIssue.BROKEN
    : StageAssetIssue.NONE;
}

export function formatElapsedTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function parseStageType(
  value: string | null | undefined,
  allowed: readonly LessonStageType[]
): LessonStageType | null {
  return allowed.find((item) => item === value) ?? null;
}

export function computeLessonSnapshotSignature(lesson: Lesson): string {
  const stagesPart = (lesson.stages ?? [])
    .slice()
    .sort((a, b) => a.type.localeCompare(b.type))
    .map(
      (stage) =>
        `${stage.type}:${stage.status}:${stage.lockVersion}:${stage.currentVersionId ?? ''}:${stage.failureCode ?? ''}:${stage.failureMessage ?? ''}`
    )
    .join('|');
  const commentsCount = lesson.comments?.length ?? 0;
  return `${lesson.id}:${lesson.status}:${lesson.weekMaterialId ?? ''}:${lesson.publicationFailureMessage ?? ''}:${commentsCount}:${stagesPart}:${generationSignature(lesson.generation)}`;
}

export function isLessonSnapshotNewerOrEqual(previous: Lesson | undefined, next: Lesson): boolean {
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
    return lesson.weekNumber
      ? `Material Especial · Semana ${lesson.weekNumber}`
      : 'Material Especial';
  }
  return lesson.weekNumber ? `Semana ${lesson.weekNumber}` : 'Material Semanal';
}

export function parseLessonCategory(value: string): LessonCategory | '' {
  return Object.values(LessonCategory).find((item) => item === value) ?? '';
}
