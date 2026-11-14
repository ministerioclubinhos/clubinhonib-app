import { expect, test } from '@playwright/test';

/**
 * Navegação de pagelas (`/adm/pagelas`, hooks de `pagela-clubs`).
 *
 * O efeito de busca dependia de um objeto recriado a cada render e se repetia
 * em laço. Aqui a prova é pela rede: uma busca de clubinhos ao abrir, e nada
 * de pagelas enquanto não há criança escolhida.
 */
test.describe('Pagelas: navegação', () => {
  test('busca os clubinhos uma vez só e não busca pagela sem criança escolhida', async ({ page }) => {
    const clubRequests: string[] = [];
    const pagelaRequests: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (request.method() !== 'GET') return;
      if (url.pathname === '/clubs') clubRequests.push(request.url());
      if (url.pathname === '/pagelas') pagelaRequests.push(request.url());
    });

    await page.goto('/adm/pagelas');
    await expect(page.getByTestId('pagela-clubs-pagela-clubs-manager')).toBeVisible();
    await page.waitForLoadState('networkidle');
    // Um instante a mais: um laço de refetch se revelaria aqui.
    await page.waitForTimeout(1500);

    expect(clubRequests).toHaveLength(1);
    expect(pagelaRequests).toHaveLength(0);
  });
});
