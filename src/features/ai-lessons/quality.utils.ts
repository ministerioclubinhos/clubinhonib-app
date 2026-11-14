import {
  LESSON_DISCLAIMER_REPEAT_THRESHOLD,
  LESSON_QUALITY_TEXTS,
  LESSON_QUALITY_EXCERPT_MAX_LENGTH,
  LESSON_QUALITY_MAX_EXCERPTS,
  LESSON_QUALITY_PATTERNS,
  LESSON_STORY_HEADING,
  LESSON_STORY_MIN_WORDS,
} from './quality.constants';
import {
  LessonQualityIssueKind,
  type LessonQualityIssue,
  type LessonTextSection,
} from './quality.types';
import type { TiptapDocument } from './types';

type TiptapNode = Record<string, unknown>;

function nodeText(node: TiptapNode): string {
  if (typeof node.text === 'string') return node.text;
  const children = Array.isArray(node.content) ? (node.content as TiptapNode[]) : [];
  return children.map(nodeText).join('');
}

/** Splits the document at its section headings (levels 1 and 2). */
export function lessonTextSections(document: TiptapDocument): LessonTextSection[] {
  const sections: LessonTextSection[] = [{ heading: '', text: '' }];
  for (const node of document.content ?? []) {
    const level = Number((node.attrs as { level?: unknown } | undefined)?.level);
    if (node.type === 'heading' && level <= 2) {
      sections.push({ heading: nodeText(node).trim().toLocaleUpperCase('pt-BR'), text: '' });
      continue;
    }
    const current = sections[sections.length - 1];
    current.text += `${nodeText(node)}\n`;
  }
  return sections;
}

export function countWords(text: string): number {
  return text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

/** The sentence around a match, trimmed for display. */
function excerptAround(text: string, index: number, length: number): string {
  const before = text.slice(0, index);
  const start = Math.max(before.lastIndexOf('. '), before.lastIndexOf('\n'), -1) + 1;
  const after = text.slice(index + length);
  const endOffsets = ['. ', '\n'].map((mark) => after.indexOf(mark)).filter((i) => i >= 0);
  const end = index + length + (endOffsets.length ? Math.min(...endOffsets) + 1 : after.length);
  const sentence = text.slice(start, end).replace(/\s+/g, ' ').trim();
  return sentence.length > LESSON_QUALITY_EXCERPT_MAX_LENGTH
    ? `${sentence.slice(0, LESSON_QUALITY_EXCERPT_MAX_LENGTH - 1)}…`
    : sentence;
}

function matchExcerpts(text: string, patterns: readonly RegExp[]): string[] {
  const found: string[] = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
      const excerpt = excerptAround(text, match.index, match[0].length);
      if (!found.includes(excerpt)) found.push(excerpt);
    }
  }
  return found;
}

/**
 * Gross problems of a generated lesson, found with plain text patterns. It is
 * approximate on purpose: it points the reviewer at excerpts and decides nothing.
 */
export function lessonQualityIssues(document: TiptapDocument): LessonQualityIssue[] {
  const sections = lessonTextSections(document);
  const text = sections.map((section) => section.text).join('\n');
  const issues: LessonQualityIssue[] = [];

  const story = sections.find((section) => section.heading === LESSON_STORY_HEADING);
  const storyWords = story ? countWords(story.text) : 0;
  if (story && storyWords < LESSON_STORY_MIN_WORDS)
    issues.push({ kind: LessonQualityIssueKind.SHORT_STORY, excerpts: [], storyWords });

  for (const kind of [
    LessonQualityIssueKind.SOURCE_COMMENTARY,
    LessonQualityIssueKind.PROMPT_LEAK,
    LessonQualityIssueKind.REPEATED_DISCLAIMER,
    LessonQualityIssueKind.MARKDOWN,
  ] as const) {
    const excerpts = matchExcerpts(text, LESSON_QUALITY_PATTERNS[kind]);
    const threshold =
      kind === LessonQualityIssueKind.REPEATED_DISCLAIMER ? LESSON_DISCLAIMER_REPEAT_THRESHOLD : 1;
    if (excerpts.length >= threshold)
      issues.push({ kind, excerpts: excerpts.slice(0, LESSON_QUALITY_MAX_EXCERPTS) });
  }
  return issues;
}

/** Short, human label of one issue. */
export function lessonQualityIssueLabel(issue: LessonQualityIssue): string {
  return issue.kind === LessonQualityIssueKind.SHORT_STORY
    ? LESSON_QUALITY_TEXTS.labels[LessonQualityIssueKind.SHORT_STORY](issue.storyWords ?? 0)
    : LESSON_QUALITY_TEXTS.labels[issue.kind];
}
