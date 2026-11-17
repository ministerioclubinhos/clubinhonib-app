import { expect, test } from '@playwright/test';

import { WeeklyClubStatus, type ClubStat, type WeeklyAttendanceDto } from '@/features/statistics/types';
import {
  clubsWithoutChildren,
  clubsWithoutCoordinator,
  clubsWithoutTeacher,
  daysSince,
  formatDaysAgo,
  lowPresenceClubs,
  previousWeek,
  staleClubs,
  weekDelta,
  weeklyPagelaStatus,
} from '@/features/statistics/utils/alerts';

const NOW = new Date('2026-11-16T12:00:00Z');

const club = (
  id: string,
  over: { active?: number; pagelas?: number; rate?: number; last?: string | null; coordinator?: boolean } = {},
): ClubStat =>
  ({
    clubId: id,
    clubNumber: Number(id.replace(/\D/g, '')) || 0,
    coordinator: over.coordinator === false ? null : { id: 'k', name: 'K' },
    children: { active: over.active ?? 5 },
    performance: { totalPagelas: over.pagelas ?? 10, presenceRate: over.rate ?? 80 },
    lastActivity: over.last === undefined ? { date: '2026-11-14T00:00:00Z', type: 'pagela' } : over.last ? { date: over.last, type: 'pagela' } : null,
  }) as unknown as ClubStat;

test.describe('daysSince / formatDaysAgo / previousWeek', () => {
  test('conta dias inteiros e escreve em palavras', () => {
    expect(daysSince('2026-11-16T00:00:00Z', NOW)).toBe(0);
    expect(daysSince('2026-11-15T00:00:00Z', NOW)).toBe(1);
    expect(daysSince('2026-11-06T12:00:00Z', NOW)).toBe(10);
    expect(daysSince(null, NOW)).toBeNull();
    expect(daysSince('lixo', NOW)).toBeNull();
    expect(formatDaysAgo(0)).toBe('hoje');
    expect(formatDaysAgo(1)).toBe('ontem');
    expect(formatDaysAgo(5)).toBe('há 5 dias');
    expect(formatDaysAgo(null)).toBe('nunca');
    expect(previousWeek(2026, 42)).toEqual({ year: 2026, week: 41 });
    expect(previousWeek(2026, 1)).toBeNull();
  });
});

test.describe('weeklyPagelaStatus', () => {
  const weekly = (statuses: WeeklyClubStatus[]): WeeklyAttendanceDto =>
    ({ clubs: statuses.map((status, index) => ({ clubId: `c${index}`, clubNumber: index, status })) }) as unknown as WeeklyAttendanceDto;

  test('só conta quem era esperado: pendente, férias e inativo não são falta', () => {
    const result = weeklyPagelaStatus(
      weekly([
        WeeklyClubStatus.Ok,
        WeeklyClubStatus.Ok,
        WeeklyClubStatus.Missing,
        WeeklyClubStatus.Partial,
        WeeklyClubStatus.Pending,
        WeeklyClubStatus.Vacation,
        WeeklyClubStatus.Inactive,
        WeeklyClubStatus.OutOfPeriod,
      ]),
    );
    expect(result.launched).toBe(2);
    expect(result.expected).toBe(4);
    expect(result.missing).toHaveLength(1);
    expect(result.partial).toHaveLength(1);
  });

  test('sem dado, tudo zerado', () => {
    expect(weeklyPagelaStatus(undefined)).toEqual({ launched: 0, expected: 0, missing: [], partial: [] });
  });
});

test.describe('listas de clubinhos', () => {
  test('presença baixa: ignora quem não tem pagela e ordena do pior para o melhor', () => {
    const low = lowPresenceClubs([club('c1', { rate: 55 }), club('c2', { rate: 20 }), club('c3', { rate: 0, pagelas: 0 }), club('c4', { rate: 90 })]);
    expect(low.map((item) => item.clubId)).toEqual(['c2', 'c1']);
  });

  test('parado: só quem tem crianças; sem atividade conta como parado', () => {
    const stale = staleClubs(
      [
        club('c1', { last: '2026-11-14T00:00:00Z' }),
        club('c2', { last: '2026-11-01T00:00:00Z' }),
        club('c3', { last: null }),
        club('c4', { last: null, active: 0 }),
      ],
      NOW,
    );
    expect(stale.map((item) => item.clubId)).toEqual(['c2', 'c3']);
  });

  test('sem crianças, sem coordenador e sem professor', () => {
    const list = [club('c1', { active: 0 }), club('c2', { coordinator: false }), club('c3')];
    expect(clubsWithoutChildren(list).map((item) => item.clubId)).toEqual(['c1']);
    expect(clubsWithoutCoordinator(list).map((item) => item.clubId)).toEqual(['c2']);
    expect(clubsWithoutTeacher(list, [{ clubId: 'c3', count: 2 }, { clubId: 'c2', count: 0 }]).map((item) => item.clubId)).toEqual(['c1', 'c2']);
  });
});

test.describe('weekDelta', () => {
  test('diferença entre as duas últimas semanas; null com menos de duas', () => {
    expect(weekDelta([{ value: 10 }, { value: 14 }])).toBe(4);
    expect(weekDelta([{ value: 14 }, { value: 10 }])).toBe(-4);
    expect(weekDelta([{ value: 3 }])).toBeNull();
  });
});
