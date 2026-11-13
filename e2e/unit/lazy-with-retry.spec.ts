import { expect, test } from '@playwright/test';
import { isChunkLoadError, shouldReloadForChunk } from '@/utils/lazyWithRetry';

test.describe('carregamento sob demanda das telas', () => {
  test('reconhece os erros de pedaço perdido depois de um deploy', () => {
    for (const message of [
      'Failed to fetch dynamically imported module: https://site/assets/Stats-abc.js',
      'Importing a module script failed.',
      'error loading dynamically imported module',
      'Loading chunk 42 failed.',
    ])
      expect(isChunkLoadError(new Error(message))).toBe(true);
    const named = new Error('qualquer');
    named.name = 'ChunkLoadError';
    expect(isChunkLoadError(named)).toBe(true);
  });

  test('outros erros seguem para o error boundary', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isChunkLoadError('Failed to fetch dynamically imported module')).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });

  test('recarrega só uma vez por sessão', () => {
    const lost = new Error('Failed to fetch dynamically imported module: x');
    expect(shouldReloadForChunk(lost, false)).toBe(true);
    expect(shouldReloadForChunk(lost, true)).toBe(false);
    expect(shouldReloadForChunk(new Error('outro'), false)).toBe(false);
  });
});
