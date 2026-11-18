import { expect, test } from '@playwright/test';

import { PeriodShortcut } from '../../src/features/statistics/types';
import { elapsedRange, percentChange, previousRange } from '../../src/features/statistics/utils/comparison';

// Quarta-feira, 18/11/2026.
const TODAY = new Date(2026, 10, 18);

test.describe('statistics/utils/comparison', () => {
  test('semana: a decorrida contra o mesmo trecho da semana anterior', () => {
    expect(elapsedRange(PeriodShortcut.THIS_WEEK, TODAY)).toEqual({ startDate: '2026-11-16', endDate: '2026-11-18' });
    expect(previousRange(PeriodShortcut.THIS_WEEK, TODAY)).toEqual({ startDate: '2026-11-09', endDate: '2026-11-11' });
  });

  test('mês: o mês passado até o mesmo dia', () => {
    expect(previousRange(PeriodShortcut.THIS_MONTH, TODAY)).toEqual({ startDate: '2026-10-01', endDate: '2026-10-18' });
    expect(previousRange(PeriodShortcut.THIS_MONTH, new Date(2026, 2, 31))).toEqual({ startDate: '2026-02-01', endDate: '2026-02-28' });
  });

  test('30 dias: os 30 dias imediatamente antes', () => {
    expect(previousRange(PeriodShortcut.LAST_30_DAYS, TODAY)).toEqual({ startDate: '2026-09-20', endDate: '2026-10-19' });
  });

  test('ano: o ano passado até a mesma data', () => {
    expect(previousRange(PeriodShortcut.THIS_YEAR, TODAY)).toEqual({ startDate: '2025-01-01', endDate: '2025-11-18' });
  });

  test('variação percentual, sem base não inventa número', () => {
    expect(percentChange(15, 10)).toBe(50);
    expect(percentChange(5, 10)).toBe(-50);
    expect(percentChange(5, 0)).toBeUndefined();
  });
});
