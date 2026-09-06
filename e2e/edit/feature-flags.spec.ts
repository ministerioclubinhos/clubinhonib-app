import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, replaceText, searchListing } from '../support/ui';

type Flag = { id: string; key: string; name: string; description: string | null; enabled: boolean };

/** Edição e alternância de feature flags (`/adm/feature-flags`). */
test.describe('Feature flags: edição', () => {
  let api: ApiClient;
  let flag: Flag;
  const key = `e2e_flag_${uniqueSuffix()}`;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    flag = await api.post<Flag>('/feature-flags', { key, name: `E2E Flag ${key}`, description: 'Original', enabled: false, targetRoles: ['admin'] });
  });

  test.afterAll(async () => {
    await api.delete(`/feature-flags/${flag.key}`);
    await api.dispose();
  });

  test('edita nome, descrição e liga a flag pelo diálogo', async ({ page }) => {
    await page.goto('/adm/feature-flags');
    await expect(page.getByTestId('feature-flags-feature-flags-manager')).toBeVisible();
    await searchListing(page, key);
    const card = cardOf(page, 'feature-flags', 'feature-flag-list-card', flag.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('feature-flags-feature-flag-form-dialog');
    await expect(dialog).toBeVisible();
    await replaceText(dialog.getByLabel('Nome'), `E2E Flag Editada ${key}`);
    await replaceText(dialog.getByLabel('Descrição'), 'Descrição editada');
    await dialog.getByLabel('Desligada').check();
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(async () => api.get<Flag>(`/feature-flags/${key}`)).toMatchObject({ name: `E2E Flag Editada ${key}`, description: 'Descrição editada', enabled: true });
  });

  test('o interruptor do card desliga e liga a flag', async ({ page }) => {
    await page.goto('/adm/feature-flags');
    await searchListing(page, key);
    const card = cardOf(page, 'feature-flags', 'feature-flag-list-card', flag.id);
    const toggle = card.getByRole('checkbox', { name: /Alternar/ });
    await toggle.click();
    await expect.poll(async () => (await api.get<Flag>(`/feature-flags/${key}`)).enabled).toBe(false);
    await toggle.click();
    await expect.poll(async () => (await api.get<Flag>(`/feature-flags/${key}`)).enabled).toBe(true);
  });
});
