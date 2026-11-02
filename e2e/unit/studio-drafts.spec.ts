import { expect, test } from '@playwright/test';
import {
  acknowledgeLessonDraft,
  acknowledgePromptDraft,
  composeEffectivePromptPreview,
  editLessonDraft,
  editPromptDraft,
  hasDuplicatedBasePrompt,
  isValidComplementaryPrompt,
  lessonDraftKey,
  resolvePromptDraftValue,
  stripDuplicatedBasePrompt,
} from '@/features/ai-lessons/drafts';
import { lessonProductionActions, canPublishLesson } from '@/features/ai-lessons/workflow';
import {
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  type Lesson,
  type LessonStage,
  type LessonVersion,
  type TiptapDocument,
  type AdminPromptPreference,
} from '@/features/ai-lessons/types';
import {
  EDITABLE_STAGE_STATUSES,
  GENERATION_BLOCKED_LESSON_STATUSES,
  PROMPT_COMPLEMENTARY_HEADER,
  PROMPT_OFFICIAL_QUALITY_MARKER,
  STUDIO_STAGE_ORDER,
} from '@/features/ai-lessons/constants';

const document: TiptapDocument = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Edição A' }] }],
};
const version: LessonVersion = {
  id: 'v1',
  versionNumber: 1,
  tiptapAstJson: document,
  structuredDataJson: { marker: 'base A' },
  changeSummary: '',
  createdAt: '',
};
const stage: LessonStage = {
  id: 'stage-a',
  type: LessonStageType.LESSON,
  status: LessonStageStatus.DRAFT,
  lockVersion: 1,
  currentVersionId: 'v1',
  failureMessage: null,
  versions: [version],
};
const lesson: Lesson = {
  id: 'lesson-a',
  status: LessonStatus.IN_PROGRESS,
  theme: 'Teste',
  biblicalReference: 'Lucas 1',
  weekNumber: 1,
  weekMaterialId: null,
  createdAt: '',
  updatedAt: '',
  comments: [],
  stages: [stage],
};
const preference: AdminPromptPreference = {
  stage: LessonStageType.LESSON,
  lockVersion: 1,
  basePrompt: 'base original',
  customPrompt: null,
  effectivePrompt: 'base original',
};

test('SSE/refetch não altera lock nem dados estruturados da edição iniciada em N', () => {
  const first = editLessonDraft(undefined, lesson.id, stage, version, document);
  const remote = { ...stage, lockVersion: 2 };
  const second = editLessonDraft(
    first,
    lesson.id,
    remote,
    { ...version, structuredDataJson: { marker: 'B' } },
    { ...document, content: [] }
  );
  expect(second.lockVersion).toBe(1);
  expect(second.structuredData).toEqual({ marker: 'base A' });
  expect(second.document.content).toEqual([]);
});

test('save limpa somente revisão enviada; texto digitado depois continua com base da própria gravação', () => {
  const sent = editLessonDraft(undefined, lesson.id, stage, version, document);
  const key = lessonDraftKey(lesson.id, stage.type);
  const other = editLessonDraft(undefined, 'other-lesson', stage, version, document);
  const otherKey = lessonDraftKey(other.lessonId, other.stage);
  const newer = editLessonDraft(sent, lesson.id, stage, version, { type: 'doc', content: [] });
  const saved = { ...stage, lockVersion: 2 };
  expect(acknowledgeLessonDraft({ [key]: sent, [otherKey]: other }, sent, saved)).toEqual({
    [otherKey]: other,
  });
  const retained = acknowledgeLessonDraft({ [key]: newer, [otherKey]: other }, sent, saved);
  expect(retained[key]?.document).toEqual(newer.document);
  expect(retained[key]?.lockVersion).toBe(2);
  expect(retained[otherKey]).toBe(other);
});

test('dois prompts dirty preservam base e texto ao salvar/resetar um alvo', () => {
  const first = editPromptDraft(undefined, preference, 'edição da etapa A');
  const secondPref = { ...preference, stage: LessonStageType.MANUAL_WORK };
  const second = editPromptDraft(undefined, secondPref, 'edição da etapa B');
  const saved = { ...preference, lockVersion: 2 };
  expect(acknowledgePromptDraft({ LESSON: first, MANUAL_WORK: second }, first, saved)).toEqual({
    MANUAL_WORK: second,
  });
  const later = editPromptDraft(first, saved, 'mais texto depois do envio');
  expect(later.base.lockVersion).toBe(1);
  expect(acknowledgePromptDraft({ LESSON: later }, first, saved).LESSON).toEqual({
    value: later.value,
    base: saved,
  });
});

test('prompt complementar inicializa apenas customPrompt e limpa duplicação legada do basePrompt', () => {
  expect(resolvePromptDraftValue(undefined, preference)).toBe('');
  expect(
    resolvePromptDraftValue(undefined, { ...preference, customPrompt: 'Foco em crianças de 6 anos' })
  ).toBe('Foco em crianças de 6 anos');
  expect(composeEffectivePromptPreview('Base oficial', '')).toBe('Base oficial');
  expect(composeEffectivePromptPreview('Base oficial', 'Instrução extra')).toBe(
    `Base oficial\n\n${PROMPT_COMPLEMENTARY_HEADER}\nInstrução extra`
  );
  expect(isValidComplementaryPrompt('curto')).toBe(false);
  expect(isValidComplementaryPrompt('Orientação pedagógica válida com mais de 10 caracteres.')).toBe(
    true
  );

  const polluted = `Base oficial\n${PROMPT_OFFICIAL_QUALITY_MARKER}\n\n${PROMPT_COMPLEMENTARY_HEADER}\nManter linguagem acolhedora.`;
  expect(hasDuplicatedBasePrompt(polluted, 'Base oficial')).toBe(true);
  expect(stripDuplicatedBasePrompt(polluted, 'Base oficial')).toBe('Manter linguagem acolhedora.');
});

for (const status of Object.values(LessonStageStatus)) {
  test(`edição/conclusão respeitam o contrato da etapa ${status}`, () => {
    const candidate = { ...stage, status };
    const result = lessonProductionActions(
      { ...lesson, stages: [candidate] },
      candidate,
      false,
      false
    );
    expect(result.canEdit).toBe(EDITABLE_STAGE_STATUSES.includes(status));
    expect(result.canComplete).toBe(EDITABLE_STAGE_STATUSES.includes(status));
    expect(lessonProductionActions(lesson, candidate, true, false).canComplete).toBe(false);
    expect(lessonProductionActions(lesson, candidate, false, true).canComplete).toBe(false);
  });
}
for (const status of Object.values(LessonStatus)) {
  test(`geração respeita agregado ${status}`, () => {
    expect(lessonProductionActions({ ...lesson, status }, stage, false, false).canGenerate).toBe(
      !GENERATION_BLOCKED_LESSON_STATUSES.includes(status) && status !== LessonStatus.PUBLISHING
    );
  });
}
test('bloqueia ações conflitantes, dependência ausente e publicação incompleta', () => {
  expect(lessonProductionActions(lesson, stage, true, false).canGenerate).toBe(false);
  expect(
    lessonProductionActions(lesson, { ...stage, type: LessonStageType.MANUAL_WORK }, false, false)
      .canGenerate
  ).toBe(false);
  const busy = {
    ...lesson,
    stages: [stage, { ...stage, id: 'generating', status: LessonStageStatus.GENERATING }],
  };
  expect(lessonProductionActions(busy, stage, false, false).canEdit).toBe(false);
  expect(
    lessonProductionActions({ ...lesson, status: LessonStatus.PUBLISHING }, stage, false, false)
      .canEdit
  ).toBe(false);
  const ready = {
    ...lesson,
    status: LessonStatus.READY_FOR_PUBLICATION,
    stages: STUDIO_STAGE_ORDER.map((type) => ({
      ...stage,
      type,
      status: LessonStageStatus.APPROVED,
    })),
  };
  expect(canPublishLesson(ready)).toBe(true);
  expect(canPublishLesson({ ...ready, stages: [stage] })).toBe(false);
  expect(canPublishLesson({ ...ready, status: LessonStatus.PUBLISHING })).toBe(false);
});
