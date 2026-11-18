import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STUDIO_STAGE_ORDER, STUDIO_STAGE_QUERY_PARAM } from './constants';
import { LessonStageType } from './types';
import { parseStageType } from './utils';

/** Keeps the selected item in the URL so a reload or a shared link opens the same item. */
export function useStageParam(): [LessonStageType, (type: LessonStageType) => void] {
  const [params, setParams] = useSearchParams();
  const selected =
    parseStageType(params.get(STUDIO_STAGE_QUERY_PARAM), STUDIO_STAGE_ORDER) ??
    LessonStageType.LESSON;
  const select = useCallback(
    (type: LessonStageType) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(STUDIO_STAGE_QUERY_PARAM, type);
          return next;
        },
        { replace: true }
      ),
    [setParams]
  );
  return [selected, select];
}
