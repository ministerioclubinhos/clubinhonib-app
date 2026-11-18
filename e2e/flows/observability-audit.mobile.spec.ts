import { expect, Page, Route, test } from '@playwright/test';

const SHOTS = process.env.OBS_MOBILE_SHOTS;
const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
const paged = <T,>(data: T[]) => ({ data, total: 57, page: 1, limit: 25, pageCount: 3 });

const common = (id: string) => ({
  schemaVersion: '1',
  eventId: `0f8fad5b-d9cb-469f-a165-7086772895${id}`,
  environment: 'local',
  service: 'clubinhonib-api',
  occurredAt: '2026-09-05T12:00:00.000Z',
  requestId: `7c9e6679-7425-40de-944b-e07fc1f903${id}`,
  sourceType: 'http',
  actorType: 'user',
  actorId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  actorRole: 'admin',
});
const observability = [
  {
    ...common('01'),
    recordType: 'observability',
    level: 'error',
    context: 'OpenAiLessonService',
    moduleName: 'AiLessonsModule',
    operation: 'generate',
    message:
      '[repetido 165x em 60s] Falha ao enviar "Neste dia não vai ter Clubinho" para um destinatário com uma mensagem bem longa para testar a quebra.',
    errorName: 'AppInternalException',
    errorCode: 'INT_9001',
    errorMessage: 'Data command failed',
    errorFingerprint: 'abc123',
    sourceFile: 'src/modules/ai-lessons/services/open-ai-lesson.service.ts',
    sourceLine: 612,
    httpMethod: 'POST',
    routeTemplate: '/api/v1/lessons/:id/stages/generate',
    statusCode: 500,
    durationMs: 120863,
    providerName: null,
    jobName: null,
    occurrenceCount: 165,
  },
  {
    ...common('02'),
    recordType: 'observability',
    level: 'warn',
    context: 'GlobalExceptionFilter',
    moduleName: 'WeekMaterialsPageModule',
    operation: 'create',
    message: '[VAL_4001] Já existe material para esta semana.',
    errorName: 'AppConflictException',
    errorCode: 'RES_5002',
    errorMessage: null,
    errorFingerprint: 'def456',
    sourceFile: null,
    sourceLine: null,
    httpMethod: 'POST',
    routeTemplate: '/week-material-pages',
    statusCode: 409,
    durationMs: 14,
    providerName: null,
    jobName: null,
    occurrenceCount: 1,
  },
];
const audit = [
  {
    ...common('03'),
    recordType: 'audit',
    actorName: 'Maria Aparecida de Souza',
    actionType: 'http_request',
    actionName: 'WeekMaterialsPageModule.WeekMaterialsPageController.setCurrentWeek',
    moduleName: 'WeekMaterialsPageModule',
    controllerName: 'WeekMaterialsPageController',
    handlerName: 'setCurrentWeek',
    resourceType: 'week-material-pages',
    resourceId: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    outcome: 'rejected',
    httpMethod: 'POST',
    routeTemplate: '/week-material-pages/:id/current-week',
    statusCode: 409,
    durationMs: 8,
    errorCode: 'RES_5002',
    occurrenceCount: 4,
    jobName: null,
  },
];

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('Observabilidade e auditoria no celular', () => {
  test.use({ viewport: { width: 360, height: 760 } });

  test('as duas abas, os filtros e o modal cabem em 360 px sem rolagem lateral', async ({ page }) => {
    await page.route('**/log-records/observability**', (route) => json(route, paged(observability)));
    await page.route('**/log-records/audit**', (route) => json(route, paged(audit)));
    await page.goto('/adm/observabilidade-auditoria');
    await expect(page.locator('[data-testid^="observability-record-row"]').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    // O total aparece no topo do painel e na paginação.
    await expect(page.getByTestId('observability-records-panel-total')).toContainText('57 registros');
    await expect(page.getByTestId('observability-records-pagination-total')).toContainText('Total: 57 registros');
    // O período já sobe preenchido com a semana atual, em dias inteiros.
    await expect(page.getByTestId('observability-records-period-error')).toHaveCount(0);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/1-obs.png`, fullPage: true });

    await page.locator('[data-testid^="observability-record-row"]').first().click();
    await expect(page.getByTestId('record-details-dialog')).toBeVisible();
    await expectNoHorizontalScroll(page);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/2-details.png` });
    await page.getByTestId('record-details-close').click();

    await page.getByTestId('observability-audit-tab-audit').click();
    await expect(page.locator('[data-testid^="audit-record-row"]').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    // Os filtros avançados abrem em uma coluna, sem estourar a largura.
    const toolbar = page.getByTestId('audit-records-toolbar');
    await toolbar.getByRole('button', { name: 'Filtros', exact: true }).click();
    await expect(toolbar.getByLabel('ID do ator')).toBeVisible();
    await expectNoHorizontalScroll(page);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/3-audit.png`, fullPage: true });

    // O nome de quem agiu não aparece na lista, só no modal; e há filtro por nome.
    await expect(toolbar.getByLabel('Nome do usuário')).toBeVisible();
    await expect(page.locator('[data-testid^="audit-record-row"]').first()).not.toContainText('Maria Aparecida');
    await page.locator('[data-testid^="audit-record-row"]').first().getByRole('button').first().click();
    const dialog = page.getByTestId('record-details-dialog');
    await expect(dialog.getByTestId('record-details-field-actor-name')).toContainText('Maria Aparecida de Souza');
    await expect(dialog.getByTestId('record-details-dialog-section-who')).toBeVisible();
    // Campo vazio não ocupa espaço no modal.
    await expect(dialog.getByTestId('record-details-field-job')).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/5-audit-details.png` });
    await page.getByTestId('record-details-close').click();
    if (SHOTS) {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.screenshot({ path: `${SHOTS}/4-audit-desktop.png` });
    }
  });
});
