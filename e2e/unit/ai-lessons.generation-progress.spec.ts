import { expect, test } from '@playwright/test';

import {
  generationElapsedSeconds,
  generationSignature,
  generationStepText,
} from '@/features/ai-lessons/generation.utils';
import {
  LessonGenerationPhase,
  LessonStageType,
  LessonStatus,
  type Lesson,
  type LessonGenerationProgress,
} from '@/features/ai-lessons/types';
import { computeLessonSnapshotSignature } from '@/features/ai-lessons/utils';

const progress = (over: Partial<LessonGenerationProgress> = {}): LessonGenerationProgress => ({
  stage: LessonStageType.LESSON_VISUALS,
  phase: LessonGenerationPhase.IMAGES,
  totalImages: 5,
  completedImages: 2,
  percent: 50,
  startedAt: '2026-11-12T10:00:00.000Z',
  updatedAt: '2026-11-12T10:01:00.000Z',
  ...over,
});

test.describe('generationStepText', () => {
  test('diz quantas imagens estão prontas e quantas faltam', () => {
    expect(generationStepText(progress())).toBe('Gerando as imagens — 2 de 5 prontas, faltam 3');
    expect(generationStepText(progress({ completedImages: 4 }))).toBe(
      'Gerando as imagens — 4 de 5 prontas, falta 1'
    );
    expect(generationStepText(progress({ completedImages: 1 }))).toBe(
      'Gerando as imagens — 1 de 5 pronta, faltam 4'
    );
  });

  test('avisa das imagens que virão enquanto o texto é escrito', () => {
    expect(
      generationStepText(progress({ phase: LessonGenerationPhase.WRITING, completedImages: 0 }))
    ).toBe('Escrevendo o conteúdo (depois, 5 imagens)');
  });

  test('item sem imagens mostra só a etapa', () => {
    expect(
      generationStepText(
        progress({ phase: LessonGenerationPhase.WRITING, totalImages: 0, completedImages: 0 })
      )
    ).toBe('Escrevendo o conteúdo');
  });

  test('sem progresso conhecido não inventa números', () => {
    expect(generationStepText(null)).toBe('Gerando o conteúdo com IA');
  });
});

test.describe('generationElapsedSeconds', () => {
  test('conta a partir do início informado pelo servidor', () => {
    const now = new Date('2026-11-12T10:02:05.000Z').getTime();
    expect(generationElapsedSeconds('2026-11-12T10:00:00.000Z', now)).toBe(125);
  });

  test('relógio adiantado do servidor não gera tempo negativo', () => {
    const now = new Date('2026-11-12T09:59:00.000Z').getTime();
    expect(generationElapsedSeconds('2026-11-12T10:00:00.000Z', now)).toBe(0);
  });

  test('sem início válido devolve nulo', () => {
    expect(generationElapsedSeconds(null)).toBeNull();
    expect(generationElapsedSeconds('ontem')).toBeNull();
  });
});

test.describe('assinatura do retrato da lição', () => {
  const lesson = (generation: LessonGenerationProgress | null): Lesson => ({
    id: 'lesson-1',
    theme: 'Tema',
    biblicalReference: 'João 3:16',
    weekNumber: 9,
    status: LessonStatus.IN_PROGRESS,
    weekMaterialId: null,
    createdAt: '2026-11-12T10:00:00.000Z',
    updatedAt: '2026-11-12T10:00:00.000Z',
    stages: [],
    comments: [],
    generation,
  });

  test('uma imagem nova muda a assinatura, para a tela repintar', () => {
    // Regressão: o retrato só olhava etapas, e o avanço das imagens era descartado.
    expect(computeLessonSnapshotSignature(lesson(progress({ completedImages: 2 })))).not.toBe(
      computeLessonSnapshotSignature(lesson(progress({ completedImages: 3 })))
    );
    expect(generationSignature(null)).toBe('');
  });
});
