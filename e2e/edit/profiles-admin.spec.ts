import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { replaceText } from '../support/ui';

type User = { id: string; name: string; email: string };
type Profile = { id: string; personalData?: { gaLeaderName?: string }; preferences?: { favoriteFood?: string } };

/** Edição do perfil de outra pessoa pelo admin (`/adm/perfis`). */
test.describe('Perfis (admin): edição', () => {
  let api: ApiClient;
  let user: User;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    user = await api.post<User>('/users', { name: `E2E Perfil ${suffix}`, email: `e2e.perfil.${suffix}@teste.clubinhonib.com`, password: 'Senha123@', phone: '11999990000', role: 'teacher', active: true, completed: true });
    await api.patch(`/profiles/${user.id}`, { personalData: { gaLeaderName: 'Líder original' }, preferences: { favoriteFood: 'Original' } }).catch(async () => {
      const session = await ApiClient.login(user.email, 'Senha123@');
      await session.post('/profiles', { personalData: { gaLeaderName: 'Líder original' }, preferences: { favoriteFood: 'Original' } });
      await session.dispose();
    });
  });

  test.afterAll(async () => {
    await api.delete(`/users/${user.id}`);
    await api.dispose();
  });

  test('edita dados pessoais e preferências pelo diálogo do admin', async ({ page }) => {
    await page.goto('/adm/perfis');
    await expect(page.getByTestId('profile-profiles-manager')).toBeVisible();
    await replaceText(page.getByPlaceholder(/Buscar por nome ou e-mail/), user.email);
    const card = page.getByTestId('profile-profile-card').filter({ hasText: user.name }).first();
    await expect(card).toBeVisible();
    await card.click();

    const modal = page.getByTestId('profile-profile-detail-modal');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('profile-profile-admin-edit-dialog');
    await expect(dialog).toBeVisible();
    await replaceText(dialog.getByLabel('Nome do Líder de GA'), 'Líder editado pelo admin');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect.poll(async () => (await api.get<Profile>(`/profiles/${user.id}`)).personalData?.gaLeaderName).toBe('Líder editado pelo admin');

    await dialog.getByRole('tab', { name: 'Preferências' }).click();
    await replaceText(dialog.getByLabel('Comida Favorita'), 'Lasanha E2E');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect.poll(async () => (await api.get<Profile>(`/profiles/${user.id}`)).preferences?.favoriteFood).toBe('Lasanha E2E');
  });
});
