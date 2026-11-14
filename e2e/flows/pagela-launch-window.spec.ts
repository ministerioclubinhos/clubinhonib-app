import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import {
  currentUser,
  launchWindow,
  pagelaBody,
  pagelasOf,
  removeChild,
  seedChild,
  type LaunchWindow,
  type SeededChild,
} from '../support/children';

/**
 * Regra do período letivo no lançamento de pagelas
 * (`/area-das-criancas/:childId`), contra a API real.
 *
 * Pagela só se lança dentro do período letivo, e a semana é a letiva — contada
 * do início do período —, não a do calendário. Cada teste cria a própria
 * criança e a apaga no fim.
 *
 * Os cenários de período **aberto** só fazem sentido com um período letivo
 * ativo cobrindo hoje; sem ele, são pulados com o motivo. O cenário de período
 * **fechado** desativa o período do ano por alguns segundos e o reativa em
 * seguida — por isso o arquivo roda em série.
 */
test.describe.configure({ mode: 'serial' });

let api: ApiClient;
let window: LaunchWindow;
let child: SeededChild | undefined;

test.beforeAll(async () => {
  api = await ApiClient.login();
  window = await launchWindow(api);
});

test.afterEach(async () => {
  await removeChild(api, child);
  child = undefined;
});

test.afterAll(async () => {
  await api.dispose();
});

const requireOpen = () =>
  test.skip(!window.open, `período letivo fechado hoje (${window.reason}): ${window.message ?? ''}`);

test.describe('Pagela: dentro do período letivo', () => {
  test('lança na semana letiva atual e grava o que a tela mostra', async ({ page }) => {
    requireOpen();
    child = await seedChild(api);
    await page.goto(`/area-das-criancas/${child.id}`);

    // A semana oferecida é a letiva de hoje, vinda da API — não a do calendário.
    await expect(page.getByTestId('pagela-week-select')).toHaveValue(String(window.currentWeek));
    await page.getByRole('checkbox', { name: /Presença/ }).check();
    await page.getByLabel('Observações').fill('Lançada pelo teste');
    await page.getByRole('button', { name: /Salvar/ }).click();
    await expect(page.getByText('Pagela salva!')).toBeVisible();

    const [saved] = await pagelasOf(api, child.id);
    expect(saved).toMatchObject({
      year: window.year,
      week: window.currentWeek,
      referenceDate: window.today,
      present: true,
      notes: 'Lançada pelo teste',
    });

    // Fica gravado quem lançou, e a tela mostra o nome.
    const me = await currentUser(api);
    expect(saved.createdBy).toEqual({ id: me.id, name: me.name });
    await expect(page.getByTestId('pagela-authorship')).toContainText(`Lançada por ${me.name}`);
  });

  test('a semana que já tem pagela vira edição e mantém a data do registro', async ({ page }) => {
    requireOpen();
    child = await seedChild(api);
    const created = await api.post<{ id: string; referenceDate: string }>(
      '/pagelas',
      pagelaBody(child.id, window, { notes: 'Original' }),
    );
    await page.goto(`/area-das-criancas/${child.id}`);

    await expect(page.getByText(/Editando/)).toBeVisible();
    await expect(page.getByLabel('Observações')).toHaveValue('Original');
    await page.getByRole('checkbox', { name: /Recitou o versículo/ }).check();
    await page.getByLabel('Observações').fill('Corrigida');
    await page.getByRole('button', { name: /Salvar/ }).click();
    await expect(page.getByText('Pagela atualizada!')).toBeVisible();

    const rows = await pagelasOf(api, child.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: created.id,
      referenceDate: created.referenceDate,
      week: window.currentWeek,
      recitedVerse: true,
      notes: 'Corrigida',
    });
  });

  test('criança ausente pode ter meditação e versículo marcados', async ({ page }) => {
    requireOpen();
    child = await seedChild(api);
    await page.goto(`/area-das-criancas/${child.id}`);

    await expect(page.getByTestId('pagela-week-select')).toHaveValue(String(window.currentWeek));
    await page.getByRole('checkbox', { name: /Fez meditação/ }).check();
    await page.getByRole('checkbox', { name: /Recitou o versículo/ }).check();
    await page.getByRole('button', { name: /Salvar/ }).click();
    await expect(page.getByText('Pagela salva!')).toBeVisible();

    const [saved] = await pagelasOf(api, child.id);
    expect(saved).toMatchObject({ present: false, didMeditation: true, recitedVerse: true });
  });

  test('a lista de semanas só oferece as que já aconteceram', async ({ page }) => {
    requireOpen();
    child = await seedChild(api);
    await page.goto(`/area-das-criancas/${child.id}`);

    await page.getByRole('combobox', { name: /Semana/ }).click();
    await expect(page.getByRole('option')).toHaveCount(window.currentWeek ?? 0);
    await expect(page.getByRole('option', { name: `Semana ${window.currentWeek} (atual)` })).toBeVisible();
    await expect(page.getByRole('option', { name: `Semana ${(window.currentWeek ?? 0) + 1}`, exact: true })).toHaveCount(0);
  });

  test('a API recusa semana futura, outro ano, data futura e segunda pagela na semana', async () => {
    requireOpen();
    child = await seedChild(api);
    const current = window.currentWeek ?? 1;

    const futureWeek = await api.send('POST', '/pagelas', pagelaBody(child.id, window, { week: current + 1 }));
    expect(futureWeek).toMatchObject({ status: 400, code: 'VAL_4005' });

    const otherYear = await api.send('POST', '/pagelas', pagelaBody(child.id, window, { year: (window.year ?? 0) - 1 }));
    expect(otherYear).toMatchObject({ status: 400, code: 'VAL_4005' });

    const futureDate = await api.send('POST', '/pagelas', pagelaBody(child.id, window, { referenceDate: '2999-01-01' }));
    expect(futureDate).toMatchObject({ status: 400, code: 'VAL_4005' });

    const first = await api.send('POST', '/pagelas', pagelaBody(child.id, window));
    expect(first.status).toBe(201);
    const duplicate = await api.send('POST', '/pagelas', pagelaBody(child.id, window));
    expect(duplicate.status).toBe(409);

    // Mover a pagela existente para uma semana futura também é recusado.
    const pagelaId = (first.body as { id: string }).id;
    const moved = await api.send('PATCH', `/pagelas/${pagelaId}`, { week: current + 1 });
    expect(moved).toMatchObject({ status: 400, code: 'VAL_4005' });
    expect(await pagelasOf(api, child.id)).toHaveLength(1);
  });
});

test.describe('Pagela: quem lançou e quem alterou', () => {
  test('a edição por outra pessoa registra quem alterou, sem trocar quem lançou', async ({ page }) => {
    requireOpen();
    const { COORDINATOR_EMAIL, COORDINATOR_PASSWORD } = await import('../support/env');
    const login = await page.request.post(`${process.env.E2E_API_URL ?? 'http://localhost:3000'}/auth/login`, {
      data: { email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD },
    });
    test.skip(!login.ok(), 'usuário de automação (coordenador) não existe neste banco');

    // Criança sem clubinho: fica ao alcance do coordenador também.
    child = await seedChild(api);
    const coordinator = await ApiClient.login(COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
    const author = await currentUser(coordinator);
    const created = await coordinator.post<{ id: string }>('/pagelas', pagelaBody(child.id, window));
    await coordinator.dispose();

    const me = await currentUser(api);
    await api.patch(`/pagelas/${created.id}`, { notes: 'Corrigida pelo administrador' });

    const [row] = await pagelasOf(api, child.id);
    expect(row.createdBy).toEqual({ id: author.id, name: author.name });
    expect(row.updatedBy).toEqual({ id: me.id, name: me.name });

    await page.goto(`/area-das-criancas/${child.id}`);
    await expect(page.getByTestId('pagela-authorship')).toHaveText(
      `Lançada por ${author.name} · alterada por ${me.name}`,
    );
  });
});

test.describe('Pagela: criança desativada', () => {
  test('a tela explica o motivo e a API recusa criar e editar', async ({ page }) => {
    requireOpen();
    child = await seedChild(api);
    const created = await api.post<{ id: string }>('/pagelas', pagelaBody(child.id, window));
    await api.patch(`/children/${child.id}/toggle-active`);

    await page.goto(`/area-das-criancas/${child.id}`);
    await expect(page.getByTestId('pagela-child-inactive')).toBeVisible();
    await expect(page.getByRole('button', { name: /Salvar/ })).toHaveCount(0);

    const edit = await api.send('PATCH', `/pagelas/${created.id}`, { present: false });
    expect(edit).toMatchObject({ status: 409, code: 'CHILD_7003' });

    // Reativada, volta a aceitar.
    await api.patch(`/children/${child.id}/toggle-active`);
    const again = await api.send('PATCH', `/pagelas/${created.id}`, { present: false });
    expect(again.status).toBe(200);
  });
});

test.describe('Pagela: fora do período letivo', () => {
  interface Period {
    id: string;
    year: number;
    isActive: boolean;
  }
  let period: Period | null = null;

  // O período é religado aqui mesmo que o teste quebre no meio.
  test.afterEach(async () => {
    if (period) await api.put(`/club-control/periods/${period.id}`, { isActive: true });
    period = null;
  });

  test('a tela mostra o motivo, some com o formulário e a API recusa criar e editar', async ({ page }) => {
    requireOpen();
    child = await seedChild(api);
    const created = await api.post<{ id: string }>('/pagelas', pagelaBody(child.id, window));

    period = await api.get<Period>(`/club-control/periods/${window.year}`);
    await api.put(`/club-control/periods/${period.id}`, { isActive: false });

    const closed = await launchWindow(api);
    expect(closed.open).toBe(false);
    expect(closed.message).toBeTruthy();

    await page.goto(`/area-das-criancas/${child.id}`);
    await expect(page.getByTestId('pagela-launch-closed')).toContainText(closed.message ?? '');
    await expect(page.getByRole('button', { name: /Salvar/ })).toHaveCount(0);
    await expect(page.getByTestId('pagela-week-select')).toHaveCount(0);

    const create = await api.send('POST', '/pagelas', pagelaBody(child.id, window, { week: 1 }));
    expect(create).toMatchObject({ status: 400, code: 'VAL_4007' });
    const edit = await api.send('PATCH', `/pagelas/${created.id}`, { present: false });
    expect(edit).toMatchObject({ status: 400, code: 'VAL_4007' });

    // Excluir continua permitido fora do período.
    const remove = await api.send('DELETE', `/pagelas/${created.id}`);
    expect(remove.status).toBe(200);
  });
});
