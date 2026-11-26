import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { childInList, launchWindow, pagelaBody, removeChild, seedChild, type SeededChild } from '../support/children';

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

/**
 * Cenários de paginação, filtros, cadastro, edição e exclusão da lista, no
 * computador e no celular. Usam um prefixo único: a busca por ele isola as
 * crianças do teste do resto do banco.
 */
const cards = (page: import('@playwright/test').Page) => page.getByTestId('pagela-teacher-child-card');

async function seedGroup(count: number): Promise<{ prefix: string; kids: SeededChild[] }> {
  const prefix = `E2E Lista ${uniqueSuffix()}`;
  const kids: SeededChild[] = [];
  for (let index = 0; index < count; index += 1) {
    kids.push(await seedChild(api, { name: `${prefix} ${String.fromCharCode(65 + index)}` }));
    // O telefone único usa o relógio: um instante entre as criações evita repetir.
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  return { prefix, kids };
}

async function removeGroup(kids: SeededChild[]): Promise<void> {
  for (const kid of kids) await removeChild(api, kid);
}

test.describe('Área das crianças: celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('mostra 6 crianças por página e navega para a segunda', async ({ page }) => {
    const { prefix, kids } = await seedGroup(7);
    try {
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(prefix)}`);
      await expect(cards(page)).toHaveCount(6);
      await expect(page.getByRole('navigation').getByRole('button', { name: /2/ }).first()).toBeVisible();

      await page.getByRole('navigation').getByRole('button', { name: /2/ }).first().click();
      await expect(page).toHaveURL(/pagina=2/);
      await expect(cards(page)).toHaveCount(1);

      // Recarregar na página 2 continua nela.
      await page.reload();
      await expect(cards(page)).toHaveCount(1);
    } finally {
      await removeGroup(kids);
    }
  });

  test('o botão de adicionar fica no topo e os filtros começam recolhidos', async ({ page }) => {
    await page.goto('/area-das-criancas');
    await expect(page.getByTestId('children-browser-add-button')).toBeVisible();
    await expect(page.getByTestId('children-browser-add-fab')).toHaveCount(0);

    const toggle = page.getByTestId('children-browser-filters-toggle');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('combobox', { name: 'Status' })).toBeHidden();

    await toggle.click();
    await expect(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Ativas' }).click();
    await expect(page).toHaveURL(/ativas=true/);
    // O contador do botão mostra quantos filtros valem.
    await expect(toggle.locator('.MuiBadge-badge')).toHaveText('1');
  });

  test('os controles têm alvo de toque de 44 px e a página não rola de lado', async ({ page }) => {
    const { prefix, kids } = await seedGroup(1);
    try {
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(prefix)}`);
      await expect(cards(page)).toHaveCount(1);

      const targets = [
        page.getByRole('button', { name: 'Voltar para a página anterior' }),
        page.getByTestId('children-browser-add-button'),
        page.getByTestId('children-browser-filters-toggle'),
        page.getByRole('button', { name: 'Editar criança' }),
        page.getByRole('button', { name: 'Registrar decisão' }),
      ];
      for (const target of targets) {
        const box = await target.boundingBox();
        expect(box, 'alvo sem caixa na tela').not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(43.5);
        expect(box!.height).toBeGreaterThanOrEqual(43.5);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    } finally {
      await removeGroup(kids);
    }
  });

  test('o formulário de cadastro abre em tela cheia', async ({ page }) => {
    await page.goto('/area-das-criancas');
    await page.getByTestId('children-browser-add-button').click();
    const paper = page.getByTestId('children-child-form-dialog').locator('.MuiDialog-paper');
    await expect(paper).toBeVisible();
    const box = await paper.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(388);
    expect(box!.height).toBeGreaterThanOrEqual(840);
  });
});

test.describe('Área das crianças: computador', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('mostra até 10 por página, com o botão no cabeçalho e os filtros à vista', async ({ page }) => {
    const { prefix, kids } = await seedGroup(4);
    try {
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(prefix)}`);
      await expect(cards(page)).toHaveCount(4);
      await expect(page.getByRole('navigation')).toHaveCount(0);
      await expect(page.getByTestId('children-browser-add-button')).toContainText('Adicionar criança');
      await expect(page.getByTestId('children-browser-add-fab')).toHaveCount(0);
      await expect(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
    } finally {
      await removeGroup(kids);
    }
  });
});

test.describe('Área das crianças: ordem por assiduidade', () => {
  test('as mais assíduas vêm primeiro, quem nunca veio por último e o empate segue o nome', async ({ page }) => {
    const launch = await launchWindow(api);
    test.skip(!launch.open || (launch.currentWeek ?? 0) < 3, 'precisa de período aberto com 3 semanas');
    const week = launch.currentWeek ?? 3;

    // Nomes em ordem alfabética contrária à assiduidade: A nunca veio, D veio 3 vezes.
    const { prefix, kids } = await seedGroup(4);
    try {
      const [never, absent, once, often] = kids;
      for (const w of [week, week - 1, week - 2]) await api.post('/pagelas', pagelaBody(often.id, launch, { week: w }));
      await api.post('/pagelas', pagelaBody(once.id, launch));
      // Pagela com falta não conta como presença.
      await api.post('/pagelas', pagelaBody(absent.id, launch, { present: false }));
      await api.post('/pagelas', pagelaBody(absent.id, launch, { week: week - 1, present: false }));

      const apiPage = await api.get<{ data: { id: string }[] }>('/children/simple', { searchString: prefix, page: 1, limit: 10 });
      expect(apiPage.data.map((row) => row.id)).toEqual([often.id, once.id, never.id, absent.id]);

      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(prefix)}`);
      const names = page.getByTestId('pagela-teacher-child-card');
      await expect(names).toHaveCount(4);
      await expect(names.nth(0)).toContainText(often.name);
      await expect(names.nth(1)).toContainText(once.name);
      await expect(names.nth(2)).toContainText(never.name);
      await expect(names.nth(3)).toContainText(absent.name);
    } finally {
      await removeGroup(kids);
    }
  });

  test('a paginação mantém a ordem entre as páginas', async () => {
    const launch = await launchWindow(api);
    test.skip(!launch.open, 'período letivo fechado');
    const { prefix, kids } = await seedGroup(3);
    try {
      await api.post('/pagelas', pagelaBody(kids[2].id, launch));
      const first = await api.get<{ data: { id: string }[] }>('/children/simple', { searchString: prefix, page: 1, limit: 2 });
      const second = await api.get<{ data: { id: string }[] }>('/children/simple', { searchString: prefix, page: 2, limit: 2 });
      expect([...first.data, ...second.data].map((row) => row.id)).toEqual([kids[2].id, kids[0].id, kids[1].id]);
    } finally {
      await removeGroup(kids);
    }
  });
});

test.describe('Área das crianças: busca, filtros e estados', () => {
  test('busca sem resultado mostra o estado vazio e limpar filtros devolve a lista', async ({ page }) => {
    await page.goto('/area-das-criancas');
    await expect(cards(page).first()).toBeVisible().catch(() => undefined);

    await page.getByPlaceholder(search).fill(`nao-existe-${uniqueSuffix()}`);
    await expect(page.getByTestId('children-browser-empty')).toContainText('Nenhuma criança encontrada');
    await expect(page.getByTestId('children-browser-clear-filters')).toBeEnabled();

    await page.getByTestId('children-browser-clear-filters').click();
    await expect(page.getByPlaceholder(search)).toHaveValue('');
    await expect(page.getByTestId('children-browser-empty')).toHaveCount(0);
    await expect(page).not.toHaveURL(/busca=/);
  });

  test('o filtro de desativadas separa as crianças e a contagem acompanha', async ({ page }) => {
    const { prefix, kids } = await seedGroup(3);
    try {
      await api.patch(`/children/${kids[0].id}/toggle-active`);
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(prefix)}`);
      await expect(cards(page)).toHaveCount(3);

      await page.getByRole('combobox', { name: 'Status' }).click();
      await page.getByRole('option', { name: 'Desativadas' }).click();
      await expect(cards(page)).toHaveCount(1);
      await expect(page.getByText(kids[0].name)).toBeVisible();
      await expect(page.getByText('Selecionar criança (1)')).toBeVisible();

      await page.getByRole('combobox', { name: 'Status' }).click();
      await page.getByRole('option', { name: 'Ativas' }).click();
      await expect(cards(page)).toHaveCount(2);
    } finally {
      await removeGroup(kids);
    }
  });

  test('toque no cartão abre as pagelas da criança certa', async ({ page }) => {
    const { prefix, kids } = await seedGroup(2);
    try {
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(prefix)}`);
      await page.getByText(kids[1].name).click();
      await expect(page).toHaveURL(new RegExp(`/area-das-criancas/${kids[1].id}`));
      await expect(page.getByRole('heading', { name: kids[1].name })).toBeVisible();
    } finally {
      await removeGroup(kids);
    }
  });
});

test.describe('Área das crianças: cadastro, edição e exclusão', () => {
  test('cadastra pela tela: valida os obrigatórios e grava na API', async ({ page }) => {
    const name = `E2E Cadastro ${uniqueSuffix()}`;
    await page.goto('/area-das-criancas');
    await page.getByRole('button', { name: 'Adicionar criança' }).first().click();

    const form = page.getByTestId('children-child-form-dialog');
    await expect(form).toBeVisible();
    // Sem os obrigatórios o cadastro não segue e nada é criado.
    await form.getByRole('button', { name: 'Cadastrar' }).click();
    await expect(form).toBeVisible();

    await form.getByLabel('Nome').fill(name);
    await form.getByRole('combobox', { name: 'Sexo' }).click();
    await page.getByRole('option').first().click();
    // A data é digitada seção a seção: o primeiro campo de data é o Nascimento.
    await form.getByRole('spinbutton', { name: /^(Dia|Day)/ }).first().click();
    await page.keyboard.type('10052018');
    await form.getByLabel('Responsável').fill('Responsável do cadastro');
    await form.getByLabel('Bairro').fill('Centro');
    await form.getByLabel('Cidade').fill('Manaus');
    await form.getByLabel('UF').fill('AM');
    await form.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText('Criança cadastrada com sucesso!')).toBeVisible();
    await expect(form).toBeHidden();

    const found = await api.get<{ data: { id: string; name: string; guardianName: string }[] }>('/children/simple', {
      searchString: name,
      page: 1,
      limit: 5,
    });
    expect(found.data).toHaveLength(1);
    expect(found.data[0].guardianName).toBe('Responsável do cadastro');
    await api.delete(`/children/${found.data[0].id}`);
  });

  test('edita pela tela e a lista mostra o novo nome', async ({ page }) => {
    child = await seedChild(api);
    await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}`);
    await page.getByRole('button', { name: 'Editar criança' }).click();

    const form = page.getByTestId('children-child-form-dialog');
    await expect(form.getByLabel('Nome')).toHaveValue(child.name);
    const renamed = `${child.name} Editada`;
    await form.getByLabel('Nome').fill(renamed);
    await form.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText('Criança atualizada com sucesso!')).toBeVisible();
    expect((await api.get<{ name: string }>(`/children/${child.id}`)).name).toBe(renamed);
  });

  test('administrador exclui só depois de confirmar; cancelar mantém a criança', async ({ page }) => {
    child = await seedChild(api);
    await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}`);

    await page.getByRole('button', { name: 'Excluir criança' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    expect(await api.statusOf(`/children/${child.id}`)).toBe(200);

    await page.getByRole('button', { name: 'Excluir criança' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Criança excluída com sucesso!')).toBeVisible();
    await expect(page.getByTestId('children-browser-empty')).toBeVisible();
    expect(await api.statusOf(`/children/${child.id}`)).toBe(404);
    child = undefined;
  });
});
