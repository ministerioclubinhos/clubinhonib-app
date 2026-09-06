import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, searchListing } from '../support/ui';

type User = { id: string; name: string; email: string };

/**
 * Componentes compartilhados das listagens (`ListingLayout`, `ListingToolbar`,
 * `ListingCard`), vistos pela tela de usuários, que usa os três.
 *
 * Eram testes de componente isolado; aqui o que se prova é o mesmo contrato
 * com a tela real: seletor de domínio na raiz, resumo, ações com nome
 * acessível, clique na ação sem abrir o card e a barra no celular.
 */
test.describe('Listagens: layout, barra e card', () => {
  let api: ApiClient;
  let user: User;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    user = await api.post<User>('/users', {
      name: `E2E Listagem ${suffix}`,
      email: `e2e.listagem.${suffix}@teste.clubinhonib.com`,
      password: 'Senha123@',
      phone: '11999990000',
      role: 'teacher',
      active: true,
      completed: false,
      commonUser: true,
    });
  });

  test.afterAll(async () => {
    await api.delete(`/users/${user.id}`).catch(() => undefined);
    await api.dispose();
  });

  test('a raiz leva o seletor de domínio e o resumo conta o que a busca trouxe', async ({ page }) => {
    await page.goto('/adm/usuarios');
    const layout = page.getByTestId('users-users-manager');
    await expect(layout).toBeVisible();
    await expect(layout.getByTestId('listing-listing-toolbar')).toBeVisible();

    await searchListing(page, user.email);
    await expect(layout.getByText('1 usuário(s) encontrado(s)')).toBeVisible();

    const card = cardOf(page, 'users', 'user-card', user.id);
    await expect(card).toBeVisible();
    await expect(card).toContainText(user.name);
    await expect(card).toContainText(user.email);
  });

  test('o card expõe as ações com nome acessível e a ação não abre os detalhes', async ({ page }) => {
    await page.goto('/adm/usuarios');
    await searchListing(page, user.email);
    const card = cardOf(page, 'users', 'user-card', user.id);
    await expect(card).toBeVisible();

    for (const name of ['Ver detalhes', 'Editar', 'Excluir']) {
      await expect(card.getByRole('button', { name, exact: true })).toBeVisible();
    }

    // Clicar em "Editar" abre o formulário, e não o diálogo de detalhes do card.
    await card.getByRole('button', { name: 'Editar', exact: true }).click();
    await expect(page.getByTestId('users-user-form-dialog')).toBeVisible();
    await expect(page.getByTestId('users-user-view-dialog')).toHaveCount(0);
  });

  test('mostra o estado vazio quando a busca não traz ninguém', async ({ page }) => {
    await page.goto('/adm/usuarios');
    await searchListing(page, `ninguem-${suffix}-${Date.now()}`);
    await expect(page.getByText('Nenhum usuário encontrado')).toBeVisible();
  });

  test('no celular, a ação principal fica à mão e os filtros ficam recolhidos', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/adm/usuarios');
    const layout = page.getByTestId('users-users-manager');
    await expect(layout).toBeVisible();

    await expect(layout.getByRole('button', { name: /novo usuário/i })).toBeVisible();
    // Os filtros só abrem pelo botão; nenhum seletor de filtro fica aberto.
    await expect(layout.getByRole('button', { name: /^(Filtros|Mais filtros)$/ })).toBeVisible();
    await expect(layout.getByRole('combobox', { name: 'Papel' })).toHaveCount(0);
  });

  test('no desktop, busca e filtros já aparecem abertos', async ({ page }) => {
    await page.goto('/adm/usuarios');
    const layout = page.getByTestId('users-users-manager');
    await expect(layout.getByRole('textbox', { name: /buscar/i }).or(layout.getByPlaceholder(/buscar/i)).first()).toBeVisible();
    await expect(layout.getByRole('combobox', { name: 'Papel' })).toBeVisible();
  });
});
