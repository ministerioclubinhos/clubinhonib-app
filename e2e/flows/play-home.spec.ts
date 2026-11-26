import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { enableProductFlags } from '../support/featureFlags';
import { expectNoHorizontalOverflow, expectTouchTarget } from '../support/responsive';

/** Clubinho Play dos professores no celular e no desktop, com os vídeos reais da API. */
test.describe('Clubinho Play: início', () => {
  let api: ApiClient;
  let restoreFlags: () => Promise<void>;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    restoreFlags = await enableProductFlags(api);
    const home = await api.get<{ sections: { videos: unknown[] }[] }>('/play/home');
    expect(home.sections.length, 'o ambiente local precisa de vídeos no Play').toBeGreaterThan(0);
  });

  test.afterAll(async () => {
    await restoreFlags?.();
    await api?.dispose();
  });

  for (const width of [320, 360, 1440]) {
    test(`fileiras e ações cabem em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/area-do-professor/play');
      const root = page.getByTestId('clubinho-play-page');
      const row = root.locator('[data-testid^="play-row-"]').first();
      await expect(row).toBeVisible();
      await expectNoHorizontalOverflow(page, root);
      // A fileira começa dentro da tela: a margem negativa cortava os títulos.
      expect((await row.getByRole('link').first().boundingBox())!.x).toBeGreaterThanOrEqual(0);
      for (const button of await page.getByTestId('play-home-actions').getByRole('button').all()) {
        await expectTouchTarget(button);
        expect(await button.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
        expect((await button.boundingBox())!.height, 'texto numa linha só').toBeLessThan(60);
      }
    });
  }

  test('capa que não carrega vira o ícone de vídeo, sem imagem quebrada', async ({ page }) => {
    // Falha de rede injetada nas capas; os vídeos vêm da API real.
    await page.route(/^https:\/\/(img\.youtube\.com|i\.ytimg\.com)\//, (route) => route.abort());
    await page.goto('/area-do-professor/play');
    const root = page.getByTestId('clubinho-play-page');
    await expect(root.getByTestId('play-thumbnail-placeholder').first()).toBeVisible();
    await expect
      .poll(() =>
        root
          .getByTestId('play-thumbnail-image')
          .evaluateAll((images) =>
            images.filter((img) => (img as HTMLImageElement).complete && !(img as HTMLImageElement).naturalWidth).length
          )
      )
      .toBe(0);
  });
});
