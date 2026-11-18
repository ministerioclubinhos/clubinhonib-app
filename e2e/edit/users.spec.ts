import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, replaceText, searchListing, selectMuiOption } from '../support/ui';

type User = { id: string; name: string; email: string; role: string; active: boolean; completed: boolean; commonUser: boolean; phone: string };

/**
 * Edição de usuário pelo painel (`/adm/usuarios`).
 *
 * O usuário é criado pela API antes do teste e removido depois; a tela edita
 * nome, papel e situação, e a API é relida para provar a persistência.
 */
test.describe('Usuários: edição', () => {
  let api: ApiClient;
  let user: User;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    user = await api.post<User>('/users', {
      name: `E2E Usuário ${suffix}`,
      email: `e2e.user.${suffix}@teste.clubinhonib.com`,
      password: 'Senha123@',
      phone: '11999990000',
      role: 'teacher',
      active: true,
      completed: true,
      commonUser: true,
    });
  });

  test.afterAll(async () => {
    await api.delete(`/users/${user.id}`);
    await api.dispose();
  });

  test('edita nome, papel e situação pelo formulário e a API reflete', async ({ page }) => {
    await page.goto('/adm/usuarios');
    await expect(page.getByTestId('users-users-manager')).toBeVisible();
    await searchListing(page, user.email);

    const card = cardOf(page, 'users', 'user-card', user.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('users-user-form-dialog');
    await expect(dialog).toBeVisible();
    await replaceText(dialog.getByLabel('Nome'), `E2E Editado ${suffix}`);
    await selectMuiOption(page, dialog.getByRole('combobox', { name: 'Papel' }), /coordenador/i);
    await dialog.getByLabel('Ativo').uncheck();
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).toBeHidden();

    await expect
      .poll(async () => api.get<User>(`/users/${user.id}`), { message: 'usuário não foi atualizado na API' })
      .toMatchObject({ name: `E2E Editado ${suffix}`, role: 'coordinator', active: false });

    // O card da listagem passa a mostrar o nome novo.
    await expect(cardOf(page, 'users', 'user-card', user.id)).toContainText(`E2E Editado ${suffix}`);
  });

  test('troca a senha pelo formulário e o login passa a aceitar a nova', async ({ page }) => {
    await page.goto('/adm/usuarios');
    await searchListing(page, user.email);
    const card = cardOf(page, 'users', 'user-card', user.id);
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('users-user-form-dialog');
    await dialog.getByLabel('Ativo').check();
    await dialog.getByLabel('Trocar senha').check();
    await dialog.getByLabel('Nova senha').fill('NovaSenha123@');
    await dialog.getByLabel('Confirmar senha').fill('NovaSenha123@');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).toBeHidden();

    const session = await ApiClient.login(user.email, 'NovaSenha123@');
    expect(session.token).toBeTruthy();
    await session.dispose();
  });

  test('recusa e-mail inválido sem fechar o formulário', async ({ page }) => {
    await page.goto('/adm/usuarios');
    await searchListing(page, user.email);
    await cardOf(page, 'users', 'user-card', user.id).getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('users-user-form-dialog');
    await replaceText(dialog.getByLabel('E-mail'), 'nao-e-email');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).toBeVisible();
    const after = await api.get<User>(`/users/${user.id}`);
    expect(after.email).toBe(user.email);
  });
});
