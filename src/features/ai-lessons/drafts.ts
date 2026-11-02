import {
  PROMPT_COMPLEMENTARY_HEADER,
  PROMPT_MAX_LENGTH,
  PROMPT_MIN_LENGTH,
  PROMPT_OFFICIAL_QUALITY_MARKER,
} from './constants';
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

export function resolvePromptDraftValue(
  draft: PromptLocalDraft | undefined,
  preference: AdminPromptPreference | undefined
): string {
  return draft?.value ?? preference?.customPrompt ?? '';
}

export function composeEffectivePromptPreview(basePrompt: string, customValue: string): string {
  const trimmed = customValue.trim();
  if (!trimmed) return basePrompt;
  return `${basePrompt}\n\n${PROMPT_COMPLEMENTARY_HEADER}\n${trimmed}`;
}

export function isValidComplementaryPrompt(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length >= PROMPT_MIN_LENGTH &&
    trimmed.length <= PROMPT_MAX_LENGTH &&
    value.length <= PROMPT_MAX_LENGTH
  );
}

export function hasDuplicatedBasePrompt(value: string, basePrompt: string): boolean {
  const normalizedBase = basePrompt.trim();
  if (!value.trim()) return false;
  if (normalizedBase.length >= 20 && value.includes(normalizedBase)) return true;
  if (value.includes(PROMPT_OFFICIAL_QUALITY_MARKER)) return true;
  if (value.includes(PROMPT_COMPLEMENTARY_HEADER)) return true;
  return false;
}

export function stripDuplicatedBasePrompt(value: string, basePrompt: string): string {
  let cleaned = value;
  const normalizedBase = basePrompt.trim();
  if (normalizedBase) {
    cleaned = cleaned.split(normalizedBase).join('');
  }
  if (cleaned.includes(PROMPT_OFFICIAL_QUALITY_MARKER)) {
    cleaned = cleaned.split(PROMPT_OFFICIAL_QUALITY_MARKER).join('');
  }
  if (cleaned.includes(PROMPT_COMPLEMENTARY_HEADER)) {
    cleaned = cleaned.split(PROMPT_COMPLEMENTARY_HEADER).join('');
  }
  return cleaned.trim();
}
