import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, confirmToggleActive, replaceText, searchListing, selectMuiOption } from '../support/ui';

type Club = { id: string; number: number; weekday: string; time: string | null; isActive: boolean; address: { street: string | null; district: string | null; city: string | null; state: string | null } | null };

/** Edição de clubinho pelo painel (`/adm/clubinhos`). */
test.describe('Clubinhos: edição', () => {
  let api: ApiClient;
  let club: Club;
  const number = 6000 + Math.floor(Math.random() * 999);
  const district = `Bairro E2E ${uniqueSuffix()}`;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    club = await api.post<Club>('/clubs', { number, weekday: 'monday', time: '14:00', address: { street: 'Rua Original', district, city: 'Campinas', state: 'SP' } });
  });

  test.afterAll(async () => {
    await api.delete(`/clubs/${club.id}`);
    await api.dispose();
  });

  test('edita dia, horário, endereço e status pelo formulário', async ({ page }) => {
    await page.goto('/adm/clubinhos');
    await expect(page.getByTestId('clubs-clubs-manager')).toBeVisible();
    await searchListing(page, district);
    const card = cardOf(page, 'clubs', 'club-card', club.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('clubs-club-form-dialog');
    await expect(dialog).toBeVisible();
    await selectMuiOption(page, dialog.getByRole('combobox', { name: 'Dia da semana' }), /s[áa]bado/i);
    await dialog.getByLabel('Horário').fill('09:30');
    await replaceText(dialog.getByLabel('Rua'), 'Rua Editada');
    await replaceText(dialog.getByLabel('Cidade'), 'Sorocaba');
    await dialog.getByLabel('Ativo').uncheck();
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(async () => api.get<Club>(`/clubs/${club.id}`)).toMatchObject({
      weekday: 'saturday',
      time: '09:30',
      isActive: false,
      address: expect.objectContaining({ street: 'Rua Editada', city: 'Sorocaba' }),
    });
  });

  test('reativa pelo botão do card', async ({ page }) => {
    await page.goto('/adm/clubinhos');
    await searchListing(page, district);
    const card = cardOf(page, 'clubs', 'club-card', club.id);
    await card.getByRole('button', { name: 'Reativar' }).click();
    await confirmToggleActive(page);
    await expect.poll(async () => (await api.get<Club>(`/clubs/${club.id}`)).isActive).toBe(true);
  });
});
