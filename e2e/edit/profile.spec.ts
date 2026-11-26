import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../support/env';
import { replaceText } from '../support/ui';

type MyProfile = { id: string; name: string; phone: string; personalData?: { gaLeaderName?: string }; preferences?: { favoriteColor?: string } };

/**
 * Meu perfil (`/meu-perfil`): a conta, os dados pessoais, as preferências e
 * a senha do próprio administrador. Cada seção é uma entrada do menu lateral.
 */
test.describe('Meu perfil: edição', () => {
  let api: ApiClient;
  let original: MyProfile;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    original = await api.get<MyProfile>('/profile');
  });

  test.afterAll(async () => {
    await api.patch('/profile', { name: original.name, phone: original.phone });
    await api.dispose();
  });

  test('edita nome e telefone na aba Informações da Conta', async ({ page }) => {
    await page.goto('/meu-perfil');
    await expect(page.getByTestId('profile-profile-page')).toBeVisible();
    await page.getByRole('button', { name: 'Informações da Conta' }).click();
    const form = page.getByTestId('profile-profile-edit-form');
    await expect(form).toBeVisible();
    await replaceText(form.getByLabel('Nome Completo'), `${original.name.split(' (')[0]} (e2e)`);
    await replaceText(form.getByLabel('Telefone'), '(11) 98888-7777');
    await form.getByRole('button', { name: 'Salvar' }).click();

    await expect.poll(async () => api.get<MyProfile>('/profile')).toMatchObject({ name: `${original.name.split(' (')[0]} (e2e)` });
    const after = await api.get<MyProfile>('/profile');
    expect(after.phone.replace(/\D/g, '')).toBe('11988887777');
  });

  test('edita dados pessoais e preferências', async ({ page }) => {
    await page.goto('/meu-perfil');
    await page.getByRole('button', { name: 'Dados Pessoais' }).click();
    const personal = page.getByTestId('profile-personal-data-form');
    await expect(personal).toBeVisible();
    await replaceText(personal.getByLabel('Nome do Líder de GA'), 'Líder E2E');
    await personal.getByRole('button', { name: 'Salvar' }).click();
    await expect.poll(async () => (await api.get<MyProfile>('/profiles/me')).personalData?.gaLeaderName).toBe('Líder E2E');

    await page.getByRole('button', { name: 'Minhas Preferências' }).click();
    const prefs = page.getByTestId('profile-preferences-form');
    await expect(prefs).toBeVisible();
    await replaceText(prefs.getByLabel('Cor Favorita'), 'Azul E2E');
    await prefs.getByRole('button', { name: 'Salvar' }).click();
    await expect.poll(async () => (await api.get<MyProfile>('/profiles/me')).preferences?.favoriteColor).toBe('Azul E2E');
  });

  test('troca a senha e a restaura', async ({ page }) => {
    await page.goto('/meu-perfil');
    await page.getByRole('button', { name: 'Alterar Senha' }).click();
    const form = page.getByTestId('profile-password-change-form');
    await expect(form).toBeVisible();
    // Os três campos são `type=password` na ordem: atual, nova, confirmação.
    const inputs = form.locator('input[type="password"]');
    await inputs.nth(0).fill(ADMIN_PASSWORD);
    await inputs.nth(1).fill('NovaSenhaE2E@1');
    await inputs.nth(2).fill('NovaSenhaE2E@1');
    await form.getByRole('button', { name: /Salvar|Alterar/ }).click();

    await expect.poll(async () => (await ApiClient.login(ADMIN_EMAIL, 'NovaSenhaE2E@1').catch(() => null)) !== null).toBe(true);
    const session = await ApiClient.login(ADMIN_EMAIL, 'NovaSenhaE2E@1');
    await session.patch('/profile/password', { currentPassword: 'NovaSenhaE2E@1', newPassword: ADMIN_PASSWORD });
    await session.dispose();
  });
});
