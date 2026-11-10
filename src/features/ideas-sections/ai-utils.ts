import {
  IdeaAiDecision,
  IdeaAiMediaStatus,
  type IdeaAiDecisions,
  type IdeaAiDetail,
  type IdeasSectionResponse,
  type IdeaWordDiff,
} from './types';
import type { MediaItem } from '@/store/slices/types';
export function initialIdeaAiDecisions(detail?: IdeaAiDetail): IdeaAiDecisions | null {
  const current = detail?.currentResult;
  if (!current) return null;
  const pick = (available: boolean, decision: IdeaAiDecision) =>
    !available
      ? IdeaAiDecision.ORIGINAL
      : decision === IdeaAiDecision.PENDING
        ? IdeaAiDecision.ENHANCED
        : decision;
  return {
    enhancementId: current.id,
    title: pick(Boolean(current.enhancedTitle), current.titleDecision),
    description: pick(current.enhancedDescription !== null, current.descriptionDecision),
    medias: (detail?.snapshot?.medias ?? []).map((m) => {
      const result = current.medias.find((r) => r.sourceMediaId === m.id);
      return {
        sourceMediaId: m.id,
        decision: pick(
          result?.status === IdeaAiMediaStatus.ENHANCED,
          result?.decision ?? IdeaAiDecision.PENDING
        ),
      };
    }),
  };
}
/** Bounded word-level LCS, preserving all whitespace for display. */
export function ideaWordDiff(original: string, enhanced: string): IdeaWordDiff[] {
  const a = original.match(/\S+|\s+/g) ?? [];
  const b = enhanced.match(/\S+|\s+/g) ?? [];
  if (a.length * b.length > 2_000_000) {
    const known = new Set(a);
    return b.map((text) => ({ text, changed: !known.has(text) }));
  }
  const table = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const unchanged = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      unchanged.add(j);
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  return b.map((text, index) => ({ text, changed: !unchanged.has(index) && Boolean(text.trim()) }));
}

/** A removed publication projection must not be restored by its AI choice. */
export function excludedIdeaSourceIds(
  section: IdeasSectionResponse,
  medias: MediaItem[]
): string[] {
  const retainedUrls = new Set(medias.map((m) => m.url));
  return (section.aiEnhancement?.snapshot?.medias ?? [])
    .filter((source) => {
      const versions =
        section.aiEnhancement?.attemptHistory.flatMap((a) =>
          a.medias.filter((m) => m.sourceMediaId === source.id).map((m) => m.enhancedMedia?.url)
        ) ?? [];
      return (
        !retainedUrls.has(source.url) &&
        !versions.some((url) => Boolean(url && retainedUrls.has(url)))
      );
    })
    .map((source) => source.id);
}
