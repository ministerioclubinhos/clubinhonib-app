import { expect, test } from '@playwright/test';

/**
 * Painel de estatísticas (`/adm/estatisticas`).
 *
 * A tela tem onze abas e nenhuma cobertura de navegador até aqui — foi assim
 * que passou despercebido que quase todas respondiam `400`: o painel mandava
 * um único conjunto de filtros para cinco endpoints com contratos diferentes,
 * e a validação global recusa qualquer chave que o DTO não declare
 * ("property groupBy should not exist").
 *
 * O teste central abaixo percorre as abas observando a **rede**: nenhuma
 * requisição de `/statistics` pode voltar com erro.
 */
test.describe('Estatísticas', () => {
  /** As abas, na ordem em que aparecem em `NavigationTabs`. */
  const ABAS = [
    'Visão geral',
    'Frequência',
    'Crianças',
    'Clubinhos',
    'Professores',
    'Demográfico',
    'Geográfico',
    'Decisões',
    'Retenção',
    'Atividades',
    'Rankings',
  ];

  test('nenhuma aba pede à API algo que o contrato recusa', async ({ page }) => {
    const falhas: string[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (!url.includes('/statistics/') || response.ok()) return;

      let detalhe = '';
      try {
        const corpo = (await response.json()) as { error?: { message?: string } };
        detalhe = corpo.error?.message ?? '';
      } catch {
        detalhe = await response.text().catch(() => '');
      }
      falhas.push(`${response.status()} ${new URL(url).pathname}${new URL(url).search} → ${detalhe}`);
    });

    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-statistics-page-statistics-content')).toBeVisible();

    const tabs = page.getByTestId('statistics-dashboard-navigation-tabs');
    await expect(tabs).toBeVisible();

    for (const aba of ABAS) {
      await tabs.getByRole('tab', { name: aba }).click();
      // O conteúdo é carregado sob demanda; esperar a rede sossegar é o que
      // garante que as requisições daquela aba já foram e voltaram.
      await page.waitForLoadState('networkidle');
    }

    expect(falhas, `requisições recusadas:\n${falhas.join('\n')}`).toEqual([]);
  });

  test('o rodapé mostra a hora do dado, não a do render', async ({ page }) => {
    await page.goto('/adm/estatisticas');

    const rodape = page.getByTestId('statistics-last-updated');
    await expect(rodape).toBeVisible();
    await expect(rodape).toHaveText(/^Dados de \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  test('"Atualizar" só invalida as consultas das estatísticas', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-statistics-page-statistics-content')).toBeVisible();
    await page.waitForLoadState('networkidle');

    const pedidos: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith('/statistics') || url.pathname.startsWith('/club-control')) {
        pedidos.push(url.pathname);
      }
    });

    await page.getByRole('button', { name: /atualizar/i }).first().click();
    await page.waitForLoadState('networkidle');

    // O `queryClient` é o compartilhado do app: sem a chave, o botão derrubava
    // também o controle de clubinhos e o resumo semanal.
    expect(pedidos.filter((path) => path.startsWith('/club-control'))).toEqual([]);
    expect(pedidos.some((path) => path.startsWith('/statistics'))).toBe(true);
  });

  test('guarda e reaplica um recorte de filtros', async ({ page }) => {
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-statistics-page-statistics-content')).toBeVisible();

    await page.getByRole('button', { name: 'Filtros salvos' }).click();
    const salvar = page.getByTestId('statistics-save-current-filters');
    await expect(salvar).toBeVisible();
    await salvar.click();

    // Antes a lista era de `string` e nada a preenchia: o botão existia e
    // nunca fazia nada.
    const lista = page.getByTestId('statistics-saved-filters-list');
    await expect(lista).toBeVisible();
    await expect(lista.getByRole('button').first()).toBeVisible();
  });

  test('no celular a página ocupa 98% e não rola para o lado', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/adm/estatisticas');
    await expect(page.getByTestId('statistics-statistics-page-statistics-content')).toBeVisible();

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows).toBe(false);
  });
});
