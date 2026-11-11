import { expect, Page, Route, test } from '@playwright/test';

/**
 * Lista da área das crianças (`/area-das-criancas`).
 *
 * A API é simulada. O que se prova: os filtros moram na URL, a página vazia
 * recua sozinha e a falha de uma ação aparece para quem a pediu.
 */
const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const child = (index: number) => ({
  id: `00000000-0000-4000-8000-00000000000${index}`,
  name: `Criança ${index}`,
  guardianName: 'Responsável',
  guardianPhone: '92999990000',
  gender: 'F',
  clubId: null,
  isActive: true,
  acceptedChrists: [],
});

async function mockChildren(page: Page) {
  const queries: URLSearchParams[] = [];
  await page.route('**/children/simple*', (route) => {
    const params = new URL(route.request().url()).searchParams;
    queries.push(params);
    // Só existe a página 1: pedir outra devolve vazio, como a API faz.
    const data = params.get('page') === '1' ? [child(1), child(2)] : [];
    return json(route, { data, meta: { totalItems: 2, totalPages: 1 } });
  });
  return queries;
}

test.describe('Área das crianças: lista', () => {
  test('filtros e busca ficam na URL e voltam ao recarregar', async ({ page }) => {
    const queries = await mockChildren(page);
    await page.goto('/area-das-criancas');
    await expect(page.getByText('Criança 1')).toBeVisible();

    await page.getByPlaceholder(/Buscar por nome/).fill('ana');
    await expect(page).toHaveURL(/busca=ana/);
    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Ativas' }).click();
    await expect(page).toHaveURL(/ativas=true/);

    await page.reload();
    await expect(page.getByPlaceholder(/Buscar por nome/)).toHaveValue('ana');
    await expect.poll(() => queries.at(-1)?.get('searchString')).toBe('ana');
    expect(queries.at(-1)?.get('isActive')).toBe('true');
  });

  test('página que ficou vazia recua para a última que existe', async ({ page }) => {
    await mockChildren(page);
    await page.goto('/area-das-criancas?pagina=3');

    await expect(page.getByText('Criança 1')).toBeVisible();
    await expect(page).not.toHaveURL(/pagina=/);
  });

  test('falha ao desativar aparece na tela', async ({ page }) => {
    await mockChildren(page);
    await page.route('**/children/*/toggle-active', (route) =>
      json(
        route,
        { success: false, error: { code: 'CHILD_7002', message: 'Sem acesso à criança informada' } },
        403,
      ),
    );
    await page.goto('/area-das-criancas');
    await expect(page.getByText('Criança 1')).toBeVisible();

    await page.getByRole('switch', { name: 'Desativar criança' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: /^Desativar/ }).click();

    await expect(page.getByText('Sem acesso à criança informada')).toBeVisible();
  });
});
