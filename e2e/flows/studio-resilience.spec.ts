import { expect, test } from '@playwright/test';

import { LessonStageType, type Lesson } from '@/features/ai-lessons/types';

import { ApiClient } from '../support/api';
import { createStudioFixture, selectStudioStage } from '../support/studio';

/**
 * A lição é real; só as falhas são injetadas (SSE recusado ou encerrado e PDF
 * recusado), porque não há como provocá-las no servidor sob demanda.
 */
let api: ApiClient;
let lesson: Lesson;

test.beforeEach(async () => {
  api = await ApiClient.login();
  lesson = await createStudioFixture(api);
});

test.afterEach(async () => {
  await api.delete(`/api/v1/lessons/${lesson.id}`);
  await api.dispose();
});

test('SSE 403 para de reconectar; PDF 422 exibe mensagem segura e prévia tardia não aparece em outra etapa', async ({
  page,
}) => {
  let connections = 0;
  await page.route(`**/api/v1/lessons/${lesson.id}/events*`, (route) => {
    connections += 1;
    return route.fulfill({ status: 403, json: { message: 'Acesso negado' } });
  });
  await page.route(`**/api/v1/lessons/${lesson.id}/stages/LESSON/preview.pdf*`, (route) =>
    route.fulfill({
      status: 422,
      json: { success: false, error: { message: 'O conteúdo não cabe na folha.' } },
    })
  );
  await page.goto(`/adm/estudio/licoes/${lesson.id}`);
  await expect(page.getByTestId('ai-lesson-connection-status')).toContainText('Sem acesso');
  await page.getByRole('button', { name: 'Visualizar PDF do item' }).click();
  await expect(page.getByTestId('ai-lesson-pdf-error')).toContainText(
    'O conteúdo não cabe na folha.'
  );
  await page
    .getByTestId('ai-lesson-pdf-preview-dialog')
    .getByRole('button', { name: 'Fechar' })
    .click();
  await page.unroute(`**/api/v1/lessons/${lesson.id}/stages/LESSON/preview.pdf*`);
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    `**/api/v1/lessons/${lesson.id}/stages/LESSON/preview.pdf*`,
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
  await page.route(`**/api/v1/lessons/${lesson.id}/events*`, (route) => {
    connections += 1;
    return route.fulfill({
      contentType: 'text/event-stream',
      // O retrato real da lição, e o servidor "cai" em seguida (EOF).
      body: `data: ${JSON.stringify(lesson)}\n\n`,
    });
  });
  await page.goto('/adm/estudio/licoes');
  await page.getByPlaceholder(/Buscar/).fill(lesson.theme);
  await page.getByTestId(`ai-lesson-card-action-${lesson.id}`).click();
  await expect(page).toHaveURL(new RegExp(`/adm/estudio/licoes/${lesson.id}`));
  const editor = page.getByTestId('ai-lesson-document-editor').locator('[contenteditable="true"]');
  await editor.fill('Não perder este texto');
  await expect.poll(() => connections).toBeGreaterThan(1);
  await expect(editor).toContainText('Não perder este texto');
  await page.evaluate(() => window.history.back());
  // The in-app leave guard uses the shared dialog; staying keeps the route and the text.
  await page.getByTestId('modal-unsaved-changes-dialog').getByRole('button', { name: 'Continuar editando' }).click();
  await expect(page).toHaveURL(new RegExp(`${lesson.id}(\\?.*)?$`));
  await expect(editor).toContainText('Não perder este texto');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.evaluate(() => window.location.reload());
  await expect(editor).toContainText('Não perder este texto');
  await page.getByRole('button', { name: 'Voltar para Produção de Lições' }).click();
  await page.getByTestId('modal-unsaved-changes-dialog').getByRole('button', { name: 'Sair sem salvar' }).click();
  await expect(page).toHaveURL(/\/adm\/estudio\/licoes$/);
});

for (const width of [375, 1440]) {
  test(`abrir uma lição encontrada pela busca permanece na lição, em ${width}px`, async ({ page }) => {
    // A listagem regravava a busca na URL durante a troca de tela e voltava.
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/adm/estudio/licoes');
    await page.getByPlaceholder(/Buscar/).fill(lesson.theme);
    await expect(page).toHaveURL(new RegExp(`busca=${lesson.theme}`));
    await page.getByTestId(`ai-lesson-card-action-${lesson.id}`).click();
    await expect(page.getByTestId('ai-lesson-document-editor')).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(new RegExp(`/adm/estudio/licoes/${lesson.id}`));

    // E voltar pelo navegador devolve a lista com a busca.
    await page.goBack();
    await expect(page.getByPlaceholder(/Buscar/)).toHaveValue(lesson.theme);
  });
}

test('abrir antes de a busca chegar à URL também permanece na lição', async ({ page }) => {
  await page.goto('/adm/estudio/licoes');
  await expect(page.getByTestId(`ai-lesson-card-action-${lesson.id}`)).toBeVisible();
  // Clica dentro do atraso da busca: o timer vence já com a lição aberta.
  await page.getByPlaceholder(/Buscar/).fill(lesson.theme);
  await page.getByTestId(`ai-lesson-card-action-${lesson.id}`).click();
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(new RegExp(`/adm/estudio/licoes/${lesson.id}`));
  await expect(page.getByTestId('ai-lesson-document-editor')).toBeVisible();
});

for (const width of [375, 1440]) {
  test(`o "voltar" do navegador não descarta a configuração de IA sem avisar, em ${width}px`, async ({
    page,
  }) => {
    // Aqui nada é salvo no navegador: sem o aviso, a edição se perdia.
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/adm/estudio/orientacoes');
    // Navegação interna pelo atalho do rodapé, como o administrador faz.
    await page.getByRole('contentinfo').getByRole('link', { name: /Provedores e Modelos IA/ }).click();
    await page.getByTestId('ai-provider-radio-gemini').click();
    const retries = page.getByTestId('ai-provider-gemini-max-retries');
    await retries.fill('2');

    await page.goBack();
    const dialog = page.getByTestId('modal-unsaved-changes-dialog');
    await dialog.getByRole('button', { name: 'Continuar editando' }).click();
    await expect(page).toHaveURL(/\/adm\/config-provedores-ia$/);
    await expect(retries).toHaveValue('2');

    await page.goBack();
    await dialog.getByRole('button', { name: 'Sair sem salvar' }).click();
    await expect(page).toHaveURL(/\/adm\/estudio\/orientacoes$/);
  });
}

