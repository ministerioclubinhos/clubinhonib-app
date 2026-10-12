import { LessonSortField, LessonSortOrder, LessonStatus } from './types';
export const parseSseChunk = (text: string): ParsedSseChunk => {
  const events = text.replace(/\r\n/g, '\n').split('\n\n');
  const remainder = events.pop() ?? '';
  const messages = events
    .map((item) =>
      item
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('')
    )
    .filter(Boolean);
  return { messages, remainder };
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
import {
  LessonStageType,
  type VisualAsset,
  type ParsedSseChunk,
  type GetLessonDraftsParams,
} from './types';

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
