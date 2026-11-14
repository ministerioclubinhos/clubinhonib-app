import { expect, test } from '@playwright/test';

/**
 * Página de descadastro dos avisos por e-mail (`/descadastrar?token=…`).
 *
 * Provedores abrem os links das mensagens antes de a pessoa clicar; por isso
 * abrir a página não descadastra ninguém — só o botão manda o `POST`.
 */
test.describe('Descadastro de avisos', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('não descadastra ao abrir: explica e pede confirmação', async ({ page }) => {
    const posts: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/email-preferences/unsubscribe')) posts.push(request.url());
    });

    await page.goto('/descadastrar?token=abc.def');
    await expect(page.getByRole('button', { name: /não quero mais receber/i })).toBeEnabled();
    await expect(page.getByText(/novos materiais da semana/i)).toBeVisible();
    await expect(page.getByText(/recuperação de senha e de confirmação/i)).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(posts).toHaveLength(0);
  });

  test('descadastra com o token da URL quando a pessoa confirma', async ({ page }) => {
    await page.goto('/descadastrar?token=abc.def');
    const request = page.waitForRequest((req) => req.method() === 'POST' && req.url().includes('/email-preferences/unsubscribe'));
    await page.getByRole('button', { name: /não quero mais receber/i }).click();
    const sent = await request;
    expect(sent.postDataJSON()).toEqual({ token: 'abc.def' });

    // O token de teste não vale: a falha aparece na própria página, sem toast global.
    const response = await sent.response();
    expect(response?.status()).toBeGreaterThanOrEqual(400);
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('sem token, o botão fica desabilitado', async ({ page }) => {
    await page.goto('/descadastrar');
    await expect(page.getByRole('button', { name: /não quero mais receber/i })).toBeDisabled();
  });
});
