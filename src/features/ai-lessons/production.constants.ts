import { AiProviderProfile } from '@/features/ai-providers/types';
import type { ProductionConfirmCopy, VisualConfigForm } from './production.types';
import { LessonStageStatus, ProductionConfirmationKind, StudioHubAction } from './types';
import type { lessonProductionActions } from './workflow';

/** Width of the header's actions column on desktop; the title takes what is left. */
export const PRODUCTION_HEADER_ACTIONS_WIDTH = 280;
/** Room left under the page so the fixed mobile bar never covers the last control. */
export const PRODUCTION_UNSAVED_BAR_CLEARANCE = 88;
export const PRODUCTION_STAGE_CARD_ID = 'ai-lesson-production-stage-card';
export const PRODUCTION_SKELETON_STAGE_ROWS = 5;
export const AI_PROVIDER_SETTINGS_ROUTE = '/adm/config-provedores-ia';
export const PRODUCTION_SAVE_SHORTCUT_KEY = 's';
/**
 * Appended to the lesson id in the drafts snapshot key. The instructions live beside the
 * document drafts so the same logout/user purge covers them.
 */
export const PRODUCTION_INSTRUCTIONS_KEY_SUFFIX = 'instructions';

/** Until the lesson loads nothing can be done to it. */
export const PRODUCTION_NO_ACTIONS: ReturnType<typeof lessonProductionActions> = {
  canEdit: false,
  canSave: false,
  canGenerate: false,
  regenerationLocked: false,
  canComplete: false,
  dependencyReady: true,
};
export const EMPTY_VISUAL_CONFIG_FORM: VisualConfigForm = {
  visualType: '',
  visualOrientation: '',
  visualQuantity: '',
};

/** Hub actions that are done in this screen; the others happen in the review screen. */
export const PRODUCTION_STEP_ACTIONS: readonly StudioHubAction[] = [
  StudioHubAction.FIX_CHANGES,
  StudioHubAction.RETRY_FAILED,
  StudioHubAction.CONTINUE,
  StudioHubAction.START,
];

/**
 * Short status names for the mobile tabs, where the full ones ("Concluída pelo produtor")
 * push the item name out of view. Other screens keep `LESSON_STAGE_STATUS_LABELS`.
 */
export const LESSON_STAGE_STATUS_SHORT_LABELS: Record<LessonStageStatus, string> = {
  NOT_STARTED: 'A fazer',
  GENERATING: 'Gerando',
  DRAFT: 'Em produção',
  PRODUCER_APPROVED: 'Concluída',
  IN_REVIEW: 'Em revisão',
  CHANGES_REQUESTED: 'Ajustes',
  APPROVED: 'Aprovada',
  FAILED: 'Falhou',
  STALE: 'Desatualizada',
};
export const LESSON_STAGE_UNSAVED_LABEL = 'Edição não salva';
export const LESSON_STAGE_UNSAVED_SHORT_LABEL = 'Não salva';

export const AI_PROVIDER_PROFILE_CAPTIONS: Record<AiProviderProfile, string> = {
  [AiProviderProfile.TEST]: 'perfil de teste',
  [AiProviderProfile.PRODUCTION]: 'perfil de produção',
  [AiProviderProfile.CUSTOM]: 'perfil personalizado',
};

export const PRODUCTION_CONFIRM_COPY: Record<ProductionConfirmationKind, ProductionConfirmCopy> = {
  [ProductionConfirmationKind.COMPLETE_OUTDATED]: {
    title: () => 'Concluir este item sem gerar novamente?',
    confirmText: 'Continua válido, concluir',
    confirmColor: 'primary',
  },
  [ProductionConfirmationKind.SAVE]: {
    title: () => 'Salvar e desatualizar os itens seguintes?',
    confirmText: 'Salvar mesmo assim',
    confirmColor: 'primary',
  },
  [ProductionConfirmationKind.REGENERATE]: {
    title: (stageLabel) => `Regenerar “${stageLabel}” com IA?`,
    confirmText: 'Regenerar',
    confirmColor: 'primary',
  },
  [ProductionConfirmationKind.REBASE]: {
    title: () => 'Reaplicar sua edição sobre a versão atual?',
    confirmText: 'Reaplicar minha edição',
    confirmColor: 'primary',
  },
  [ProductionConfirmationKind.DISCARD]: {
    title: () => 'Descartar a edição desta etapa?',
    confirmText: 'Descartar edição',
    confirmColor: 'error',
  },
};

export const PRODUCTION_TEXTS = {
  back: 'Voltar para Produção de Lições',
  backFromError: 'Voltar para lições',
  loading: 'Carregando detalhes da lição...',
  loadError: 'Não foi possível carregar os detalhes da lição.',
  deleteError: 'Não foi possível excluir a lição.',
  stageMissing:
    'Esta etapa não faz parte deste pacote. Selecione outra etapa no fluxo da produção.',

  // Cabeçalho
  goToReview: 'Ir para a revisão',
  moreActions: 'Mais ações',
  deleteLesson: 'Excluir lição',
  progressLabel: 'Progresso geral da lição',
  progressApproved: 'aprovados',
  progressCompleted: 'itens concluídos',
  specialContextPrefix: 'Ideia da história:',

  // Avisos da página
  draftRecovered:
    'Rascunho recuperado: suas edições não salvas desta lição foram restauradas neste navegador. Revise e salve para não perdê-las.',
  unsavedNotice:
    'Há edições não salvas. Você pode alternar as etapas; salve ou descarte as edições antes de concluir ou gerar conteúdo.',
  draftOutdated:
    'Esta etapa recebeu uma versão mais nova em outra sessão enquanto você editava. Sua edição foi preservada, mas não pode ser salva sobre a versão antiga.',
  viewRemote: 'Ver versão remota',
  rebase: 'Reaplicar minha edição sobre a versão atual',

  // Orientações do item
  changesRequested:
    'Esta etapa recebeu solicitação de ajustes na revisão. Revise as observações abaixo, edite ou regenere o conteúdo e conclua o item novamente.',
  staleUnknownOrigin: 'uma etapa anterior do fluxo',
  dependencyMissing: 'Conclua a etapa anterior do fluxo antes de gerar esta.',
  commentsTitle: 'Observações da Revisão',
  generationFailedTitle: 'A geração deste item falhou.',
  retryGeneration: 'Tentar de novo',
  retryNeedsVisualConfig:
    'Para tentar de novo, confirme abaixo a quantidade, o estilo e o formato dos visuais.',
  failureDetails: 'Ver detalhes',
  packageReady: 'O pacote está completo e pronto para a revisão.',
  dismissNotice: 'Dispensar aviso',

  // Ações do item
  instructionsLabel: 'Orientações e instruções para a IA (geração ou ajuste)',
  instructionsPlaceholder:
    'Ex: Enfatize o amor de Deus, mantenha linguagem acessível para crianças de 6 anos...',
  generate: 'Gerar com IA',
  regenerate: 'Regenerar com IA',
  generating: 'Gerando com IA…',
  save: 'Salvar edição',
  saving: 'Salvando…',
  preview: 'Visualizar PDF do item',
  previewNeedsSave: 'Salve para visualizar',
  complete: 'Concluir item para o pacote',
  completing: 'Concluindo…',
  completed: 'Item concluído',
  discard: 'Descartar edição desta etapa',
  providerSettingsLink: 'Alterar',
  completeBlockedOverflow:
    'O conteúdo ultrapassa a folha de impressão. Reduza o texto antes de concluir o item.',
  completeBlockedDrafts: 'Salve ou descarte as edições pendentes antes de concluir.',
  completeBlockedDone:
    'Este item já foi concluído. Ao salvar uma nova edição ele volta para produção e pode ser concluído de novo.',
  saveConflict:
    'Esta etapa foi alterada em outra sessão. Sua edição foi preservada; aguarde a versão atual carregar para compará-la ou reaplicar sua edição.',
  saveFailed: 'Não foi possível salvar. Sua edição foi preservada; tente novamente.',
  completeConflict:
    'Esta etapa foi atualizada em outra sessão. A versão mais recente foi recarregada; revise o conteúdo antes de concluir o item.',
  completeFailed:
    'Não foi possível concluir o item para o pacote. Verifique se o conteúdo e as ilustrações estão prontos e tente novamente.',

  // Barra de edição não salva
  unsavedBarLabel: 'Edição não salva nesta etapa',
  unsavedBarSaveName: 'Salvar edição desta etapa',
  unsavedBarDiscard: 'Descartar',
  unsavedBarShortcut: 'Ctrl/Cmd + S salva',

  // Confirmações
  confirmSaveBody:
    'Salvar esta edição marca como desatualizados os itens abaixo, que dependem dela. Eles perdem a conclusão e precisarão ser revistos e concluídos novamente. Itens aprovados ou em revisão não são alterados:',
  confirmRegenerateSignedOff: 'Este item já foi concluído. Regenerar descarta essa conclusão.',
  confirmRegenerateBody:
    'A IA criará uma nova versão que substitui o conteúdo atual deste item. A versão anterior fica apenas no histórico e a geração consome créditos do provedor.',
  confirmRegenerateImpact: 'Os itens abaixo também ficarão desatualizados:',
  confirmRegenerateNoImpact: 'Os demais itens não serão alterados.',
  confirmRegenerateNoImpactInReview:
    'O pacote está em revisão: os demais itens não serão alterados e os aprovados continuam aprovados.',
  confirmRebaseBody:
    'Seu texto passa a substituir a versão que está no servidor quando você salvar. As alterações feitas na outra sessão que você não incorporou serão sobrescritas. Use “Ver versão remota” antes, se quiser comparar.',
  confirmDiscardBody:
    'A edição local desta etapa será apagada e a versão atual do servidor será carregada.',
  confirmOutdatedUnknownOrigin: ' dos itens anteriores',

  remoteVersionTitle: 'Versão atual no servidor —',
  close: 'Fechar',
} as const;
