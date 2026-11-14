import { expect, Page, test } from '@playwright/test';

/**
 * Menu lateral do painel (`AdminLayout`): a seção da rota atual abre sozinha e
 * o agrupamento segue o dashboard (ideias junto dos materiais; Conteúdo só com
 * criação e publicações).
 */
function section(page: Page, title: string) {
  return page.getByTestId('adm-admin-layout').getByRole('button', { name: title, exact: true });
}

/** O conteúdo da seção: a região que vem logo depois do cabeçalho do acordeão. */
function sectionItems(page: Page, title: string) {
  return page
    .getByTestId('adm-admin-layout')
    .getByRole('heading', { name: title, exact: true })
    .locator('xpath=following-sibling::*[1]');
}

test.describe('Painel: menu lateral', () => {
  const cases: [string, string][] = [
    ['/adm/controle-clubinhos', 'Operacional'],
    ['/adm/estatisticas', 'Operacional'],
    ['/adm/paginas-materiais-semanais', 'Materiais'],
    ['/adm/paginas-ideias', 'Materiais'],
    ['/adm/criar-pagina', 'Conteúdo'],
    ['/adm/coordenadores', 'Pessoas'],
  ];

  for (const [path, title] of cases) {
    test(`abre ${title} em ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByTestId('adm-admin-layout')).toBeVisible();
      await expect(section(page, title)).toHaveAttribute('aria-expanded', 'true');
      for (const other of ['Operacional', 'Materiais', 'Conteúdo', 'Pessoas'].filter((t) => t !== title)) {
        await expect(section(page, other)).toHaveAttribute('aria-expanded', 'false');
      }
    });
  }

  test('agrupa ideias com materiais e deixa Conteúdo com criação e publicações', async ({ page }) => {
    await page.goto('/adm/paginas-ideias');
    const materiais = sectionItems(page, 'Materiais');
    await expect(materiais.getByText('Materiais semanais')).toBeVisible();
    await expect(materiais.getByText('Páginas de ideias')).toBeVisible();
    await expect(materiais.getByText('Ideias compartilhadas')).toBeVisible();

    await section(page, 'Conteúdo').click();
    const conteudo = sectionItems(page, 'Conteúdo');
    await expect(conteudo.getByText('Criar Página')).toBeVisible();
    await expect(conteudo.getByText('Meditações')).toBeVisible();
    await expect(conteudo.getByText('Materiais semanais')).toHaveCount(0);
  });
});
