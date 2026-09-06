import { expect, Page, Route, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { API_URL, COORDINATOR_EMAIL, COORDINATOR_PASSWORD } from '../support/env';
import { loginAs } from '../support/session';

type Page$<T> = { data: T[]; total: number; page: number; limit: number; pageCount: number };

/** Envelope `Paginated<T>` da API. */
const paged = <T,>(data: T[], total = data.length, page = 1, limit = 25): Page$<T> => ({
  data,
  total,
  page,
  limit,
  pageCount: Math.ceil(total / limit),
});

const OBS_URL = '**/log-records/observability**';
const AUDIT_URL = '**/log-records/audit**';

const observabilityItem = (id: string) => ({
  schemaVersion: '1',
  eventId: id,
  recordType: 'observability',
  environment: 'local',
  service: 'clubinhonib-api',
  occurredAt: '2026-09-05T12:00:00.000Z',
  requestId: `req-${id}`,
  sourceType: 'http',
  actorType: 'user',
  actorId: 'user-1',
  actorRole: 'admin',
  level: 'error',
  context: 'ClubsService',
  moduleName: 'ClubsModule',
  operation: 'create',
  message: `Falha ${id}`,
  errorName: 'AppInternalException',
  errorCode: 'INT_9002',
  errorMessage: 'Falha no banco',
  errorFingerprint: 'abc',
  sourceFile: 'src/x.ts',
  sourceLine: 1,
  httpMethod: 'POST',
  routeTemplate: '/clubs',
  statusCode: 500,
  durationMs: 12,
  providerName: null,
  jobName: null,
});

const auditItem = (id: string) => ({
  schemaVersion: '1',
  eventId: id,
  recordType: 'audit',
  environment: 'local',
  service: 'clubinhonib-api',
  occurredAt: '2026-09-05T12:00:00.000Z',
  requestId: `req-${id}`,
  sourceType: 'http',
  actorType: 'user',
  actorId: 'user-1',
  actorRole: 'admin',
  actionType: 'http_request',
  actionName: `ClubsModule.ClubsController.${id}`,
  moduleName: 'ClubsModule',
  controllerName: 'ClubsController',
  handlerName: id,
  resourceType: 'clubs',
  resourceId: 'club-1',
  outcome: 'succeeded',
  httpMethod: 'GET',
  routeTemplate: '/clubs',
  statusCode: 200,
  durationMs: 8,
  errorCode: null,
  occurrenceCount: 1,
  jobName: null,
});

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const apiError = (route: Route, status: number, code: string, message: string) =>
  json(route, { success: false, error: { code, message, timestamp: new Date().toISOString(), path: route.request().url() } }, status);

async function mockBoth(page: Page, obs: Page$<unknown>, audit: Page$<unknown>) {
  await page.route(OBS_URL, (route) => json(route, obs));
  await page.route(AUDIT_URL, (route) => json(route, audit));
}

/** A aba de auditoria; a de observabilidade é a inicial. */
async function openAuditTab(page: Page) {
  await page.getByTestId('observability-audit-tab-audit').click();
  await expect(page.getByTestId('audit-records-panel')).toBeVisible();
}

test.describe('Observabilidade e auditoria', () => {
  test('o administrador vê o link discreto no rodapé, e ele abre a rota; sidebar e dashboard não têm o item', async ({ page }) => {
    await mockBoth(page, paged([]), paged([]));
    await page.goto('/adm');
    await expect(page.getByTestId('adm-admin-layout')).toBeVisible();

    const layout = page.getByTestId('adm-admin-layout');
    await expect(layout.getByText('Observabilidade e auditoria', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('main').getByText('Observabilidade e auditoria', { exact: true })).toHaveCount(0);

    const link = page.getByTestId('footer-observability-audit-link');
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/adm\/observabilidade-auditoria$/);
    await expect(page.getByTestId('observability-audit-page')).toBeVisible();

    // Duas abas na mesma rota: a técnica abre primeiro; a de auditoria fica montada, mas escondida.
    const tabs = page.getByTestId('observability-audit-tabs');
    await expect(tabs.getByRole('tab')).toHaveCount(2);
    await expect(page.getByTestId('observability-audit-tab-observability')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('observability-records-panel')).toBeVisible();
    await expect(page.getByTestId('audit-records-panel')).toBeHidden();

    await openAuditTab(page);
    await expect(page.getByTestId('observability-records-panel')).toBeHidden();
    await expect(page.getByTestId('observability-audit-tab-audit')).toHaveAttribute('aria-selected', 'true');
  });

  test('as duas requests saem com método, endpoint, período, page=1 e limit', async ({ page }) => {
    await mockBoth(page, paged([observabilityItem('o1')]), paged([auditItem('a1')]));
    const [obsRequest, auditRequest] = await Promise.all([
      page.waitForRequest(OBS_URL),
      page.waitForRequest(AUDIT_URL),
      page.goto('/adm/observabilidade-auditoria'),
    ]);

    for (const request of [obsRequest, auditRequest]) {
      expect(request.method()).toBe('GET');
      const url = new URL(request.url());
      expect(url.origin + url.pathname).toMatch(new RegExp(`^${API_URL}/log-records/(observability|audit)$`));
      expect(url.searchParams.get('from')).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
      expect(url.searchParams.get('to')).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
      expect(url.searchParams.get('limit')).toBe('25');
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.has('requestId')).toBe(false);
      expect(request.headers().authorization).toMatch(/^Bearer /);
    }

    await expect(page.getByTestId('observability-record-row-o1')).toBeVisible();
    await openAuditTab(page);
    await expect(page.getByTestId('audit-record-row-a1')).toBeVisible();
  });

  test('loading, vazio e erro são independentes; "Tentar novamente" repete só o painel com erro', async ({ page }) => {
    let obsCalls = 0;
    let auditCalls = 0;

    await page.route(OBS_URL, async (route) => {
      obsCalls += 1;
      // O painel técnico demora: enquanto isso, o de auditoria já falhou e foi refeito.
      await new Promise((done) => setTimeout(done, 2500));
      await json(route, paged([]));
    });
    await page.route(AUDIT_URL, (route) => {
      auditCalls += 1;
      return auditCalls === 1
        ? apiError(route, 500, 'INT_9001', 'Erro interno do servidor')
        : json(route, paged([auditItem('a1')]));
    });

    await page.goto('/adm/observabilidade-auditoria');

    await expect(page.getByTestId('observability-records-loading')).toBeVisible();
    await openAuditTab(page);
    const auditError = page.getByTestId('audit-records-error');
    await expect(auditError).toBeVisible();
    await expect(auditError).toContainText('Erro interno');

    await auditError.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByTestId('audit-record-row-a1')).toBeVisible();
    expect(auditCalls).toBe(2);
    expect(obsCalls).toBe(1);

    await page.getByTestId('observability-audit-tab-observability').click();
    await expect(page.getByTestId('observability-records-empty')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('observability-records-empty')).toContainText('Nenhum registro encontrado');
    // Voltar para auditoria não recarrega: o estado ficou montado.
    await openAuditTab(page);
    await expect(page.getByTestId('audit-record-row-a1')).toBeVisible();
    expect(obsCalls).toBe(1);
    expect(auditCalls).toBe(2);
  });

  test('paginação numerada: total, páginas, ir para uma página, itens por página e reinício ao filtrar', async ({ page }) => {
    const requests: { page: string | null; limit: string | null; outcome: string | null }[] = [];
    const all = Array.from({ length: 5 }, (_, i) => auditItem(`p${i + 1}`));
    await page.route(OBS_URL, (route) => json(route, paged([])));
    await page.route(AUDIT_URL, (route) => {
      const url = new URL(route.request().url());
      const pageNumber = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '25');
      requests.push({
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
        outcome: url.searchParams.get('outcome'),
      });
      return json(route, paged(all.slice((pageNumber - 1) * limit, pageNumber * limit), all.length, pageNumber, limit));
    });

    await page.goto('/adm/observabilidade-auditoria');
    await openAuditTab(page);
    const pagination = page.getByTestId('audit-records-pagination');
    await expect(page.getByTestId('audit-record-row-p1')).toBeVisible();

    // 25 por página: uma página só, controles de página desabilitados, total no resumo.
    await expect(pagination).toContainText('1–5 de 5 · Página 1 de 1');
    await expect(pagination.getByRole('button', { name: 'Próxima página' })).toBeDisabled();

    // Itens por página = 10 muda o limit; total continua 5.
    await pagination.getByRole('combobox', { name: 'Itens por página' }).click();
    await page.getByRole('option', { name: '10', exact: true }).click();
    await expect.poll(() => requests.at(-1)?.limit).toBe('10');
    await expect(pagination).toContainText('1–5 de 5 · Página 1 de 1');

    // Um limite menor que o total abre a numeração.
    await page.evaluate(() => undefined);
    await page.route(AUDIT_URL, (route) => {
      const url = new URL(route.request().url());
      const pageNumber = Number(url.searchParams.get('page') ?? '1');
      const limit = 2;
      requests.push({ page: url.searchParams.get('page'), limit: url.searchParams.get('limit'), outcome: url.searchParams.get('outcome') });
      return json(route, paged(all.slice((pageNumber - 1) * limit, pageNumber * limit), all.length, pageNumber, limit));
    });
    await page.getByTestId('audit-records-refresh').click();
    await expect(pagination).toContainText('1–2 de 5 · Página 1 de 3');
    await expect(pagination.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await pagination.getByRole('button', { name: 'Página 3' }).click();
    await expect(page.getByTestId('audit-record-row-p5')).toBeVisible();
    await expect(pagination).toContainText('5–5 de 5 · Página 3 de 3');
    expect(requests.at(-1)?.page).toBe('3');
    await expect(pagination.getByRole('button', { name: 'Próxima página' })).toBeDisabled();

    await pagination.getByRole('button', { name: 'Página anterior' }).click();
    await expect(page.getByTestId('audit-record-row-p3')).toBeVisible();
    expect(requests.at(-1)?.page).toBe('2');

    // Filtro novo: volta para a página 1 e envia o filtro.
    await page.getByTestId('audit-records-filters').getByRole('combobox', { name: 'Resultado' }).click();
    await page.getByRole('option', { name: 'Negado' }).click();
    await expect.poll(() => requests.at(-1)?.outcome).toBe('denied');
    expect(requests.at(-1)?.page).toBe('1');
    await expect(pagination).toContainText('Página 1 de 3');
  });

  test('trocar o filtro aborta a request anterior e a resposta antiga não substitui a nova', async ({ page }) => {
    let calls = 0;
    await page.route(OBS_URL, (route) => json(route, paged([])));
    await page.route(AUDIT_URL, async (route) => {
      calls += 1;
      const url = new URL(route.request().url());
      if (calls === 1) {
        // A primeira resposta demora; se chegasse, traria o item "velho".
        await new Promise((done) => setTimeout(done, 5000));
        return json(route, paged([auditItem('velho')]));
      }
      return json(route, paged([auditItem(url.searchParams.get('outcome') ?? 'novo')]));
    });

    await page.goto('/adm/observabilidade-auditoria');
    await openAuditTab(page);
    await expect(page.getByTestId('audit-records-loading')).toBeVisible();
    await page.getByTestId('audit-records-filters').getByRole('combobox', { name: 'Resultado' }).click();
    await page.getByRole('option', { name: 'Falha' }).click();

    await expect(page.getByTestId('audit-record-row-failed')).toBeVisible();
    await page.waitForTimeout(5500);
    await expect(page.getByTestId('audit-record-row-velho')).toHaveCount(0);
    await expect(page.getByTestId('audit-record-row-failed')).toBeVisible();
  });

  test('período inválido é recusado antes da request', async ({ page }) => {
    let calls = 0;
    await page.route(OBS_URL, (route) => {
      calls += 1;
      return json(route, paged([]));
    });
    await page.route(AUDIT_URL, (route) => {
      calls += 1;
      return json(route, paged([]));
    });
    await page.goto('/adm/observabilidade-auditoria');
    await expect(page.getByTestId('observability-records-empty')).toBeVisible();
    const before = calls;

    const toolbar = page.getByTestId('observability-records-toolbar');
    await toolbar.getByLabel('Início do período').fill('2026-01-01T00:00');
    await toolbar.getByLabel('Fim do período').fill('2026-03-01T00:00');
    await expect(page.getByTestId('observability-records-period-error')).toContainText('31 dias');
    await page.waitForTimeout(600);
    expect(calls).toBe(before);
    await expect(page.getByTestId('observability-records-refresh')).toBeDisabled();
    // A toolbar é por aba: a de auditoria continua válida e habilitada.
    await openAuditTab(page);
    await expect(page.getByTestId('audit-records-period-error')).toHaveCount(0);
    await expect(page.getByTestId('audit-records-refresh')).toBeEnabled();
  });

  test('no celular as listas viram cards, a toolbar recolhe os filtros avançados e a página não rola na horizontal', async ({ page }) => {
    await mockBoth(
      page,
      paged([observabilityItem('o1'), observabilityItem('o2')]),
      paged([auditItem('a1'), auditItem('a2')]),
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/adm/observabilidade-auditoria');
    await expect(page.getByTestId('observability-record-row-o1')).toBeVisible();

    for (const [tab, id, row] of [
      ['observability-audit-tab-observability', 'observability-records-table', 'observability-record-row-o1'],
      ['observability-audit-tab-audit', 'audit-records-table', 'audit-record-row-a1'],
    ] as const) {
      await page.getByTestId(tab).click();
      const list = page.getByTestId(id);
      await expect(list).toBeVisible();
      await expect(list.locator('table')).toHaveCount(0);
      await expect(page.getByTestId(row)).toBeVisible();
      const pageScrollsHorizontally = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(pageScrollsHorizontally).toBe(false);
    }

    // Toolbar mobile: período e Atualizar à mão; o resto atrás de "Mais filtros".
    const toolbar = page.getByTestId('audit-records-toolbar');
    await expect(toolbar.getByLabel('Início do período')).toBeVisible();
    await expect(toolbar.getByTestId('audit-records-refresh')).toBeVisible();
    await expect(toolbar.getByLabel('ID da requisição')).toBeHidden();
    await toolbar.getByRole('button', { name: 'Mais filtros' }).click();
    await expect(toolbar.getByLabel('ID da requisição')).toBeVisible();
    await expect(toolbar.getByRole('combobox', { name: 'Resultado' })).toBeVisible();

    // O card abre o modal em tela cheia.
    await page.getByTestId('audit-record-row-a1').getByRole('button', { name: /Ver detalhes/ }).click();
    await expect(page.getByTestId('record-details-dialog')).toBeVisible();
    await page.getByTestId('record-details-close').click();
  });

  test('smoke com a API real: o DTO publicado é consumível pelo administrador e a API recusa outros papéis', async ({ page }) => {
    const admin = await ApiClient.login();
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 60 * 60 * 1000);
      const query = { from: from.toISOString(), to: to.toISOString(), limit: 5 };
      const audit = await admin.get<Page$<Record<string, unknown>>>('/log-records/audit', query);
      const obs = await admin.get<Page$<Record<string, unknown>>>('/log-records/observability', query);
      for (const body of [audit, obs]) {
        expect(Array.isArray(body.data)).toBe(true);
        expect(body).toMatchObject({ page: 1, limit: 5 });
        expect(typeof body.total).toBe('number');
        expect(typeof body.pageCount).toBe('number');
        for (const item of body.data) {
          expect(item).not.toHaveProperty('stack');
          expect(item).not.toHaveProperty('metadata');
          expect(item).not.toHaveProperty('expiresAtEpochSeconds');
        }
      }
      // Leituras não são auditadas: a própria consulta não aparece na lista.
      expect(audit.data.some((item) => item.actionName === 'LogRecordsModule.LogRecordsController.listAudit')).toBe(false);
    } finally {
      await admin.dispose();
    }

    const coordinator = await ApiClient.login(COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
    try {
      const res = await page.request.get(`${API_URL}/log-records/audit`, {
        headers: { Authorization: `Bearer ${coordinator.token}` },
        params: { from: '2026-09-01T00:00:00Z', to: '2026-09-02T00:00:00Z' },
      });
      expect(res.status()).toBe(403);
    } finally {
      await coordinator.dispose();
    }

    const anonymous = await page.request.get(`${API_URL}/log-records/observability`, {
      params: { from: '2026-09-01T00:00:00Z', to: '2026-09-02T00:00:00Z' },
    });
    expect(anonymous.status()).toBe(401);

    // E a tela real, sem mock: a página abre e um dos dois estados finais aparece.
    await page.goto('/adm/observabilidade-auditoria');
    await openAuditTab(page);
    await expect(page.getByTestId('audit-records-table').or(page.getByTestId('audit-records-empty'))).toBeVisible();
  });

  test('clicar numa linha abre o modal de detalhes com os campos do DTO; copiar não abre; Fechar e Esc fecham', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await mockBoth(page, paged([observabilityItem('o1')]), paged([auditItem('a1')]));
    await page.goto('/adm/observabilidade-auditoria');

    const dialog = page.getByTestId('record-details-dialog');

    // Copiar o ID da requisição não pode abrir o modal.
    await page.getByTestId('observability-record-row-o1').getByRole('button', { name: 'Copiar identificador de requisição' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Identificador copiado' })).toBeVisible();
    await expect(dialog).toHaveCount(0);

    await page.getByTestId('observability-record-row-o1').click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /Detalhes do registro técnico/ })).toBeVisible();
    await expect(page.getByTestId('record-details-field-message')).toContainText('Falha o1');
    await expect(page.getByTestId('record-details-field-error-code')).toContainText('INT_9002');
    await expect(page.getByTestId('record-details-field-request-id')).toContainText('req-o1');
    await expect(page.getByTestId('record-details-field-source-location')).toContainText('src/x.ts:1');
    await expect(dialog.getByText(/stack|metadata/i)).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: /excluir|editar/i })).toHaveCount(0);

    await page.getByTestId('record-details-close').click();
    await expect(dialog).toBeHidden();

    await openAuditTab(page);
    const row = page.getByTestId('audit-record-row-a1');
    await row.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /Detalhes do evento de auditoria/ })).toBeVisible();
    await expect(page.getByTestId('record-details-field-action-name')).toContainText('ClubsModule.ClubsController.a1');
    await expect(page.getByTestId('record-details-field-outcome')).toContainText('Sucesso');
    await expect(page.getByTestId('record-details-field-actor')).toContainText('Usuário · Administrador');
    await expect(page.getByTestId('record-details-field-resource-id')).toContainText('club-1');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('excluir um registro pelo modal pede confirmação, chama DELETE com eventId e occurredAt e recarrega a lista', async ({ page }) => {
    const deletes: string[] = [];
    let items = [auditItem('a1'), auditItem('a2')];
    await page.route(OBS_URL, (route) => json(route, paged([])));
    await page.route(AUDIT_URL, (route) => {
      if (route.request().method() === 'DELETE') {
        deletes.push(route.request().url());
        items = items.filter((item) => !route.request().url().includes(item.eventId));
        return json(route, { deleted: 1 });
      }
      return json(route, paged(items));
    });

    await page.goto('/adm/observabilidade-auditoria');
    await openAuditTab(page);
    await page.getByTestId('audit-record-row-a1').click();
    const dialog = page.getByTestId('record-details-dialog');
    await expect(dialog).toBeVisible();

    await page.getByTestId('record-details-delete').click();
    const confirm = page.getByRole('dialog').filter({ hasText: 'Ação Irreversível' });
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText('este registro');
    expect(deletes).toHaveLength(0);

    await confirm.getByRole('button', { name: /^Excluir/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: '1 registro excluído' })).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('audit-record-row-a1')).toHaveCount(0);
    await expect(page.getByTestId('audit-record-row-a2')).toBeVisible();

    expect(deletes).toHaveLength(1);
    const url = new URL(deletes[0]);
    expect(url.pathname).toBe('/log-records/audit/a1');
    expect(url.searchParams.get('occurredAt')).toBe('2026-09-05T12:00:00.000Z');
  });

  test('excluir o período da aba pede confirmação com as datas e chama DELETE com from/to; a outra aba não é afetada', async ({ page }) => {
    const deletes: string[] = [];
    let obsItems = [observabilityItem('o1')];
    await page.route(OBS_URL, (route) => {
      if (route.request().method() === 'DELETE') {
        deletes.push(route.request().url());
        obsItems = [];
        return json(route, { deleted: 7 });
      }
      return json(route, paged(obsItems));
    });
    await page.route(AUDIT_URL, (route) => {
      if (route.request().method() === 'DELETE') deletes.push(route.request().url());
      return json(route, paged([auditItem('a1')]));
    });

    await page.goto('/adm/observabilidade-auditoria');
    await expect(page.getByTestId('observability-record-row-o1')).toBeVisible();

    await page.getByTestId('observability-records-delete-range').click();
    const confirm = page.getByRole('dialog').filter({ hasText: 'Ação Irreversível' });
    await expect(confirm).toContainText('todos os registros desta aba entre');
    await confirm.getByRole('button', { name: /^Excluir/ }).click();

    await expect(page.getByRole('alert').filter({ hasText: '7 registros excluídos' })).toBeVisible();
    await expect(page.getByTestId('observability-records-empty')).toBeVisible();
    expect(deletes).toHaveLength(1);
    const url = new URL(deletes[0]);
    expect(url.pathname).toBe('/log-records/observability');
    expect(url.searchParams.get('from')).toMatch(/Z$/);
    expect(url.searchParams.get('to')).toMatch(/Z$/);

    await openAuditTab(page);
    await expect(page.getByTestId('audit-record-row-a1')).toBeVisible();
  });

  test('com storage file a API responde LOG_9101 e a aba explica, sem tabela, retry ou exclusão', async ({ page }) => {
    await page.route(OBS_URL, (route) => apiError(route, 409, 'LOG_9101', 'Consulta e exclusão indisponíveis'));
    await page.route(AUDIT_URL, (route) => json(route, paged([auditItem('a1')])));

    await page.goto('/adm/observabilidade-auditoria');
    const notice = page.getByTestId('observability-records-unavailable');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('Consulta indisponível neste ambiente');
    await expect(page.getByTestId('observability-records-error')).toHaveCount(0);
    await expect(page.getByTestId('observability-records-empty')).toHaveCount(0);
    await expect(page.getByTestId('observability-records-table')).toHaveCount(0);
    await expect(page.getByTestId('observability-records-delete-range')).toHaveCount(0);

    // A outra aba segue normal: cada uma responde pelo próprio storage.
    await openAuditTab(page);
    await expect(page.getByTestId('audit-record-row-a1')).toBeVisible();
    await expect(page.getByTestId('audit-records-delete-range')).toBeVisible();
  });

  test('coordenador não vê o link e não abre a rota; anônimo vai para o login', async ({ browser }) => {
    const coordinatorPage = await loginAs(browser, COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
    try {
      await expect(coordinatorPage.getByTestId('footer')).toBeVisible();
      await expect(coordinatorPage.getByTestId('footer-observability-audit-link')).toHaveCount(0);
      await coordinatorPage.goto('/adm/observabilidade-auditoria');
      await expect(coordinatorPage.getByTestId('observability-audit-page')).toHaveCount(0);
      await expect(coordinatorPage).not.toHaveURL(/observabilidade-auditoria$/);
    } finally {
      await coordinatorPage.context().close();
    }

    const anonymousContext = await browser.newContext({ storageState: undefined });
    const anonymousPage = await anonymousContext.newPage();
    try {
      await anonymousPage.goto('/adm/observabilidade-auditoria');
      await expect(anonymousPage).toHaveURL(/\/login/);
    } finally {
      await anonymousContext.close();
    }
  });
});
