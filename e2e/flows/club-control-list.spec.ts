import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';

/**
 * Lista "Status detalhado dos clubinhos" (`/adm/controle-clubinhos`), contra a
 * API real: paginação e filtros acontecem no back, e o resumo continua sendo o
 * da semana inteira.
 */
interface Week {
  year: number | null;
  week: number | null;
  summary: Record<string, number>;
  clubs: { clubId: string; status: string; weekday: string | null }[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

let api: ApiClient;
let full: Week;

test.beforeAll(async () => {
  api = await ApiClient.login();
  full = await api.get<Week>('/club-control/check/week', { page: 1, limit: 100 });
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe('Controle: lista paginada e filtrada no back', () => {
  test('a página traz só o limite pedido e o total é o da semana', async () => {
    test.skip(full.pagination.total < 2, 'menos de 2 clubinhos ativos neste banco');
    const page1 = await api.get<Week>('/club-control/check/week', { page: 1, limit: 1 });
    const page2 = await api.get<Week>('/club-control/check/week', { page: 2, limit: 1 });

    expect(page1.clubs).toHaveLength(1);
    expect(page2.clubs).toHaveLength(1);
    expect(page1.clubs[0].clubId).not.toBe(page2.clubs[0].clubId);
    expect(page1.pagination.total).toBe(full.pagination.total);
    expect(page1.pagination.totalPages).toBe(full.pagination.total);
    // O resumo não encolhe com a página.
    expect(page1.summary.totalClubs).toBe(full.summary.totalClubs);
  });

  test('o filtro de status e de dia vale para a semana toda, não só para a página', async () => {
    const statuses = [...new Set(full.clubs.map((club) => club.status))];
    for (const status of statuses) {
      const expected = full.clubs.filter((club) => club.status === status).length;
      const filtered = await api.get<Week>('/club-control/check/week', { status, page: 1, limit: 1 });
      expect(filtered.pagination.total).toBe(expected);
      expect(filtered.clubs.every((club) => club.status === status)).toBe(true);
    }

    const weekday = full.clubs.find((club) => club.weekday)?.weekday;
    test.skip(!weekday, 'nenhum clubinho com dia da semana');
    const expectedDay = full.clubs.filter((club) => club.weekday === weekday).length;
    const byDay = await api.get<Week>('/club-control/check/week', { weekday: weekday as string, page: 1, limit: 100 });
    expect(byDay.pagination.total).toBe(expectedDay);
    expect(byDay.summary.totalClubs).toBe(full.summary.totalClubs);
  });

  test('filtro inválido é recusado', async () => {
    const refused = await api.send('GET', '/club-control/check/week?status=banana');
    expect(refused.status).toBe(400);
  });

  test('no celular a tela pede 6 por página e o filtro vai para o back', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/club-control/check/week')) requests.push(request.url());
    });
    await page.goto('/adm/controle-clubinhos');
    await expect(page.getByTestId('club-control-clubs-list-mobile-cards')).toBeVisible();

    expect(requests.some((url) => /limit=6(&|$)/.test(url))).toBe(true);
    await expect(page.getByTestId('club-control-club-row')).toHaveCount(Math.min(6, full.pagination.total));

    await page.getByTestId('club-control-filters-toggle').click();
    await page.getByTestId('club-control-filter-status').getByRole('combobox').click();
    await page.getByRole('option', { name: /OK/ }).first().click();
    await expect.poll(() => requests.some((url) => url.includes('status=ok'))).toBe(true);
  });
});
