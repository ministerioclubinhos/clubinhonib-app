import { IdeaAiStatus } from './types';
export const IDEA_AI_STATUS_LABELS: Record<IdeaAiStatus, string> = {
  [IdeaAiStatus.PENDING]: 'Melhoria na fila',
  [IdeaAiStatus.PROCESSING]: 'Melhorando com IA…',
  [IdeaAiStatus.COMPLETED]: 'Melhorada',
  [IdeaAiStatus.PARTIAL]: 'Melhorada em parte',
  [IdeaAiStatus.FAILED]: 'IA falhou',
  [IdeaAiStatus.SKIPPED]: 'Original mantido',
};
export const IDEA_AI_SKIP_LABELS: Record<string, string> = {
  NOT_SUPPORTED: 'Este formato é preservado como foi enviado. Vídeos não passam por melhoria.',
  ESSENTIAL_VISUALS:
    'O documento contém desenhos, moldes ou outros elementos essenciais. Mantivemos o original.',
  TOO_LARGE: 'O documento ultrapassa 30 páginas ou 60 mil caracteres.',
  ALREADY_GOOD: 'O material já apresenta boa qualidade.',
  CONTAINS_PEOPLE: 'Há pessoas na foto. Não fazemos edição generativa de rostos.',
  LIMIT_REACHED: 'Limite de 10 imagens por tentativa atingido.',
};
export const IDEA_AI_COMPARE_COLUMNS = { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' };
export const IDEA_AI_PANEL_SX = { p: { xs: 2, md: 3 }, borderRadius: 3, minWidth: 0 };
