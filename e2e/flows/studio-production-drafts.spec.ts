import { expect, test } from '@playwright/test';
import {
  LessonStageStatus,
  LessonStageType,
  type Lesson,
} from '@/features/ai-lessons/types';
import { ApiClient } from '../support/api';
import {
  createStudioFixture,
  prepareStudioFixture,
  selectStudioStage,
  studioDocument,
} from '../support/studio';

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
      const api = await ApiClient.login();
      const lesson = await createStudioFixture(api);
      try {
        const stages = [scenario.stage, scenario.next].filter(
          (type) => type !== LessonStageType.LESSON
        );
        prepareStudioFixture(lesson, stages);
        for (const type of stages) {
          const current = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
          const stage = current.stages.find((item) => item.type === type)!;
          await api.patch(`/api/v1/lessons/${lesson.id}/stages/content`, {
            stage: type,
            lockVersion: stage.lockVersion,
            tiptapAstJson: studioDocument('Conteúdo inicial'),
            structuredDataJson: { title: 'Título inicial' },
          });
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
        await field.fill(editedText);
        await expect(notice).toBeVisible();
        await expect(complete).toBeDisabled();
        await save.click();
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

        await field.fill('Edição a descartar');
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
        await expect(complete).toBeEnabled();
        await expect(save).toBeDisabled();
        await expect(notice).toHaveCount(0);
        const completed = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
        expect(completed.stages.find((item) => item.type === scenario.stage)?.status).toBe(
          LessonStageStatus.PRODUCER_APPROVED
        );

        await selectStudioStage(page, scenario.next, width);
        await expect(notice).toHaveCount(0);
        await expect(complete).toBeEnabled();
        await complete.click();
        await expect(complete).toBeEnabled();
        await expect(notice).toHaveCount(0);
        const nextCompleted = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
        expect(nextCompleted.stages.find((item) => item.type === scenario.next)?.status).toBe(
          LessonStageStatus.PRODUCER_APPROVED
        );
      } finally {
        page.on('dialog', (dialog) => dialog.accept());
        await api.delete(`/api/v1/lessons/${lesson.id}`);
        await api.dispose();
      }
    });
  }
}
