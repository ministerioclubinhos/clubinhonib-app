import { expect, test } from '@playwright/test';

import { STUDIO_STAGE_ORDER } from '@/features/ai-lessons/constants';
import {
  LESSON_STAGE_STATUS_SHORT_LABELS,
  PRODUCTION_CONFIRM_COPY,
  PRODUCTION_TEXTS,
} from '@/features/ai-lessons/production.constants';
import {
  InstructionsOutcome,
  ProductionHeaderTarget,
  ProductionStageAction,
} from '@/features/ai-lessons/production.types';
import {
  aiProviderCaption,
  canCompleteProductionStage,
  completeBlockedReason,
  completionNoticeText,
  instructionsOutcome,
  isProductionCompleted,
  isSaveShortcut,
  isVisualConfigComplete,
  nextStageNeedingProduction,
  productionHeaderStep,
  productionInstructionsKey,
  productionProgress,
  productionStagePrimaryAction,
  resolveVisualConfigForm,
} from '@/features/ai-lessons/production.utils';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  LessonVisualOrientation,
  LessonVisualStyle,
  LessonVisualType,
  ProductionConfirmationKind,
  type Lesson,
  type LessonStage,
} from '@/features/ai-lessons/types';
import { lessonProductionActions } from '@/features/ai-lessons/workflow';
import {
  AI_PROVIDER_PROFILES,
  DEFAULT_AI_PROVIDER_SETTINGS,
} from '@/features/ai-providers/constants';
import { AiProviderProfile, LlmProviderType } from '@/features/ai-providers/types';

const stage = (type: LessonStageType, status: LessonStageStatus): LessonStage => ({
  id: `${type}-id`,
  type,
  status,
  currentVersionId: status === LessonStageStatus.NOT_STARTED ? null : 'v1',
  lockVersion: 1,
  failureMessage: null,
  versions: [],
});

const lesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: 'lesson-1',
  theme: 'Tema',
  biblicalReference: 'João 3.16',
  weekNumber: 12,
  category: LessonCategory.REGULAR,
  status: LessonStatus.IN_PROGRESS,
  weekMaterialId: null,
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-10T12:00:00.000Z',
  stages: [],
  comments: [],
  ...overrides,
});

/** Every item of the weekly lesson, with the given statuses and the rest not started. */
const stagesWith = (statuses: Partial<Record<LessonStageType, LessonStageStatus>>): LessonStage[] =>
  STUDIO_STAGE_ORDER.map((type) => stage(type, statuses[type] ?? LessonStageStatus.NOT_STARTED));

const allStages = (status: LessonStageStatus): LessonStage[] =>
  STUDIO_STAGE_ORDER.map((type) => stage(type, status));

test.describe('produção: ação em destaque do item', () => {
  const primary = (status: LessonStageStatus, edited = false, generating = false) =>
    productionStagePrimaryAction({
      stage: stage(LessonStageType.LESSON, status),
      edited,
      generating,
    });

  test('item sem conteúdo destaca gerar', () => {
    expect(primary(LessonStageStatus.NOT_STARTED)).toBe(ProductionStageAction.GENERATE);
  });

  test('falha sem nenhuma versão continua destacando gerar', () => {
    expect(
      productionStagePrimaryAction({
        stage: { status: LessonStageStatus.FAILED, currentVersionId: null },
        edited: false,
        generating: false,
      })
    ).toBe(ProductionStageAction.GENERATE);
  });

  test('edição não salva destaca salvar, mesmo em item já concluído', () => {
    expect(primary(LessonStageStatus.DRAFT, true)).toBe(ProductionStageAction.SAVE);
    expect(primary(LessonStageStatus.PRODUCER_APPROVED, true)).toBe(ProductionStageAction.SAVE);
  });

  test('rascunho salvo destaca concluir', () => {
    for (const status of [
      LessonStageStatus.DRAFT,
      LessonStageStatus.CHANGES_REQUESTED,
      LessonStageStatus.STALE,
      LessonStageStatus.FAILED,
    ])
      expect(primary(status)).toBe(ProductionStageAction.COMPLETE);
  });

  test('item concluído, em revisão ou aprovado não tem ação em destaque', () => {
    for (const status of [
      LessonStageStatus.PRODUCER_APPROVED,
      LessonStageStatus.IN_REVIEW,
      LessonStageStatus.APPROVED,
    ])
      expect(primary(status)).toBeNull();
  });

  test('durante a geração nada fica em destaque', () => {
    expect(primary(LessonStageStatus.GENERATING)).toBeNull();
    expect(primary(LessonStageStatus.DRAFT, false, true)).toBeNull();
    expect(
      productionStagePrimaryAction({ stage: undefined, edited: false, generating: false })
    ).toBeNull();
  });
});

test.describe('produção: concluir item', () => {
  test('item já concluído não oferece concluir de novo', () => {
    const current = lesson({
      stages: stagesWith({ [LessonStageType.LESSON]: LessonStageStatus.PRODUCER_APPROVED }),
    });
    const concluded = current.stages[0];
    // The workflow rule alone still allows it: this is the regression being fixed.
    const allowed = lessonProductionActions(current, concluded, false, false).canComplete;
    expect(allowed).toBe(true);
    expect(canCompleteProductionStage(concluded, allowed, false)).toBe(false);
    expect(isProductionCompleted(concluded)).toBe(true);
  });

  test('rascunho com conteúdo pode ser concluído; folha estourada bloqueia', () => {
    const draft = stage(LessonStageType.LESSON, LessonStageStatus.DRAFT);
    expect(canCompleteProductionStage(draft, true, false)).toBe(true);
    expect(canCompleteProductionStage(draft, true, true)).toBe(false);
    expect(canCompleteProductionStage(draft, false, false)).toBe(false);
  });

  test('motivo do bloqueio segue a ordem: folha, edições pendentes, já concluído', () => {
    const concluded = stage(LessonStageType.LESSON, LessonStageStatus.PRODUCER_APPROVED);
    expect(completeBlockedReason({ stage: concluded, layoutOverflow: true, hasDrafts: true })).toBe(
      PRODUCTION_TEXTS.completeBlockedOverflow
    );
    expect(
      completeBlockedReason({ stage: concluded, layoutOverflow: false, hasDrafts: true })
    ).toBe(PRODUCTION_TEXTS.completeBlockedDrafts);
    expect(
      completeBlockedReason({ stage: concluded, layoutOverflow: false, hasDrafts: false })
    ).toBe(PRODUCTION_TEXTS.completeBlockedDone);
    expect(
      completeBlockedReason({
        stage: stage(LessonStageType.LESSON, LessonStageStatus.DRAFT),
        layoutOverflow: false,
        hasDrafts: false,
      })
    ).toBeNull();
    // An approved item already explains itself through the regeneration lock.
    expect(
      completeBlockedReason({
        stage: stage(LessonStageType.LESSON, LessonStageStatus.APPROVED),
        layoutOverflow: false,
        hasDrafts: false,
      })
    ).toBeNull();
  });
});

test.describe('produção: ação do cabeçalho', () => {
  test('com 1/8 concluído o destaque é o próximo item, não a revisão', () => {
    const step = productionHeaderStep(
      lesson({
        stages: stagesWith({
          [LessonStageType.LESSON]: LessonStageStatus.PRODUCER_APPROVED,
          [LessonStageType.LESSON_VISUALS]: LessonStageStatus.PRODUCER_APPROVED,
          [LessonStageType.STANDARD_GAME]: LessonStageStatus.DRAFT,
        }),
      })
    );
    expect(step).toEqual({
      target: ProductionHeaderTarget.STAGE,
      label: 'Continuar: 3. Brincadeira',
      stage: LessonStageType.STANDARD_GAME,
    });
  });

  test('geração que falhou vem antes de continuar a produção', () => {
    const step = productionHeaderStep(
      lesson({
        stages: stagesWith({
          [LessonStageType.LESSON]: LessonStageStatus.PRODUCER_APPROVED,
          [LessonStageType.LESSON_VISUALS]: LessonStageStatus.FAILED,
        }),
      })
    );
    expect(step.target).toBe(ProductionHeaderTarget.STAGE);
    expect(step.stage).toBe(LessonStageType.LESSON_VISUALS);
    expect(step.label).toBe('Tentar de novo: 2. Visuais da história');
  });

  test('item devolvido pelo revisor é o próximo passo', () => {
    const step = productionHeaderStep(
      lesson({
        status: LessonStatus.CHANGES_REQUESTED,
        stages: [
          ...allStages(LessonStageStatus.APPROVED).slice(0, 2),
          stage(LessonStageType.STANDARD_GAME, LessonStageStatus.CHANGES_REQUESTED),
        ],
      })
    );
    expect(step.stage).toBe(LessonStageType.STANDARD_GAME);
    expect(step.label).toBe('Corrigir: 3. Brincadeira');
  });

  test('pacote completo, em revisão, aprovado ou publicado destaca a revisão', () => {
    const cases: [LessonStatus, LessonStageStatus][] = [
      [LessonStatus.PACKAGE_READY, LessonStageStatus.PRODUCER_APPROVED],
      [LessonStatus.IN_REVIEW, LessonStageStatus.IN_REVIEW],
      [LessonStatus.READY_FOR_PUBLICATION, LessonStageStatus.APPROVED],
      [LessonStatus.PUBLISHING, LessonStageStatus.APPROVED],
      [LessonStatus.PUBLISHED, LessonStageStatus.APPROVED],
    ];
    for (const [status, stageStatus] of cases)
      expect(productionHeaderStep(lesson({ status, stages: allStages(stageStatus) }))).toEqual({
        target: ProductionHeaderTarget.REVIEW,
        label: PRODUCTION_TEXTS.goToReview,
        stage: null,
      });
  });

  test('material especial usa os nomes das suas três etapas', () => {
    const step = productionHeaderStep(
      lesson({
        category: LessonCategory.SPECIAL,
        stages: [
          stage(LessonStageType.LESSON, LessonStageStatus.PRODUCER_APPROVED),
          stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.NOT_STARTED),
          stage(LessonStageType.VERSE_VISUALS, LessonStageStatus.NOT_STARTED),
        ],
      })
    );
    expect(step.label).toBe('Continuar: 2. Visual da Lição');
    expect(step.stage).toBe(LessonStageType.LESSON_VISUALS);
  });
});

test.describe('produção: depois de concluir', () => {
  test('abre o primeiro item que ainda não foi concluído, na ordem da produção', () => {
    const current = lesson({
      stages: stagesWith({
        [LessonStageType.LESSON]: LessonStageStatus.PRODUCER_APPROVED,
        [LessonStageType.LESSON_VISUALS]: LessonStageStatus.PRODUCER_APPROVED,
      }),
    });
    expect(nextStageNeedingProduction(current, LessonStageType.LESSON_VISUALS)).toBe(
      LessonStageType.STANDARD_GAME
    );
  });

  test('volta para um item anterior que ficou pendente', () => {
    const current = lesson({
      stages: stagesWith({
        [LessonStageType.LESSON]: LessonStageStatus.DRAFT,
        [LessonStageType.MEDITATION_OLDER]: LessonStageStatus.PRODUCER_APPROVED,
      }),
    });
    expect(nextStageNeedingProduction(current, LessonStageType.MEDITATION_OLDER)).toBe(
      LessonStageType.LESSON
    );
  });

  test('ignora o item recém-concluído mesmo que o status ainda não tenha chegado', () => {
    const current = lesson({ stages: stagesWith({}) });
    expect(nextStageNeedingProduction(current, LessonStageType.LESSON)).toBe(
      LessonStageType.LESSON_VISUALS
    );
  });

  test('pacote todo concluído não tem próximo item', () => {
    const current = lesson({ stages: allStages(LessonStageStatus.PRODUCER_APPROVED) });
    expect(nextStageNeedingProduction(current, LessonStageType.MANUAL_WORK)).toBeNull();
  });

  test('material especial só percorre as suas etapas', () => {
    const current = lesson({
      category: LessonCategory.SPECIAL,
      stages: [
        stage(LessonStageType.LESSON, LessonStageStatus.PRODUCER_APPROVED),
        stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.PRODUCER_APPROVED),
        stage(LessonStageType.VERSE_VISUALS, LessonStageStatus.PRODUCER_APPROVED),
      ],
    });
    expect(nextStageNeedingProduction(current, LessonStageType.VERSE_VISUALS)).toBeNull();
  });

  test('aviso diz o que foi concluído e o que vem a seguir', () => {
    expect(
      completionNoticeText(lesson(), {
        completed: LessonStageType.LESSON_VISUALS,
        next: LessonStageType.STANDARD_GAME,
      })
    ).toBe('“2. Visuais da história” concluído. Próximo: “3. Brincadeira”.');
  });

  test('aviso do último item diz que o pacote está pronto para a revisão', () => {
    expect(
      completionNoticeText(lesson(), { completed: LessonStageType.MANUAL_WORK, next: null })
    ).toBe(`“8. Trabalho manual” concluído. ${PRODUCTION_TEXTS.packageReady}`);
  });
});

test.describe('produção: progresso', () => {
  test('em produção conta os itens concluídos pelo produtor', () => {
    expect(
      productionProgress(
        lesson({
          stages: stagesWith({ [LessonStageType.LESSON]: LessonStageStatus.PRODUCER_APPROVED }),
        })
      )
    ).toEqual({ count: 1, total: 8, percent: 13, finalReview: false });
  });

  test('na revisão final conta só os aprovados', () => {
    expect(
      productionProgress(
        lesson({
          status: LessonStatus.IN_REVIEW,
          stages: stagesWith({
            [LessonStageType.LESSON]: LessonStageStatus.APPROVED,
            [LessonStageType.LESSON_VISUALS]: LessonStageStatus.IN_REVIEW,
          }),
        })
      )
    ).toEqual({ count: 1, total: 8, percent: 13, finalReview: true });
  });

  test('lição sem etapas não divide por zero', () => {
    expect(productionProgress(lesson())).toEqual({
      count: 0,
      total: 0,
      percent: 0,
      finalReview: false,
    });
  });
});

test.describe('produção: provedor de IA em uso', () => {
  const settings = (profile: AiProviderProfile.TEST | AiProviderProfile.PRODUCTION) => ({
    ...DEFAULT_AI_PROVIDER_SETTINGS,
    openai: { ...DEFAULT_AI_PROVIDER_SETTINGS.openai, ...AI_PROVIDER_PROFILES[profile].openai },
    gemini: { ...DEFAULT_AI_PROVIDER_SETTINGS.gemini, ...AI_PROVIDER_PROFILES[profile].gemini },
  });

  test('mostra provedor ativo, modelo de texto e perfil de teste', () => {
    expect(
      aiProviderCaption({ ...settings(AiProviderProfile.TEST), llmProvider: LlmProviderType.OPENAI })
    ).toBe('IA: OpenAI · gpt-4o-mini — perfil de teste');
  });

  test('usa o modelo do provedor ativo e reconhece o perfil de produção', () => {
    const production = settings(AiProviderProfile.PRODUCTION);
    expect(aiProviderCaption({ ...production, llmProvider: LlmProviderType.GEMINI })).toBe(
      `IA: Gemini · ${production.gemini.generalModel} — perfil de produção`
    );
  });

  test('qualquer ajuste manual vira perfil personalizado', () => {
    const custom = settings(AiProviderProfile.TEST);
    expect(
      aiProviderCaption({
        ...custom,
        llmProvider: LlmProviderType.OPENAI,
        openai: { ...custom.openai, generalModel: 'modelo-manual' },
      })
    ).toBe('IA: OpenAI · modelo-manual — perfil personalizado');
  });

  test('sem configurações ou sem modelo não mostra nada', () => {
    const empty = settings(AiProviderProfile.TEST);
    expect(aiProviderCaption(undefined)).toBeNull();
    expect(
      aiProviderCaption({
        ...empty,
        llmProvider: LlmProviderType.OPENAI,
        openai: { ...empty.openai, generalModel: '' },
      })
    ).toBeNull();
  });
});

test.describe('produção: configuração dos visuais', () => {
  test('lição semanal usa o kit por padrão e mantém as cenas completas salvas', () => {
    expect(
      resolveVisualConfigForm(
        {
          type: LessonVisualType.STORY_SEQUENCE,
          orientation: LessonVisualOrientation.PORTRAIT,
          quantity: 6,
          style: LessonVisualStyle.CLASSIC_CARTOON,
        },
        false
      )
    ).toEqual({
      visualType: LessonVisualType.STORY_SEQUENCE,
      visualOrientation: LessonVisualOrientation.PORTRAIT,
      visualQuantity: 6,
      visualStyle: LessonVisualStyle.CLASSIC_CARTOON,
    });
    expect(resolveVisualConfigForm({}, false).visualType).toBe(LessonVisualType.CUTOUT_KIT);
    expect(
      resolveVisualConfigForm({ type: LessonVisualType.CHARACTER_AND_EMOTION }, false).visualType
    ).toBe(LessonVisualType.CUTOUT_KIT);
  });

  test('nova geração usa o infantil fofo; versão antiga sem estilo mantém o ilustrado', () => {
    expect(resolveVisualConfigForm({}, false).visualStyle).toBe(LessonVisualStyle.CUTE_CARTOON);
    expect(
      resolveVisualConfigForm({ type: LessonVisualType.CUTOUT_KIT }, false).visualStyle
    ).toBe(LessonVisualStyle.ILLUSTRATED);
    expect(resolveVisualConfigForm({ style: 'X' }, true).visualStyle).toBe(
      LessonVisualStyle.CUTE_CARTOON
    );
  });

  test('material especial mantém o estilo salvo, mas nunca o kit de recortes', () => {
    expect(
      resolveVisualConfigForm({ type: LessonVisualType.STORY_SEQUENCE }, true).visualType
    ).toBe(LessonVisualType.STORY_SEQUENCE);
    expect(resolveVisualConfigForm({ type: LessonVisualType.CUTOUT_KIT }, true).visualType).toBe(
      ''
    );
  });

  test('valores desconhecidos ou fora da faixa ficam em branco', () => {
    expect(resolveVisualConfigForm({ type: 'X', orientation: 'Y', quantity: 99 }, true)).toEqual({
      visualType: '',
      visualOrientation: '',
      visualQuantity: '',
      visualStyle: LessonVisualStyle.CUTE_CARTOON,
    });
    expect(resolveVisualConfigForm({ quantity: '6' }, false).visualQuantity).toBe('');
    expect(resolveVisualConfigForm({}, false).visualOrientation).toBe('');
  });

  test('só está completa com as três escolhas válidas', () => {
    const complete = {
      visualType: LessonVisualType.CUTOUT_KIT,
      visualOrientation: LessonVisualOrientation.PORTRAIT,
      visualQuantity: 6,
      visualStyle: LessonVisualStyle.ILLUSTRATED,
    } as const;
    expect(isVisualConfigComplete(complete)).toBe(true);
    expect(isVisualConfigComplete({ ...complete, visualType: '' })).toBe(false);
    expect(isVisualConfigComplete({ ...complete, visualOrientation: '' })).toBe(false);
    expect(isVisualConfigComplete({ ...complete, visualQuantity: '' })).toBe(false);
    expect(isVisualConfigComplete({ ...complete, visualQuantity: 3 })).toBe(false);
    expect(isVisualConfigComplete({ ...complete, visualQuantity: 11 })).toBe(false);
    expect(isVisualConfigComplete({ ...complete, visualQuantity: 4.5 })).toBe(false);
  });
});

test.describe('produção: instruções para a IA', () => {
  const sent = { text: 'Enfatize o amor de Deus', versionId: 'v1' };

  test('enquanto gera, ou antes de o servidor responder, o texto espera', () => {
    expect(
      instructionsOutcome(sent, { status: LessonStageStatus.GENERATING, currentVersionId: 'v1' })
    ).toBe(InstructionsOutcome.WAIT);
    expect(
      instructionsOutcome(sent, { status: LessonStageStatus.DRAFT, currentVersionId: 'v1' })
    ).toBe(InstructionsOutcome.WAIT);
  });

  test('versão nova limpa o texto usado', () => {
    expect(
      instructionsOutcome(sent, { status: LessonStageStatus.DRAFT, currentVersionId: 'v2' })
    ).toBe(InstructionsOutcome.CLEAR);
    expect(
      instructionsOutcome(
        { text: 'x', versionId: null },
        { status: LessonStageStatus.DRAFT, currentVersionId: 'v1' }
      )
    ).toBe(InstructionsOutcome.CLEAR);
  });

  test('falha preserva o texto para a nova tentativa', () => {
    expect(
      instructionsOutcome(sent, { status: LessonStageStatus.FAILED, currentVersionId: 'v1' })
    ).toBe(InstructionsOutcome.KEEP);
    expect(instructionsOutcome(sent, undefined)).toBe(InstructionsOutcome.KEEP);
  });

  test('chave de armazenamento é por usuário e por lição', () => {
    expect(productionInstructionsKey('user-1', 'lesson-1')).toBe(
      'clubinho:studio:v1:user-1:drafts:lesson-1:instructions'
    );
    expect(productionInstructionsKey('', 'lesson-1')).toBe('');
    expect(productionInstructionsKey('user-1', '')).toBe('');
  });
});

test.describe('produção: atalho de salvar', () => {
  const key = (overrides: Partial<Parameters<typeof isSaveShortcut>[0]>) =>
    isSaveShortcut({ key: 's', ctrlKey: false, metaKey: false, altKey: false, ...overrides });

  test('Ctrl+S e Cmd+S salvam, em maiúscula ou minúscula', () => {
    expect(key({ ctrlKey: true })).toBe(true);
    expect(key({ metaKey: true })).toBe(true);
    expect(key({ ctrlKey: true, key: 'S' })).toBe(true);
  });

  test('S sozinho, outra tecla ou combinação com Alt não salvam', () => {
    expect(key({})).toBe(false);
    expect(key({ ctrlKey: true, key: 'a' })).toBe(false);
    expect(key({ ctrlKey: true, altKey: true })).toBe(false);
  });
});

test.describe('produção: textos', () => {
  test('toda confirmação tem título e botão; só descartar é destrutivo', () => {
    for (const kind of Object.values(ProductionConfirmationKind)) {
      const copy = PRODUCTION_CONFIRM_COPY[kind];
      expect(copy.title('3. Brincadeira')).not.toBe('');
      expect(copy.confirmText).not.toBe('');
      expect(copy.confirmColor).toBe(
        kind === ProductionConfirmationKind.DISCARD ? 'error' : 'primary'
      );
    }
    expect(PRODUCTION_CONFIRM_COPY[ProductionConfirmationKind.REGENERATE].title('3. Brincadeira')).toBe(
      'Regenerar “3. Brincadeira” com IA?'
    );
  });

  test('textos que os testes de navegador procuram continuam iguais', () => {
    expect(PRODUCTION_TEXTS.back).toBe('Voltar para Produção de Lições');
    expect(PRODUCTION_TEXTS.preview).toBe('Visualizar PDF do item');
    expect(PRODUCTION_TEXTS.close).toBe('Fechar');
    expect(PRODUCTION_TEXTS.save).toBe('Salvar edição');
    expect(PRODUCTION_CONFIRM_COPY[ProductionConfirmationKind.DISCARD].confirmText).toBe(
      'Descartar edição'
    );
    // The bar's save must not answer to the exact name of the item's own button.
    expect(PRODUCTION_TEXTS.unsavedBarSaveName).not.toBe(PRODUCTION_TEXTS.save);
  });

  test('todo status tem nome curto para as abas do celular', () => {
    for (const status of Object.values(LessonStageStatus))
      expect(LESSON_STAGE_STATUS_SHORT_LABELS[status].length).toBeLessThanOrEqual(13);
  });
});
