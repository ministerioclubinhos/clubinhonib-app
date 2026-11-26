import { LessonGenerationPhase } from './types';

/** How often the studio asks which generations are running. */
export const ACTIVE_GENERATIONS_POLL_MS = { running: 3000, idle: 20000 } as const;

export const GENERATION_PHASE_LABELS: Record<LessonGenerationPhase, string> = {
  [LessonGenerationPhase.WRITING]: 'Escrevendo o conteúdo',
  [LessonGenerationPhase.IMAGES]: 'Gerando as imagens',
  [LessonGenerationPhase.SAVING]: 'Salvando o resultado',
};

export const GENERATION_TEXTS = {
  bannerTitleOne: '1 geração em andamento',
  bannerTitleMany: (count: number) => `${count} gerações em andamento`,
  follow: 'Acompanhar',
  /** The API could not tell the progress (Redis offline): the work still runs. */
  unknown: 'Gerando o conteúdo com IA',
  keepBrowsing:
    'Você pode sair desta tela ou recarregar a página: a geração continua e o andamento volta sozinho.',
  otherStage:
    'Edição, geração e conclusão ficam bloqueadas até terminar; a leitura continua liberada.',
} as const;
