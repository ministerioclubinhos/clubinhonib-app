import { expect, test } from '@playwright/test';
import {
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  type Lesson,
} from '@/features/ai-lessons/types';
import { selectStudioStage, studioDocument } from '../support/studio';

const fixture: Lesson = {
  id: 'studio-resilience',
  theme: 'Lição de teste',
  biblicalReference: 'Lucas 15',
  weekNumber: 20,
  status: LessonStatus.IN_PROGRESS,
  weekMaterialId: null,
  createdAt: '',
  updatedAt: '',
  comments: [],
  stages: [LessonStageType.LESSON, LessonStageType.STANDARD_GAME].map((type) => ({
    id: type,
    type,
    status: LessonStageStatus.DRAFT,
    currentVersionId: `v-${type}`,
    lockVersion: 1,
    failureMessage: null,
    versions: [
      {
        id: `v-${type}`,
        versionNumber: 1,
        tiptapAstJson: studioDocument(`Texto ${type}`),
        structuredDataJson: null,
        changeSummary: '',
        createdAt: '',
      },
    ],
  })),
};

test.beforeEach(async ({ page }) => {
  await page.route(/\/api\/v1\/lessons\/studio-resilience(\?.*)?$/, (route) =>
    route.fulfill({ json: fixture })
  );
});

test('SSE 403 para de reconectar; PDF 422 exibe mensagem segura e prévia tardia não aparece em outra etapa', async ({
  page,
}) => {
  let connections = 0;
  await page.route('**/api/v1/lessons/studio-resilience/events*', (route) => {
    connections += 1;
    return route.fulfill({ status: 403, json: { message: 'Acesso negado' } });
  });
  await page.route('**/api/v1/lessons/studio-resilience/stages/LESSON/preview.pdf*', (route) =>
    route.fulfill({
      status: 422,
      json: { success: false, error: { message: 'O conteúdo não cabe na folha.' } },
    })
  );
  await page.goto(`/adm/estudio/licoes/${fixture.id}`);
  await expect(page.getByTestId('ai-lesson-connection-status')).toContainText('Sem acesso');
  await page.getByRole('button', { name: 'Visualizar PDF do item' }).click();
  await expect(page.getByTestId('ai-lesson-pdf-error')).toContainText(
    'O conteúdo não cabe na folha.'
  );
  await page
    .getByTestId('ai-lesson-pdf-preview-dialog')
    .getByRole('button', { name: 'Fechar' })
    .click();
  await page.unroute('**/api/v1/lessons/studio-resilience/stages/LESSON/preview.pdf*');
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    '**/api/v1/lessons/studio-resilience/stages/LESSON/preview.pdf*',
    async (route) => {
      await pending;
      await route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.4\n%%EOF' });
    }
  );
  await page.getByRole('button', { name: 'Visualizar PDF do item' }).click();
  await expect(page.getByTestId('ai-lesson-pdf-loading')).toBeVisible();
  await page
    .getByTestId('ai-lesson-pdf-preview-dialog')
    .getByRole('button', { name: 'Fechar' })
    .click();
  await selectStudioStage(page, LessonStageType.STANDARD_GAME, 1280);
  release?.();
  await expect(page.getByTestId('ai-lesson-pdf-preview-dialog')).toBeHidden();
  await page.waitForTimeout(2300);
  expect(connections).toBe(1);
});

test('EOF reconecta e navegação por voltar/refresh preserva edição ao cancelar saída', async ({
  page,
}) => {
  let connections = 0;
  await page.route('**/api/v1/lessons/studio-resilience/events*', (route) => {
    connections += 1;
    return route.fulfill({
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify(fixture)}\n\n`,
    });
  });
  await page.route('**/api/v1/lessons?*', (route) =>
    route.fulfill({ json: { items: [fixture], total: 1, page: 1, limit: 12, totalPages: 1 } })
  );
  await page.goto('/adm/estudio/licoes');
  await page
    .getByTestId(`ai-lesson-card-${fixture.id}`)
    .getByRole('button', { name: `Abrir produção ${fixture.theme}` })
    .click();
  const editor = page.getByTestId('ai-lesson-document-editor').locator('[contenteditable="true"]');
  await editor.fill('Não perder este texto');
  await expect.poll(() => connections).toBeGreaterThan(1);
  await expect(editor).toContainText('Não perder este texto');
  await page.evaluate(() => window.history.back());
  // The in-app leave guard uses the shared dialog; staying keeps the route and the text.
  await page.getByTestId('modal-unsaved-changes-dialog').getByRole('button', { name: 'Continuar editando' }).click();
  await expect(page).toHaveURL(/studio-resilience(\?.*)?$/);
  await expect(editor).toContainText('Não perder este texto');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.evaluate(() => window.location.reload());
  await expect(editor).toContainText('Não perder este texto');
  await page.getByRole('button', { name: 'Voltar para Produção de Lições' }).click();
  await page.getByTestId('modal-unsaved-changes-dialog').getByRole('button', { name: 'Sair sem salvar' }).click();
  await expect(page).toHaveURL(/\/adm\/estudio\/licoes$/);
});
