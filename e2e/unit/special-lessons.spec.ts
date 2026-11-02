import { expect, test } from '@playwright/test';
import {
  SPECIAL_STUDIO_STAGE_ORDER,
  STUDIO_STAGE_ORDER,
  getStudioStageOrder,
} from '@/features/ai-lessons/constants';
import { LessonCategory, LessonStageType, type Lesson } from '@/features/ai-lessons/types';
import { formatLessonBadgeLabel } from '@/features/ai-lessons/utils';
import {
  isSpecialMaterialDescription,
  stripSpecialMaterialTag,
  withSpecialMaterialTag,
} from '@/features/week-materials/utils';

test.describe('Material Especial', () => {
  test('usa 3 etapas no especial e 8 no semanal', () => {
    expect(getStudioStageOrder(LessonCategory.SPECIAL)).toEqual([
      LessonStageType.LESSON,
      LessonStageType.LESSON_VISUALS,
      LessonStageType.VERSE_VISUALS,
    ]);
    expect(getStudioStageOrder(LessonCategory.SPECIAL)).toBe(SPECIAL_STUDIO_STAGE_ORDER);
    expect(getStudioStageOrder(LessonCategory.REGULAR)).toBe(STUDIO_STAGE_ORDER);
    expect(getStudioStageOrder(undefined)).toHaveLength(8);
  });

  test('formata o rótulo sem exibir "Semana null"', () => {
    const label = (category: LessonCategory | undefined, weekNumber: number | null) =>
      formatLessonBadgeLabel({ category, weekNumber } as Pick<Lesson, 'category' | 'weekNumber'>);
    expect(label(LessonCategory.SPECIAL, null)).toBe('Material Especial');
    expect(label(LessonCategory.SPECIAL, 2)).toBe('Material Especial · Semana 2');
    expect(label(LessonCategory.REGULAR, 5)).toBe('Semana 5');
    expect(label(undefined, null)).toBe('Material Semanal');
  });

  test('gerencia a marca [tipo:especial] da descrição da página', () => {
    const tagged = withSpecialMaterialTag('Lição sobre honestidade', true);
    expect(isSpecialMaterialDescription(tagged)).toBe(true);
    expect(stripSpecialMaterialTag(tagged)).toBe('Lição sobre honestidade');
    expect(withSpecialMaterialTag(tagged, false)).toBe('Lição sobre honestidade');
    expect(withSpecialMaterialTag('', true)).toBe('');
  });
});
