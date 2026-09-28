export interface ParsedSseChunk {
  messages: string[];
  remainder: string;
}

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
  value: Record<string, unknown> | undefined,
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
import { LessonStageType, VisualAsset } from './types';
