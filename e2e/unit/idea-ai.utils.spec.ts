import { expect, test } from '@playwright/test';
import { ideaWordDiff, initialIdeaAiDecisions } from '@/features/ideas-sections/ai-utils';
import { IdeaAiDecision, IdeaWordDiffKind } from '@/features/ideas-sections/types';
import { buildReviewSubmission, toSectionDraft } from '@/features/ideas-sections/utils';
import { ideaWithAi } from '../support/ideasMocks';
test('word diff marks insertions and removals and rebuilds both texts', () => {
  const diff = ideaWordDiff('Use 3 bolas.', 'Separe 3 bolas.');
  expect(diff.filter((d) => d.kind === IdeaWordDiffKind.ADDED).map((d) => d.text)).toEqual([
    'Separe',
  ]);
  expect(diff.filter((d) => d.kind === IdeaWordDiffKind.REMOVED).map((d) => d.text)).toEqual([
    'Use',
  ]);
  const without = (kind: IdeaWordDiffKind) =>
    diff
      .filter((d) => d.kind !== kind)
      .map((d) => d.text)
      .join('');
  expect(without(IdeaWordDiffKind.REMOVED)).toBe('Separe 3 bolas.');
  expect(without(IdeaWordDiffKind.ADDED)).toBe('Use 3 bolas.');
});
test('word diff ignores whitespace-only changes and merges adjacent parts', () => {
  const diff = ideaWordDiff('Uma ideia boa', 'Uma  ideia\nboa');
  expect(diff).toEqual([{ text: 'Uma  ideia\nboa', kind: IdeaWordDiffKind.SAME }]);
  expect(ideaWordDiff('', 'Nova')).toEqual([{ text: 'Nova', kind: IdeaWordDiffKind.ADDED }]);
});
test('a new result is bound to its attempt; unavailable improvements default to original', () => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.currentResult!.enhancedTitle = null;
  const decisions = initialIdeaAiDecisions(idea.aiEnhancement)!;
  expect(decisions.title).toBe(IdeaAiDecision.ORIGINAL);
  expect(decisions.description).toBe(IdeaAiDecision.ENHANCED);
  const result = buildReviewSubmission({ ...toSectionDraft(idea), aiDecisions: decisions });
  expect(result.payload.aiDecisions?.enhancementId).toBe(idea.aiEnhancement!.currentResult!.id);
});

test('does not restore removed original materials when publishing AI choices', async () => {
  const { excludedIdeaSourceIds } = await import('@/features/ideas-sections/ai-utils');
  const { ideaWithAi } = await import('../support/ideasMocks');
  const { toSectionDraft } = await import('@/features/ideas-sections/utils');
  const idea = ideaWithAi();
  const medias = toSectionDraft(idea).medias;
  expect(excludedIdeaSourceIds(idea, medias)).toEqual([]);
  expect(excludedIdeaSourceIds(idea, medias.slice(1))).toContain(
    idea.aiEnhancement!.snapshot!.medias[0].id
  );
});
