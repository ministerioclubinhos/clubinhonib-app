import { expect, test } from '@playwright/test';

import { MediaType } from '@/store/slices/types';
import {
  countMedias,
  mediasOfType,
  pageSummaryLabel,
} from '@/pages/PageView/IdeasMaterialViewpage/utils';

/**
 * As contas da página pública de ideias.
 *
 * O resumo e o agrupamento por tipo eram feitos no meio do JSX, com o número
 * repetido entre parênteses e num chip ao lado — sem nunca dizer de quantas
 * seções ou materiais se tratava.
 */
const media = (mediaType: MediaType, title: string) => ({ mediaType, title });

test.describe('página de ideias: contas da tela', () => {
  test('mediasOfType separa por tipo mantendo a ordem da API', () => {
    const medias = [
      media(MediaType.VIDEO, 'v1'),
      media(MediaType.DOCUMENT, 'd1'),
      media(MediaType.VIDEO, 'v2'),
    ];

    expect(mediasOfType(medias, MediaType.VIDEO).map((item) => item.title)).toEqual(['v1', 'v2']);
    expect(mediasOfType(medias, MediaType.IMAGE)).toEqual([]);
  });

  test('countMedias soma as mídias de todas as seções', () => {
    const sections = [
      { medias: [media(MediaType.VIDEO, 'v1'), media(MediaType.IMAGE, 'i1')] },
      { medias: [media(MediaType.DOCUMENT, 'd1')] },
      { medias: [] },
    ];

    expect(countMedias(sections)).toBe(3);
    expect(countMedias([])).toBe(0);
  });

  test('pageSummaryLabel concorda o singular e o plural', () => {
    expect(pageSummaryLabel(1, 1)).toBe('1 seção · 1 material');
    expect(pageSummaryLabel(4, 9)).toBe('4 seções · 9 materiais');
    expect(pageSummaryLabel(0, 0)).toBe('0 seções · 0 materiais');
  });
});
