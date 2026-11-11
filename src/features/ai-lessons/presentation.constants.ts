import {
  LessonCategory,
  LessonConnectionState,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  StudioScreenKind,
  type StudioChipColor,
} from './types';


export const LESSON_STAGE_LABELS: Record<LessonStageType, string> = {
  LESSON: '1. Lição completa',
  LESSON_VISUALS: '2. Visuais da história',
  STANDARD_GAME: '3. Brincadeira',
  VERSE_VISUALS: '4. Visuais do versículo',
  VERSE_FIXATION: '5. Fixação divertida do versículo',
  MEDITATION_YOUNGER: '6. Meditação dos menores',
  MEDITATION_OLDER: '7. Meditação dos maiores',
  MANUAL_WORK: '8. Trabalho manual',
};

export const LESSON_STAGE_SHORT_LABELS: Record<LessonStageType, string> = {
  LESSON: '1. Lição',
  LESSON_VISUALS: '2. Visuais',
  STANDARD_GAME: '3. Brincadeira',
  VERSE_VISUALS: '4. Vis. Versículo',
  VERSE_FIXATION: '5. Fixação',
  MEDITATION_YOUNGER: '6. Med. Menores',
  MEDITATION_OLDER: '7. Med. Maiores',
  MANUAL_WORK: '8. Trab. Manual',
};

export const LESSON_STAGE_DESCRIPTIONS: Record<LessonStageType, string> = {
  LESSON: 'Conteúdo-base da aula e escolha de um único versículo principal NVI para memorização.',
  LESSON_VISUALS:
    'Personagens, ambientes e cenas, em ordem narrativa, para auxiliar o professor a contar a história.',
  STANDARD_GAME:
    'Brincadeira prática da aula e seus visuais de apoio, separada da atividade de memorização.',
  VERSE_VISUALS:
    'Sequência de imagens mnemônicas baseada na melhor quebra do versículo; a última imagem mostra somente a referência.',
  VERSE_FIXATION:
    'Dinâmica ou brincadeira divertida para praticar e memorizar o versículo, separada dos visuais mnemônicos.',
  MEDITATION_YOUNGER:
    'Folha A4 com duas cópias de atividades visuais simples para crianças de 5 a 7 anos.',
  MEDITATION_OLDER:
    'Folha A4 com três desafios de compreensão e aplicação para crianças de 8 a 11 anos, acompanhados de gabarito.',
  MANUAL_WORK:
    'Desenho bíblico em preto e branco para colorir, com o versículo principal, duplicado na folha para impressão e recorte.',
};

export const SPECIAL_STAGE_LABELS: Partial<Record<LessonStageType, string>> = {
  LESSON: '1. Lição Especial + Versículo',
  LESSON_VISUALS: '2. Visual da Lição',
  VERSE_VISUALS: '3. Visual do Versículo',
};

export const SPECIAL_STAGE_SHORT_LABELS: Partial<Record<LessonStageType, string>> = {
  LESSON: '1. Lição Especial',
  LESSON_VISUALS: '2. Visual da Lição',
  VERSE_VISUALS: '3. Vis. Versículo',
};

export const SPECIAL_STAGE_DESCRIPTIONS: Partial<Record<LessonStageType, string>> = {
  LESSON:
    'Lição Especial com um jeito legal e criativo de contar uma história para os dias de hoje, conectada às referências bíblicas, e o versículo principal NVI para memorização.',
  LESSON_VISUALS:
    'Cartazes e cenas para contar a Lição Especial, com orientações criativas de como apresentar cada visual às crianças.',
  VERSE_VISUALS:
    'Sequência de imagens mnemônicas baseada na melhor quebra do versículo; a última imagem mostra somente a referência.',
};

export const LESSON_STAGE_STATUS_LABELS: Record<LessonStageStatus, string> = {
  NOT_STARTED: 'Não iniciada',
  GENERATING: 'Gerando',
  DRAFT: 'Em produção',
  PRODUCER_APPROVED: 'Concluída pelo produtor',
  IN_REVIEW: 'Em aprovação final',
  CHANGES_REQUESTED: 'Ajustes solicitados',
  APPROVED: 'Aprovada na revisão final',
  FAILED: 'Falhou',
  STALE: 'Desatualizada',
};

export const LESSON_STAGE_STATUS_COLORS: Record<LessonStageStatus, StudioChipColor> = {
  NOT_STARTED: 'default',
  GENERATING: 'info',
  DRAFT: 'primary',
  PRODUCER_APPROVED: 'info',
  IN_REVIEW: 'warning',
  CHANGES_REQUESTED: 'error',
  APPROVED: 'success',
  FAILED: 'error',
  STALE: 'warning',
};

export const LEGACY_DOCUMENT_LABELS: Record<string, string> = {
  'FUN MECHANICS': 'MECÂNICAS DIVERTIDAS',
  AGES5TO7: 'CRIANÇAS DE 5 A 7 ANOS',
  AGES8TO11: 'CRIANÇAS DE 8 A 11 ANOS',
};
export const LEGACY_VERSE_HEADINGS = [
  'TEXTO DO VERSÍCULO',
  'REFERÊNCIA DO VERSÍCULO',
  'VERSÃO BÍBLICA',
];
export const AI_QUOTA_FAILURE_MARKERS = [
  'insufficient_quota',
  'credit_balance_exhausted',
  'no credits remaining',
];

/** One vocabulary for the package status, shared by lists, headers and filters. */
export const LESSON_STATUS_PRESENTATION: Record<
  LessonStatus,
  { label: string; color: StudioChipColor }
> = {
  DRAFT: { label: 'Rascunho', color: 'warning' },
  IN_PROGRESS: { label: 'Em produção', color: 'info' },
  PACKAGE_READY: { label: 'Pacote completo', color: 'info' },
  IN_REVIEW: { label: 'Em revisão', color: 'warning' },
  CHANGES_REQUESTED: { label: 'Ajustes solicitados', color: 'error' },
  READY_FOR_PUBLICATION: { label: 'Pronto para publicar', color: 'success' },
  PUBLISHING: { label: 'Publicando', color: 'info' },
  PUBLISHED: { label: 'Publicado', color: 'success' },
  ARCHIVED: { label: 'Arquivado', color: 'default' },
};

export const LESSON_CATEGORY_LABELS: Record<LessonCategory, string> = {
  [LessonCategory.REGULAR]: 'Material Semanal',
  [LessonCategory.SPECIAL]: 'Material Especial',
};

export const REVIEW_TAB_STATUS_LABELS: Record<LessonStageStatus, string> = {
  NOT_STARTED: 'NÃO INICIADO',
  GENERATING: 'GERANDO',
  DRAFT: 'EM PRODUÇÃO',
  PRODUCER_APPROVED: 'AGUARDA REVISÃO',
  IN_REVIEW: 'EM REVISÃO',
  CHANGES_REQUESTED: 'AJUSTES',
  APPROVED: 'APROVADO',
  FAILED: 'FALHOU',
  STALE: 'DESATUALIZADO',
};

export const STUDIO_CONNECTION_COPY: Record<
  StudioScreenKind,
  Record<LessonConnectionState, string>
> = {
  [StudioScreenKind.PRODUCTION]: {
    [LessonConnectionState.CONNECTING]: 'Conectando às atualizações da lição…',
    [LessonConnectionState.CONNECTED]: '',
    [LessonConnectionState.PAUSED]: '',
    [LessonConnectionState.RECONNECTING]:
      'Conexão interrompida. Reconectando; suas edições locais estão preservadas.',
    [LessonConnectionState.DENIED]:
      'Sem acesso às atualizações desta lição. Verifique sua sessão e permissão.',
    [LessonConnectionState.NOT_FOUND]:
      'Esta lição não existe mais: ela foi excluída em outra sessão. O conteúdo abaixo é a última cópia carregada e não pode mais ser salvo.',
  },
  [StudioScreenKind.REVIEW]: {
    [LessonConnectionState.CONNECTING]: 'Conectando às atualizações da revisão…',
    [LessonConnectionState.CONNECTED]: '',
    [LessonConnectionState.PAUSED]: '',
    [LessonConnectionState.RECONNECTING]:
      'Conexão interrompida. Reconectando; suas observações locais estão preservadas.',
    [LessonConnectionState.DENIED]:
      'Sem acesso às atualizações desta revisão. Verifique sua sessão e permissão.',
    [LessonConnectionState.NOT_FOUND]:
      'Esta lição não existe mais: ela foi excluída em outra sessão. A revisão não pode continuar.',
  },
};

export const IMAGE_ONLY_STAGES: readonly LessonStageType[] = [
  LessonStageType.LESSON_VISUALS,
  LessonStageType.VERSE_VISUALS,
  LessonStageType.MANUAL_WORK,
];
export const VERSE_DEPENDENT_STAGES: readonly LessonStageType[] = [
  LessonStageType.VERSE_VISUALS,
  LessonStageType.VERSE_FIXATION,
  LessonStageType.MEDITATION_YOUNGER,
  LessonStageType.MEDITATION_OLDER,
  LessonStageType.MANUAL_WORK,
];
export const STUDIO_ROUTES = {
  hub: '/adm/estudio',
  production: '/adm/estudio/licoes',
  review: '/adm/estudio/revisao',
  weekMaterials: '/adm/paginas-materiais-semanais',
} as const;
export const MANUAL_SAVE_CHANGE_SUMMARY = 'Revisão manual';
export const LESSON_INSTRUCTIONS_MAX_LENGTH = 1000;
export const STUDIO_CONNECTION_TEST_IDS: Record<StudioScreenKind, string> = {
  [StudioScreenKind.PRODUCTION]: 'ai-lesson-connection-status',
  [StudioScreenKind.REVIEW]: 'ai-lesson-review-connection-status',
};
