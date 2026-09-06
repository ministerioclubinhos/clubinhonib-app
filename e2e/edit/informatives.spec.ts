import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, replaceText, searchListing } from '../support/ui';

type Informative = { id: string; title: string; description: string; public: boolean };

/** Edição de banner informativo (`/adm/informativos`). */
test.describe('Informativos: edição', () => {
  let api: ApiClient;
  let informative: Informative;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    informative = await api.post<Informative>('/informatives', { title: `E2E Aviso ${suffix}`, description: 'Descrição original', public: false });
  });

  test.afterAll(async () => {
    await api.delete(`/informatives/${informative.id}`);
    await api.dispose();
  });

  test('edita título, descrição e publica', async ({ page }) => {
    await page.goto('/adm/informativos');
    await expect(page.getByTestId('informatives-informatives-manager')).toBeVisible();
    await searchListing(page, suffix);
    const card = cardOf(page, 'informatives', 'informative-list-card', informative.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('informatives-informative-form-dialog');
    await expect(dialog).toBeVisible();
    // O diálogo preenche os campos num efeito depois de abrir; digitar antes
    // disso seria sobrescrito pelo valor original.
    await expect(dialog.getByLabel('Título')).toHaveValue(informative.title);
    await replaceText(dialog.getByLabel('Título'), `E2E Aviso Editado ${suffix}`);
    await replaceText(dialog.getByLabel('Descrição'), 'Descrição editada pelo Playwright');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(async () => api.get<Informative>(`/informatives/${informative.id}`)).toMatchObject({
      title: `E2E Aviso Editado ${suffix}`,
      description: 'Descrição editada pelo Playwright',
      public: true,
    });
  });

  test('não salva com título vazio', async ({ page }) => {
    await page.goto('/adm/informativos');
    await searchListing(page, suffix);
    await cardOf(page, 'informatives', 'informative-list-card', informative.id).getByRole('button', { name: 'Editar' }).click();
    const dialog = page.getByTestId('informatives-informative-form-dialog');
    await replaceText(dialog.getByLabel('Título'), '');
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).toBeVisible();
    expect((await api.get<Informative>(`/informatives/${informative.id}`)).title).toContain('E2E Aviso');
  });
});
