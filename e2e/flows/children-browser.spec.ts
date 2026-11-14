import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { childInList, removeChild, seedChild, type SeededChild } from '../support/children';

/**
 * Lista da área das crianças (`/area-das-criancas`), contra a API real.
 *
 * Cada teste cria a própria criança, com nome e telefone únicos, e a apaga no
 * fim. A busca pelo nome único é o que isola o teste do resto do banco.
 */
let api: ApiClient;
let child: SeededChild | undefined;

test.beforeAll(async () => {
  api = await ApiClient.login();
});

test.afterEach(async () => {
  await removeChild(api, child);
  child = undefined;
});

test.afterAll(async () => {
  await api.dispose();
});

const search = 'Buscar por nome ou telefone do responsável…';

test.describe('Área das crianças: lista', () => {
  test('busca e filtros ficam na URL e voltam ao recarregar', async ({ page }) => {
    child = await seedChild(api);
    await page.goto('/area-das-criancas');

    await page.getByPlaceholder(search).fill(child.name);
    await expect(page).toHaveURL(/busca=/);
    await expect(page.getByTestId('pagela-teacher-child-card')).toHaveCount(1);
    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Ativas' }).click();
    await expect(page).toHaveURL(/ativas=true/);

    await page.reload();
    await expect(page.getByPlaceholder(search)).toHaveValue(child.name);
    await expect(page.getByTestId('pagela-teacher-child-card')).toHaveCount(1);
    await expect(page.getByText(child.name)).toBeVisible();

    // Abrir a criança e voltar devolve a lista como estava.
    await page.getByText(child.name).click();
    await expect(page).toHaveURL(new RegExp(`/area-das-criancas/${child.id}`));
    await page.goBack();
    await expect(page.getByPlaceholder(search)).toHaveValue(child.name);
    await expect(page).toHaveURL(/ativas=true/);
  });

  test('a busca acha pelo telefone digitado com máscara', async ({ page }) => {
    child = await seedChild(api);
    const phone = child.guardianPhone;
    const masked = `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;

    await page.goto('/area-das-criancas');
    await page.getByPlaceholder(search).fill(masked);

    await expect(page.getByTestId('pagela-teacher-child-card')).toHaveCount(1);
    await expect(page.getByText(child.name)).toBeVisible();
  });

  test('página que não existe recua para a última que tem criança', async ({ page }) => {
    child = await seedChild(api);
    await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}&pagina=3`);

    await expect(page.getByText(child.name)).toBeVisible();
    await expect(page).not.toHaveURL(/pagina=/);
  });

  test('desativar pela tela grava na API e o filtro de desativadas a encontra', async ({ page }) => {
    child = await seedChild(api);
    await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}`);
    await expect(page.getByText(child.name)).toBeVisible();

    await page.getByRole('switch', { name: 'Desativar criança' }).click();
    await page.getByRole('dialog').getByRole('button', { name: /^Desativar/ }).click();
    await expect(page.getByText('Criança desativada com sucesso')).toBeVisible();

    expect((await childInList(api, child)).isActive).toBe(false);

    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Desativadas' }).click();
    await expect(page.getByText(child.name)).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Ativar criança' })).toBeVisible();

    // Reativar pela mesma tela devolve a situação.
    await page.getByRole('switch', { name: 'Ativar criança' }).click();
    await page.getByRole('dialog').getByRole('button', { name: /^Ativar/ }).click();
    await expect(page.getByText('Criança ativada com sucesso')).toBeVisible();
    expect((await childInList(api, child)).isActive).toBe(true);
  });
});
