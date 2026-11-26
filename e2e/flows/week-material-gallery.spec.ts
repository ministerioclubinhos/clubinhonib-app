import { expect, test } from '@playwright/test';

import type { WeekMaterialResponse } from '@/features/week-materials/types';
import { ApiClient, uniqueSuffix } from '../support/api';
import { assertLocalApi } from '../support/emailFlags';

const GALLERY_URL = '/lista-materias-semanais';

test.describe('Galeria de materiais do professor', () => {
  let api: ApiClient;
  let weekly: WeekMaterialResponse;
  let special: WeekMaterialResponse;
  const created: string[] = [];
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    assertLocalApi();
    api = await ApiClient.login();
    for (const isSpecial of [false, true]) {
      const material = await api.postMultipart<WeekMaterialResponse>('/week-material-pages', {
        weekMaterialsPageData: JSON.stringify({
          pageTitle: `${isSpecial ? 'Z' : 'A'} Galeria ${suffix}`,
          pageSubtitle: isSpecial ? 'Encontro em família' : 'Oração e amizade',
          pageDescription: `${isSpecial ? '[tipo:especial] ' : ''}Atividades do Clubinho [origem:licao:hidden-marker]`,
          videos: [],
          documents: [],
          images: [],
          audios: [],
        }),
      });
      created.push(material.id);
      if (isSpecial) special = material;
      else weekly = material;
    }
  });

  test.afterAll(async () => {
    for (const id of created) await api.delete(`/week-material-pages/${id}`);
    await api?.dispose();
  });

  test('busca, filtra, ordena e abre o material pelo teclado', async ({ page }) => {
    await page.goto(GALLERY_URL);
    await expect(
      page.getByRole('heading', { name: 'Galeria de materiais', exact: true })
    ).toBeVisible();
    const search = page.getByRole('textbox', { name: 'Buscar materiais' });
    await search.fill(suffix);
    const grid = page.getByTestId('week-material-gallery-grid');
    await expect(grid.getByRole('article')).toHaveCount(2);
    await expect(grid).not.toContainText('[origem:licao:');
    await expect(grid).not.toContainText('[tipo:especial]');
    await expect(page.getByTestId('week-material-gallery-results')).toHaveText(
      '2 materiais encontrados'
    );

    await page.getByRole('button', { name: 'Especiais', exact: true }).click();
    await expect(grid.getByRole('article')).toHaveCount(1);
    await expect(grid).toContainText(special.title);
    await page.getByRole('button', { name: 'Semanais', exact: true }).click();
    await expect(grid.getByRole('article')).toHaveCount(1);
    await expect(grid).toContainText(weekly.title);
    await page.getByRole('button', { name: 'Todos os materiais', exact: true }).click();
    await page.getByRole('combobox', { name: 'Ordenar por' }).click();
    await page.getByRole('option', { name: 'Título (A–Z)' }).click();
    await expect(grid.getByRole('article').first()).toContainText(weekly.title);

    const open = grid.getByRole('link', { name: `Ver material: ${weekly.title}`, exact: true });
    await expect(open).toHaveAttribute('href', `/materiais-semanais/${weekly.id}`);
    await open.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/materiais-semanais/${weekly.id}$`));
    await expect(
      page.getByRole('heading', { name: weekly.title, exact: true }).first()
    ).toBeVisible();
  });

  test('a busca sem resultados permite limpar os filtros', async ({ page }) => {
    await page.goto(GALLERY_URL);
    await page.getByRole('button', { name: 'Especiais', exact: true }).click();
    await page.getByRole('textbox', { name: 'Buscar materiais' }).fill(`sem-resultados-${suffix}`);
    await expect(page.getByTestId('week-material-gallery-empty')).toBeVisible();
    await expect(page.getByTestId('week-material-gallery-results')).toHaveText(
      '0 materiais encontrados'
    );
    await page.getByRole('button', { name: 'Limpar filtros' }).click();
    await expect(page.getByRole('textbox', { name: 'Buscar materiais' })).toHaveValue('');
    await expect(
      page.getByRole('button', { name: 'Todos os materiais', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('week-material-gallery-grid')).toBeVisible();
  });

  test('preserva a galeria quando a capa falha e cabe no celular', async ({ page }, testInfo) => {
    await page.route('**/card_materiais.png', (route) => route.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(GALLERY_URL);
    await page.getByRole('textbox', { name: 'Buscar materiais' }).fill(suffix);
    const cards = page.getByTestId('week-material-gallery-grid').getByRole('article');
    await expect(cards).toHaveCount(2);
    await expect(cards.first().getByTestId('week-material-gallery-cover-fallback')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    const content = page.getByTestId('week-material-gallery-content');
    expect((await content.boundingBox())?.width).toBeCloseTo(390 * 0.98, 0);
    await page.screenshot({ path: testInfo.outputPath('gallery-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    expect((await content.boundingBox())?.width).toBeCloseTo(1440 * 0.95, 0);
    await page.screenshot({ path: testInfo.outputPath('gallery-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 320, height: 740 });
    expect((await content.boundingBox())?.width).toBeCloseTo(320 * 0.98, 0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    for (const button of await page
      .getByRole('group', { name: 'Categoria dos materiais' })
      .getByRole('button')
      .all()) {
      expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({
      path: testInfo.outputPath('gallery-small-mobile.png'),
      fullPage: true,
    });
  });

  test('mostra carregamento, erro e permite tentar novamente', async ({ page }) => {
    let fail = true;
    let releaseResponse = () => {};
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    await page.route('**/routes', async (route) => {
      if (!fail) return route.continue();
      await responseGate;
      await route.abort('failed');
    });
    await page.goto(GALLERY_URL, { waitUntil: 'domcontentloaded' });
    try {
      await expect(page.getByTestId('week-material-gallery-loading')).toBeVisible();
    } finally {
      releaseResponse();
    }
    await expect(page.getByTestId('week-material-gallery-error')).toBeVisible();
    fail = false;
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(page.getByTestId('week-material-gallery-grid')).toBeVisible();
    await expect(page.getByTestId('week-material-gallery-error')).toHaveCount(0);
  });

  test('exibe as capas reais no desktop e no celular', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(GALLERY_URL);
    await expect(page.getByTestId('week-material-gallery-grid')).toBeVisible();
    const firstCover = page.getByTestId('week-material-gallery-grid').getByRole('img').first();
    await expect(firstCover).toBeVisible();
    await expect
      .poll(() =>
        firstCover.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('gallery-real-desktop.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('gallery-real-mobile.png'), fullPage: true });
  });
});
