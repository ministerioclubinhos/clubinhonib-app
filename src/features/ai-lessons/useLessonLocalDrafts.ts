import { useEffect, useMemo, useState } from 'react';
import {
  acknowledgeLessonDraft,
  editLessonDraft,
  isLessonLocalDrafts,
  lessonDraftKey,
  rebaseLessonDraft,
} from './drafts';
import { readStudioSnapshot, resolveStudioStorage, studioSnapshotKey } from './draftStorage';
import { usePersistedStudioState, useStudioUserId } from './usePersistedStudioState';
import {
  StudioSnapshotScope,
  type LessonLocalDraft,
  type LessonLocalDrafts,
  type LessonStage,
  type LessonVersion,
  type TiptapDocument,
} from './types';

export function useLessonLocalDrafts(
  lessonId: string,
  stage: LessonStage | undefined,
  version: LessonVersion | undefined
) {
  const userId = useStudioUserId();
  const storageKey =
    userId && lessonId
      ? studioSnapshotKey(StudioSnapshotScope.LESSON_DRAFTS, userId, lessonId)
      : '';
  const [drafts, setDrafts] = useState<LessonLocalDrafts>({});
  const [loadedKey, setLoadedKey] = useState('');
  const [recovered, setRecovered] = useState(false);
  useEffect(() => {
    if (!storageKey || loadedKey === storageKey) return;
    const stored = readStudioSnapshot(resolveStudioStorage(), storageKey, isLessonLocalDrafts);
    const own = Object.fromEntries(
      Object.entries(stored ?? {}).filter(([, item]) => item?.lessonId === lessonId)
    );
    setDrafts(own);
    setRecovered(Object.keys(own).length > 0);
    setLoadedKey(storageKey);
  }, [lessonId, loadedKey, storageKey]);
  // Nothing is written before the stored snapshot was read, so a mount never erases it.
  usePersistedStudioState(loadedKey === storageKey ? storageKey : '', drafts);
  const key = stage ? lessonDraftKey(lessonId, stage.type) : '';
  const draft = drafts[key];
  const draftStages = useMemo(
    () =>
      Object.values(drafts)
        .filter((item): item is LessonLocalDraft => item?.lessonId === lessonId)
        .map((item) => item.stage),
    [drafts, lessonId]
  );
  return {
    draft,
    draftStages,
    hasDrafts: draftStages.length > 0,
    recovered,
    dismissRecovered: () => setRecovered(false),
    edit: (document: TiptapDocument) => {
      if (!stage || !version) return;
      setDrafts((current) => ({
        ...current,
        [key]: editLessonDraft(current[key], lessonId, stage, version, document),
      }));
    },
    acknowledge: (sent: LessonLocalDraft, saved: LessonStage) =>
      setDrafts((current) => acknowledgeLessonDraft(current, sent, saved)),
    rebase: () => {
      if (!stage) return;
      setDrafts((current) => {
        const existing = current[key];
        return existing
          ? { ...current, [key]: rebaseLessonDraft(existing, stage, version) }
          : current;
      });
    },
    discard: () =>
      setDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      }),
  };
}
