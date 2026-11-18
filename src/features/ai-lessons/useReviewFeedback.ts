import { useEffect, useState } from 'react';
import { isReviewFeedbackMap } from './drafts';
import { readStudioSnapshot, resolveStudioStorage, studioSnapshotKey } from './draftStorage';
import { usePersistedStudioState, useStudioUserId } from './usePersistedStudioState';
import { StudioSnapshotScope, type LessonStageType, type ReviewFeedbackMap } from './types';

/** Reviewer notes typed and not yet sent, recovered after a reload or an expired session. */
export function useReviewFeedback(lessonId: string) {
  const userId = useStudioUserId();
  const storageKey =
    userId && lessonId
      ? studioSnapshotKey(StudioSnapshotScope.REVIEW_FEEDBACK, userId, lessonId)
      : '';
  const [feedback, setFeedback] = useState<ReviewFeedbackMap>({});
  const [loadedKey, setLoadedKey] = useState('');
  const [recovered, setRecovered] = useState(false);
  useEffect(() => {
    if (!storageKey || loadedKey === storageKey) return;
    const stored =
      readStudioSnapshot(resolveStudioStorage(), storageKey, isReviewFeedbackMap) ?? {};
    setFeedback(stored);
    setRecovered(Object.values(stored).some((text) => Boolean(text?.trim())));
    setLoadedKey(storageKey);
  }, [loadedKey, storageKey]);
  usePersistedStudioState(loadedKey === storageKey ? storageKey : '', feedback);
  return {
    feedback,
    hasUnsent: Object.values(feedback).some((text) => Boolean(text?.trim())),
    recovered,
    dismissRecovered: () => setRecovered(false),
    change: (stage: LessonStageType, text: string) =>
      setFeedback((current) => ({ ...current, [stage]: text })),
    /** Clears the note only if it is still the text that was sent. */
    clearSent: (stage: LessonStageType, sentText: string) =>
      setFeedback((current) =>
        current[stage] === sentText ? { ...current, [stage]: '' } : current
      ),
  };
}
