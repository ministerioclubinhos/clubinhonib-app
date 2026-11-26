import { ApiClient } from '../support/api';
import { expect, test } from '@playwright/test';

/**
 * Os gráficos das estatísticas, contra a API real: cada visão usa o desenho que
 * lê melhor (anéis, colunas, rosca, blocos, bonequinhos) em vez de só barras, e
 * a animação respeita quem prefere tela parada.
 */
test.describe('Estatísticas: gráficos', () => {
  test('crianças: anéis, rosca, colunas e barra dividida', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=criancas');
    await expect(page.getByTestId('statistics-children-view')).toBeVisible();

    await expect(page.getByTestId('statistics-children-low').getByTestId('statistics-plain-ring-list')).toBeVisible();
    await expect(page.getByTestId('statistics-children-top').getByTestId('statistics-plain-ring-list')).toBeVisible();
    await expect(page.getByTestId('statistics-children-gender').getByTestId('statistics-plain-donut')).toBeVisible();
    await expect(page.getByTestId('statistics-children-ages').getByTestId('statistics-plain-column-chart')).toBeVisible();
    await expect(page.getByTestId('statistics-children-time').getByTestId('statistics-plain-stacked-bar')).toBeVisible();
  });

  test('clubinhos: anel por clubinho, blocos, colunas dos dias e bonequinhos das cidades', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=clubinhos');
    await expect(page.getByTestId('statistics-clubs-view')).toBeVisible();

    await expect(page.getByTestId('statistics-clubs-presence-list').getByTestId('statistics-plain-ring-grid')).toBeVisible();
    await expect(page.getByTestId('statistics-clubs-size-list').getByTestId('statistics-plain-tile-map')).toBeVisible();
    await expect(page.getByTestId('statistics-clubs-weekdays').getByTestId('statistics-plain-column-chart')).toBeVisible();
    await expect(page.getByTestId('statistics-clubs-cities').getByTestId('statistics-plain-dots-list')).toBeVisible();
  });

  test('professores: ranking com anel e bonequinhos por clubinho', async ({ page }) => {
    await page.goto('/adm/estatisticas?aba=professores');
    await expect(page.getByTestId('statistics-teachers-by-club').getByTestId('statistics-plain-dots-list')).toBeVisible();
  });

  test('o resumo desenha as semanas em colunas com a linha da média', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-plain-week-columns')).toBeVisible();
    await expect(page.getByTestId('statistics-plain-week-columns-average')).toBeAttached();
  });

  test.describe('com movimento ligado', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('o número grande sobe e termina no valor que a API mandou', async ({ page }) => {
      await page.goto('/adm/estatisticas');
      const value = page.getByTestId('statistics-summary-children-value');
      const api = await ApiClient.login();
      const overview = await api.get<{ summary: { totalChildren: number } }>('/statistics/overview');
      await api.dispose();
      expect(overview.summary.totalChildren).toBeGreaterThan(0);
      // Com movimento ligado o número sobe por menos de 1s; os valores do caminho
      // são intermediários, o que vale é onde ele para.
      const total = String(overview.summary.totalChildren);
      await expect(value).toHaveText(total, { timeout: 20_000 });
      await page.waitForTimeout(1200);
      expect(await value.innerText()).toBe(total);
    });

    test('as colunas das semanas crescem até a altura final', async ({ page }) => {
      await page.goto('/adm/estatisticas');
      const chart = page.getByTestId('statistics-plain-week-columns');
      await chart.scrollIntoViewIfNeeded();
      const tallest = chart.getByRole('listitem').first().locator('.week-col');
      await expect.poll(async () => (await tallest.boundingBox())?.height ?? 0, { timeout: 5000 }).toBeGreaterThan(8);
    });
  });

  test.describe('no celular', () => {
    test.use({ viewport: { width: 360, height: 780 }, hasTouch: true });

    test('os gráficos novos cabem na tela, sem rolar para o lado', async ({ page }) => {
      for (const tab of ['criancas', 'clubinhos', 'professores', 'coordenadores']) {
        await page.goto(`/adm/estatisticas?aba=${tab}`);
        await expect(page.getByTestId(`statistics-${tab === 'criancas' ? 'children' : tab === 'clubinhos' ? 'clubs' : tab === 'professores' ? 'teachers' : 'coordinators'}-view`)).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${tab} rola para o lado`).toBeLessThanOrEqual(0);
      }
    });
  });
});
