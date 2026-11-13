import { expect, test } from '@playwright/test';
import { LESSON_GAME_SUMMARY_ASSET_ID } from '@/features/ai-lessons/constants';
import { LessonStageType } from '@/features/ai-lessons/types';
import { isGameSummaryAssets, visualAssets } from '@/features/ai-lessons/utils';

test.describe('brincadeira divertida com imagem de compilado', () => {
  test('reconhece a imagem única que compila a brincadeira', () => {
    const assets = visualAssets(
      { assets: [{ id: LESSON_GAME_SUMMARY_ASSET_ID, url: 'https://exemplo/compilado.png' }] },
      LessonStageType.STANDARD_GAME
    );
    expect(isGameSummaryAssets(assets)).toBe(true);
  });

  test('mantém as brincadeiras antigas como passo a passo visual', () => {
    const assets = visualAssets(
      {
        assets: [
          { id: 'instrucao-01', stepNumber: 1, instruction: 'Forme uma roda.' },
          { id: 'instrucao-02', stepNumber: 2, instruction: 'Passe a bola.' },
        ],
      },
      LessonStageType.STANDARD_GAME
    );
    expect(isGameSummaryAssets(assets)).toBe(false);
    expect(isGameSummaryAssets([{ id: 'instrucao-01' }])).toBe(false);
    expect(isGameSummaryAssets([])).toBe(false);
  });
});
