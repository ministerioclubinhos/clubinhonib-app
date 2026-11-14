import {
  IdeaAiErrorCode,
  IdeaAiQueueFilter,
  IdeaAiScope,
  IdeaAiSkipReason,
  IdeaAiStatus,
} from './types';
export const IDEA_AI_STATUS_LABELS: Record<IdeaAiStatus, string> = {
  [IdeaAiStatus.PENDING]: 'Melhoria na fila',
  [IdeaAiStatus.PROCESSING]: 'Melhorando com IA…',
  [IdeaAiStatus.COMPLETED]: 'Melhorada',
  [IdeaAiStatus.PARTIAL]: 'Melhorada em parte',
  [IdeaAiStatus.FAILED]: 'IA falhou',
  [IdeaAiStatus.SKIPPED]: 'Original mantido',
};
export const IDEA_AI_SKIP_LABELS: Record<IdeaAiSkipReason, string> = {
  [IdeaAiSkipReason.NOT_SUPPORTED]: 'Este formato é preservado como foi enviado. Vídeos não passam por melhoria.',
  [IdeaAiSkipReason.ESSENTIAL_VISUALS]:
    'O documento contém desenhos, moldes ou outros elementos essenciais. Mantivemos o original.',
  [IdeaAiSkipReason.TOO_LARGE]: 'O documento ultrapassa 30 páginas ou 60 mil caracteres.',
  [IdeaAiSkipReason.ALREADY_GOOD]: 'O material já apresenta boa qualidade.',
  [IdeaAiSkipReason.CONTAINS_PEOPLE]: 'Há pessoas na foto. Não fazemos edição generativa de rostos.',
  [IdeaAiSkipReason.LIMIT_REACHED]: 'Limite de 10 imagens por tentativa atingido.',
};
export const IDEA_AI_COMPARE_COLUMNS = { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' };
export const IDEA_AI_PANEL_SX = { p: { xs: 2, md: 3 }, borderRadius: 3, minWidth: 0 };

/** Acima disso o diff troca o LCS por uma comparação simples de palavras. */
export const IDEA_AI_DIFF_MAX_CELLS = 2_000_000;
export const IDEA_AI_MAX_INSTRUCTIONS = 500;
/** Polling da revisão: backoff em erro transitório e pausa com a aba oculta. */
export const IDEA_AI_POLL_MAX_ERRORS = 3;
export const IDEA_AI_POLL_BACKOFF_MS = 10_000;
/** Status HTTP que encerram o acompanhamento em vez de repetir. */
export const IDEA_AI_POLL_TERMINAL_STATUSES: readonly number[] = [400, 401, 403, 404];
/** Fila: atualiza os chips enquanto alguma ideia está na IA. */
export const IDEA_AI_QUEUE_POLL_MS = 15_000;

export const IDEA_AI_SCOPE_LABELS: Record<IdeaAiScope, string> = {
  [IdeaAiScope.FULL]: 'Tudo de novo',
  [IdeaAiScope.TEXT]: 'Só título e descrição',
  [IdeaAiScope.FAILED]: 'Só o que falhou ou foi reprovado',
  [IdeaAiScope.MEDIA]: 'Materiais escolhidos',
};
export const IDEA_AI_SCOPE_HELP: Record<IdeaAiScope, string> = {
  [IdeaAiScope.FULL]: 'Refaz texto e todos os materiais a partir do original enviado.',
  [IdeaAiScope.TEXT]: 'Refaz só o texto. Os materiais continuam como estão no resultado atual.',
  [IdeaAiScope.FAILED]:
    'Refaz apenas os itens com falha ou reprovados pela revisão de essência. O restante é aproveitado.',
  [IdeaAiScope.MEDIA]:
    'Refaz só os documentos e imagens que você marcar. O restante é aproveitado.',
};
export const IDEA_AI_ERROR_LABELS: Record<IdeaAiErrorCode, string> = {
  [IdeaAiErrorCode.PROVIDER_NOT_CONFIGURED]:
    'O provedor de IA não está configurado. Esta tentativa não conta no limite.',
  [IdeaAiErrorCode.PROVIDER_REQUEST_FAILED]: 'O provedor de IA não respondeu a tempo.',
  [IdeaAiErrorCode.INVALID_PROVIDER_RESPONSE]: 'O provedor de IA devolveu uma resposta inválida.',
  [IdeaAiErrorCode.GUARD_REJECTED]:
    'A revisão de essência reprovou a nova versão. O original foi preservado.',
  [IdeaAiErrorCode.LIMIT_REACHED]: 'Limite de processamento atingido.',
  [IdeaAiErrorCode.CANCELLED]: 'Cancelada. Não conta no limite.',
  [IdeaAiErrorCode.STALLED]:
    'O processamento travou repetidas vezes e foi encerrado. Não conta no limite.',
  [IdeaAiErrorCode.SNAPSHOT_MISSING]:
    'O envio original não foi encontrado. Não conta no limite.',
  [IdeaAiErrorCode.QUEUE_UNAVAILABLE]:
    'A fila de IA estava indisponível. Não conta no limite; tente mais tarde.',
};
export const IDEA_AI_QUEUE_FILTER_ALL = '';
export const IDEA_AI_QUEUE_FILTER_OPTIONS = [
  { value: IDEA_AI_QUEUE_FILTER_ALL, label: 'Todas' },
  { value: IdeaAiQueueFilter.READY, label: 'Melhoria pronta para revisar' },
  { value: IdeaAiQueueFilter.PROCESSING, label: 'IA trabalhando' },
  { value: IdeaAiQueueFilter.FAILED, label: 'IA falhou' },
  { value: IdeaAiQueueFilter.NONE, label: 'Sem melhoria' },
] as const;
export const IDEA_AI_TEXT_LABELS = {
  title: 'Título',
  description: 'Descrição',
} as const;

/** Estados de uma tentativa que ainda vão mudar sozinhos. */
export const IDEA_AI_WORKING_STATUSES: readonly IdeaAiStatus[] = [
  IdeaAiStatus.PENDING,
  IdeaAiStatus.PROCESSING,
];

export const IDEA_AI_DESCRIPTION_ROWS = 3;

/** Ordem das opções no diálogo de regeneração. */
export const IDEA_AI_SCOPE_ORDER: readonly IdeaAiScope[] = [
  IdeaAiScope.FAILED,
  IdeaAiScope.TEXT,
  IdeaAiScope.MEDIA,
  IdeaAiScope.FULL,
];
/** Tentativas cujo resultado pode ser comparado e publicado. */
export const IDEA_AI_RESULT_STATUSES: readonly IdeaAiStatus[] = [
  IdeaAiStatus.COMPLETED,
  IdeaAiStatus.PARTIAL,
];

/** Destaque acessível do diff: sublinhado/riscado, além da cor. */
export const IDEA_AI_DIFF_TEXT_SX = {
  '& ins': {
    bgcolor: 'success.light',
    color: 'success.contrastText',
    textDecoration: 'underline',
    textDecorationThickness: 2,
  },
  '& del': { color: 'error.main', textDecoration: 'line-through' },
} as const;

export const IDEA_AI_DIFF_REWRITE_RATIO = 0.6;
export const IDEA_AI_FINAL_TEXT_LABELS = {
  title: 'Título que será publicado',
  description: 'Descrição que será publicada',
} as const;
