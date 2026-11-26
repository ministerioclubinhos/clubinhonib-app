import { expect, test } from '@playwright/test';
import {
  LessonStageStatus,
  LessonStageType,
  type Lesson,
} from '@/features/ai-lessons/types';
import { ApiClient } from '../support/api';
import {
  approvedBefore,
  confirmStaleSave,
  createLessonWithMeditations,
  createStudioFixture,
  prepareStudioFixture,
  selectStudioStage,
  stageDocument,
  studioDocument,
} from '../support/studio';

const IMAGE_STAGES = [LessonStageType.LESSON_VISUALS, LessonStageType.MANUAL_WORK];

const cases = [
  {
    stage: LessonStageType.LESSON,
    next: LessonStageType.LESSON_VISUALS,
    field: 'ai-lesson-document-editor',
  },
  {
    stage: LessonStageType.MEDITATION_YOUNGER,
    next: LessonStageType.MEDITATION_OLDER,
    field: 'younger-meditation-upper-title',
  },
  {
    stage: LessonStageType.MEDITATION_OLDER,
    next: LessonStageType.MANUAL_WORK,
    field: 'older-meditation-title',
  },
];

for (const width of [360, 1440]) {
  for (const scenario of cases) {
    test(`concluir ${scenario.stage} libera ${scenario.next} sem edições falsas em ${width}px`, async ({
      page,
    }) => {
      // Gerar meditações passa pela fila de IA (simulada), uma de cada vez.
      test.setTimeout(300_000);
      const api = await ApiClient.login();
      const isLesson = scenario.stage === LessonStageType.LESSON;
      const lesson = isLesson
        ? await createStudioFixture(api)
        : await createLessonWithMeditations(
            api,
            [scenario.stage, scenario.next].filter((type) => type !== LessonStageType.MANUAL_WORK)
          );
      try {
        if (isLesson) {
          prepareStudioFixture(lesson, [scenario.next]);
          const current = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
          await api.patch(`/api/v1/lessons/${lesson.id}/stages/content`, {
            stage: scenario.next,
            lockVersion: current.stages.find((item) => item.type === scenario.next)!.lockVersion,
            tiptapAstJson: studioDocument('Conteúdo inicial'),
            structuredDataJson: { title: 'Título inicial' },
          });
        }
        else {
          prepareStudioFixture(
            lesson,
            [scenario.stage, scenario.next],
            undefined,
            approvedBefore(scenario.stage)
          );
        }
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/adm/estudio/licoes/${lesson.id}`);
        await selectStudioStage(page, scenario.stage, width);
        const field =
          scenario.stage === LessonStageType.LESSON
            ? page.getByTestId(scenario.field).locator('[contenteditable="true"]')
            : page.getByTestId(scenario.field);
        const notice = page.getByTestId('ai-lesson-unsaved-notice');
        const save = page.getByTestId('ai-lesson-save-edit');
        const complete = page.getByTestId('ai-lesson-complete-stage');

        await expect(field).toBeVisible();
        await expect(save).toBeDisabled();
        await expect(notice).toHaveCount(0);
        await expect(complete).toBeEnabled();

        // Real edits still block completion, and saving clears only those edits.
        const editedText = `Edição salva ${scenario.stage}`;
        // No item 1 a edição acrescenta texto à narrativa: substituir o documento
        // inteiro apagaria as seções que a conclusão exige.
        const edit = async (text: string): Promise<void> => {
          if (scenario.stage !== LessonStageType.LESSON) return field.fill(text);
          const story = field.locator('p').last();
          await story.click();
          await page.keyboard.press('End');
          await page.keyboard.type(` ${text}`);
        };
        await edit(editedText);
        await expect(notice).toBeVisible();
        await expect(complete).toBeDisabled();
        await save.click();
        await confirmStaleSave(page);
        await expect(save).toBeDisabled();
        await expect(notice).toHaveCount(0);
        const saved = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
        const savedStage = saved.stages.find((item) => item.type === scenario.stage)!;
        expect(
          JSON.stringify(
            savedStage.versions.find((item) => item.id === savedStage.currentVersionId)
              ?.tiptapAstJson
          )
        ).toContain(editedText);

        await edit('Edição a descartar');
        await expect(notice).toBeVisible();
        await page.getByTestId('ai-lesson-discard-edit').click();
        await page
          .getByTestId('ai-lesson-production-confirm-dialog')
          .getByRole('button', { name: 'Descartar edição' })
          .click();
        await expect(field).toContainText(editedText);
        await expect(notice).toHaveCount(0);

        // Completion toggles edit permissions while its real API request is pending.
        await complete.click();
        // A tela avança sozinha para o próximo item: o que vale é o que persistiu.
        await expect
          .poll(async () =>
            (await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`)).stages.find(
              (item) => item.type === scenario.stage
            )?.status
          )
          .toBe(LessonStageStatus.PRODUCER_APPROVED);
        await expect(save).toBeDisabled();
        await expect(notice).toHaveCount(0);

        await selectStudioStage(page, scenario.next, width);
        await expect(notice).toHaveCount(0);
        await expect(page.getByText('Conclua a etapa anterior do fluxo antes de gerar esta.')).toHaveCount(0);
        // Os itens de imagem só concluem com artes; para eles, "liberar" é poder gerar.
        if (IMAGE_STAGES.includes(scenario.next)) return;

        await expect(complete).toBeEnabled();
        await complete.click();
        // A edição do item anterior desatualizou este: concluir sem gerar pede confirmação.
        await page
          .getByTestId('ai-lesson-production-confirm-dialog')
          .getByRole('button', { name: 'Continua válido, concluir' })
          .click();
        await expect(notice).toHaveCount(0);
        await expect
          .poll(async () =>
            (await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`)).stages.find(
              (item) => item.type === scenario.next
            )?.status
          )
          .toBe(LessonStageStatus.PRODUCER_APPROVED);
      } finally {
        page.on('dialog', (dialog) => dialog.accept());
        await api.delete(`/api/v1/lessons/${lesson.id}`);
        await api.dispose();
      }
    });
  }
}

for (const width of [360, 1440]) {
  test(`recusa por etapa anterior pendente mostra o motivo da API em ${width}px`, async ({
    page,
  }) => {
    // A tela tratava todo 409 como "atualizada em outra sessão" e escondia o que fazer.
    const api = await ApiClient.login();
    const lesson = await createStudioFixture(api);
    try {
      const stage = LessonStageType.MEDITATION_OLDER;
      prepareStudioFixture(lesson, [stage]);
      const current = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
      await api.patch(`/api/v1/lessons/${lesson.id}/stages/content`, {
        stage,
        lockVersion: current.stages.find((item) => item.type === stage)!.lockVersion,
        tiptapAstJson: stageDocument(stage, 'Conteúdo inicial'),
        structuredDataJson: { title: 'Título inicial' },
      });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/adm/estudio/licoes/${lesson.id}?stage=${stage}`);
      await page.getByTestId('ai-lesson-complete-stage').click();

      await expect(page.getByRole('alert').filter({ hasText: /precisa ser concluída pelo produtor/ })).toBeVisible();
      await expect(page.getByText(/atualizada em outra sessão/)).toHaveCount(0);
      const after = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
      expect(after.stages.find((item) => item.type === stage)?.status).toBe(LessonStageStatus.DRAFT);
    } finally {
      await api.delete(`/api/v1/lessons/${lesson.id}`);
      await api.dispose();
    }
  });
}
