import {
  PROMPT_COMPLEMENTARY_FOOTER,
  PROMPT_COMPLEMENTARY_HEADER,
  PROMPT_MAX_LENGTH,
  PROMPT_MIN_LENGTH,
  PROMPT_OFFICIAL_QUALITY_MARKER,
} from './constants';
import type {
  AdminPromptPreference,
  LessonCategory,
  LessonStageType,
  PersistedPromptDraft,
  PersistedPromptDrafts,
  PromptCategoryDrafts,
  ReviewFeedbackMap,
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

/** Moves a draft onto the current remote version, keeping only the text the user typed. */
export function rebaseLessonDraft(
  draft: LessonLocalDraft,
  stage: LessonStage,
  version: LessonVersion | undefined
): LessonLocalDraft {
  return {
    ...draft,
    lockVersion: stage.lockVersion,
    structuredData: version?.structuredDataJson ?? draft.structuredData,
  };
}

export function isLessonDraftOutdated(
  draft: LessonLocalDraft | undefined,
  stage: LessonStage | undefined
): boolean {
  return Boolean(draft && stage && draft.lockVersion !== stage.lockVersion);
}

export function isLessonLocalDrafts(value: unknown): value is LessonLocalDrafts {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((item) => {
    if (!item || typeof item !== 'object') return false;
    const draft = item as Partial<LessonLocalDraft>;
    return (
      typeof draft.lessonId === 'string' &&
      typeof draft.stage === 'string' &&
      typeof draft.lockVersion === 'number' &&
      Boolean(draft.document) &&
      draft.document?.type === 'doc'
    );
  });
}

export function isReviewFeedbackMap(value: unknown): value is ReviewFeedbackMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === 'string');
}

export function isPersistedPromptDrafts(value: unknown): value is PersistedPromptDrafts {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every(
    (category) =>
      Boolean(category) &&
      typeof category === 'object' &&
      Object.values(category as object).every(
        (item) =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as PersistedPromptDraft).value === 'string'
      )
  );
}

export function toPersistedPromptDrafts(drafts: PromptCategoryDrafts): PersistedPromptDrafts {
  const result: PersistedPromptDrafts = {};
  for (const [category, stages] of Object.entries(drafts) as Array<
    [LessonCategory, PromptLocalDrafts | undefined]
  >) {
    for (const [stage, draft] of Object.entries(stages ?? {}) as Array<
      [LessonStageType, PromptLocalDraft | undefined]
    >) {
      if (!draft) continue;
      result[category] = {
        ...result[category],
        [stage]: { value: draft.value, lockVersion: draft.base.lockVersion },
      };
    }
  }
  return result;
}

/** Rebuilds prompt drafts once the preferences they were based on are loaded again. */
export function restorePromptDrafts(
  persisted: Partial<Record<LessonStageType, PersistedPromptDraft>> | undefined,
  preferences: AdminPromptPreference[]
): PromptLocalDrafts {
  const result: PromptLocalDrafts = {};
  for (const preference of preferences) {
    const saved = persisted?.[preference.stage];
    if (!saved || saved.value === (preference.customPrompt ?? '')) continue;
    result[preference.stage] = {
      value: saved.value,
      base: { ...preference, lockVersion: saved.lockVersion },
    };
  }
  return result;
}

/** Keeps the typed text and adopts the current remote version as the new base. */
export function rebasePromptDraft(
  draft: PromptLocalDraft,
  current: AdminPromptPreference
): PromptLocalDraft {
  return { value: draft.value, base: current };
}

export function isPromptDraftOutdated(
  draft: PromptLocalDraft | undefined,
  current: AdminPromptPreference | undefined
): boolean {
  return Boolean(draft && current && draft.base.lockVersion !== current.lockVersion);
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
  return `${basePrompt}\n\n${PROMPT_COMPLEMENTARY_HEADER}\n${trimmed}\n\n${PROMPT_COMPLEMENTARY_FOOTER}`;
}

/**
 * What the AI will actually receive. The saved text shows the prompt composed by the API;
 * an unsaved edit is composed locally with the same template.
 */
export function resolveEffectivePromptPreview(
  preference: AdminPromptPreference,
  value: string
): string {
  if (value.trim() === (preference.customPrompt ?? '').trim() && preference.effectivePrompt)
    return preference.effectivePrompt;
  return composeEffectivePromptPreview(preference.basePrompt, value);
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
