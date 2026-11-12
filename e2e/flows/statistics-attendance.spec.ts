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
const KNOWN_LABELS = ['OK', 'Parcial', 'Faltou', 'Aguardando o dia do clubinho', 'Férias', 'Inativo', 'Fora do período letivo'];

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

async function openFrequency(page: Page, subTab: 'Semana' | 'Timeline') {
  await page.goto('/adm/estatisticas');
  await page.getByTestId('statistics-dashboard-navigation-tabs').getByRole('tab', { name: 'Frequência' }).click();
  const frequency = page.getByTestId('statistics-tabs-frequency-tab');
  await expect(frequency).toBeVisible();
  if (subTab === 'Timeline') await frequency.getByRole('tab', { name: /Timeline/ }).click();
}

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

test.describe('Estatísticas: frequência na tela', () => {
  test('cada clubinho da semana tem rótulo próprio, sem "Desconhecido"', async ({ page }) => {
    await openFrequency(page, 'Semana');

    const grid = page.getByTestId('statistics-weekly-attendance-grid');
    const chips = grid.getByTestId('statistics-weekly-attendance-status');
    await expect(chips.first()).toBeVisible();
    await expect(grid.getByText('Desconhecido')).toHaveCount(0);
    for (const label of await chips.allInnerTexts()) expect(KNOWN_LABELS).toContain(label.trim());
  });

  test('na linha do tempo, semana futura nunca aparece como falta', async ({ page }) => {
    test.skip((window.currentWeek ?? 0) >= (window.totalWeeks ?? 0), 'não há semana futura no período');
    await openFrequency(page, 'Timeline');

    const timeline = page.getByTestId('statistics-club-attendance-timeline');
    const weeks = timeline.getByTestId('statistics-timeline-week');
    await expect(weeks.first()).toBeVisible();
    await expect(timeline.getByTestId('statistics-timeline-legend').getByText('Pendente', { exact: true })).toBeVisible();

    // A linha do tempo é paginada: percorre as páginas olhando as semanas
    // depois da atual. Elas são pendentes — ou já têm pagela, em banco de
    // teste semeado com datas futuras —, mas nunca "sem pagela".
    const nextPage = timeline.getByRole('button', { name: /next page|próxima página/i }).first();
    let futureSeen = 0;
    for (let step = 0; step < 8; step += 1) {
      const states = await weeks.evaluateAll((nodes) =>
        nodes.map((node) => ({
          week: Number(node.getAttribute('data-week')),
          state: node.getAttribute('data-state'),
        })),
      );
      for (const item of states.filter((entry) => entry.week > (window.currentWeek ?? 0))) {
        futureSeen += 1;
        expect(item.state, `semana ${item.week}`).not.toBe('missing');
      }
      if (await nextPage.isDisabled()) break;
      await nextPage.click();
      await page.waitForLoadState('networkidle');
      await expect(weeks.first()).toBeVisible();
    }
    expect(futureSeen).toBeGreaterThan(0);
  });

  test('os cartões do topo avisam que não seguem os filtros', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByText('Visão geral — não segue os filtros').first()).toBeVisible();
    await expect(page.getByText('Top Performers')).toHaveCount(0);
  });
});

test.describe('Estatísticas: frequência no celular (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('a grade e a linha do tempo cabem sem rolar a página para o lado', async ({ page }) => {
    await openFrequency(page, 'Semana');
    const grid = page.getByTestId('statistics-weekly-attendance-grid');
    await expect(grid.getByTestId('statistics-weekly-attendance-status').first()).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);

    await page.getByTestId('statistics-tabs-frequency-tab').getByRole('tab', { name: /Timeline/ }).click();
    const timeline = page.getByTestId('statistics-club-attendance-timeline');
    await expect(timeline.getByTestId('statistics-timeline-week').first()).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
