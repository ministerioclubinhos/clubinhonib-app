import { expect, test } from '@playwright/test';

import {
  ATTENDANCE_WEEK_STATE_LABELS,
  WEEKLY_CLUB_STATUS_LABELS,
} from '@/features/statistics/constants';
import { AttendanceWeekState, WeeklyClubStatus } from '@/features/statistics/types';
import {
  attendanceWeekState,
  sortWeeksAscending,
} from '@/features/statistics/utils/attendance';

const week = (over: Partial<{ hasPagela: boolean; isException: boolean; isPending: boolean }>) => ({
  hasPagela: false,
  isException: false,
  isPending: false,
  ...over,
});

test.describe('attendanceWeekState', () => {
  test('semana futura é pendente, não falta', () => {
    // Regressão: a tela só lia `hasPagela` e desenhava um X vermelho.
    expect(attendanceWeekState(week({ isPending: true }))).toBe(AttendanceWeekState.Pending);
  });

  test('semana de exceção (feriado) não é falta', () => {
    expect(attendanceWeekState(week({ isException: true }))).toBe(AttendanceWeekState.Exception);
  });

  test('exceção vence o futuro: um feriado que ainda vai chegar é exceção', () => {
    expect(attendanceWeekState(week({ isException: true, isPending: true }))).toBe(
      AttendanceWeekState.Exception,
    );
  });

  test('pagela lançada vence exceção e futuro', () => {
    expect(
      attendanceWeekState(week({ hasPagela: true, isException: true, isPending: true })),
    ).toBe(AttendanceWeekState.WithPagela);
  });

  test('só é falta a semana passada, sem exceção e sem pagela', () => {
    expect(attendanceWeekState(week({}))).toBe(AttendanceWeekState.Missing);
  });
});

test.describe('sortWeeksAscending', () => {
  test('põe a série em ordem cronológica, atravessando a virada do ano', () => {
    const newestFirst = [
      { year: 2026, week: 2 },
      { year: 2026, week: 1 },
      { year: 2025, week: 40 },
      { year: 2025, week: 39 },
    ];

    expect(sortWeeksAscending(newestFirst)).toEqual([
      { year: 2025, week: 39 },
      { year: 2025, week: 40 },
      { year: 2026, week: 1 },
      { year: 2026, week: 2 },
    ]);
  });

  test('não altera a lista recebida', () => {
    const input = [
      { year: 2026, week: 9, presenceRate: 80 },
      { year: 2026, week: 8, presenceRate: 60 },
    ];
    const copy = structuredClone(input);

    expect(sortWeeksAscending(input).map((w) => w.presenceRate)).toEqual([60, 80]);
    expect(input).toEqual(copy);
  });
});

test.describe('rótulos de frequência', () => {
  test('todo estado que a API devolve tem rótulo próprio', () => {
    // `pending` e `partial` caíam em "Desconhecido".
    expect(WEEKLY_CLUB_STATUS_LABELS[WeeklyClubStatus.Pending]).toBe('Aguardando o dia do clubinho');
    expect(WEEKLY_CLUB_STATUS_LABELS[WeeklyClubStatus.Partial]).toBe('Parcial');

    for (const status of Object.values(WeeklyClubStatus)) {
      expect(WEEKLY_CLUB_STATUS_LABELS[status], status).toBeTruthy();
    }
    for (const state of Object.values(AttendanceWeekState)) {
      expect(ATTENDANCE_WEEK_STATE_LABELS[state], state).toBeTruthy();
    }
  });

  test('os valores do enum são os do contrato da API', () => {
    expect(Object.values(WeeklyClubStatus).sort()).toEqual(
      ['inactive', 'missing', 'ok', 'out_of_period', 'partial', 'pending', 'vacation'],
    );
  });
});
