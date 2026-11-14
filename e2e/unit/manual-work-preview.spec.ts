import { expect, test } from '@playwright/test';
import { manualWorkPreviewData } from '@/features/ai-lessons/manual-work-preview/utils';
import { MANUAL_WORK_COPY_IDS } from '@/features/ai-lessons/manual-work-preview/constants';

test('prévia usa a arte e o versículo da versão atual para as duas cópias', () => {
  expect(MANUAL_WORK_COPY_IDS).toEqual(['upper', 'lower']);
  expect(
    manualWorkPreviewData({
      printableAssets: [{ url: 'https://example.test/current.png' }],
      assets: [{ url: 'https://example.test/old.png' }],
      verseText: 'Texto aprovado',
      verseReference: 'João 11:25',
    })
  ).toEqual({
    imageUrl: 'https://example.test/current.png',
    verse: '“Texto aprovado” (João 11:25 - NVI)',
  });
});
test('prévia sem arte não inventa desenho nem usa imagem de outra etapa', () => {
  expect(manualWorkPreviewData({ assets: [{ url: 'old.png' }] }).imageUrl).toBe('');
});
