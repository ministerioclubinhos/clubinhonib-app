import { expect, test } from '@playwright/test';

import { LessonStageType } from '@/features/ai-lessons/types';
import { parseSseChunk, visualAssets } from '@/features/ai-lessons/utils';

test('preserva evento SSE incompleto para o próximo chunk', () => {
  const parsed = parseSseChunk('data: {"status":"GENERATING"}\n\ndata: {"status"');
  expect(parsed.messages).toEqual(['{"status":"GENERATING"}']);
  expect(parsed.remainder).toBe('data: {"status"');
});

test('lê os assets dos visuais da história na ordem recebida', () => {
  const assets = visualAssets(
    {
      assets: [
        { id: 'scene-01', url: 'https://example.test/scene-01.png' },
        { id: 'scene-02', url: 'https://example.test/scene-02.png' },
      ],
    },
    LessonStageType.LESSON_VISUALS
  );

  expect(assets.map((asset) => asset.id)).toEqual(['scene-01', 'scene-02']);
});
