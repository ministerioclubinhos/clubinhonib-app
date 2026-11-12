import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';
import { ApiClient, uniqueSuffix } from './api';
import { assertLocalApi } from './emailFlags';
import {
  LessonStageType,
  LessonStatus,
  type Lesson,
  type TiptapDocument,
} from '@/features/ai-lessons/types';

export const studioDocument = (text: string): TiptapDocument => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

export function prepareStudioFixture(
  lesson: Lesson,
  stages: LessonStageType[] = [],
  status?: LessonStatus
) {
  assertLocalApi();
  execFileSync(
    process.execPath,
    [
      resolve('e2e/support/studioFixture.mjs'),
      JSON.stringify({ id: lesson.id, theme: lesson.theme, stages, status }),
    ],
    { stdio: 'pipe' }
  );
}
export async function createStudioFixture(
  api: ApiClient,
  suffix = uniqueSuffix()
): Promise<Lesson> {
  assertLocalApi();
  const lesson = await api.post<Lesson>('/api/v1/lessons', {
    theme: `studio-e2e-${suffix}`,
    biblicalReference: 'Lucas 15:1-7',
    weekNumber: 20,
    editorialPurpose: 'Mostrar que Deus ama e perdoa.',
  });
  prepareStudioFixture(lesson, [LessonStageType.LESSON, LessonStageType.STANDARD_GAME]);
  let updated = lesson;
  for (const type of [LessonStageType.LESSON, LessonStageType.STANDARD_GAME]) {
    const stage = updated.stages.find((item) => item.type === type)!;
    updated = await api.patch<Lesson>(`/api/v1/lessons/${lesson.id}/stages/content`, {
      stage: type,
      lockVersion: stage.lockVersion,
      tiptapAstJson: studioDocument(`Conteúdo inicial ${type}`),
      structuredDataJson: {},
    });
  }
  return updated;
}
export async function selectStudioStage(page: Page, type: LessonStageType, width: number) {
  const mode = width < 1200 ? 'mobile' : 'desktop';
  await page
    .getByTestId(`ai-lesson-stage-navigation-${mode}`)
    .getByTestId(`ai-stage-tab-${type}`)
    .click();
}

export async function createStudioReviewPackage(api: ApiClient): Promise<Lesson> {
  const lesson = await api.post<Lesson>('/api/v1/lessons', {
    theme: `studio-e2e-${uniqueSuffix()}`,
    biblicalReference: 'Lucas 15',
    weekNumber: 20,
    editorialPurpose: 'Mostrar que Deus ama e perdoa.',
  });
  prepareStudioFixture(lesson, Object.values(LessonStageType));
  let updated = lesson;
  for (const type of Object.values(LessonStageType)) {
    const stage = updated.stages.find((item) => item.type === type)!;
    updated = await api.patch<Lesson>(`/api/v1/lessons/${lesson.id}/stages/content`, {
      stage: type,
      lockVersion: stage.lockVersion,
      tiptapAstJson: studioDocument(`Conteúdo ${type}`),
      structuredDataJson: {},
    });
  }
  for (const stage of updated.stages)
    await api.post(`/api/v1/lessons/${lesson.id}/stages/complete-production`, {
      stage: stage.type,
      lockVersion: stage.lockVersion,
    });
  return api.post(`/api/v1/lessons/${lesson.id}/package/submit-review`);
}
