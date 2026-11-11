import { expect, test } from '@playwright/test';

import { percentChange, weightedAverageRate } from '@/features/statistics/utils/rates';

test.describe('weightedAverageRate', () => {
  test('pondera pelo total de cada grupo', () => {
    // Regressão: a média simples das linhas dava 70%.
    const byGender = [
      { gender: 'M', total: 10, presenceRate: 90 },
      { gender: 'F', total: 90, presenceRate: 50 },
    ];

    expect(weightedAverageRate(byGender, (g) => g.presenceRate)).toBeCloseTo(54, 10);
  });

  test('grupos do mesmo tamanho dão a média simples', () => {
    const rows = [
      { total: 20, rate: 40 },
      { total: 20, rate: 60 },
    ];

    expect(weightedAverageRate(rows, (r) => r.rate)).toBe(50);
  });

  test('grupo sem pagela não puxa a taxa para baixo', () => {
    const rows = [
      { total: 30, rate: 80 },
      { total: 0, rate: 0 },
    ];

    expect(weightedAverageRate(rows, (r) => r.rate)).toBe(80);
  });

  test('sem pagela nenhuma devolve null, e não 0%', () => {
    expect(weightedAverageRate([], () => 0)).toBeNull();
    expect(weightedAverageRate([{ total: 0, rate: 0 }], (r) => r.rate)).toBeNull();
  });

  test('ignora linhas com número inválido', () => {
    const rows = [
      { total: 10, rate: 70 },
      { total: Number.NaN, rate: 100 },
      { total: 10, rate: Number.NaN },
    ];

    expect(weightedAverageRate(rows, (r) => r.rate)).toBe(70);
  });
});

test.describe('percentChange', () => {
  test('calcula a variação sobre o valor anterior', () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(60, 100)).toBe(-40);
  });

  test('sem base de comparação não há variação', () => {
    // Regressão: 0 crianças cadastradas dividia por zero no cartão.
    expect(percentChange(0, 0)).toBeNull();
    expect(percentChange(5, 0)).toBeNull();
    expect(percentChange(5, undefined)).toBeNull();
    expect(percentChange(5, null)).toBeNull();
    expect(percentChange(Number.NaN, 10)).toBeNull();
  });
});
