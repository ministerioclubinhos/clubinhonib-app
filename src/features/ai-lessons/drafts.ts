import type {
  AdminPromptPreference,
  LessonLocalDraft,
  LessonLocalDrafts,
  LessonStage,
  LessonVersion,
  PromptLocalDraft,
  PromptLocalDrafts,
  TiptapDocument,
} from './types';

export function lessonDraftKey(lessonId: string, stage: LessonStage['type']): string {
  return `${lessonId}:${stage}`;
}

export function editLessonDraft(
  current: LessonLocalDraft | undefined,
  lessonId: string,
  stage: LessonStage,
  version: LessonVersion,
  document: TiptapDocument
): LessonLocalDraft {
  return {
    ...current,
    lessonId,
    stage: stage.type,
    lockVersion: current?.lockVersion ?? stage.lockVersion,
    structuredData: current ? current.structuredData : version.structuredDataJson,
    document,
  };
}

export function acknowledgeLessonDraft(
  drafts: LessonLocalDrafts,
  sent: LessonLocalDraft,
  saved: LessonStage
): LessonLocalDrafts {
  const key = lessonDraftKey(sent.lessonId, sent.stage);
  const current = drafts[key];
  if (!current) return drafts;
  if (current === sent) {
    const next = { ...drafts };
    delete next[key];
    return next;
  }
  // Only our own successful save can advance the base of typing done during that save.
  if (current.lockVersion !== sent.lockVersion) return drafts;
  return { ...drafts, [key]: { ...current, lockVersion: saved.lockVersion } };
}

export function editPromptDraft(
  current: PromptLocalDraft | undefined,
  base: AdminPromptPreference,
  value: string
): PromptLocalDraft {
  return { base: current?.base ?? base, value };
}

export function acknowledgePromptDraft(
  drafts: PromptLocalDrafts,
  sent: PromptLocalDraft | undefined,
  saved: AdminPromptPreference
): PromptLocalDrafts {
  const current = drafts[saved.stage];
  if (current === sent) {
    const next = { ...drafts };
    delete next[saved.stage];
    return next;
  }
  if (!current || current.base !== sent?.base) return drafts;
  return { ...drafts, [saved.stage]: { ...current, base: saved } };
}
