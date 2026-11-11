import { expect, test, type Page, type Route } from '@playwright/test';

import { API_URL } from '../support/env';

/**
 * Frequência do painel de estatísticas (`/adm/estatisticas`, aba Frequência).
 *
 * As respostas de `/statistics/attendance/*` são simuladas: os estados que
 * estes testes travam (semana futura, feriado, clubinho parcial, ano sem
 * período letivo) dependem do calendário e do que está lançado no banco, e a
 * tela precisa mostrá-los do mesmo jeito em qualquer dia.
 *
 * Regressões cobertas:
 *  - a linha do tempo desenhava semana futura e feriado como falta (X vermelho);
 *  - a grade semanal mostrava `pending` e `partial` como "Desconhecido";
 *  - sem semana/clubinho esperado, a taxa aparecia como 0%.
 */

const CLUB_ID = 'club-e2e-1';
const YEAR = 2026;

const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

const pagination = (total: number, limit = 20) => ({
  page: 1,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: false,
  hasPreviousPage: false,
});

const weeklyClub = (clubNumber: number, status: string, totalPagelas?: number) => ({
  clubId: `club-${status}`,
  clubNumber,
  weekday: 'saturday',
  hasPagela: totalPagelas !== undefined,
  ...(totalPagelas !== undefined ? { totalPagelas } : {}),
  expectedChildren: 10,
  expectedDate: '2026-04-11',
  status,
});

const weeklyResponse = (clubs: ReturnType<typeof weeklyClub>[], summary: Record<string, number>) => ({
  year: YEAR,
  week: 10,
  weekRange: { start: '2026-04-06', end: '2026-04-12' },
  clubs,
  pagination: pagination(clubs.length),
  summary,
});

const ALL_STATUSES = weeklyResponse(
  [
    weeklyClub(101, 'ok', 10),
    weeklyClub(102, 'partial', 4),
    weeklyClub(103, 'missing'),
    weeklyClub(104, 'pending'),
    weeklyClub(105, 'vacation'),
    weeklyClub(106, 'inactive'),
  ],
  { totalClubs: 6, clubsActive: 3, clubsWithPagela: 2, clubsMissing: 1, attendanceRate: 66.7 },
);

const ONLY_PENDING = weeklyResponse(
  [weeklyClub(104, 'pending'), weeklyClub(107, 'pending')],
  { totalClubs: 2, clubsActive: 0, clubsWithPagela: 0, clubsMissing: 0, attendanceRate: 0 },
);

const timelineWeek = (
  week: number,
  flags: { hasPagela?: boolean; isException?: boolean; isPending?: boolean },
) => ({
  year: YEAR,
  week,
  date: `2026-03-${String(week * 7).padStart(2, '0')}`,
  hasPagela: false,
  isException: false,
  isPending: false,
  expectedChildren: 10,
  ...flags,
  ...(flags.hasPagela ? { totalPagelas: 8, presenceCount: 7 } : {}),
});

const clubAttendance = (over: {
  timeline: ReturnType<typeof timelineWeek>[];
  hasAcademicPeriod: boolean;
  weeksExpected: number;
  weeksWithPagela: number;
  weeksMissing: number;
  attendanceRate: number;
  exceptionsCount: number;
}) => ({
  clubId: CLUB_ID,
  clubNumber: 101,
  weekday: 'saturday',
  period: {
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    totalWeeks: over.timeline.length,
    activeWeeks: over.weeksExpected,
    exceptionsCount: over.exceptionsCount,
    hasAcademicPeriod: over.hasAcademicPeriod,
  },
  attendance: {
    weeksWithPagela: over.weeksWithPagela,
    weeksExpected: over.weeksExpected,
    weeksMissing: over.weeksMissing,
    attendanceRate: over.attendanceRate,
    consecutiveWeeksPresent: 0,
    consecutiveWeeksMissing: 0,
  },
  alerts: [],
  timeline: over.timeline,
  timelinePagination: pagination(over.timeline.length),
  missingWeeks: [],
  missingWeeksPagination: pagination(0),
});

const TIMELINE_MIXED = clubAttendance({
  timeline: [
    timelineWeek(1, { hasPagela: true }),
    timelineWeek(2, {}),
    timelineWeek(3, { isException: true }),
    timelineWeek(4, { isPending: true }),
  ],
  hasAcademicPeriod: true,
  weeksExpected: 2,
  weeksWithPagela: 1,
  weeksMissing: 1,
  attendanceRate: 50,
  exceptionsCount: 1,
});

const TIMELINE_NO_PERIOD = clubAttendance({
  timeline: [],
  hasAcademicPeriod: false,
  weeksExpected: 0,
  weeksWithPagela: 0,
  weeksMissing: 0,
  attendanceRate: 0,
  exceptionsCount: 0,
});

const CLUBS_LIST = {
  filters: { applied: {}, summary: '' },
  summary: {
    totalClubs: 1,
    filteredClubs: 1,
    totalChildren: 10,
    totalTeachers: 1,
    avgPerformanceScore: 0,
    avgPresenceRate: 0,
    totalDecisions: 0,
  },
  distribution: { byCity: [], byWeekday: [], byCoordinator: [], byPerformance: [] },
  clubs: [
    {
      clubId: CLUB_ID,
      clubNumber: 101,
      weekday: 'saturday',
      time: '15:00',
      address: { city: 'Campinas', state: 'SP', district: 'Centro', street: 'Rua A' },
      coordinator: null,
      children: { total: 10, active: 10, byGender: { M: 5, F: 5 }, withDecisions: 0 },
      teachers: { total: 1, active: 1, list: [] },
      performance: { totalPagelas: 0, presenceRate: 0, meditationRate: 0, performanceScore: 0, totalDecisions: 0 },
      lastActivity: null,
      rank: 1,
    },
  ],
  pagination: { page: 1, limit: 100, total: 1, totalPages: 1, hasNext: false, hasPrevious: false },
};

/** Simula o que a aba Frequência lê; o resto da tela usa a API de verdade. */
async function mockAttendance(page: Page, weekly: unknown, club: unknown) {
  await page.route(`${API_URL}/club-control/current-week**`, (route) =>
    json(route, {
      academicYear: YEAR,
      academicWeek: 10,
      isWithinPeriod: true,
      periodStartDate: '2026-03-01',
      periodEndDate: '2026-11-30',
    }),
  );
  // 2021 está fora da janela "ano atual e os dois anteriores" que a linha do
  // tempo usava: só aparece no seletor se ele ler os períodos cadastrados.
  await page.route(`${API_URL}/club-control/periods**`, (route) =>
    json(route, { items: [{ id: 'p-2026', year: YEAR }, { id: 'p-2021', year: 2021 }], total: 2 }),
  );
  await page.route(`${API_URL}/statistics/clubs**`, (route) => json(route, CLUBS_LIST));
  await page.route(`${API_URL}/statistics/attendance/week**`, (route) => json(route, weekly));
  await page.route(`${API_URL}/statistics/attendance/club/**`, (route) => json(route, club));
}

async function openFrequency(page: Page, subTab: 'Semana' | 'Timeline') {
  await page.goto('/adm/estatisticas');
  await page
    .getByTestId('statistics-dashboard-navigation-tabs')
    .getByRole('tab', { name: 'Frequência' })
    .click();

  const frequency = page.getByTestId('statistics-tabs-frequency-tab');
  await expect(frequency).toBeVisible();
  if (subTab === 'Timeline') {
    await frequency.getByRole('tab', { name: /Timeline/ }).click();
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );

test.describe('Estatísticas: grade semanal de frequência', () => {
  test('cada situação que a API devolve tem rótulo próprio, sem "Desconhecido"', async ({ page }) => {
    await mockAttendance(page, ALL_STATUSES, TIMELINE_MIXED);
    await openFrequency(page, 'Semana');

    const grid = page.getByTestId('statistics-weekly-attendance-grid');
    const chips = grid.getByTestId('statistics-weekly-attendance-status');
    await expect(chips).toHaveCount(6);

    const esperado: Record<string, string> = {
      ok: 'OK',
      partial: 'Parcial',
      missing: 'Faltou',
      pending: 'Aguardando o dia do clubinho',
      vacation: 'Férias',
      inactive: 'Inativo',
    };
    for (const [status, label] of Object.entries(esperado)) {
      await expect(grid.locator(`[data-status="${status}"]`)).toHaveText(label);
    }

    await expect(grid.getByText('Desconhecido')).toHaveCount(0);
    await expect(grid.getByTestId('statistics-weekly-attendance-rate')).toHaveText('66.7%');
  });

  test('sem clubinho esperado ainda, a taxa não aparece como 0%', async ({ page }) => {
    await mockAttendance(page, ONLY_PENDING, TIMELINE_MIXED);
    await openFrequency(page, 'Semana');

    const grid = page.getByTestId('statistics-weekly-attendance-grid');
    await expect(grid.getByTestId('statistics-weekly-attendance-status')).toHaveCount(2);
    await expect(grid.getByTestId('statistics-weekly-attendance-rate')).toHaveText('—');
    await expect(grid.getByTestId('statistics-weekly-attendance-empty')).toBeVisible();
    await expect(grid.getByText('0.0%')).toHaveCount(0);
  });
});

test.describe('Estatísticas: linha do tempo do clubinho', () => {
  test('semana futura e feriado não aparecem como falta', async ({ page }) => {
    await mockAttendance(page, ALL_STATUSES, TIMELINE_MIXED);
    await openFrequency(page, 'Timeline');

    const timeline = page.getByTestId('statistics-club-attendance-timeline');
    const weeks = timeline.getByTestId('statistics-timeline-week');
    await expect(weeks).toHaveCount(4);

    await expect(timeline.locator('[data-week="1"]')).toHaveAttribute('data-state', 'with_pagela');
    await expect(timeline.locator('[data-week="2"]')).toHaveAttribute('data-state', 'missing');
    await expect(timeline.locator('[data-week="3"]')).toHaveAttribute('data-state', 'exception');
    await expect(timeline.locator('[data-week="4"]')).toHaveAttribute('data-state', 'pending');
    // Só a semana 2 é falta de verdade.
    await expect(timeline.locator('[data-state="missing"]')).toHaveCount(1);

    // O estado também é dito em texto, não só em cor.
    await expect(timeline.locator('[data-week="3"]')).toHaveAttribute('aria-label', /Exceção\/feriado/);
    await expect(timeline.locator('[data-week="4"]')).toHaveAttribute('aria-label', /Pendente/);

    const legend = timeline.getByTestId('statistics-timeline-legend');
    for (const label of ['Com pagela', 'Sem pagela', 'Pendente', 'Exceção/feriado']) {
      await expect(legend.getByText(label, { exact: true })).toBeVisible();
    }

    await expect(timeline.getByTestId('statistics-timeline-attendance-rate')).toHaveText('50.0%');
  });

  test('o seletor de ano lista os períodos letivos cadastrados', async ({ page }) => {
    await mockAttendance(page, ALL_STATUSES, TIMELINE_MIXED);
    await openFrequency(page, 'Timeline');

    const timeline = page.getByTestId('statistics-club-attendance-timeline');
    await expect(timeline.getByTestId('statistics-timeline-week')).toHaveCount(4);

    await timeline.getByLabel('Ano').click();
    await expect(page.getByRole('option', { name: '2021', exact: true })).toBeVisible();
  });

  test('ano sem período letivo mostra o motivo em vez de 0%', async ({ page }) => {
    await mockAttendance(page, ALL_STATUSES, TIMELINE_NO_PERIOD);
    await openFrequency(page, 'Timeline');

    const timeline = page.getByTestId('statistics-club-attendance-timeline');
    await expect(timeline.getByTestId('statistics-timeline-empty')).toContainText(
      'Não há período letivo cadastrado',
    );
    await expect(timeline.getByTestId('statistics-timeline-attendance-rate')).toHaveText('—');
    await expect(timeline.getByText('Nenhuma Semana Faltante')).toHaveCount(0);
  });
});

test.describe('Estatísticas: frequência no celular (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('a grade e a linha do tempo cabem sem rolar a página para o lado', async ({ page }) => {
    await mockAttendance(page, ALL_STATUSES, TIMELINE_MIXED);
    await openFrequency(page, 'Semana');

    const grid = page.getByTestId('statistics-weekly-attendance-grid');
    const pending = grid.locator('[data-status="pending"]');
    await pending.scrollIntoViewIfNeeded();
    await expect(pending).toBeVisible();
    // O rótulo mais longo cabe inteiro no cartão.
    const chipBox = await pending.boundingBox();
    expect(chipBox && chipBox.x >= 0 && chipBox.x + chipBox.width <= 360).toBe(true);
    expect(await hasHorizontalScroll(page)).toBe(false);

    await page
      .getByTestId('statistics-tabs-frequency-tab')
      .getByRole('tab', { name: /Timeline/ })
      .click();
    const timeline = page.getByTestId('statistics-club-attendance-timeline');
    await expect(timeline.getByTestId('statistics-timeline-week')).toHaveCount(4);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
