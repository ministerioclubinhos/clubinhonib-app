import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, confirmToggleActive, replaceText, searchListing, selectMuiOption } from '../support/ui';

type Club = { id: string; number: number };
type Child = { id: string; name: string; guardianName: string; gender: string; isActive: boolean; club: { id: string } | null; address: { street: string; city: string } | null };

/** Edição de criança pelo painel (`/adm/criancas`). */
test.describe('Crianças: edição', () => {
  let api: ApiClient;
  let club: Club;
  let child: Child;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    club = await api.post<Club>('/clubs', { number: 5000 + Math.floor(Math.random() * 999), weekday: 'friday', address: { district: 'Centro', city: 'Campinas', state: 'SP' } });
    child = await api.post<Child>('/children', {
      name: `E2E Criança ${suffix}`,
      birthDate: '2016-05-10',
      guardianName: 'Responsável Original',
      gender: 'M',
      guardianPhone: '11988887777',
      joinedAt: '2024-02-05',
      clubId: club.id,
      address: { street: 'Rua Original', district: 'Centro', city: 'Campinas', state: 'SP', postalCode: '13000000' },
    });
  });

  test.afterAll(async () => {
    await api.delete(`/children/${child.id}`);
    await api.delete(`/clubs/${club.id}`);
    await api.dispose();
  });

  test('edita nome, sexo, responsável e endereço', async ({ page }) => {
    await page.goto('/adm/criancas');
    await expect(page.getByTestId('children-children-manager')).toBeVisible();
    await searchListing(page, suffix);
    const card = cardOf(page, 'children', 'child-card', child.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('children-child-form-dialog');
    await expect(dialog).toBeVisible();
    await replaceText(dialog.getByRole('textbox', { name: 'Nome', exact: true }), `E2E Criança Editada ${suffix}`);
    await selectMuiOption(page, dialog.getByRole('combobox', { name: 'Sexo' }), 'Menina');
    await replaceText(dialog.getByLabel('Responsável'), 'Responsável Editado');
    await replaceText(dialog.getByLabel('Rua'), 'Rua Editada');
    await replaceText(dialog.getByLabel('Cidade'), 'Sorocaba');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(async () => api.get<Child>(`/children/${child.id}`)).toMatchObject({
      name: `E2E Criança Editada ${suffix}`,
      gender: 'F',
      guardianName: 'Responsável Editado',
      address: expect.objectContaining({ street: 'Rua Editada', city: 'Sorocaba' }),
    });
  });

  test('inativa e reativa pelo botão do card', async ({ page }) => {
    await page.goto('/adm/criancas');
    await searchListing(page, suffix);
    const card = cardOf(page, 'children', 'child-card', child.id);
    await card.getByRole('button', { name: 'Inativar' }).click();
    await confirmToggleActive(page);
    await expect.poll(async () => (await api.get<Child>(`/children/${child.id}`)).isActive).toBe(false);
    await card.getByRole('button', { name: 'Reativar' }).click();
    await confirmToggleActive(page);
    await expect.poll(async () => (await api.get<Child>(`/children/${child.id}`)).isActive).toBe(true);
  });
});
