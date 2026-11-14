import { expect, test } from '@playwright/test';
import {
  isEmptySnapshot,
  purgeStudioSnapshots,
  readStudioSnapshot,
  studioSnapshotKey,
  suppressStudioPersistence,
  writeStudioSnapshot,
} from '@/features/ai-lessons/draftStorage';
import {
  editLessonDraft,
  isLessonDraftOutdated,
  isLessonLocalDrafts,
  isPromptDraftOutdated,
  isReviewFeedbackMap,
  lessonDraftKey,
  rebaseLessonDraft,
  rebasePromptDraft,
  restorePromptDrafts,
  toPersistedPromptDrafts,
} from '@/features/ai-lessons/drafts';
import {
  STUDIO_STAGE_ORDER,
  STUDIO_STORAGE_MAX_CHARS,
  STUDIO_STORAGE_PREFIX,
} from '@/features/ai-lessons/constants';
import { buildMeditationDocument } from '@/features/ai-lessons/meditation-editor-core/document';
import { meditationFieldRange } from '@/features/ai-lessons/meditation-editor-core/rich-document';
import { MeditationTextField } from '@/features/ai-lessons/meditation-editor-core/constants';
import { displayAiFailure } from '@/features/ai-lessons/presentation.utils';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  StageAssetIssue,
  StudioSnapshotScope,
  type AdminPromptPreference,
  type Lesson,
  type LessonStage,
  type LessonVersion,
  type StudioStorage,
  type TiptapDocument,
} from '@/features/ai-lessons/types';
import {
  formatElapsedTime,
  hasCompleteStageAssets,
  parseStageType,
  resolveStageAssetIssue,
} from '@/features/ai-lessons/utils';
import {
  canDeleteLesson,
  canReopenStage,
  captureStageVersions,
  hasStageVersionChanged,
  reviewBlockReason,
  stagesInvalidatedBy,
  staleOriginStage,
} from '@/features/ai-lessons/workflow';

function memoryStorage(quota = Number.POSITIVE_INFINITY): StudioStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get length() {
      return data.size;
    },
    key: (index) => Array.from(data.keys())[index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      if (value.length > quota) throw new Error('QuotaExceededError');
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

const document: TiptapDocument = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Edição não salva' }] }],
};
const version = (id: string, createdAt: string, data: Record<string, unknown> | null = null) =>
  ({
    id,
    versionNumber: 1,
    tiptapAstJson: document,
    structuredDataJson: data,
    changeSummary: '',
    createdAt,
  }) satisfies LessonVersion;
const stage = (
  type: LessonStageType,
  status: LessonStageStatus,
  versions: LessonVersion[] = [],
  lockVersion = 1
): LessonStage => ({
  id: `stage-${type}`,
  type,
  status,
  currentVersionId: versions[0]?.id ?? null,
  lockVersion,
  failureMessage: null,
  versions,
});
const lesson = (stages: LessonStage[], status = LessonStatus.IN_PROGRESS): Lesson => ({
  id: 'lesson-1',
  theme: 'Tema',
  biblicalReference: 'Jo 3:16',
  weekNumber: 1,
  category: LessonCategory.REGULAR,
  status,
  weekMaterialId: null,
  createdAt: '',
  updatedAt: '',
  comments: [],
  stages,
});

test('rascunho do Estúdio é gravado por usuário e lição e recuperado íntegro', () => {
  const storage = memoryStorage();
  const key = studioSnapshotKey(StudioSnapshotScope.LESSON_DRAFTS, 'user-1', 'lesson-1');
  expect(key).toBe(`${STUDIO_STORAGE_PREFIX}:user-1:drafts:lesson-1`);
  const target = stage(LessonStageType.LESSON, LessonStageStatus.DRAFT, [version('v1', '')], 4);
  const drafts = {
    [lessonDraftKey('lesson-1', target.type)]: editLessonDraft(
      undefined,
      'lesson-1',
      target,
      target.versions[0],
      document
    ),
  };
  expect(writeStudioSnapshot(storage, key, drafts)).toBe(true);
  const restored = readStudioSnapshot(storage, key, isLessonLocalDrafts);
  expect(restored).toEqual(drafts);
  expect(restored?.[lessonDraftKey('lesson-1', target.type)]?.lockVersion).toBe(4);
});

test('snapshot vazio, inválido, grande demais ou sem storage nunca quebra a tela', () => {
  const storage = memoryStorage();
  const key = studioSnapshotKey(StudioSnapshotScope.REVIEW_FEEDBACK, 'user-1', 'lesson-1');
  writeStudioSnapshot(storage, key, { LESSON: 'ajuste' });
  // Clearing every note removes the entry instead of leaving an empty object behind.
  expect(writeStudioSnapshot(storage, key, { LESSON: '  ' })).toBe(true);
  expect(storage.data.has(key)).toBe(false);
  expect(isEmptySnapshot({ a: { b: '' }, c: [] })).toBe(true);
  expect(isEmptySnapshot({ a: { b: 'x' } })).toBe(false);

  storage.data.set(key, '{not json');
  expect(readStudioSnapshot(storage, key, isReviewFeedbackMap)).toBeNull();
  storage.data.set(key, JSON.stringify({ LESSON: 42 }));
  expect(readStudioSnapshot(storage, key, isReviewFeedbackMap)).toBeNull();
  expect(storage.data.has(key)).toBe(false);

  const huge = { LESSON: 'x'.repeat(STUDIO_STORAGE_MAX_CHARS + 1) };
  expect(writeStudioSnapshot(storage, key, huge)).toBe(false);
  expect(writeStudioSnapshot(memoryStorage(4), key, { LESSON: 'ajuste' })).toBe(false);
  expect(writeStudioSnapshot(null, key, { LESSON: 'ajuste' })).toBe(false);
  expect(readStudioSnapshot(null, key, isReviewFeedbackMap)).toBeNull();
});

test('logout explícito e troca de usuário não deixam rascunho de outra pessoa', () => {
  const storage = memoryStorage();
  const mine = studioSnapshotKey(StudioSnapshotScope.LESSON_DRAFTS, 'user-1', 'lesson-1');
  const theirs = studioSnapshotKey(StudioSnapshotScope.REVIEW_FEEDBACK, 'user-2', 'lesson-1');
  storage.data.set(mine, '{"a":"b"}');
  storage.data.set(theirs, '{"a":"b"}');
  storage.data.set('persist:root', 'redux');
  purgeStudioSnapshots(storage, 'user-1');
  expect(Array.from(storage.data.keys()).sort()).toEqual([mine, 'persist:root'].sort());
  // After an explicit logout the unmount flush must not write the work back.
  suppressStudioPersistence(true);
  purgeStudioSnapshots(storage);
  expect(writeStudioSnapshot(storage, mine, { a: 'b' })).toBe(false);
  expect(Array.from(storage.data.keys())).toEqual(['persist:root']);
  suppressStudioPersistence(false);
  expect(writeStudioSnapshot(storage, mine, { a: 'b' })).toBe(true);
});

test('rascunho sobre versão superada é detectado e pode ser reaplicado sobre a versão atual', () => {
  const original = stage(LessonStageType.LESSON, LessonStageStatus.DRAFT, [version('v1', '')], 2);
  const draft = editLessonDraft(undefined, 'lesson-1', original, original.versions[0], document);
  expect(isLessonDraftOutdated(draft, original)).toBe(false);
  const remote = stage(
    LessonStageType.LESSON,
    LessonStageStatus.DRAFT,
    [version('v2', '', { story: 'remota' })],
    5
  );
  expect(isLessonDraftOutdated(draft, remote)).toBe(true);
  const rebased = rebaseLessonDraft(draft, remote, remote.versions[0]);
  expect(rebased.lockVersion).toBe(5);
  expect(rebased.document).toBe(document);
  expect(rebased.structuredData).toEqual({ story: 'remota' });
  expect(isLessonDraftOutdated(rebased, remote)).toBe(false);
});

test('rascunhos de prompt persistem só o texto e voltam ligados à preferência atual', () => {
  const preference: AdminPromptPreference = {
    stage: LessonStageType.LESSON,
    basePrompt: 'Base oficial muito longa',
    customPrompt: 'Texto salvo',
    effectivePrompt: 'Base oficial muito longa + Texto salvo',
    lockVersion: 3,
  };
  const persisted = toPersistedPromptDrafts({
    [LessonCategory.REGULAR]: {
      [LessonStageType.LESSON]: { value: 'Texto digitado', base: preference },
    },
  });
  expect(persisted).toEqual({
    REGULAR: { LESSON: { value: 'Texto digitado', lockVersion: 3 } },
  });
  expect(JSON.stringify(persisted)).not.toContain('Base oficial');

  const restored = restorePromptDrafts(persisted.REGULAR, [preference]);
  expect(restored.LESSON?.value).toBe('Texto digitado');
  expect(isPromptDraftOutdated(restored.LESSON, preference)).toBe(false);
  // Same text as the server: nothing to restore.
  expect(restorePromptDrafts({ LESSON: { value: 'Texto salvo', lockVersion: 3 } }, [preference])).toEqual(
    {}
  );

  const newer = { ...preference, lockVersion: 4, customPrompt: 'Outra sessão' };
  const stale = restorePromptDrafts(persisted.REGULAR, [newer]).LESSON;
  expect(isPromptDraftOutdated(stale, newer)).toBe(true);
  const rebased = stale ? rebasePromptDraft(stale, newer) : undefined;
  expect(rebased?.value).toBe('Texto digitado');
  expect(isPromptDraftOutdated(rebased, newer)).toBe(false);
});

test('revisor só decide sobre a versão que reconheceu ter lido', () => {
  const opened = lesson(
    [
      stage(LessonStageType.LESSON, LessonStageStatus.IN_REVIEW, [version('v1', '')]),
      stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.IN_REVIEW),
    ],
    LessonStatus.IN_REVIEW
  );
  const acknowledged = captureStageVersions(opened);
  expect(hasStageVersionChanged(acknowledged, opened.stages[0])).toBe(false);
  // A status-only change (same version) does not ask for a new acknowledgement.
  expect(
    hasStageVersionChanged(acknowledged, { ...opened.stages[0], lockVersion: 9 })
  ).toBe(false);
  const replaced = { ...opened.stages[0], currentVersionId: 'v2', lockVersion: 9 };
  expect(hasStageVersionChanged(acknowledged, replaced)).toBe(true);
  expect(hasStageVersionChanged(acknowledged, { ...opened.stages[1], currentVersionId: 'v1' })).toBe(
    true
  );
  expect(hasStageVersionChanged(acknowledged, undefined)).toBe(false);

  const base = {
    lessonStatus: LessonStatus.IN_REVIEW,
    stageStatus: LessonStageStatus.IN_REVIEW,
    hasVersion: true,
    busy: false,
    assetIssue: StageAssetIssue.NONE,
    versionChanged: false,
  };
  expect(reviewBlockReason(base)).toBeNull();
  expect(reviewBlockReason({ ...base, versionChanged: true })).toContain('nova versão');
  expect(reviewBlockReason({ ...base, assetIssue: StageAssetIssue.MISSING })).toContain('ausentes');
  expect(reviewBlockReason({ ...base, assetIssue: StageAssetIssue.BROKEN })).toContain(
    'não carregaram'
  );
  expect(reviewBlockReason({ ...base, busy: true })).toContain('geração');
  expect(reviewBlockReason({ ...base, lessonStatus: LessonStatus.PACKAGE_READY })).toContain(
    'Inicie a revisão'
  );
  expect(reviewBlockReason({ ...base, stageStatus: LessonStageStatus.APPROVED })).toContain(
    'já foi aprovado'
  );
});

test('completude de artes tem uma regra só: null e {} dão o mesmo resultado', () => {
  for (const type of STUDIO_STAGE_ORDER)
    expect(hasCompleteStageAssets(type, null)).toBe(hasCompleteStageAssets(type, {}));
  expect(hasCompleteStageAssets(LessonStageType.LESSON, null)).toBe(true);
  // Image-only items without any art are incomplete, with or without an object.
  expect(hasCompleteStageAssets(LessonStageType.VERSE_VISUALS, {})).toBe(false);
  expect(hasCompleteStageAssets(LessonStageType.MANUAL_WORK, null)).toBe(false);
  // Legacy text-first items saved before art existed.
  expect(hasCompleteStageAssets(LessonStageType.STANDARD_GAME, {})).toBe(true);
  expect(hasCompleteStageAssets(LessonStageType.STANDARD_GAME, { assets: [] })).toBe(false);

  const data = { assets: [{ url: 'https://cdn/a.png' }, { url: 'https://cdn/b.png' }] };
  expect(resolveStageAssetIssue(LessonStageType.LESSON_VISUALS, data)).toBe(StageAssetIssue.NONE);
  expect(resolveStageAssetIssue(LessonStageType.LESSON_VISUALS, data, ['https://cdn/b.png'])).toBe(
    StageAssetIssue.BROKEN
  );
  expect(
    resolveStageAssetIssue(LessonStageType.LESSON_VISUALS, { assets: [{ url: '' }] }, [])
  ).toBe(StageAssetIssue.MISSING);
});

test('salvar ou regenerar lista os itens que serão desatualizados e a origem do STALE', () => {
  const stages = [
    stage(LessonStageType.LESSON, LessonStageStatus.PRODUCER_APPROVED, [
      version('l2', '2026-11-05T10:00:00Z'),
    ]),
    stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.PRODUCER_APPROVED, [
      version('v1', '2026-11-02T10:00:00Z'),
    ]),
    stage(LessonStageType.STANDARD_GAME, LessonStageStatus.STALE, [
      version('g1', '2026-11-03T10:00:00Z'),
    ]),
    stage(LessonStageType.VERSE_VISUALS, LessonStageStatus.NOT_STARTED),
  ];
  const current = lesson(stages);
  expect(stagesInvalidatedBy(current, LessonStageType.LESSON).map((item) => item.type)).toEqual([
    LessonStageType.LESSON_VISUALS,
  ]);
  expect(stagesInvalidatedBy(current, LessonStageType.STANDARD_GAME)).toEqual([]);
  expect(staleOriginStage(current, stages[2])).toBe(LessonStageType.LESSON);
  expect(staleOriginStage(current, stages[0])).toBeNull();
});

test('lição publicada ou em publicação não oferece exclusão', () => {
  expect(canDeleteLesson({ status: LessonStatus.PUBLISHED })).toBe(false);
  expect(canDeleteLesson({ status: LessonStatus.PUBLISHING })).toBe(false);
  expect(canDeleteLesson({ status: LessonStatus.ARCHIVED })).toBe(false);
  expect(canDeleteLesson({ status: LessonStatus.READY_FOR_PUBLICATION })).toBe(true);

  const approved = stage(LessonStageType.LESSON, LessonStageStatus.APPROVED, [version('v1', '')]);
  expect(canReopenStage(LessonStatus.READY_FOR_PUBLICATION, approved, false)).toBe(true);
  expect(canReopenStage(LessonStatus.READY_FOR_PUBLICATION, approved, true)).toBe(false);
  expect(canReopenStage(LessonStatus.IN_REVIEW, approved, false)).toBe(false);
  expect(canReopenStage(LessonStatus.PUBLISHED, approved, false)).toBe(false);
});

test('ordem das etapas é explícita, etapa da URL é validada e o tempo é legível', () => {
  expect(STUDIO_STAGE_ORDER).toEqual([
    LessonStageType.LESSON,
    LessonStageType.LESSON_VISUALS,
    LessonStageType.STANDARD_GAME,
    LessonStageType.VERSE_VISUALS,
    LessonStageType.VERSE_FIXATION,
    LessonStageType.MEDITATION_YOUNGER,
    LessonStageType.MEDITATION_OLDER,
    LessonStageType.MANUAL_WORK,
  ]);
  expect(parseStageType('VERSE_VISUALS', STUDIO_STAGE_ORDER)).toBe(LessonStageType.VERSE_VISUALS);
  expect(parseStageType('<script>', STUDIO_STAGE_ORDER)).toBeNull();
  expect(parseStageType(null, STUDIO_STAGE_ORDER)).toBeNull();
  expect(formatElapsedTime(0)).toBe('0:00');
  expect(formatElapsedTime(75)).toBe('1:15');
  expect(formatElapsedTime(-3)).toBe('0:00');
});

test('meditação: título vazio não gera nó de texto vazio e título editável é sempre localizado', () => {
  const content = {
    title: '',
    verseText: 'Deus é amor',
    verseReference: '1 João 4:8',
    instructions: ['Pinte'],
    prayer: 'Amém',
  };
  const empty = buildMeditationDocument(content);
  expect(empty.content?.[0]).toMatchObject({ type: 'heading', content: [] });
  expect(JSON.stringify(empty)).not.toContain('"text":""');
  // A title that reads like a section label used to be skipped and the edit reverted.
  const labelled = buildMeditationDocument({ ...content, title: 'MEDITAÇÃO DA SEMANA' });
  expect(meditationFieldRange(labelled, MeditationTextField.TITLE)).toEqual([0, 1]);
});

test('falha de créditos não atribui o erro a um provedor específico', () => {
  const message = displayAiFailure(LessonStageType.LESSON, 'insufficient_quota');
  expect(message).toContain('créditos');
  expect(message).not.toContain('OpenAI');
  expect(displayAiFailure(LessonStageType.VERSE_VISUALS, 'insufficient_quota', LessonCategory.SPECIAL)).toContain(
    '3. Visual do Versículo'
  );
});
