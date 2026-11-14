import { expect, test } from '@playwright/test';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  canDownloadLessonPackage,
  canPublishOrRepublishLesson,
  canRepublishLesson,
  canSetMaterialAsCurrentWeek,
  isPublishedMaterialMissing,
  isStagePdfFailure,
  lessonPackageFileName,
  publicationDuplicateWarning,
  publicationDuplicates,
  publicationFailureNotice,
  publicationKindLabel,
  publicationMaterialPath,
} from '@/features/ai-lessons/publication';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  type Lesson,
  type LessonPublicationPreview,
  type LessonStage,
  type LessonVersion,
} from '@/features/ai-lessons/types';
import {
  isReviewCycleActive,
  lessonProductionActions,
  nextPendingReviewStage,
  regenerationLockReason,
  stagesInvalidatedBy,
} from '@/features/ai-lessons/workflow';
import { cleanMaterialDescription, withSpecialMaterialTag } from '@/features/week-materials/utils';

const version = (id: string): LessonVersion => ({
  id,
  versionNumber: 1,
  tiptapAstJson: { type: 'doc', content: [] },
  structuredDataJson: null,
  changeSummary: '',
  createdAt: '2026-11-01T10:00:00Z',
});
const stage = (type: LessonStageType, status: LessonStageStatus, hasVersion = true): LessonStage => ({
  id: `stage-${type}`,
  type,
  status,
  currentVersionId: hasVersion ? `v-${type}` : null,
  lockVersion: 1,
  failureMessage: null,
  versions: hasVersion ? [version(`v-${type}`)] : [],
});
const lesson = (
  stages: LessonStage[],
  status = LessonStatus.IN_PROGRESS,
  category = LessonCategory.REGULAR
): Lesson => ({
  id: 'lesson-1',
  theme: 'O Bom Pastor — João',
  biblicalReference: 'Jo 10',
  weekNumber: 12,
  category,
  status,
  weekMaterialId: null,
  createdAt: '',
  updatedAt: '',
  comments: [],
  stages,
});
const SPECIAL_ORDER = [
  LessonStageType.LESSON,
  LessonStageType.LESSON_VISUALS,
  LessonStageType.VERSE_VISUALS,
];
const special = (statuses: LessonStageStatus[], status: LessonStatus) =>
  lesson(
    SPECIAL_ORDER.map((type, index) => stage(type, statuses[index])),
    status,
    LessonCategory.SPECIAL
  );
const preview = (overrides: Partial<LessonPublicationPreview> = {}): LessonPublicationPreview => ({
  title: 'Semana 12 — O Bom Pastor',
  isSpecial: false,
  documentCount: 8,
  weekMaterial: null,
  duplicates: [],
  ...overrides,
});
const httpError = (status: number, code?: string) =>
  new AxiosError('falha', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: code ? { success: false, error: { code, message: 'Item: falha' } } : {},
  });

test.describe('marcas técnicas da descrição do material', () => {
  test('remove a marca de tipo e a de origem, sem deixar espaços sobrando', () => {
    expect(
      cleanMaterialDescription(
        'Material completo da semana 12, revisado e aprovado. [origem:licao:0b1c2d3e-aaaa-bbbb-cccc-1234567890ab]'
      )
    ).toBe('Material completo da semana 12, revisado e aprovado.');
    expect(
      cleanMaterialDescription('Material Especial completo. [tipo:especial] [origem:licao:abc]')
    ).toBe('Material Especial completo.');
    expect(cleanMaterialDescription('[TIPO:ESPECIAL] Texto\nsegunda linha')).toBe(
      'Texto\nsegunda linha'
    );
    expect(cleanMaterialDescription(null)).toBe('');
    expect(cleanMaterialDescription('Texto [com colchetes] comum')).toBe(
      'Texto [com colchetes] comum'
    );
  });

  test('salvar pelo formulário preserva o tipo especial sem duplicar marcas', () => {
    const loaded = 'Material Especial completo. [tipo:especial] [origem:licao:abc]';
    const saved = withSpecialMaterialTag(cleanMaterialDescription(loaded), true);
    expect(saved).toBe('Material Especial completo. [tipo:especial]');
    expect(withSpecialMaterialTag(saved, true)).toBe(saved);
    expect(withSpecialMaterialTag(saved, false)).toBe('Material Especial completo.');
  });
});

test.describe('ciclo de revisão', () => {
  test('após aprovar, o próximo item pendente é procurado adiante e depois do início', () => {
    const current = special(
      [LessonStageStatus.IN_REVIEW, LessonStageStatus.APPROVED, LessonStageStatus.IN_REVIEW],
      LessonStatus.IN_REVIEW
    );
    expect(nextPendingReviewStage(current, LessonStageType.LESSON)).toBe(
      LessonStageType.VERSE_VISUALS
    );
    expect(nextPendingReviewStage(current, LessonStageType.VERSE_VISUALS)).toBe(
      LessonStageType.LESSON
    );
    const done = special(
      [LessonStageStatus.APPROVED, LessonStageStatus.APPROVED, LessonStageStatus.CHANGES_REQUESTED],
      LessonStatus.CHANGES_REQUESTED
    );
    expect(nextPendingReviewStage(done, LessonStageType.LESSON)).toBeNull();
  });

  test('corrigir um item devolvido não desatualiza os demais', () => {
    const current = special(
      [LessonStageStatus.CHANGES_REQUESTED, LessonStageStatus.APPROVED, LessonStageStatus.APPROVED],
      LessonStatus.CHANGES_REQUESTED
    );
    expect(isReviewCycleActive(current)).toBe(true);
    expect(stagesInvalidatedBy(current, LessonStageType.LESSON)).toEqual([]);
  });

  test('na produção inicial a regra antiga continua valendo para os itens seguintes', () => {
    const current = special(
      [LessonStageStatus.PRODUCER_APPROVED, LessonStageStatus.PRODUCER_APPROVED, LessonStageStatus.DRAFT],
      LessonStatus.IN_PROGRESS
    );
    expect(isReviewCycleActive(current)).toBe(false);
    expect(stagesInvalidatedBy(current, LessonStageType.LESSON).map((item) => item.type)).toEqual([
      LessonStageType.LESSON_VISUALS,
      LessonStageType.VERSE_VISUALS,
    ]);
  });

  test('item aprovado ou com o revisor não pode ser regenerado e explica o motivo', () => {
    const current = special(
      [LessonStageStatus.APPROVED, LessonStageStatus.IN_REVIEW, LessonStageStatus.CHANGES_REQUESTED],
      LessonStatus.CHANGES_REQUESTED
    );
    const [approved, inReview, returned] = current.stages;
    expect(lessonProductionActions(current, approved, false, false)).toMatchObject({
      canGenerate: false,
      regenerationLocked: true,
    });
    expect(lessonProductionActions(current, inReview, false, false).regenerationLocked).toBe(true);
    expect(lessonProductionActions(current, returned, false, false)).toMatchObject({
      canGenerate: true,
      regenerationLocked: false,
    });
    expect(regenerationLockReason(approved)).toContain('reabra-o');
    expect(regenerationLockReason(inReview)).toContain('devolvido');
    expect(regenerationLockReason(returned)).toBeNull();
    expect(regenerationLockReason(undefined)).toBeNull();
  });
});

test.describe('publicação', () => {
  const approved = [
    LessonStageStatus.APPROVED,
    LessonStageStatus.APPROVED,
    LessonStageStatus.APPROVED,
  ];

  test('republicar só é oferecido quando a página publicada foi removida', () => {
    const published = special(approved, LessonStatus.PUBLISHED);
    const gone = preview({
      weekMaterial: { id: 'm1', exists: false, routePath: null, currentWeek: false },
    });
    const alive = preview({
      weekMaterial: { id: 'm1', exists: true, routePath: 'materiais_semana_12', currentWeek: false },
    });
    expect(isPublishedMaterialMissing(published, gone)).toBe(true);
    expect(canRepublishLesson(published, gone)).toBe(true);
    expect(canPublishOrRepublishLesson(published, gone)).toBe(true);
    expect(canRepublishLesson(published, alive)).toBe(false);
    expect(canRepublishLesson(published, undefined)).toBe(false);
    expect(canRepublishLesson(special(approved, LessonStatus.ARCHIVED), gone)).toBe(false);
    expect(
      canPublishOrRepublishLesson(special(approved, LessonStatus.READY_FOR_PUBLICATION), undefined)
    ).toBe(true);
  });

  test('semana atual só para página existente que ainda não é a atual', () => {
    const published = special(approved, LessonStatus.PUBLISHED);
    const material = { id: 'm1', exists: true, routePath: 'p', currentWeek: false };
    expect(canSetMaterialAsCurrentWeek(published, preview({ weekMaterial: material }))).toBe(true);
    expect(
      canSetMaterialAsCurrentWeek(
        published,
        preview({ weekMaterial: { ...material, currentWeek: true } })
      )
    ).toBe(false);
    expect(
      canSetMaterialAsCurrentWeek(published, preview({ weekMaterial: { ...material, exists: false } }))
    ).toBe(false);
    expect(canSetMaterialAsCurrentWeek(published, undefined)).toBe(false);
  });

  test('duplicatas nunca incluem a própria página e o aviso muda por tipo', () => {
    const own = { id: 'm1', exists: true, routePath: 'a', currentWeek: false };
    const data = preview({
      weekMaterial: own,
      duplicates: [
        { id: 'm1', title: 'Semana 12 — Própria', routePath: 'a' },
        { id: 'm2', title: 'Semana 12 — Outra', routePath: 'b' },
      ],
    });
    expect(publicationDuplicates(data).map((item) => item.id)).toEqual(['m2']);
    expect(publicationDuplicates(undefined)).toEqual([]);
    expect(publicationDuplicateWarning(false, 0)).toBe('');
    expect(publicationDuplicateWarning(false, 1)).toContain('para esta semana');
    expect(publicationDuplicateWarning(true, 2)).toContain('2 materiais com este mesmo título');
  });

  test('rótulos, caminho, nome do arquivo e pontuação do aviso de falha', () => {
    expect(publicationKindLabel(true)).toBe('Material Especial');
    expect(publicationKindLabel(false)).toBe('material semanal');
    expect(publicationMaterialPath('/materiais_semana_12')).toBe('/materiais_semana_12');
    expect(publicationMaterialPath('materiais_semana_12')).toBe('/materiais_semana_12');
    expect(publicationMaterialPath('  ')).toBeNull();
    expect(publicationMaterialPath(null)).toBeNull();
    expect(lessonPackageFileName(lesson([]))).toBe('licao-semana-12-o-bom-pastor-joao.pdf');
    expect(
      lessonPackageFileName({ category: LessonCategory.SPECIAL, weekNumber: null, theme: 'Páscoa!' })
    ).toBe('material-especial-pascoa.pdf');
    const notice = publicationFailureNotice('Brincadeira: o PDF não pôde ser gerado. ');
    expect(notice).toContain('Brincadeira: o PDF não pôde ser gerado. Os itens');
    expect(notice).not.toContain('..');
  });

  test('pacote completo só pode ser baixado com todos os itens aprovados', () => {
    expect(canDownloadLessonPackage(special(approved, LessonStatus.READY_FOR_PUBLICATION))).toBe(true);
    expect(canDownloadLessonPackage(special(approved, LessonStatus.PUBLISHED))).toBe(true);
    expect(canDownloadLessonPackage(special(approved, LessonStatus.ARCHIVED))).toBe(true);
    expect(
      canDownloadLessonPackage(
        special(
          [LessonStageStatus.APPROVED, LessonStageStatus.IN_REVIEW, LessonStageStatus.APPROVED],
          LessonStatus.IN_REVIEW
        )
      )
    ).toBe(false);
  });

  test('falha de PDF na aprovação é reconhecida pelo código ou pelo status', () => {
    expect(isStagePdfFailure(httpError(409, 'LESSON_9314'))).toBe(true);
    expect(isStagePdfFailure(httpError(422))).toBe(true);
    expect(isStagePdfFailure(httpError(503))).toBe(true);
    expect(isStagePdfFailure(httpError(409, 'LESSON_9303'))).toBe(false);
    expect(isStagePdfFailure(new Error('rede'))).toBe(false);
  });
});
