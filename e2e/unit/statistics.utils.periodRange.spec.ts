import { expect, test } from '@playwright/test';

import { PeriodShortcut } from '@/features/statistics/types';
import { resolveRangeOnPeriodChange } from '@/features/statistics/utils/periodRange';

const previous = { startDate: '2026-11-01', endDate: '2026-11-30' };

test.describe('resolveRangeOnPeriodChange', () => {
  test('"Personalizado" mantém as datas que estavam em uso', () => {
    // Regressão: as duas eram apagadas e `period=custom` saía sozinho.
    expect(resolveRangeOnPeriodChange(PeriodShortcut.CUSTOM, null, previous)).toEqual(previous);
  });

  test('um atalho comum usa o intervalo calculado para ele', () => {
    const shortcut = { startDate: '2026-11-05', endDate: '2026-11-11' };

    expect(
      resolveRangeOnPeriodChange(PeriodShortcut.LAST_7_DAYS, shortcut, previous),
    ).toEqual(shortcut);
  });

  test('sem datas anteriores, "Personalizado" segue sem datas', () => {
    expect(resolveRangeOnPeriodChange(PeriodShortcut.CUSTOM, null, {})).toEqual({
      startDate: undefined,
      endDate: undefined,
    });
  });

  test('devolve só as duas datas, sem carregar o resto do filtro', () => {
    const filters = { ...previous, clubId: 'club-1', period: PeriodShortcut.THIS_MONTH };

    expect(
      Object.keys(resolveRangeOnPeriodChange(PeriodShortcut.CUSTOM, null, filters)).sort(),
    ).toEqual(['endDate', 'startDate']);
  });
});
