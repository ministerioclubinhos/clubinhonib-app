import { expect, test } from '@playwright/test';

import { PeriodShortcut, type ClubStat, type WeeklyPagelaStats } from '@/features/statistics/types';
import { RateTone, StatisticsTab } from '@/features/statistics/constants';
import type { CoordinatorResponse } from '@/features/coordinators/types';
import {
  averageClubsPerCoordinator,
  buildCoordinatorRows,
  formatDecimal,
  formatPercent,
  outOfTen,
  parsePlainPeriod,
  parseStatisticsTab,
  rateTone,
  toWeekColumns,
} from '@/features/statistics/utils/plain';

const club = (id: string, active: number, pagelas: number, rate: number): ClubStat =>
  ({
    clubId: id,
    children: { active },
    performance: { totalPagelas: pagelas, presenceRate: rate },
  }) as unknown as ClubStat;

const coordinator = (id: string, name: string, clubIds: string[], active = true): CoordinatorResponse =>
  ({ id, active, user: { name }, clubs: clubIds.map((clubId) => ({ id: clubId })) }) as unknown as CoordinatorResponse;

test.describe('formatPercent / outOfTen / formatDecimal', () => {
  test('arredonda e devolve null sem dado', () => {
    expect(formatPercent(84.4)).toBe('84%');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(null)).toBeNull();
    expect(formatPercent(Number.NaN)).toBeNull();
    expect(outOfTen(84.4)).toBe(8);
    expect(outOfTen(100)).toBe(10);
    expect(outOfTen(undefined)).toBeNull();
    expect(formatDecimal(7)).toBe('7');
    expect(formatDecimal(7.46)).toBe('7,5');
    expect(formatDecimal(undefined)).toBeNull();
  });
});

test.describe('rateTone', () => {
  test('separa o que vai bem, o que pode melhorar e o que precisa de atenção', () => {
    expect(rateTone(75)).toBe(RateTone.Good);
    expect(rateTone(74.9)).toBe(RateTone.Medium);
    expect(rateTone(50)).toBe(RateTone.Medium);
    expect(rateTone(49.9)).toBe(RateTone.Low);
    expect(rateTone(null)).toBe(RateTone.Low);
  });
});

test.describe('toWeekColumns', () => {
  const week = (year: number, number: number, present: number): WeeklyPagelaStats =>
    ({ year, week: number, presentCount: present, totalPagelas: present + 2 }) as WeeklyPagelaStats;

  test('ordena da mais antiga para a mais nova, vira o ano e corta nas últimas', () => {
    const columns = toWeekColumns([week(2026, 2, 5), week(2025, 52, 3), week(2026, 1, 4)], 2);
    expect(columns.map((column) => column.label)).toEqual(['S1', 'S2']);
    expect(columns.map((column) => column.value)).toEqual([4, 5]);
    expect(toWeekColumns(undefined)).toEqual([]);
  });
});

test.describe('buildCoordinatorRows', () => {
  test('soma as crianças, pondera a presença e põe quem não tem clubinho por último', () => {
    const rows = buildCoordinatorRows(
      [
        coordinator('c1', 'Zélia', []),
        coordinator('c2', 'Ana', ['a', 'b']),
        coordinator('c3', 'Bia', ['c']),
      ],
      [club('a', 10, 100, 90), club('b', 5, 300, 50), club('c', 8, 100, 95)],
    );

    expect(rows.map((row) => row.name)).toEqual(['Bia', 'Ana', 'Zélia']);
    const ana = rows.find((row) => row.id === 'c2');
    expect(ana?.childrenCount).toBe(15);
    expect(ana?.clubsCount).toBe(2);
    // (90*100 + 50*300) / 400 = 60: o clubinho grande pesa mais que a média simples (70).
    expect(ana?.presence).toBeCloseTo(60);
    expect(rows.at(-1)?.presence).toBeNull();
  });

  test('média de clubinhos só entre quem cuida de algum', () => {
    const rows = buildCoordinatorRows(
      [coordinator('c1', 'A', []), coordinator('c2', 'B', ['a', 'b']), coordinator('c3', 'C', ['c'])],
      [],
    );
    expect(averageClubsPerCoordinator(rows)).toBe(1.5);
    expect(averageClubsPerCoordinator([])).toBeNull();
  });
});

test.describe('parseStatisticsTab / parsePlainPeriod', () => {
  test('valor da URL desconhecido cai no padrão', () => {
    expect(parseStatisticsTab('clubinhos')).toBe(StatisticsTab.Clubs);
    expect(parseStatisticsTab('xyz')).toBe(StatisticsTab.Summary);
    expect(parseStatisticsTab(null)).toBe(StatisticsTab.Summary);
    expect(parsePlainPeriod('this_month')).toBe(PeriodShortcut.THIS_MONTH);
    expect(parsePlainPeriod('today')).toBe(PeriodShortcut.THIS_YEAR);
    expect(parsePlainPeriod(undefined)).toBe(PeriodShortcut.THIS_YEAR);
  });
});
