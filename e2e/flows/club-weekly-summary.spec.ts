import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';

type Flag = { id: string; key: string; name: string; enabled: boolean };

type WeeklySummary = {
  year: number;
  availableYears: number[];
  currentWeek: number | null;
  period: { totalWeeks: number } | null;
  clubs: Array<{ clubId: string; clubNumber: number }>;
  weeks: Array<{ week: number }>;
};

const FLAG_KEY = 'club_weekly_summary';

/**
 * Resumo semanal (`/adm/resumo-semanal`): a tela que o e-mail de segunda-feira
 * abre. Cobre o desenho das semanas, o filtro de ano e a flag que libera a rota
 * e o item do menu.
 */
test.describe('Resumo semanal dos clubinhos', () => {
  let api: ApiClient;
  let summary: WeeklySummary;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    summary = await api.get<WeeklySummary>('/club-control/weekly-summary');
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('abre no período atual e mostra os números do recorte', async ({ page }) => {
    await page.goto('/adm/resumo-semanal');

    await expect(page.getByTestId('club-weekly-summary-page')).toBeVisible();
    await expect(page.getByTestId('club-weekly-summary-filters')).toBeVisible();

    if (summary.clubs.length === 0) {
      await expect(page.getByTestId('club-weekly-summary-no-clubs')).toBeVisible();
      return;
    }
    if (!summary.period) {
      await expect(page.getByTestId('club-weekly-summary-no-period')).toBeVisible();
      return;
    }

    const navigator = page.getByTestId('club-weekly-summary-range-navigator');
    await expect(navigator).toBeVisible();
    // Abrir já no agora: o atalho "voltar para o atual" nasce desabilitado.
    await expect(page.getByTestId('club-weekly-summary-range-current')).toBeDisabled();

    await expect(page.getByTestId('club-weekly-summary-range-stats')).toBeVisible();
    await expect(page.getByTestId('club-weekly-summary-club-breakdown')).toBeVisible();
    await expect(page.getByTestId('club-weekly-summary-chart')).toBeVisible();
    await expect(page.getByTestId('club-weekly-summary-heat-strip')).toBeVisible();
  });

  test('as setas andam um período por vez e o atalho volta ao atual', async ({ page }) => {
    test.skip(!summary.period || summary.clubs.length === 0, 'ambiente sem período letivo ou sem clubinho');

    await page.goto('/adm/resumo-semanal');
    const navigator = page.getByTestId('club-weekly-summary-range-navigator');
    await expect(navigator).toBeVisible();

    const rotulo = navigator.locator('p').first();
    const inicial = await rotulo.textContent();

    await page.getByTestId('club-weekly-summary-range-previous').click();
    await expect(rotulo).not.toHaveText(inicial ?? '');

    await page.getByTestId('club-weekly-summary-range-current').click();
    await expect(rotulo).toHaveText(inicial ?? '');
    await expect(page.getByTestId('club-weekly-summary-range-current')).toBeDisabled();
  });

  test('as quatro visões trocam o recorte mostrado', async ({ page }) => {
    test.skip(!summary.period || summary.clubs.length === 0, 'ambiente sem período letivo ou sem clubinho');

    await page.goto('/adm/resumo-semanal');
    const navigator = page.getByTestId('club-weekly-summary-range-navigator');
    await expect(navigator).toBeVisible();
    const rotulo = navigator.locator('p').first();

    await expect(rotulo).toHaveText(/^Semana \d+$/);

    await page.getByTestId('club-weekly-summary-granularity-month').click();
    await expect(rotulo).toHaveText(/de \d{4}$/);

    await page.getByTestId('club-weekly-summary-granularity-quarter').click();
    await expect(rotulo).toHaveText(/trimestre de \d{4}$/);

    await page.getByTestId('club-weekly-summary-granularity-year').click();
    await expect(rotulo).toHaveText(/^Ano letivo \d{4}$/);
  });

  test('a faixa do ano salta para o período daquela semana', async ({ page }) => {
    test.skip(!summary.period || summary.clubs.length === 0, 'ambiente sem período letivo ou sem clubinho');

    await page.goto('/adm/resumo-semanal');
    const faixa = page.getByTestId('club-weekly-summary-heat-strip');
    await expect(faixa).toBeVisible();

    const primeira = faixa.locator('[data-testid^="club-weekly-summary-strip-"]').first();
    const numero = await primeira.textContent();
    await primeira.click();

    const rotulo = page
      .getByTestId('club-weekly-summary-range-navigator')
      .locator('p')
      .first();
    await expect(rotulo).toHaveText(`Semana ${numero?.trim()}`);
  });

  test('no celular ocupa 98% da largura, sem empurrar a página para o lado', async ({ page }) => {
    test.skip(!summary.period || summary.clubs.length === 0, 'ambiente sem período letivo ou sem clubinho');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/adm/resumo-semanal');
    const screen = page.getByTestId('club-weekly-summary-page');
    await expect(screen).toBeVisible();

    // O atalho de voltar ao período atual desce para a própria linha: entre as
    // setas ele não caberia junto do rótulo do período.
    await expect(page.getByTestId('club-weekly-summary-range-current-mobile')).toBeVisible();
    await expect(page.getByTestId('club-weekly-summary-range-current')).toBeHidden();

    const largura = await screen.evaluate(
      (element) => element.getBoundingClientRect().width / element.ownerDocument.documentElement.clientWidth,
    );
    expect(largura).toBeGreaterThan(0.95);
    expect(largura).toBeLessThanOrEqual(0.99);

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows).toBe(false);
  });

  test('no desktop ocupa 95% da largura', async ({ page }) => {
    test.skip(!summary.period || summary.clubs.length === 0, 'ambiente sem período letivo ou sem clubinho');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/adm/resumo-semanal');
    const screen = page.getByTestId('club-weekly-summary-page');
    await expect(screen).toBeVisible();

    // A régua é a mesma das telas de conteúdo: 95% da área disponível, que no
    // painel já vem descontada da barra lateral.
    const largura = await screen.evaluate((element) => {
      const parent = element.parentElement;
      return parent ? element.getBoundingClientRect().width / parent.getBoundingClientRect().width : 0;
    });
    expect(largura).toBeGreaterThan(0.93);
    expect(largura).toBeLessThanOrEqual(0.96);
  });

  test('trocar o ano refaz a consulta com o ano escolhido', async ({ page }) => {
    const outroAno = summary.availableYears.find((year) => year !== summary.year);
    test.skip(outroAno === undefined, 'só há um ano letivo cadastrado neste ambiente');

    await page.goto('/adm/resumo-semanal');
    await expect(page.getByTestId('club-weekly-summary-page')).toBeVisible();

    const pedido = page.waitForRequest(
      (request) =>
        request.url().includes('/club-control/weekly-summary') &&
        request.url().includes(`year=${outroAno}`),
    );

    await page.getByRole('combobox', { name: 'Ano letivo' }).click();
    await page.getByRole('option', { name: String(outroAno) }).click();

    await pedido;
  });

  test('flag desligada fecha a rota e esconde o item do menu; ligada de novo, tudo volta', async ({ page }) => {
    const flag = await api.get<Flag>(`/feature-flags/${FLAG_KEY}`);
    test.skip(!flag.enabled, `a flag ${FLAG_KEY} já está desligada neste ambiente`);

    try {
      await api.patch(`/feature-flags/${flag.key}`, { enabled: false });

      await page.goto('/adm/resumo-semanal');
      await expect(page).toHaveURL(/\/adm\/?$/);
      await expect(
        page.getByTestId('adm-admin-layout').getByText('Resumo Semanal', { exact: true }),
      ).toHaveCount(0);
    } finally {
      await api.patch(`/feature-flags/${flag.key}`, { enabled: true });
    }

    await page.goto('/adm/resumo-semanal');
    await expect(page).toHaveURL(/\/adm\/resumo-semanal$/);
    await expect(
      page.getByTestId('adm-admin-layout').getByText('Resumo Semanal', { exact: true }),
    ).toBeVisible();
  });
});
