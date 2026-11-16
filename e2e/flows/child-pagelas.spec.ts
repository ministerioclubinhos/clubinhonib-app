import { expect, test, type Page } from '@playwright/test';

import { ApiClient } from '../support/api';
import {
  launchWindow,
  pagelaBody,
  pagelasOf,
  removeChild,
  seedChild,
  type LaunchWindow,
  type SeededChild,
} from '../support/children';
import {
  cardOfWeek,
  createButton,
  editorDialog,
  openCreateForm,
  openEditForm,
  pagelaCards,
  pagelaForm,
  saveButton,
  sizeOf,
} from '../support/pagela-ui';

/**
 * Tela de pagelas de uma criança (`/area-das-criancas/:childId`), contra a API
 * real: criar, editar, excluir, filtrar e paginar, no computador e no celular.
 *
 * Cada teste cria a própria criança e a apaga no fim. O que ficou gravado é
 * sempre relido pela API — a tela mostrar não prova que persistiu.
 */
let api: ApiClient;
let launch: LaunchWindow;
let child: SeededChild | undefined;

test.beforeAll(async () => {
  api = await ApiClient.login();
  launch = await launchWindow(api);
});

test.afterEach(async () => {
  await removeChild(api, child);
  child = undefined;
});

test.afterAll(async () => {
  await api.dispose();
});

const requireOpen = () =>
  test.skip(!launch.open, `período letivo fechado hoje (${launch.reason}): ${launch.message ?? ''}`);

const currentWeek = (): number => launch.currentWeek ?? 1;

/** Pagelas por página: 6 no celular, 12 no computador (`PAGELAS_PAGE_SIZE`). */
const pageSizeOf = (page: Page): number => ((page.viewportSize()?.width ?? 1280) < 600 ? 6 : 12);

/** Cria pagelas em semanas anteriores (da atual para trás) pela API. */
async function seedWeeks(childId: string, weeks: number, extra: (index: number) => Record<string, unknown> = () => ({})) {
  for (let index = 0; index < weeks; index += 1) {
    await api.post('/pagelas', pagelaBody(childId, launch, { week: currentWeek() - index, ...extra(index) }));
  }
}

async function openChildPage(page: Page): Promise<SeededChild> {
  child = await seedChild(api);
  await page.goto(`/area-das-criancas/${child.id}`);
  await expect(page.getByTestId('pagela-teacher-child-pagelas-page')).toBeVisible();
  return child;
}

/** Cenários que valem igual no computador e no celular. */
function sharedScenarios() {
  test('mostra a criança no cabeçalho e o estado vazio quando não há pagela', async ({ page }) => {
    const seeded = await openChildPage(page);

    await expect(page.getByRole('heading', { name: seeded.name })).toBeVisible();
    await expect(page.getByText('Responsável E2E')).toBeVisible();
    await expect(page.getByTestId('pagela-list-empty')).toContainText('Nenhuma pagela encontrada.');
    await expect(pagelaCards(page)).toHaveCount(0);
    // Sem pagela não há o que paginar.
    await expect(page.getByRole('navigation', { name: /paginação|pagination/i })).toHaveCount(0);
  });

  test('criança que não existe mostra o erro e não quebra a tela', async ({ page }) => {
    await page.goto('/area-das-criancas/00000000-0000-4000-8000-000000000000');
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(createButton(page)).toBeHidden().catch(() => undefined);
    await expect(page.getByTestId('pagela-teacher-child-pagelas-page')).toBeVisible();
  });

  test('cria uma pagela: grava na API, mostra o cartão e fecha o editor', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    const form = await openCreateForm(page);

    await form.getByRole('checkbox', { name: /Presença/ }).check();
    await form.getByRole('checkbox', { name: /Recitou o versículo/ }).check();
    await form.getByLabel('Observações').fill('Criada pelo e2e');
    await saveButton(page).click();

    await expect(page.getByText('Pagela salva!')).toBeVisible();
    await expect(editorDialog(page)).toBeHidden();
    await expect(cardOfWeek(page, currentWeek())).toBeVisible();
    await expect(cardOfWeek(page, currentWeek())).toContainText('Criada pelo e2e');

    const rows = await pagelasOf(api, seeded.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      week: currentWeek(),
      year: launch.year,
      present: true,
      didMeditation: false,
      recitedVerse: true,
      notes: 'Criada pelo e2e',
    });
  });

  test('cancelar, fechar pelo X e Esc não gravam nada', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);

    await openCreateForm(page);
    await page.getByTestId('pagela-editor-cancel').click();
    await expect(editorDialog(page)).toBeHidden();

    await openCreateForm(page);
    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(editorDialog(page)).toBeHidden();

    await openCreateForm(page);
    await page.keyboard.press('Escape');
    await expect(editorDialog(page)).toBeHidden();

    expect(await pagelasOf(api, seeded.id)).toHaveLength(0);
  });

  test('o formulário abre limpo a cada vez, sem sobra da vez anterior', async ({ page }) => {
    requireOpen();
    await openChildPage(page);

    let form = await openCreateForm(page);
    await form.getByRole('checkbox', { name: /Presença/ }).check();
    await form.getByLabel('Observações').fill('Rascunho');
    await page.getByTestId('pagela-editor-cancel').click();

    form = await openCreateForm(page);
    await expect(form.getByRole('checkbox', { name: /Presença/ })).not.toBeChecked();
    await expect(form.getByLabel('Observações')).toHaveValue('');
  });

  test('a observação respeita o limite de 500 caracteres', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    const form = await openCreateForm(page);

    await form.getByLabel('Observações').fill('a'.repeat(600));
    await expect(form.getByText('500/500')).toBeVisible();
    await saveButton(page).click();
    await expect(page.getByText('Pagela salva!')).toBeVisible();

    const [saved] = await pagelasOf(api, seeded.id);
    expect(saved.notes).toHaveLength(500);
  });

  test('semana que já tem pagela avisa, bloqueia salvar e leva para a edição', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch, { notes: 'Já existia', present: true }));
    await page.reload();

    const form = await openCreateForm(page);
    await expect(page.getByTestId('pagela-week-taken')).toBeVisible();
    await expect(saveButton(page)).toBeDisabled();

    await page.getByTestId('pagela-week-taken').getByRole('button').click();
    await expect(page.getByTestId('pagela-editor-week')).toContainText(`Semana ${currentWeek()}`);
    await expect(form.getByLabel('Observações')).toHaveValue('Já existia');
    await expect(form.getByRole('checkbox', { name: /Presença/ })).toBeChecked();
    await expect(page.getByTestId('pagela-week-taken')).toHaveCount(0);
  });

  test('trocar de semana confere a semana nova e libera o salvar quando está livre', async ({ page }) => {
    requireOpen();
    test.skip(currentWeek() < 2, 'só há uma semana letiva');
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch, { notes: 'Da semana atual' }));
    await page.reload();

    const form = await openCreateForm(page);
    await expect(page.getByTestId('pagela-week-taken')).toBeVisible();

    await form.getByRole('combobox', { name: /Semana/ }).click();
    await page.getByRole('option', { name: `Semana ${currentWeek() - 1}`, exact: true }).click();
    await expect(page.getByTestId('pagela-week-taken')).toHaveCount(0);
    await expect(saveButton(page)).toBeEnabled();

    // Voltar para a semana ocupada bloqueia de novo, sem sobra do estado anterior.
    await form.getByRole('combobox', { name: /Semana/ }).click();
    await page.getByRole('option', { name: `Semana ${currentWeek()} (atual)` }).click();
    await expect(page.getByTestId('pagela-week-taken')).toBeVisible();
    await expect(saveButton(page)).toBeDisabled();
  });

  test('lança em uma semana anterior e grava essa semana', async ({ page }) => {
    requireOpen();
    test.skip(currentWeek() < 2, 'só há uma semana letiva');
    const seeded = await openChildPage(page);
    const form = await openCreateForm(page);

    await form.getByRole('combobox', { name: /Semana/ }).click();
    await page.getByRole('option', { name: `Semana ${currentWeek() - 1}`, exact: true }).click();
    await form.getByRole('checkbox', { name: /Fez meditação/ }).check();
    await saveButton(page).click();
    await expect(page.getByText('Pagela salva!')).toBeVisible();

    const [saved] = await pagelasOf(api, seeded.id);
    expect(saved).toMatchObject({ week: currentWeek() - 1, didMeditation: true, year: launch.year });
    await expect(cardOfWeek(page, currentWeek() - 1)).toBeVisible();
  });

  test('edita: abre com os valores gravados, salva e mantém data, semana e autoria', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    const created = await api.post<{ id: string; referenceDate: string; createdBy: { id: string } | null }>(
      '/pagelas',
      pagelaBody(seeded.id, launch, { present: true, notes: 'Original' }),
    );
    await page.reload();

    const form = await openEditForm(page, currentWeek());
    await expect(form.getByRole('checkbox', { name: /Presença/ })).toBeChecked();
    await expect(form.getByRole('checkbox', { name: /Fez meditação/ })).not.toBeChecked();
    await expect(form.getByLabel('Observações')).toHaveValue('Original');
    // A semana de uma pagela existente não se troca.
    await expect(form.getByRole('combobox', { name: /Semana/ })).toHaveCount(0);

    await form.getByRole('checkbox', { name: /Presença/ }).uncheck();
    await form.getByRole('checkbox', { name: /Fez meditação/ }).check();
    await form.getByLabel('Observações').fill('Corrigida');
    await saveButton(page).click();

    await expect(page.getByText('Pagela atualizada!')).toBeVisible();
    await expect(editorDialog(page)).toBeHidden();
    await expect(cardOfWeek(page, currentWeek())).toContainText('Corrigida');

    const rows = await pagelasOf(api, seeded.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: created.id,
      referenceDate: created.referenceDate,
      week: currentWeek(),
      present: false,
      didMeditation: true,
      notes: 'Corrigida',
    });
    expect(rows[0].createdBy?.id).toBe(created.createdBy?.id);
  });

  test('apagar a observação na edição limpa de verdade na API', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch, { notes: 'Vai sumir' }));
    await page.reload();

    const form = await openEditForm(page, currentWeek());
    await form.getByLabel('Observações').fill('');
    await saveButton(page).click();
    await expect(page.getByText('Pagela atualizada!')).toBeVisible();

    const [saved] = await pagelasOf(api, seeded.id);
    expect(saved.notes ?? null).toBeNull();
  });

  test('cancelar a edição mantém a pagela como estava', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch, { notes: 'Intacta', present: true }));
    await page.reload();

    const form = await openEditForm(page, currentWeek());
    await form.getByRole('checkbox', { name: /Presença/ }).uncheck();
    await form.getByLabel('Observações').fill('Mudou');
    await page.getByTestId('pagela-editor-cancel').click();
    await expect(editorDialog(page)).toBeHidden();

    const [saved] = await pagelasOf(api, seeded.id);
    expect(saved).toMatchObject({ present: true, notes: 'Intacta' });
    await expect(cardOfWeek(page, currentWeek())).toContainText('Intacta');
  });

  test('editar duas pagelas em sequência não mistura os valores', async ({ page }) => {
    requireOpen();
    test.skip(currentWeek() < 2, 'só há uma semana letiva');
    const seeded = await openChildPage(page);
    await seedWeeks(seeded.id, 2, (index) => ({ notes: `Nota ${index}`, present: index === 0 }));
    await page.reload();

    let form = await openEditForm(page, currentWeek());
    await expect(form.getByLabel('Observações')).toHaveValue('Nota 0');
    await page.getByTestId('pagela-editor-cancel').click();

    form = await openEditForm(page, currentWeek() - 1);
    await expect(form.getByLabel('Observações')).toHaveValue('Nota 1');
    await expect(form.getByRole('checkbox', { name: /Presença/ })).not.toBeChecked();
  });

  test('exclui só depois de confirmar; cancelar mantém a pagela', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch));
    await page.reload();

    const card = cardOfWeek(page, currentWeek());
    await card.getByRole('button', { name: 'Excluir pagela' }).click();
    await page.getByTestId('pagela-teacher-delete-dialog').getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByTestId('pagela-teacher-delete-dialog')).toBeHidden();
    await expect(card).toBeVisible();
    expect(await pagelasOf(api, seeded.id)).toHaveLength(1);

    await card.getByRole('button', { name: 'Excluir pagela' }).click();
    await page.getByTestId('pagela-teacher-delete-dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Pagela excluída.')).toBeVisible();
    await expect(pagelaCards(page)).toHaveCount(0);
    await expect(page.getByTestId('pagela-list-empty')).toBeVisible();
    expect(await pagelasOf(api, seeded.id)).toHaveLength(0);
  });

  test('depois de excluir, a mesma semana volta a aceitar uma pagela nova', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch));
    await page.reload();

    await cardOfWeek(page, currentWeek()).getByRole('button', { name: 'Excluir pagela' }).click();
    await page.getByTestId('pagela-teacher-delete-dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(pagelaCards(page)).toHaveCount(0);

    const form = await openCreateForm(page);
    await expect(page.getByTestId('pagela-week-taken')).toHaveCount(0);
    await form.getByRole('checkbox', { name: /Presença/ }).check();
    await saveButton(page).click();
    await expect(page.getByText('Pagela salva!')).toBeVisible();
    expect(await pagelasOf(api, seeded.id)).toHaveLength(1);
  });

  test('falha da API ao salvar mostra o erro, mantém o formulário e permite tentar de novo', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    const form = await openCreateForm(page);
    await form.getByLabel('Observações').fill('Tentativa');

    await page.route('**/pagelas', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Falha simulada' }) });
        return;
      }
      await route.continue();
    });
    await saveButton(page).click();
    await expect(page.getByTestId('pagela-save-error')).toBeVisible();
    await expect(editorDialog(page)).toBeVisible();
    await expect(form.getByLabel('Observações')).toHaveValue('Tentativa');
    expect(await pagelasOf(api, seeded.id)).toHaveLength(0);

    await page.unroute('**/pagelas');
    await saveButton(page).click();
    await expect(page.getByText('Pagela salva!')).toBeVisible();
    expect(await pagelasOf(api, seeded.id)).toHaveLength(1);
  });

  test('outra pessoa lança a mesma semana enquanto o formulário está aberto: a API recusa e a tela explica', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    const form = await openCreateForm(page);
    await expect(saveButton(page)).toBeEnabled();

    await api.post('/pagelas', pagelaBody(seeded.id, launch, { notes: 'Chegou antes' }));
    await form.getByRole('checkbox', { name: /Presença/ }).check();
    await saveButton(page).click();

    await expect(page.getByTestId('pagela-save-error')).toBeVisible();
    await expect(editorDialog(page)).toBeVisible();
    const rows = await pagelasOf(api, seeded.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].notes).toBe('Chegou antes');
  });

  test('a pagela excluída por outra pessoa durante a edição não derruba a tela', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    const created = await api.post<{ id: string }>('/pagelas', pagelaBody(seeded.id, launch));
    await page.reload();

    const form = await openEditForm(page, currentWeek());
    await api.delete(`/pagelas/${created.id}`);
    await form.getByLabel('Observações').fill('Tarde demais');
    await saveButton(page).click();

    await expect(page.getByTestId('pagela-save-error')).toBeVisible();
    await expect(editorDialog(page)).toBeVisible();
    await page.getByTestId('pagela-editor-cancel').click();
    await expect(page.getByTestId('pagela-teacher-child-pagelas-page')).toBeVisible();
  });

  test('clicar duas vezes em salvar cria uma pagela só', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await openCreateForm(page);

    await saveButton(page).dblclick();
    await expect(page.getByText('Pagela salva!')).toBeVisible();
    expect(await pagelasOf(api, seeded.id)).toHaveLength(1);
  });

  test('filtra por presença, semana e ano, limpa os filtros e explica quando nada bate', async ({ page }) => {
    requireOpen();
    test.skip(currentWeek() < 3, 'poucas semanas letivas para filtrar');
    const seeded = await openChildPage(page);
    await seedWeeks(seeded.id, 3, (index) => ({ present: index !== 1 }));
    await page.reload();
    await expect(pagelaCards(page)).toHaveCount(3);

    const toggle = page.getByTestId('pagela-filters-toggle');
    await toggle.click();
    await page.getByTestId('pagela-filter-present-control').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Não' }).click();
    await expect(pagelaCards(page)).toHaveCount(1);
    await expect(cardOfWeek(page, currentWeek() - 1)).toBeVisible();

    await page.getByTestId('pagela-filters-clear').click();
    await expect(pagelaCards(page)).toHaveCount(3);

    await page.getByLabel('Semana', { exact: true }).fill(String(currentWeek()));
    await expect(pagelaCards(page)).toHaveCount(1);
    await expect(cardOfWeek(page, currentWeek())).toBeVisible();

    await page.getByLabel('Ano', { exact: true }).fill(String((launch.year ?? 2026) - 1));
    await expect(page.getByTestId('pagela-list-empty')).toContainText('Nenhuma pagela com esses filtros.');

    await page.getByTestId('pagela-filters-clear').click();
    await expect(pagelaCards(page)).toHaveCount(3);
  });

  test('pagina quando passa do tamanho da página e, ao excluir o último da última página, recua uma página', async ({ page }) => {
    requireOpen();
    const size = pageSizeOf(page);
    test.skip(currentWeek() < size + 1, `precisa de ${size + 1} semanas letivas para passar de uma página`);
    const seeded = await openChildPage(page);
    await seedWeeks(seeded.id, size + 1);
    await page.reload();

    await expect(pagelaCards(page)).toHaveCount(size);
    const pager = page.getByRole('navigation');
    await pager.getByRole('button', { name: /^(Go to )?(page )?2$|^2$/ }).first().click();
    await expect(pagelaCards(page)).toHaveCount(1);

    await pagelaCards(page).first().getByRole('button', { name: 'Excluir pagela' }).click();
    await page.getByTestId('pagela-teacher-delete-dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Pagela excluída.')).toBeVisible();

    // Antes a lista ficava vazia na página 2 que deixou de existir.
    await expect(pagelaCards(page)).toHaveCount(size);
    await expect(page.getByTestId('pagela-list-empty')).toHaveCount(0);
    expect(await pagelasOf(api, seeded.id)).toHaveLength(size);
  });

  test('o voltar do cabeçalho leva à lista de crianças', async ({ page }) => {
    child = await seedChild(api);
    await page.goto('/area-das-criancas');
    await page.getByPlaceholder('Buscar por nome ou telefone do responsável…').fill(child.name);
    await page.getByText(child.name).click();
    await expect(page.getByTestId('pagela-teacher-child-pagelas-page')).toBeVisible();

    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.getByTestId('pagela-teacher-children-browser-page')).toBeVisible();
  });
}

test.describe('Pagelas da criança: computador', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  sharedScenarios();

  test('o botão de nova pagela fica no cabeçalho, sem botão flutuante', async ({ page }) => {
    requireOpen();
    await openChildPage(page);
    await expect(page.getByTestId('pagela-create-button')).toBeVisible();
    await expect(page.getByTestId('pagela-create-fab')).toHaveCount(0);
  });

  test('o editor é uma caixa de diálogo, não tela cheia', async ({ page }) => {
    requireOpen();
    await openChildPage(page);
    await openCreateForm(page);

    const paper = editorDialog(page).locator('.MuiDialog-paper');
    const { width } = await sizeOf(paper);
    expect(width).toBeLessThan(700);
  });
});

test.describe('Pagelas da criança: celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  sharedScenarios();

  test('o botão de nova pagela ocupa a largura toda e o editor ocupa a tela inteira', async ({ page }) => {
    requireOpen();
    await openChildPage(page);
    // Fixo no topo, sem flutuar por cima dos cartões.
    await expect(page.getByTestId('pagela-create-button')).toBeVisible();
    await expect(page.getByTestId('pagela-create-fab')).toHaveCount(0);
    expect((await sizeOf(page.getByTestId('pagela-create-button'))).width).toBeGreaterThanOrEqual(320);

    await openCreateForm(page);
    const { width, height } = await sizeOf(editorDialog(page).locator('.MuiDialog-paper'));
    expect(width).toBeGreaterThanOrEqual(388);
    expect(height).toBeGreaterThanOrEqual(840);
  });

  test('os controles têm alvo de toque de 44 px e a página não rola de lado', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch, { notes: 'Observação comprida '.repeat(8) }));
    await page.reload();

    const targets = [
      page.getByRole('button', { name: 'Voltar' }),
      page.getByTestId('pagela-create-button'),
      page.getByRole('button', { name: 'Editar pagela' }),
      page.getByRole('button', { name: 'Excluir pagela' }),
      page.getByTestId('pagela-filters-toggle'),
    ];
    for (const target of targets) {
      const { width, height } = await sizeOf(target);
      expect(width, 'largura do alvo de toque').toBeGreaterThanOrEqual(43.5);
      expect(height, 'altura do alvo de toque').toBeGreaterThanOrEqual(43.5);
    }

    await openCreateForm(page);
    for (const target of [saveButton(page), page.getByTestId('pagela-editor-cancel'), page.getByRole('button', { name: 'Fechar' })]) {
      const { height } = await sizeOf(target);
      expect(height, 'altura do botão do editor').toBeGreaterThanOrEqual(43.5);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('os filtros começam recolhidos e abrem sob demanda', async ({ page }) => {
    await openChildPage(page);
    await expect(page.getByTestId('pagela-filters-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByLabel('Semana', { exact: true })).toHaveCount(0);

    await page.getByTestId('pagela-filters-toggle').click();
    await expect(page.getByLabel('Semana', { exact: true })).toBeVisible();
  });

  test('mostra 6 pagelas por página no celular', async ({ page }) => {
    requireOpen();
    test.skip(currentWeek() < 7, 'precisa de 7 semanas letivas');
    const seeded = await openChildPage(page);
    await seedWeeks(seeded.id, 7);
    await page.reload();

    await expect(pagelaCards(page)).toHaveCount(6);
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

test.describe('Pagelas da criança: criança desativada', () => {
  test('não cria nem edita pagela, e o aviso explica o motivo', async ({ page }) => {
    requireOpen();
    const seeded = await openChildPage(page);
    await api.post('/pagelas', pagelaBody(seeded.id, launch));
    await api.patch(`/children/${seeded.id}/toggle-active`);
    await page.reload();

    await expect(page.getByTestId('pagela-child-inactive')).toBeVisible();
    await expect(createButton(page)).toBeDisabled();
    await expect(pagelaCards(page).getByRole('button', { name: 'Editar pagela' })).toBeDisabled();
    await expect(pagelaForm(page)).toHaveCount(0);
  });
});
