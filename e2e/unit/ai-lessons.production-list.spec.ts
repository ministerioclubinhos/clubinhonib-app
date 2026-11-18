import { expect, test } from '@playwright/test';

import {
  canExportLessonPdf,
  duplicateWeekWarning,
  hasFailedStage,
  isLessonGenerating,
  productionCardItems,
  productionListStatuses,
  readProductionListState,
  writeProductionListState,
} from '@/features/ai-lessons/production-list.utils';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  type LessonStage,
} from '@/features/ai-lessons/types';
import { STUDIO_STAGE_ORDER } from '@/features/ai-lessons/constants';

const stage = (type: LessonStageType, status: LessonStageStatus): LessonStage => ({
  id: `${type}-id`,
  type,
  status,
  currentVersionId: 'v1',
  lockVersion: 1,
  failureMessage: null,
  versions: [],
});
const all = (status: LessonStageStatus) => STUDIO_STAGE_ORDER.map((type) => stage(type, status));

test.describe('lista de produção: ações do cartão', () => {
  test('o PDF do pacote só existe com todas as etapas aprovadas', () => {
    expect(canExportLessonPdf({ stages: all(LessonStageStatus.APPROVED), category: LessonCategory.REGULAR })).toBe(true);
    const oneMissing = [...all(LessonStageStatus.APPROVED).slice(1), stage(LessonStageType.LESSON, LessonStageStatus.IN_REVIEW)];
    expect(canExportLessonPdf({ stages: oneMissing, category: LessonCategory.REGULAR })).toBe(false);
    expect(canExportLessonPdf({ stages: [], category: LessonCategory.REGULAR })).toBe(false);
  });

  test('reconhece geração em andamento e etapa que falhou', () => {
    const stages = [stage(LessonStageType.LESSON, LessonStageStatus.GENERATING), stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.FAILED)];

    expect(isLessonGenerating({ stages })).toBe(true);
    expect(hasFailedStage({ stages })).toBe(true);
    expect(isLessonGenerating({ stages: all(LessonStageStatus.DRAFT) })).toBe(false);
    expect(hasFailedStage({ stages: all(LessonStageStatus.DRAFT) })).toBe(false);
  });
});

test.describe('lista de produção: filtros', () => {
  test('sem filtro de status, arquivadas ficam de fora', () => {
    expect(productionListStatuses('')).not.toContain(LessonStatus.ARCHIVED);
    expect(productionListStatuses('')).toContain(LessonStatus.PUBLISHED);
    expect(productionListStatuses(LessonStatus.ARCHIVED)).toEqual([LessonStatus.ARCHIVED]);
  });

  test('os filtros vão e voltam pela URL, e o padrão deixa o endereço limpo', () => {
    const written = writeProductionListState(new URLSearchParams(), {
      status: LessonStatus.PUBLISHED,
      category: LessonCategory.SPECIAL,
      sort: 'weekNumber:ASC',
      search: ' jesus ',
      page: 2,
    });

    expect(written.toString()).toBe('status=PUBLISHED&tipo=SPECIAL&ordem=weekNumber%3AASC&busca=jesus&pagina=2');
    expect(readProductionListState(written)).toEqual({
      status: LessonStatus.PUBLISHED,
      category: LessonCategory.SPECIAL,
      sort: 'weekNumber:ASC',
      search: 'jesus',
      page: 2,
    });

    const cleared = writeProductionListState(written, {
      status: '',
      category: '',
      sort: 'updatedAt:DESC',
      search: '',
      page: 1,
    });
    expect(cleared.toString()).toBe('');
  });

  test('o que vem inválido na URL volta ao padrão', () => {
    expect(readProductionListState(new URLSearchParams('status=nada&tipo=x&pagina=-3'))).toEqual({
      status: '',
      category: '',
      sort: 'updatedAt:DESC',
      search: '',
      page: 1,
    });
  });
});

test.describe('nova lição: semana repetida', () => {
  const lessons = [
    { theme: 'Deus prova Abraão', weekNumber: 2, category: LessonCategory.REGULAR, status: LessonStatus.IN_PROGRESS },
    { theme: 'Antiga', weekNumber: 3, category: LessonCategory.REGULAR, status: LessonStatus.ARCHIVED },
    { theme: 'Especial', weekNumber: 4, category: LessonCategory.SPECIAL, status: LessonStatus.DRAFT },
  ];

  test('avisa quando já existe lição do mesmo tipo para a semana', () => {
    const warning = duplicateWeekWarning(2, LessonCategory.REGULAR, lessons);

    expect(warning).toContain('semana 2');
    expect(warning).toContain('Deus prova Abraão');
  });

  test('não avisa para semana livre, lição arquivada, outro tipo ou sem semana', () => {
    expect(duplicateWeekWarning(9, LessonCategory.REGULAR, lessons)).toBeNull();
    expect(duplicateWeekWarning(3, LessonCategory.REGULAR, lessons)).toBeNull();
    expect(duplicateWeekWarning(4, LessonCategory.REGULAR, lessons)).toBeNull();
    expect(duplicateWeekWarning('', LessonCategory.REGULAR, lessons)).toBeNull();
    expect(duplicateWeekWarning(2, LessonCategory.REGULAR, undefined)).toBeNull();
  });
});

test.describe('lista de produção: cartões', () => {
  const lesson = (id: string, status: LessonStatus, updatedAt: string) => ({
    id,
    theme: id,
    biblicalReference: 'Jo 3.16',
    weekNumber: 1,
    category: LessonCategory.REGULAR,
    status,
    weekMaterialId: null,
    createdAt: updatedAt,
    updatedAt,
    stages: [],
    comments: [],
  });

  test('mantém a ordem da API e só deixa abrir o que já saiu do fluxo', () => {
    const items = productionCardItems([
      lesson('publicada', LessonStatus.PUBLISHED, '2026-11-01T00:00:00.000Z'),
      lesson('ajustes', LessonStatus.CHANGES_REQUESTED, '2026-11-02T00:00:00.000Z'),
      lesson('rascunho', LessonStatus.DRAFT, '2026-11-03T00:00:00.000Z'),
    ]);

    // Não reordena por urgência: quem escolhe a ordem é o filtro da lista.
    expect(items.map((item) => item.lesson.id)).toEqual(['publicada', 'ajustes', 'rascunho']);
    expect(items[0].actionLabel).toBe('Ver lição');
    expect(items[0].href).toBe('/adm/estudio/licoes/publicada');
    expect(items[1].actionLabel).toContain('Corrigir');
    expect(items[2].actionLabel).toBe('Começar: 1. Lição completa');
  });
});
