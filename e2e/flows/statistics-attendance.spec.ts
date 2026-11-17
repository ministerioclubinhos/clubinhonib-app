import { expect, Page, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import {
  launchWindow,
  pagelaBody,
  removeChild,
  seedChild,
  type LaunchWindow,
  type SeededChild,
} from '../support/children';

/**
 * Estatísticas de frequência e as regras de cálculo, contra a API real.
 *
 * Nada é simulado: os números vêm do banco local. Os cenários que precisam de
 * um dado específico criam uma criança num clubinho ativo, medem a diferença
 * que ela causa e a apagam no fim — a exclusão leva as pagelas junto, e os
 * totais voltam ao que eram.
 */
test.describe.configure({ mode: 'serial' });

interface WeeklyAttendance {
  clubs: { clubId: string; clubNumber: number; status: string }[];
  summary: { totalClubs: number; clubsActive: number; clubsWithPagela: number; clubsMissing: number; attendanceRate: number };
}

interface PagelasStats {
  overall: { totalPagelas: number; totalChildren: number; expectedPresences: number; averagePresenceRate: number };
}

interface ClubTimeline {
  period?: { hasAcademicPeriod?: boolean };
  attendance: { weeksExpected: number; weeksWithPagela: number; weeksMissing: number; attendanceRate: number };
  timeline: { week: number; hasPagela: boolean; isPending?: boolean; isException?: boolean }[];
}

const KNOWN_STATUSES = ['ok', 'partial', 'missing', 'pending', 'vacation', 'inactive', 'out_of_period'];
const KNOWN_LABELS = ['Lançou', 'Lançou em parte', 'Não lançou', 'Ainda não é o dia', 'De férias', 'Inativo', 'Fora do ano letivo'];

let api: ApiClient;
let window: LaunchWindow;
let weekly: WeeklyAttendance;
let child: SeededChild | undefined;

test.beforeAll(async () => {
  api = await ApiClient.login();
  window = await launchWindow(api);
  test.skip(!window.open, `período letivo fechado hoje (${window.reason})`);
  weekly = await api.get<WeeklyAttendance>('/statistics/attendance/week', {
    year: window.year ?? 0,
    week: window.currentWeek ?? 0,
    limit: 50,
  });
});

test.afterEach(async () => {
  await removeChild(api, child);
  child = undefined;
});

test.afterAll(async () => {
  await api.dispose();
});

const yearStats = (clubId: string) =>
  api.get<PagelasStats>('/statistics/pagelas', { year: window.year ?? 0, clubId });

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

test.describe('Estatísticas: regras de cálculo na API', () => {
  test('a presença é presentes ÷ esperadas: criança sem pagela aumenta o denominador', async () => {
    const club = weekly.clubs[0];
    test.skip(!club, 'nenhum clubinho ativo neste banco');

    const before = await yearStats(club.clubId);
    child = await seedChild(api, { clubId: club.clubId, joinedAt: window.startDate });
    const after = await yearStats(club.clubId);

    // Ninguém lançou pagela para ela: as pagelas são as mesmas, as esperadas não.
    expect(after.overall.totalPagelas).toBe(before.overall.totalPagelas);
    expect(after.overall.expectedPresences).toBeGreaterThan(before.overall.expectedPresences);
    expect(after.overall.averagePresenceRate).toBeLessThanOrEqual(before.overall.averagePresenceRate);
    expect(after.overall.averagePresenceRate).toBeGreaterThanOrEqual(0);
    expect(after.overall.averagePresenceRate).toBeLessThanOrEqual(100);
  });

  test('desativar a criança não apaga as pagelas dela do histórico', async () => {
    const club = weekly.clubs[0];
    test.skip(!club, 'nenhum clubinho ativo neste banco');

    child = await seedChild(api, { clubId: club.clubId, joinedAt: window.startDate });
    await api.post('/pagelas', pagelaBody(child.id, window));
    const whileActive = await yearStats(club.clubId);

    await api.patch(`/children/${child.id}/toggle-active`);
    const afterLeaving = await yearStats(club.clubId);

    expect(afterLeaving.overall.totalPagelas).toBe(whileActive.overall.totalPagelas);
    expect(afterLeaving.overall.totalChildren).toBe(whileActive.overall.totalChildren);
  });

  test('o total de crianças é o mesmo no panorama e na aba Crianças', async () => {
    const overview = await api.get<{ summary: { totalChildren: number } }>('/statistics/overview');
    const children = await api.get<{ summary: { totalChildren: number } }>('/statistics/children', { limit: 1 });

    expect(children.summary.totalChildren).toBe(overview.summary.totalChildren);
  });

  test('o panorama conta os clubinhos sem pagela pela semana letiva', async () => {
    const overview = await api.get<{
      indicators?: { currentAcademicWeek?: { year: number; week: number } | null; clubsMissingPagelas?: number };
    }>('/statistics/overview');

    expect(overview.indicators?.currentAcademicWeek).toEqual({ year: window.year, week: window.currentWeek });
    // Antes a conta usava a semana do calendário e marcava todos como devendo.
    expect(overview.indicators?.clubsMissingPagelas).toBe(weekly.summary.clubsMissing);
  });

  test('o filtro por cidade não quebra as estatísticas de decisões nem de pagelas', async () => {
    for (const path of [
      '/statistics/accepted-christs',
      '/statistics/accepted-christs/charts',
      '/statistics/pagelas',
      '/statistics/pagelas/charts',
    ]) {
      const response = await api.send('GET', `${path}?city=Manaus`);
      expect(response.status, `${path}?city=Manaus`).toBe(200);
    }
  });

  test('a frequência semanal só devolve situações que a tela conhece', async () => {
    for (const club of weekly.clubs) expect(KNOWN_STATUSES, `clubinho ${club.clubNumber}`).toContain(club.status);

    const { summary } = weekly;
    expect(summary.attendanceRate).toBeGreaterThanOrEqual(0);
    expect(summary.attendanceRate).toBeLessThanOrEqual(100);
    expect(summary.clubsWithPagela + summary.clubsMissing).toBeLessThanOrEqual(summary.totalClubs);
  });

  test('semana futura fica pendente na linha do tempo e não conta como falta', async () => {
    const club = weekly.clubs[0];
    test.skip(!club, 'nenhum clubinho ativo neste banco');
    const timeline = await api.get<ClubTimeline>(`/statistics/attendance/club/${club.clubId}`, {
      year: window.year ?? 0,
      limit: 60,
    });

    const future = timeline.timeline.filter((item) => item.week > (window.currentWeek ?? 0));
    for (const item of future) expect(item.isPending, `semana ${item.week}`).toBe(true);
    expect(timeline.attendance.weeksExpected).toBeLessThanOrEqual(window.currentWeek ?? 0);
    expect(timeline.attendance.weeksWithPagela + timeline.attendance.weeksMissing).toBeLessThanOrEqual(
      timeline.attendance.weeksExpected,
    );
  });

  test('clubinho que não existe responde 404, não erro interno', async () => {
    const response = await api.send(
      'GET',
      `/statistics/attendance/club/00000000-0000-4000-8000-000000000000?year=${window.year}`,
    );
    expect(response.status).toBe(404);
  });
});

test.describe('Estatísticas: pagela da semana na aba Clubinhos', () => {
  test('cada clubinho da semana tem rótulo próprio, sem "Desconhecido"', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=clubinhos');

    const chips = page.getByTestId('statistics-clubs-week').getByTestId('statistics-clubs-week-chip');
    await expect(chips.first()).toBeVisible();
    await expect(page.getByText('Desconhecido')).toHaveCount(0);
    for (const label of await chips.allInnerTexts()) {
      expect(KNOWN_LABELS.some((known) => label.endsWith(known)), label).toBe(true);
    }
    // Um chip por clubinho que a API devolveu para a semana.
    await expect(chips).toHaveCount(weekly.clubs.length);
  });
});

test.describe('Estatísticas: pagela da semana no celular (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('os clubinhos da semana cabem sem rolar a página para o lado', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=clubinhos');
    await expect(page.getByTestId('statistics-clubs-week-chip').first()).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
