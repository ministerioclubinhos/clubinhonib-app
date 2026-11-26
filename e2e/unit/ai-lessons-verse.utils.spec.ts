import { expect, test } from '@playwright/test';
import {
  isSameVerse,
  isVerseLocked,
  itemsOutdatedByVerse,
  normalizeVerseReference,
  verseChangeNeedsAcknowledgement,
  verseReferenceError,
  verseTextError,
} from '@/features/ai-lessons/verse.utils';
import {
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  type Lesson,
} from '@/features/ai-lessons/types';

const stages = (
  statuses: Partial<Record<LessonStageType, LessonStageStatus>>
): Pick<Lesson, 'stages'> =>
  ({
    stages: Object.values(LessonStageType).map((type) => ({
      type,
      status: statuses[type] ?? LessonStageStatus.NOT_STARTED,
    })),
  }) as unknown as Pick<Lesson, 'stages'>;

test.describe('regras do versículo (ai-lessons)', () => {
  test('lista só os itens depois do 1 que já foram gerados', () => {
    const lesson = stages({
      LESSON: LessonStageStatus.PRODUCER_APPROVED,
      LESSON_VISUALS: LessonStageStatus.DRAFT,
      MANUAL_WORK: LessonStageStatus.STALE,
    });

    expect(itemsOutdatedByVerse(lesson)).toEqual([
      LessonStageType.LESSON_VISUALS,
      LessonStageType.MANUAL_WORK,
    ]);
  });

  test('exige confirmação quando há itens seguintes ou o item 1 está concluído', () => {
    expect(verseChangeNeedsAcknowledgement(stages({ LESSON: LessonStageStatus.DRAFT }))).toBe(
      false
    );
    expect(
      verseChangeNeedsAcknowledgement(stages({ LESSON: LessonStageStatus.PRODUCER_APPROVED }))
    ).toBe(true);
    expect(
      verseChangeNeedsAcknowledgement(
        stages({ LESSON: LessonStageStatus.DRAFT, STANDARD_GAME: LessonStageStatus.DRAFT })
      )
    ).toBe(true);
    expect(verseChangeNeedsAcknowledgement(stages({ LESSON: LessonStageStatus.IN_REVIEW }))).toBe(
      true
    );
  });

  test('ignora aspas, espaços, caixa e o sufixo da versão ao comparar', () => {
    expect(normalizeVerseReference('João 3:16 — NVI')).toBe('joão 3:16');
    expect(normalizeVerseReference('João 3:16 (NVI)')).toBe('joão 3:16');
    expect(
      isSameVerse(
        { text: '“Porque  Deus tanto amou”', reference: 'João 3:16 — NVI' },
        { text: 'porque deus tanto amou', reference: 'João 3:16' }
      )
    ).toBe(true);
    expect(
      isSameVerse(
        { text: 'Porque Deus tanto amou', reference: 'João 3:16' },
        { text: 'Porque Deus tanto amou', reference: 'João 3:17' }
      )
    ).toBe(false);
  });

  test('valida o texto e a referência com os mesmos limites da API', () => {
    expect(verseTextError('curto')).toBeTruthy();
    expect(verseTextError('x'.repeat(601))).toBeTruthy();
    expect(verseTextError('O Senhor é o meu pastor.')).toBeNull();
    expect(verseReferenceError('  ')).toBeTruthy();
    expect(verseReferenceError('Salmo 23:1')).toBeNull();
  });

  test('lição publicada, arquivada ou publicando não aceita a troca', () => {
    for (const status of [LessonStatus.PUBLISHED, LessonStatus.ARCHIVED, LessonStatus.PUBLISHING])
      expect(isVerseLocked(status)).toBe(true);
    for (const status of [
      LessonStatus.IN_PROGRESS,
      LessonStatus.IN_REVIEW,
      LessonStatus.PACKAGE_READY,
    ])
      expect(isVerseLocked(status)).toBe(false);
  });
});
