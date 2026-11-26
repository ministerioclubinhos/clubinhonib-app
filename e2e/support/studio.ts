import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, type Page } from '@playwright/test';
import { ApiClient, uniqueSuffix } from './api';
import { assertLocalApi } from './emailFlags';
import {
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  type Lesson,
  type TiptapDocument,
} from '@/features/ai-lessons/types';
import { STUDIO_STAGE_ORDER } from '@/features/ai-lessons/constants';

export const studioDocument = (text: string): TiptapDocument => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

const heading = (text: string) => ({
  type: 'heading',
  attrs: { level: 2 },
  content: [{ type: 'text', text }],
});
const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

/**
 * Item 1 no formato canônico. A API só conclui a lição com a narrativa e o
 * versículo principal (texto, referência e NVI) em suas seções.
 */
export const lessonDocument = (story: string): TiptapDocument => ({
  type: 'doc',
  content: [
    heading('VERSÍCULO PARA MEMORIZAR'),
    paragraph('“Eu sou o bom pastor.”'),
    paragraph('João 10:11 — NVI'),
    heading('LIÇÃO BÍBLICA'),
    paragraph(story.endsWith('.') ? story : `${story}.`),
  ],
});

export const stageDocument = (type: LessonStageType, text: string): TiptapDocument =>
  type === LessonStageType.LESSON ? lessonDocument(text) : studioDocument(text);

export function prepareStudioFixture(
  lesson: Lesson,
  stages: LessonStageType[] = [],
  status?: LessonStatus,
  stageStatuses: Partial<Record<LessonStageType, string>> = {}
) {
  assertLocalApi();
  execFileSync(
    process.execPath,
    [
      resolve('e2e/support/studioFixture.mjs'),
      JSON.stringify({ id: lesson.id, theme: lesson.theme, stages, status, stageStatuses }),
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
      tiptapAstJson: stageDocument(type, `Conteúdo inicial ${type}`),
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
  // A troca roda numa transição do roteador: sem esperar, a ação seguinte cai no
  // editor da etapa anterior. O item aberto fica no endereço (sem o parâmetro, é
  // o item 1).
  await expect
    .poll(() => new URL(page.url()).searchParams.get('stage') ?? LessonStageType.LESSON)
    .toBe(type);
}

/**
 * Salvar um item com dependentes em produção pede confirmação, que lista o que
 * ficará desatualizado.
 */
export async function confirmStaleSave(page: Page): Promise<void> {
  const dialog = page.getByTestId('ai-lesson-production-confirm-dialog');
  await expect(dialog).toContainText('marca como desatualizados');
  await dialog.getByRole('button', { name: 'Salvar mesmo assim' }).click();
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
      tiptapAstJson: stageDocument(type, `Conteúdo ${type}`),
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

/* ------------------------------------------------------------------ *
 * Lições geradas pela LLM fake (`AI_PROVIDER_MODE=fake`)
 * ------------------------------------------------------------------ */

/** Versículo que a LLM fake devolve no item 1 (`AI_FAKE_MEMORY_VERSE` da API). */
export const FAKE_VERSE = {
  text: 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.',
  reference: 'João 3:16',
} as const;

const AFTER_LESSON = Object.values(LessonStageType).filter(
  (type) => type !== LessonStageType.LESSON
);

export const stageOfLesson = (lesson: Lesson, type: LessonStageType) =>
  lesson.stages.find((stage) => stage.type === type)!;

export const stageStatusesOf = (lesson: Lesson): Record<string, string> =>
  Object.fromEntries(lesson.stages.map((stage) => [stage.type, stage.status]));

export const memoryVerseOf = (lesson: Lesson) => {
  const stage = stageOfLesson(lesson, LessonStageType.LESSON);
  const version = stage.versions.find((item) => item.id === stage.currentVersionId);
  return (version?.structuredDataJson?.memoryVerse ?? null) as {
    text: string;
    reference: string;
    version: string;
  } | null;
};

export async function pollStage(
  api: ApiClient,
  lessonId: string,
  type: LessonStageType,
  timeoutMs = 90_000
): Promise<Lesson> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const lesson = await api.get<Lesson>(`/api/v1/lessons/${lessonId}`);
    if (stageOfLesson(lesson, type).status !== 'GENERATING') return lesson;
    if (Date.now() > deadline) throw new Error(`A geração de ${type} não terminou a tempo`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

/** Gera o item 1 de verdade, pela fila e pelo worker, com a LLM fake. Termina em rascunho. */
export async function createGeneratedLesson(api: ApiClient): Promise<Lesson> {
  assertLocalApi();
  const lesson = await api.post<Lesson>('/api/v1/lessons', {
    theme: `studio-e2e-verso-${uniqueSuffix()}`,
    biblicalReference: 'Lucas 15:1-7',
    weekNumber: 22,
    editorialPurpose: 'Mostrar que Deus ama e perdoa.',
  });
  await api.post(`/api/v1/lessons/${lesson.id}/stages/generate`, { stage: LessonStageType.LESSON });
  const generated = await pollStage(api, lesson.id, LessonStageType.LESSON);
  expect(stageOfLesson(generated, LessonStageType.LESSON).status).toBe('DRAFT');
  return generated;
}

/** Os itens anteriores concluídos: o Estúdio só gera e conclui na ordem do fluxo. */
export const approvedBefore = (stage: LessonStageType): Partial<Record<LessonStageType, string>> =>
  Object.fromEntries(
    STUDIO_STAGE_ORDER.slice(0, STUDIO_STAGE_ORDER.indexOf(stage)).map((type) => [
      type,
      LessonStageStatus.PRODUCER_APPROVED,
    ])
  );

/**
 * Lição com as meditações pedidas geradas pelo fluxo real (fila, worker e
 * guardas) com a IA simulada. Cada uma é gerada com as anteriores concluídas e
 * todas voltam para produção (rascunho).
 */
export async function createLessonWithMeditations(
  api: ApiClient,
  meditations: LessonStageType[]
): Promise<Lesson> {
  let lesson = await createGeneratedLesson(api);
  for (const type of meditations) {
    prepareStudioFixture(lesson, [], undefined, approvedBefore(type));
    await api.post(`/api/v1/lessons/${lesson.id}/stages/generate`, { stage: type });
    lesson = await pollStage(api, lesson.id, type);
    expect(stageOfLesson(lesson, type).status, `geração de ${type}`).toBe(LessonStageStatus.DRAFT);
  }
  return lesson;
}

export async function concludeStage(
  api: ApiClient,
  lesson: Lesson,
  type: LessonStageType
): Promise<Lesson> {
  await api.post(`/api/v1/lessons/${lesson.id}/stages/complete-production`, {
    stage: type,
    lockVersion: stageOfLesson(lesson, type).lockVersion,
  });
  return api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
}

/**
 * Item 1 gerado pela LLM fake e concluído pela API, e os itens 2 a 8 já
 * produzidos: cada um tem uma versão simples (concluir os visuais exige imagens
 * reais) e o status é ajustado no banco de teste. `reviewCycle` leva o pacote
 * inteiro para a revisão final, como se tivesse sido enviado ao revisor.
 */
export async function createLessonWithDownstream(
  api: ApiClient,
  options: { reviewCycle?: boolean } = {}
): Promise<Lesson> {
  let lesson = await concludeStage(api, await createGeneratedLesson(api), LessonStageType.LESSON);
  prepareStudioFixture(lesson, AFTER_LESSON);
  lesson = await api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
  for (const type of AFTER_LESSON) {
    const stage = stageOfLesson(lesson, type);
    lesson = await api.patch<Lesson>(`/api/v1/lessons/${lesson.id}/stages/content`, {
      stage: type,
      lockVersion: stage.lockVersion,
      tiptapAstJson: stageDocument(type, `Conteúdo ${type}`),
      structuredDataJson: {},
    });
  }
  const status = options.reviewCycle ? 'IN_REVIEW' : 'PRODUCER_APPROVED';
  prepareStudioFixture(
    lesson,
    [],
    options.reviewCycle ? LessonStatus.IN_REVIEW : undefined,
    Object.fromEntries(Object.values(LessonStageType).map((type) => [type, status]))
  );
  return api.get<Lesson>(`/api/v1/lessons/${lesson.id}`);
}

/** Apaga a lição de teste, qualquer que seja o estado em que o teste a deixou. */
export async function removeStudioLesson(api: ApiClient, lesson: Lesson): Promise<void> {
  prepareStudioFixture(lesson, [], LessonStatus.DRAFT);
  await api.send('DELETE', `/api/v1/lessons/${lesson.id}`);
}
