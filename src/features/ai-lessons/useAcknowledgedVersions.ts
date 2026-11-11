import { useEffect, useState } from 'react';
import type { AcknowledgedStageVersions, Lesson, LessonStage } from './types';
import { captureStageVersions, hasStageVersionChanged } from './workflow';

/**
 * Remembers which version of each item the reviewer actually opened. Live updates may swap
 * the content underneath; the decision stays blocked until the new version is acknowledged.
 */
export function useAcknowledgedVersions(lesson: Lesson | undefined) {
  const [state, setState] = useState<{ lessonId: string; versions: AcknowledgedStageVersions }>({
    lessonId: '',
    versions: {},
  });
  const lessonId = lesson?.id ?? '';
  useEffect(() => {
    if (!lesson || state.lessonId === lesson.id) return;
    setState({ lessonId: lesson.id, versions: captureStageVersions(lesson) });
  }, [lesson, state.lessonId]);
  const ready = Boolean(lessonId) && state.lessonId === lessonId;
  return {
    hasChanged: (stage: LessonStage | undefined) =>
      ready && hasStageVersionChanged(state.versions, stage),
    acknowledge: (stage: LessonStage) =>
      setState((current) => ({
        ...current,
        versions: { ...current.versions, [stage.type]: stage.currentVersionId },
      })),
  };
}
