import { useEffect, useMemo, useState } from 'react';
import type { LessonStageType, StageAssetIssue } from './types';
import { resolveStageAssetIssue, stageAssetUrls } from './utils';

/**
 * Loads every image of the item in the background so a broken one blocks the approval even
 * when the reviewer never opens that slide.
 */
export function useStageAssetIssue(
  stage: LessonStageType | undefined,
  structuredData: Record<string, unknown> | null | undefined
): StageAssetIssue | null {
  const urlsKey = stage ? stageAssetUrls(stage, structuredData).join('\n') : '';
  const [broken, setBroken] = useState<string[]>([]);
  useEffect(() => {
    setBroken([]);
    if (!urlsKey) return;
    let active = true;
    const images = urlsKey.split('\n').map((url) => {
      const image = new Image();
      image.onerror = () => {
        if (active) setBroken((current) => (current.includes(url) ? current : [...current, url]));
      };
      image.src = url;
      return image;
    });
    return () => {
      active = false;
      images.forEach((image) => {
        image.onerror = null;
      });
    };
  }, [urlsKey]);
  return useMemo(
    () => (stage ? resolveStageAssetIssue(stage, structuredData, broken) : null),
    [stage, structuredData, broken]
  );
}
