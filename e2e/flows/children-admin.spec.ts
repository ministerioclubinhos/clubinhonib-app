import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { currentUser, removeChild, seedChild, type SeededChild } from '../support/children';
import { COORDINATOR_EMAIL, COORDINATOR_PASSWORD, TEACHER_EMAIL, TEACHER_PASSWORD } from '../support/env';

/**
 * Cadastro de crianças no painel (`/adm/criancas`), contra a API real.
 *
 * Cada teste cria a própria criança e a apaga no fim.
 */
let api: ApiClient;
let child: SeededChild | undefined;

interface ChildDetail {
  id: string;
  isActive: boolean;
  createdBy: { id: string; name: string } | null;
  updatedBy: { id: string; name: string } | null;
  address: { street: string | null; number: string | null; complement: string | null; postalCode: string | null; city: string } | null;
}

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

test.describe('Painel de crianças', () => {
  test('campo de endereço apagado na edição é limpo de verdade', async ({ page }) => {
    child = await seedChild(api);
    await page.goto('/adm/criancas');
    await page.getByPlaceholder('Buscar por nome, responsável ou telefone…').fill(child.name);

    const card = page.getByTestId(`children-child-card-${child.id}`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const form = page.getByTestId('children-child-form-dialog');
    await expect(form.getByLabel('Complemento')).toHaveValue('Bloco E2E');
    await form.getByLabel('Complemento').fill('');
    await form.getByLabel('Número').fill('');
    await form.getByRole('button', { name: 'Salvar' }).click();
    await expect(form).toBeHidden();

    const saved = await api.get<ChildDetail>(`/children/${child.id}`);
    expect(saved.address?.complement ?? '').toBe('');
    expect(saved.address?.number ?? '').toBe('');
    // O que não foi apagado continua lá.
    expect(saved.address).toMatchObject({ street: 'Rua do Teste', city: 'Manaus' });

    // Reabrir mostra o campo vazio — antes o valor antigo voltava.
    await card.getByRole('button', { name: 'Editar' }).click();
    await expect(form.getByLabel('Complemento')).toHaveValue('');
  });

  test('a busca do painel acha pelo telefone com máscara e não confunde nome com telefone', async ({ page }) => {
    child = await seedChild(api);
    const phone = child.guardianPhone;
    await page.goto('/adm/criancas');
    const search = page.getByPlaceholder('Buscar por nome, responsável ou telefone…');

    await search.fill(`(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`);
    await expect(page.getByTestId(`children-child-card-${child.id}`)).toBeVisible();
    await expect(page.locator('[data-testid^="children-child-card-"]')).toHaveCount(1);

    // O nome de teste tem letras e números: é busca por nome, e só ela aparece.
    await search.fill(child.name);
    await expect(page.locator('[data-testid^="children-child-card-"]')).toHaveCount(1);
  });

  for (const [role, email, password] of [
    ['professor', TEACHER_EMAIL, TEACHER_PASSWORD],
    ['coordenador', COORDINATOR_EMAIL, COORDINATOR_PASSWORD],
  ] as const) {
    test(`${role} não cadastra criança sem clubinho`, async ({ request }) => {
      const login = await request.post(`${process.env.E2E_API_URL ?? 'http://localhost:3000'}/auth/login`, {
        data: { email, password },
      });
      test.skip(!login.ok(), `usuário de automação (${role}) não existe neste banco`);
      const scoped = await ApiClient.login(email, password);

      const refused = await scoped.send('POST', '/children', {
        name: 'E2E Sem Clubinho',
        birthDate: '2018-05-10',
        guardianName: 'Responsável E2E',
        gender: 'F',
      });
      await scoped.dispose();

      expect(refused).toMatchObject({ status: 403, code: 'CHILD_7002' });
    });
  }

  test('o cadastro guarda quem criou e quem alterou, e a ficha mostra os nomes', async ({ page }) => {
    child = await seedChild(api);
    const me = await currentUser(api);

    const created = await api.get<ChildDetail>(`/children/${child.id}`);
    expect(created.createdBy).toEqual({ id: me.id, name: me.name });

    // Desativar também é uma alteração do cadastro, e fica com autor.
    await api.patch(`/children/${child.id}/toggle-active`);
    const changed = await api.get<ChildDetail>(`/children/${child.id}`);
    expect(changed.isActive).toBe(false);
    expect(changed.createdBy).toEqual({ id: me.id, name: me.name });
    expect(changed.updatedBy).toEqual({ id: me.id, name: me.name });

    await page.goto('/adm/criancas');
    await page.getByPlaceholder('Buscar por nome, responsável ou telefone…').fill(child.name);
    const card = page.getByTestId(`children-child-card-${child.id}`);
    await card.getByRole('button', { name: 'Ver detalhes' }).click();
    await expect(page.getByTestId('child-created-by')).toHaveText(`por ${me.name}`);
    await expect(page.getByTestId('child-updated-by')).toHaveText(`por ${me.name}`);
  });

  test('o administrador cadastra sem clubinho', async () => {
    child = await seedChild(api);
    const saved = await api.get<ChildDetail & { club: unknown }>(`/children/${child.id}`);
    expect(saved.club).toBeNull();
  });
});
