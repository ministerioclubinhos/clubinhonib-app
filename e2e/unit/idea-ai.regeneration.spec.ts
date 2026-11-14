import { expect, test } from '@playwright/test';
import {
  buildIdeaAiRequest,
  ideaAiAttemptsLeft,
  ideaAiChosenText,
  ideaAiHasFailedItems,
  ideaAiProgressPercent,
  ideaAiRegenerableMedias,
  ideaAiRegenerateBlock,
  initialIdeaAiDecisions,
  initialIdeaAiFinalText,
  isIdeaAiInfraError,
  isIdeaAiQueueWorking,
  isIdeaAiWorking,
  isIdeaTextEdited,
  parseIdeaAiQueueFilter,
} from '@/features/ideas-sections/ai-utils';
import {
  IdeaAiDecision,
  IdeaAiErrorCode,
  IdeaAiMediaStatus,
  IdeaAiQueueFilter,
  IdeaAiScope,
  IdeaAiStatus,
} from '@/features/ideas-sections/types';
import { buildIdeasSectionsQuery } from '@/features/ideas-sections/utils';
import { completedAttempt, ideaWithAi } from '../support/ideasMocks';

test.describe('regeneração dirigida', () => {
  test('monta o pedido sem campos vazios', () => {
    expect(buildIdeaAiRequest(IdeaAiScope.FULL, ['x'], '  ')).toEqual({ scope: IdeaAiScope.FULL });
    expect(buildIdeaAiRequest(IdeaAiScope.MEDIA, ['a', 'b'], ' mais curto ')).toEqual({
      scope: IdeaAiScope.MEDIA,
      mediaIds: ['a', 'b'],
      instructions: 'mais curto',
    });
  });

  test('só documentos e imagens enviados como arquivo podem ser refeitos', () => {
    const idea = ideaWithAi();
    const expected = idea.medias.map((m) => m.id);
    idea.aiEnhancement!.snapshot!.medias = [...idea.aiEnhancement!.snapshot!.medias];
    idea.aiEnhancement!.snapshot!.medias.push({
      ...idea.medias[0],
      id: 'video',
      mediaType: 'video',
    });
    idea.aiEnhancement!.snapshot!.medias.push({
      ...idea.medias[0],
      id: 'link',
      isLocalFile: false,
    });
    expect(ideaAiRegenerableMedias(idea.aiEnhancement).map((m) => m.id)).toEqual(expected);
  });

  test('detecta itens com falha que ainda não foram cobertos pela base', () => {
    const current = completedAttempt();
    expect(ideaAiHasFailedItems(current)).toBe(false);
    expect(ideaAiHasFailedItems({ ...current, enhancedDescription: null })).toBe(true);
    current.medias[0] = { ...current.medias[0], status: IdeaAiMediaStatus.REJECTED_BY_GUARD };
    expect(ideaAiHasFailedItems(current)).toBe(true);
    expect(ideaAiHasFailedItems(null)).toBe(false);
  });

  test('explica por que não dá para regenerar', () => {
    const idea = ideaWithAi();
    expect(ideaAiRegenerateBlock(idea)).toBe('');
    expect(ideaAiRegenerateBlock({ ...idea, pageId: 'page' })).toMatch(/publicada/);
    expect(
      ideaAiRegenerateBlock({ ...idea, aiEnhancement: { ...idea.aiEnhancement!, enabled: false } })
    ).toMatch(/desligada/);
    expect(
      ideaAiRegenerateBlock({
        ...idea,
        aiEnhancement: { ...idea.aiEnhancement!, providerReady: false },
      })
    ).toMatch(/provedor/);
    expect(
      ideaAiRegenerateBlock({
        ...idea,
        aiEnhancement: { ...idea.aiEnhancement!, activeAttempt: completedAttempt() },
      })
    ).toMatch(/andamento/);
    expect(
      ideaAiRegenerateBlock({
        ...idea,
        aiEnhancement: { ...idea.aiEnhancement!, attemptsUsed: 5 },
      })
    ).toMatch(/Limite/);
    expect(ideaAiAttemptsLeft(idea.aiEnhancement)).toBe(4);
  });

  test('progresso determinado só quando o total é conhecido', () => {
    expect(ideaAiProgressPercent({ ...completedAttempt(), progressDone: 1, progressTotal: 4 })).toBe(
      25
    );
    expect(ideaAiProgressPercent({ ...completedAttempt(), progressTotal: 0 })).toBeNull();
    expect(ideaAiProgressPercent(null)).toBeNull();
  });

  test('falhas de infraestrutura são reconhecidas', () => {
    expect(isIdeaAiInfraError(IdeaAiErrorCode.QUEUE_UNAVAILABLE)).toBe(true);
    expect(isIdeaAiInfraError(IdeaAiErrorCode.GUARD_REJECTED)).toBe(false);
    expect(isIdeaAiInfraError(null)).toBe(false);
  });
});

test.describe('texto final da revisão', () => {
  test('parte da versão escolhida de cada campo', () => {
    const idea = ideaWithAi();
    const decisions = initialIdeaAiDecisions(idea.aiEnhancement)!;
    const fallback = { title: 'x', description: 'y' };
    expect(initialIdeaAiFinalText(idea.aiEnhancement, decisions, fallback)).toEqual({
      title: idea.aiEnhancement!.currentResult!.enhancedTitle,
      description: idea.aiEnhancement!.currentResult!.enhancedDescription,
    });
    expect(
      initialIdeaAiFinalText(
        idea.aiEnhancement,
        { ...decisions, description: IdeaAiDecision.ORIGINAL },
        fallback
      ).description
    ).toBe(idea.aiEnhancement!.snapshot!.description);
    expect(initialIdeaAiFinalText(undefined, null, fallback)).toBe(fallback);
  });

  test('versão da IA inexistente cai no original; espaços não contam como edição', () => {
    expect(ideaAiChosenText(IdeaAiDecision.ENHANCED, 'orig', null)).toBe('orig');
    expect(ideaAiChosenText(IdeaAiDecision.ENHANCED, 'orig', 'ia')).toBe('ia');
    expect(isIdeaTextEdited('a  b', 'a b ')).toBe(false);
    expect(isIdeaTextEdited('a b', 'a c')).toBe(true);
  });
});

test.describe('diff', () => {
  test('mede a fração reescrita para não poluir textos reorganizados', async () => {
    const { ideaDiffChangeRatio, ideaWordDiff } = await import('@/features/ideas-sections/ai-utils');
    expect(ideaDiffChangeRatio(ideaWordDiff('Use 3 bolas hoje.', 'Use 3 bolas amanhã.'))).toBeLessThan(
      0.6
    );
    expect(
      ideaDiffChangeRatio(
        ideaWordDiff('Separe 3 bolas e forme 2 equipes.', 'Forme 2 equipes e separe 3 bolas.')
      )
    ).toBeGreaterThan(0.6);
    expect(ideaDiffChangeRatio([])).toBe(0);
  });
});

test.describe('fila e acompanhamento', () => {
  test('acompanha só enquanto há tentativa na fila ou processando', () => {
    const idea = ideaWithAi();
    expect(isIdeaAiWorking(idea)).toBe(false);
    idea.aiEnhancement!.activeAttempt = { ...completedAttempt(), status: IdeaAiStatus.PROCESSING };
    expect(isIdeaAiWorking(idea)).toBe(true);
    expect(isIdeaAiQueueWorking(IdeaAiStatus.PENDING)).toBe(true);
    expect(isIdeaAiQueueWorking(IdeaAiStatus.PARTIAL)).toBe(false);
    expect(isIdeaAiQueueWorking(null)).toBe(false);
  });

  test('filtro da fila vai à API só quando escolhido', () => {
    expect(parseIdeaAiQueueFilter('READY')).toBe(IdeaAiQueueFilter.READY);
    expect(parseIdeaAiQueueFilter('')).toBeUndefined();
    expect(
      buildIdeasSectionsQuery({
        page: 1,
        limit: 10,
        filters: { aiStatus: IdeaAiQueueFilter.FAILED },
      }).aiStatus
    ).toBe(IdeaAiQueueFilter.FAILED);
    expect(buildIdeasSectionsQuery({ page: 1, limit: 10 }).aiStatus).toBeUndefined();
  });
});
