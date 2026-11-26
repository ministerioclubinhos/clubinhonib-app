import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, searchListing } from '../support/ui';

type WeekPage = { id: string; title: string; currentWeek: boolean };
type Paged = { data: WeekPage[] };

const video = { title: 'Link', description: 'yt', uploadType: 'link', mediaType: 'video', isLocalFile: false, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', platformType: 'youtube' };

/**
 * Listagem de materiais semanais (`/adm/paginas-materiais-semanais`) e o
 * módulo de API por trás dela: paginação, busca e ordenação vão para o banco;
 * publicar a semana é um `POST` em `/current-week/:id`.
 */
test.describe('Materiais semanais: listagem e API', () => {
  let api: ApiClient;
  let created: WeekPage;
  let previousCurrent: WeekPage | null = null;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    previousCurrent = await api.get<WeekPage | null>('/week-material-pages/current-week').catch(() => null);
    created = await api.postMultipart<WeekPage>('/week-material-pages', {
      weekMaterialsPageData: JSON.stringify({ pageTitle: `E2E Lista ${suffix}`, pageSubtitle: 'Sub', pageDescription: 'Desc', videos: [video] }),
    });
  });

  test.afterAll(async () => {
    if (previousCurrent?.id) await api.post(`/week-material-pages/current-week/${previousCurrent.id}`).catch(() => undefined);
    if (created) await api.delete(`/week-material-pages/${created.id}`).catch(() => undefined);
    await api.dispose();
  });

  test('manda paginação, busca e ordenação para a API', async ({ page }) => {
    const listRequests: URL[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.pathname === '/week-material-pages') listRequests.push(url);
    });

    await page.goto('/adm/paginas-materiais-semanais');
    await expect(page.getByTestId('week-materials-week-materials-manager')).toBeVisible();
    await expect.poll(() => listRequests.length).toBeGreaterThan(0);
    const first = listRequests[0];
    expect(first.searchParams.get('page')).toBe('1');
    expect(first.searchParams.get('limit')).toBeTruthy();
    expect(first.searchParams.get('sort')).toBe('createdAt');
    expect(first.searchParams.get('order')).toBe('DESC');
    expect(first.searchParams.has('searchString')).toBe(false);

    await searchListing(page, suffix);
    await expect(cardOf(page, 'week-materials', 'week-material-list-card', created.id)).toBeVisible();
    // A busca é debounced: a requisição com `searchString` chega logo depois de digitar.
    await expect
      .poll(() => listRequests.some((url) => url.searchParams.get('searchString') === suffix), { message: 'a busca não chegou à API como searchString' })
      .toBe(true);
  });

  test('publica a página como material da semana pelo POST /current-week/:id', async ({ page }) => {
    await page.goto('/adm/paginas-materiais-semanais');
    await searchListing(page, suffix);
    const card = cardOf(page, 'week-materials', 'week-material-list-card', created.id);
    await expect(card).toBeVisible();

    const request = page.waitForRequest((req) => req.method() === 'POST' && req.url().endsWith(`/week-material-pages/current-week/${created.id}`));
    await card.getByRole('button', { name: 'Publicar como material da semana' }).click();
    const dialog = page.getByTestId('week-materials-set-current-week-confirm-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /^(Publicar|Confirmar)/ }).click();
    await request;

    await expect.poll(async () => (await api.get<WeekPage>(`/week-material-pages/${created.id}`)).currentWeek).toBe(true);
    const list = await api.get<Paged>('/week-material-pages', { page: 1, limit: 100, currentWeek: true });
    expect(list.data.map((p) => p.id)).toEqual([created.id]);
  });
});
