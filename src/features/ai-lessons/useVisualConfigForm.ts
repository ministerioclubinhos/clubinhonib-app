import { useEffect, useState } from 'react';
import { EMPTY_VISUAL_CONFIG_FORM } from './production.constants';
import { isVisualConfigComplete, resolveVisualConfigForm } from './production.utils';
import type { VisualConfigForm } from './production.types';
import {
  LessonCategory,
  LessonStageType,
  type LessonVersion,
  type LessonVisualOrientation,
  type LessonVisualStyle,
  type LessonVisualType,
} from './types';
import { objectValue } from './utils';

/** Choices of the story visuals (quantity, style, format), seeded from the saved version. */
export function useVisualConfigForm(
  selectedType: LessonStageType,
  version: LessonVersion | undefined,
  category: LessonCategory | undefined
) {
  const [form, setForm] = useState<VisualConfigForm>(EMPTY_VISUAL_CONFIG_FORM);

  useEffect(() => {
    if (selectedType !== LessonStageType.LESSON_VISUALS) return;
    setForm(
      resolveVisualConfigForm(
        objectValue(version?.structuredDataJson?.visualConfig),
        category === LessonCategory.SPECIAL
      )
    );
    // The form follows the saved version, not every structured-data identity change.
  }, [selectedType, version?.id, category]);

  return {
    ...form,
    complete: isVisualConfigComplete(form),
    setVisualType: (visualType: LessonVisualType) =>
      setForm((current) => ({ ...current, visualType })),
    setVisualOrientation: (visualOrientation: LessonVisualOrientation) =>
      setForm((current) => ({ ...current, visualOrientation })),
    setVisualQuantity: (visualQuantity: number | '') =>
      setForm((current) => ({ ...current, visualQuantity })),
    setVisualStyle: (visualStyle: LessonVisualStyle) =>
      setForm((current) => ({ ...current, visualStyle })),
  };
}
