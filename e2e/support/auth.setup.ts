import { expect, test as setup } from '@playwright/test';

import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_STORAGE } from './env';

/**
 * Login do administrador pela tela, uma vez por rodada.
 *
 * A sessão fica em `redux-persist` (localStorage), então guardar o estado do
 * navegador é o que permite aos demais testes começarem já logados.
 */
setup('login do administrador', async ({ page }) => {
  // Email/password tests do not need the Google widget. Its remote iframe
  // makes storageState wait on an unrelated origin when that host is slow.
  await page.context().route('https://accounts.google.com/**', (route) => route.abort());
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  // Os campos têm `aria-label` no contêiner e rótulo no input; o papel do
  // controle é o seletor que não colide.
  await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('main').getByRole('button', { name: 'Entrar' }).click();

  await expect(page).not.toHaveURL(/\/login$/);
  await page.goto('/adm', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('adm-admin-layout')).toBeVisible();

  await page.context().storageState({ path: ADMIN_STORAGE });
});
