import {
  VERSE_CONCLUDED_STATUSES,
  VERSE_FIELD_LIMITS,
  LESSON_VERSE_TEXTS,
} from './production.constants';
import { LessonStageStatus, LessonStageType, LessonStatus, type Lesson } from './types';

/** Verse text compared without quotation marks, spacing or case. */
export function normalizeVerseText(value: string): string {
  return value
    .replace(/[“”"\s]+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

/** Items after item 1 that already exist and will become outdated by a new verse. */
export function itemsOutdatedByVerse(lesson: Pick<Lesson, 'stages'>): LessonStageType[] {
  return lesson.stages
    .filter(
      (stage) =>
        stage.type !== LessonStageType.LESSON && stage.status !== LessonStageStatus.NOT_STARTED
    )
    .map((stage) => stage.type);
}

/** Item 1 is concluded or under review: changing the verse withdraws it. */
export function isBaseItemConcluded(lesson: Pick<Lesson, 'stages'>): boolean {
  const base = lesson.stages.find((stage) => stage.type === LessonStageType.LESSON);
  return Boolean(base && VERSE_CONCLUDED_STATUSES.includes(base.status));
}

/** The change needs the admin's explicit confirmation (the API requires it too). */
export function verseChangeNeedsAcknowledgement(lesson: Pick<Lesson, 'stages'>): boolean {
  return itemsOutdatedByVerse(lesson).length > 0 || isBaseItemConcluded(lesson);
}

/** The verse of a lesson that is published, archived or being published cannot change. */
export function isVerseLocked(status: LessonStatus): boolean {
  return [LessonStatus.PUBLISHED, LessonStatus.ARCHIVED, LessonStatus.PUBLISHING].includes(status);
}

export function verseTextError(text: string): string | null {
  const length = text.trim().length;
  if (length < VERSE_FIELD_LIMITS.textMin) return LESSON_VERSE_TEXTS.textTooShort;
  return length > VERSE_FIELD_LIMITS.textMax ? LESSON_VERSE_TEXTS.textTooLong : null;
}

export function verseReferenceError(reference: string): string | null {
  return reference.trim() ? null : LESSON_VERSE_TEXTS.referenceRequired;
}

/** Same rule as the API: the version closing a reference ("— NVI") is not part of it. */
export function normalizeVerseReference(value: string): string {
  return normalizeVerseText(value.replace(/(?:\s*(?:[—–-]\s*)?\(?NVI\)?)+$/i, ''));
}

export function isSameVerse(
  a: { text: string; reference: string },
  b: { text: string; reference: string }
): boolean {
  return (
    normalizeVerseText(a.text) === normalizeVerseText(b.text) &&
    normalizeVerseReference(a.reference) === normalizeVerseReference(b.reference)
  );
}
