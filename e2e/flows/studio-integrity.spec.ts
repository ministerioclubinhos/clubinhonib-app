import { expect, test } from '@playwright/test';
import { ApiClient, uniqueSuffix } from '../support/api';
import {
  createStudioFixture,
  selectStudioStage,
  studioDocument,
  prepareStudioFixture,
} from '../support/studio';
import {
  LessonStageType,
  LessonStatus,
  type Lesson,
  type LessonListResponse,
  type SaveTiptapPayload,
  type AdminPromptPreference,
} from '@/features/ai-lessons/types';
import { REVIEW_LESSON_STATUSES } from '@/features/ai-lessons/constants';

for (const width of [360, 1440]) {
  test(`preserva etapas, lock base e edições concorrentes em ${width}px`, async ({ page }) => {
    const api = await ApiClient.login();
    const lesson = await createStudioFixture(api);
    try {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/adm/estudio/licoes/${lesson.id}`);
      const editor = page
        .getByTestId('ai-lesson-document-editor')
        .locator('[contenteditable="true"]');
      await editor.fill('Edição local A');
      await expect(page.getByTestId('ai-lesson-complete-stage')).toBeDisabled();
      await selectStudioStage(page, LessonStageType.STANDARD_GAME, width);
      await editor.fill('Edição local da brincadeira');
      await selectStudioStage(page, LessonStageType.LESSON, width);
      await expect(editor).toContainText('Edição local A');
      const original = lesson.stages.find((stage) => stage.type === LessonStageType.LESSON)!;
      const savedB = await api.patch<Lesson>(`/api/v1/lessons/${lesson.id}/stages/content`, {
        stage: LessonStageType.LESSON,
        lockVersion: original.lockVersion,
        tiptapAstJson: studioDocument('Texto remoto B'),
        structuredDataJson: {},
      });
      // Wait for a genuine SSE snapshot carrying B before saving A.
      await expect(page.getByTestId('ai-lesson-connection-status')).toHaveCount(0);
      await expect
        .poll(
          async () =>
            (await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`)).stages.find(
              (stage) => stage.type === LessonStageType.LESSON
            )?.lockVersion
        )
        .toBe(savedB.stages.find((stage) => stage.type === LessonStageType.LESSON)?.lockVersion);
      // The server sends snapshots every 2s; clock time alone is not used as the conflict assertion.
      await page.waitForTimeout(2200);
      const request = page.waitForRequest(
        (req) => req.method() === 'PATCH' && req.url().endsWith('/stages/content')
      );
      await page.getByTestId('ai-lesson-save-edit').click();
      expect((await request).postDataJSON() as SaveTiptapPayload).toMatchObject({
        lockVersion: original.lockVersion,
      });
      await expect(page.getByTestId('ai-lesson-save-error')).toContainText('outra sessão');
      await expect(editor).toContainText('Edição local A');
      const persisted = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
      expect(
        JSON.stringify(
          persisted.stages.find((stage) => stage.type === LessonStageType.LESSON)?.versions
        )
      ).toContain('Texto remoto B');
      await selectStudioStage(page, LessonStageType.STANDARD_GAME, width);
      await expect(editor).toContainText('Edição local da brincadeira');
      // Confirm browser-native leave protection separately from stage navigation.
      await page.getByRole('button', { name: 'Voltar para Produção de Lições' }).click();
      await page
        .getByTestId('modal-unsaved-changes-dialog')
        .getByRole('button', { name: 'Continuar editando' })
        .click();
      // The selected item now lives in the URL (?stage=).
      await expect(page).toHaveURL(new RegExp(`${lesson.id}(\\?.*)?$`));
      const bounds = await page.getByTestId('ai-lessons-detail').boundingBox();
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width);
    } finally {
      page.on('dialog', (dialog) => dialog.accept());
      await api.delete(`/api/v1/lessons/${lesson.id}`);
      await api.dispose();
    }
  });
}

test('save pendente não limpa texto digitado depois; API recebe a segunda revisão ao salvar novamente', async ({
  page,
}) => {
  const api = await ApiClient.login();
  const lesson = await createStudioFixture(api);
  try {
    await page.goto(`/adm/estudio/licoes/${lesson.id}`);
    const editor = page
      .getByTestId('ai-lesson-document-editor')
      .locator('[contenteditable="true"]');
    await editor.fill('Primeiro envio');
    let release: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      `**/api/v1/lessons/${lesson.id}/stages/content`,
      async (route) => {
        const response = await route.fetch();
        await held;
        await route.fulfill({ response });
      },
      { times: 1 }
    );
    const sent = page.waitForRequest(
      (req) => req.method() === 'PATCH' && req.url().endsWith('/stages/content')
    );
    await page.getByTestId('ai-lesson-save-edit').click();
    await sent;
    await editor.fill('Texto digitado durante o envio');
    await expect(page.getByTestId('ai-lesson-complete-stage')).toBeDisabled();
    release?.();
    await expect(page.getByTestId('ai-lesson-save-edit')).toBeEnabled();
    await expect(editor).toContainText('Texto digitado durante o envio');
    await page.getByTestId('ai-lesson-save-edit').click();
    await expect(page.getByTestId('ai-lesson-unsaved-notice')).toHaveCount(0);
    const persisted = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
    const stage = persisted.stages.find((item) => item.type === LessonStageType.LESSON)!;
    expect(
      JSON.stringify(
        stage.versions.find((item) => item.id === stage.currentVersionId)?.tiptapAstJson
      )
    ).toContain('Texto digitado durante o envio');
  } finally {
    await api.delete(`/api/v1/lessons/${lesson.id}`);
    await api.dispose();
  }
});

test('fila filtra antes da página: 12 rascunhos recentes não escondem dois revisáveis', async ({
  page,
}) => {
  const api = await ApiClient.login();
  const suffix = uniqueSuffix();
  const created: Lesson[] = [];
  try {
    for (let index = 0; index < 14; index += 1) {
      const lesson = await api.post<Lesson>('/api/v1/lessons', {
        theme: `studio-e2e-${suffix}-${index}`,
        biblicalReference: 'Lucas 15',
        weekNumber: 20,
      });
      created.push(lesson);
      if (index < 2) prepareStudioFixture(lesson, [], LessonStatus.IN_REVIEW);
    }
    await page.goto('/adm/estudio/revisao');
    await page.getByPlaceholder('Buscar por tema ou referência bíblica...').fill(suffix);
    await expect(page.locator('[data-testid^="ai-lesson-review-card-"]')).toHaveCount(2);
    const filtered = await api.get<LessonListResponse>('/api/v1/lessons', {
      statuses: REVIEW_LESSON_STATUSES.join(','),
      search: suffix,
      limit: 12,
    });
    expect(filtered.total).toBe(2);
    await page
      .getByPlaceholder('Buscar por tema ou referência bíblica...')
      .fill(`${suffix}-absent`);
    await expect(
      page.getByText('Nenhuma lição pronta para revisão', { exact: true })
    ).toBeVisible();
  } finally {
    for (const lesson of created) await api.delete(`/api/v1/lessons/${lesson.id}`);
    await api.dispose();
  }
});

test('salvar e restaurar um prompt preserva o outro rascunho e seu lock', async ({ page }) => {
  const api = await ApiClient.login();
  const initial = await api.get<AdminPromptPreference[]>('/api/v1/lessons/prompt-preferences/me');
  const suffix = uniqueSuffix();
  try {
    await page.goto('/adm/estudio/orientacoes');
    await page
      .getByTestId('admin-prompt-page-input-LESSON')
      .getByRole('textbox')
      .fill(`Orientação A ${suffix}`);
    await page.getByTestId('admin-prompts-tab-standard-game').click();
    await page
      .getByTestId('admin-prompt-page-input-STANDARD_GAME')
      .getByRole('textbox')
      .fill(`Orientação B ${suffix}`);
    await page.getByTestId('admin-prompts-tab-lesson').click();
    await page.getByTestId('admin-prompts-save').click();
    await expect(page.getByTestId('admin-prompts-feedback')).toContainText('Orientação salva');
    await page.getByTestId('admin-prompts-reset-open').click();
    await page.getByTestId('admin-prompts-reset-confirm').click();
    await expect(page.getByTestId('admin-prompt-page-reset-dialog')).toBeHidden();
    await page.getByTestId('admin-prompts-tab-standard-game').click();
    await expect(
      page.getByTestId('admin-prompt-page-input-STANDARD_GAME').getByRole('textbox')
    ).toHaveValue(`Orientação B ${suffix}`);
    await page.getByTestId('admin-prompts-save').click();
    await expect(page.getByTestId('admin-prompts-feedback')).toContainText('Orientação salva');
    const saved = await api.get<AdminPromptPreference[]>('/api/v1/lessons/prompt-preferences/me');
    expect(saved.find((item) => item.stage === LessonStageType.STANDARD_GAME)?.customPrompt).toBe(
      `Orientação B ${suffix}`
    );
  } finally {
    // A API versiona cada orientação: restaurar e regravar exigem a versão atual.
    const path = '/api/v1/lessons/prompt-preferences/me';
    for (const stage of [LessonStageType.LESSON, LessonStageType.STANDARD_GAME]) {
      const versionOf = async () =>
        (await api.get<AdminPromptPreference[]>(path)).find((item) => item.stage === stage)
          ?.lockVersion ?? null;
      const lockVersion = await versionOf();
      if (lockVersion !== null) await api.post(`${path}/reset`, { stage, lockVersion });
      const original = initial.find((item) => item.stage === stage);
      if (original?.customPrompt) {
        const afterReset = await versionOf();
        await api.patch(path, {
          stage,
          prompt: original.customPrompt,
          ...(afterReset !== null ? { lockVersion: afterReset } : {}),
        });
      }
    }
    await api.dispose();
  }
});

for (const target of [
  LessonStageType.LESSON,
  LessonStageType.VERSE_VISUALS,
  LessonStageType.MANUAL_WORK,
]) {
  test(`devolve, salva, conclui e revisa novamente ${target} sem fabricar estados no cliente`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const api = await ApiClient.login();
    const { createStudioReviewPackage } = await import('../support/studio');
    const lesson = await createStudioReviewPackage(api);
    const tab = `ai-lesson-review-tab-${target.toLowerCase().replaceAll('_', '-')}`;
    try {
      await page.goto(`/adm/estudio/revisao/${lesson.id}`);
      await page.getByTestId(tab).click();
      await page
        .getByTestId('ai-lesson-review-feedback-input')
        .fill('Ajustar o conteúdo desta etapa para a turma.');
      await page.getByTestId('ai-lesson-review-request-changes').click();
      await expect(page.getByTestId('ai-lesson-review-request-changes')).toBeDisabled();
      let current = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
      expect(current.status).toBe(LessonStatus.CHANGES_REQUESTED);
      const returned = current.stages.find((item) => item.type === target)!;
      expect(returned.status).toBe('CHANGES_REQUESTED');
      // A separate producer saves through the real contract; visual/manual stages have no text editor.
      current = await api.patch<Lesson>(`/api/v1/lessons/${lesson.id}/stages/content`, {
        stage: target,
        lockVersion: returned.lockVersion,
        tiptapAstJson: studioDocument('Conteúdo ajustado'),
        structuredDataJson: {},
      });
      for (const item of current.stages.filter((stage) =>
        ['DRAFT', 'STALE', 'CHANGES_REQUESTED'].includes(stage.status)
      )) {
        await api.post(`/api/v1/lessons/${lesson.id}/stages/complete-production`, {
          stage: item.type,
          lockVersion: item.lockVersion,
        });
      }
      await page.reload();
      await expect(page.getByTestId('ai-lesson-review-start')).toBeVisible();
      await page.getByTestId('ai-lesson-review-start').click();
      await expect(page.getByTestId('ai-lesson-review-start')).toBeHidden();
      await page.getByTestId(tab).click();
      await expect(page.getByTestId('ai-lesson-review-approve')).toBeEnabled();
      await page.getByTestId('ai-lesson-review-approve').click();
      await expect(page.getByTestId('ai-lesson-review-approve')).toHaveText('Item Aprovado');
      const persisted = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
      expect(persisted.stages.find((stage) => stage.type === target)?.status).toBe('APPROVED');
    } finally {
      await api.delete(`/api/v1/lessons/${lesson.id}`);
      await api.dispose();
    }
  });
}
