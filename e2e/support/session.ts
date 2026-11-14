import { Browser, expect, Page } from '@playwright/test';

/**
 * Abre um navegador limpo e faz login pela tela com outro papel.
 *
 * O projeto `chromium` já entra como administrador; os cenários que dependem
 * do que um coordenador ou professor enxerga usam este contexto à parte, sem
 * tocar no estado guardado em `e2e/.auth`.
 */
export async function loginAs(browser: Browser, email: string, password: string): Promise<Page> {
  const context = await browser.newContext({ storageState: undefined, locale: 'pt-BR' });
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  return page;
}
