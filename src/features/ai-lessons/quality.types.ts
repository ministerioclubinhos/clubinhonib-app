import type { TiptapDocument } from './types';

/** Kinds of gross problems the lesson check looks for; it never blocks an action. */
export enum LessonQualityIssueKind {
  SHORT_STORY = 'short-story',
  SOURCE_COMMENTARY = 'source-commentary',
  PROMPT_LEAK = 'prompt-leak',
  REPEATED_DISCLAIMER = 'repeated-disclaimer',
  MARKDOWN = 'markdown',
}

export interface LessonQualityIssue {
  kind: LessonQualityIssueKind;
  /** Up to a few sentences from the lesson that triggered the issue. */
  excerpts: string[];
  /** Words in the story, for the short-story issue. */
  storyWords?: number;
}

export interface LessonQualityWarningsProps {
  document: TiptapDocument;
}

/** Plain text of the lesson, grouped by its section headings. */
export interface LessonTextSection {
  heading: string;
  text: string;
}
