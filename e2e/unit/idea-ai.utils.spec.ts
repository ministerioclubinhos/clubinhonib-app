import { expect, test } from '@playwright/test';
import { ideaWordDiff, initialIdeaAiDecisions } from '@/features/ideas-sections/ai-utils';
import { IdeaAiDecision } from '@/features/ideas-sections/types';
import { buildReviewSubmission, toSectionDraft } from '@/features/ideas-sections/utils';
import { ideaWithAi } from '../support/ideasMocks';
test('word diff preserves whitespace and marks only new words', () => {
  const diff = ideaWordDiff('Use 3 bolas.', 'Separe 3 bolas.');
  expect(diff.filter((d) => d.changed).map((d) => d.text)).toEqual(['Separe']);
  expect(diff.map((d) => d.text).join('')).toBe('Separe 3 bolas.');
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
