import { useState } from 'react';
import { acknowledgeLessonDraft, editLessonDraft, lessonDraftKey } from './drafts';
import type {
  LessonLocalDraft,
  LessonLocalDrafts,
  LessonStage,
  LessonVersion,
  TiptapDocument,
} from './types';

export function useLessonLocalDrafts(
  lessonId: string,
  stage: LessonStage | undefined,
  version: LessonVersion | undefined
) {
  const [drafts, setDrafts] = useState<LessonLocalDrafts>({});
  const key = stage ? lessonDraftKey(lessonId, stage.type) : '';
  const draft = drafts[key];
  return {
    draft,
    hasDrafts: Object.values(drafts).some((item) => item?.lessonId === lessonId),
    edit: (document: TiptapDocument) => {
      if (!stage || !version) return;
      setDrafts((current) => ({
        ...current,
        [key]: editLessonDraft(current[key], lessonId, stage, version, document),
      }));
    },
    acknowledge: (sent: LessonLocalDraft, saved: LessonStage) =>
      setDrafts((current) => acknowledgeLessonDraft(current, sent, saved)),
    discard: () =>
      setDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      }),
  };
}
