export const AI_LESSON_EVENTS_RECONNECT_DELAY_MS = 2000;
export const AI_LESSON_EVENTS_STALE_TIMEOUT_MS = 10000;
export const AI_LESSON_EVENTS_MAX_DURATION_MS = 180_000;
export const AI_LESSON_EVENTS_MAX_BYTES = 2_097_152;

export const STORY_VISUAL_SETUP_STEPS = ['Quantidade', 'Estilo', 'Formato'] as const;
export const STORY_VISUAL_MIN_QUANTITY = 4;
export const STORY_VISUAL_MAX_QUANTITY = 10;

export const CUTOUT_CATEGORY_LABELS: Record<string, string> = {
  CHARACTERS: 'Personagens',
  ANIMALS: 'Animais',
  BUILDINGS: 'Construções',
  SCENERY: 'Cenário',
  SKY_AND_NATURE: 'Céu e natureza',
  OBJECTS: 'Objetos',
};

/** Espelha CUTOUT_KIT_TIERS do backend: o básico entra sempre; cada nível só acrescenta. */
const CUTOUT_KIT_EXTRAS: Record<number, string> = {
  5: 'segunda pose dos personagens principais',
  6: 'mais ângulos das construções e peças de cenário',
  7: 'céu e natureza ampliados',
  8: 'filhotes e mais animais',
  9: 'expressões extras e multidão em silhuetas',
  10: 'objetos secundários e peças de transição',
};

export const cutoutKitSummary = (quantity: number): string => {
  if (!Number.isInteger(quantity) || quantity < STORY_VISUAL_MIN_QUANTITY) return '';
  const extras: string[] = [];
  for (let n = 5; n <= Math.min(quantity, STORY_VISUAL_MAX_QUANTITY); n++)
    extras.push(CUTOUT_KIT_EXTRAS[n]);
  return extras.length
    ? `${quantity} pranchas: básico completo + ${extras.join(', ')}.`
    : `${quantity} pranchas: o básico completo.`;
};

export const AI_LESSON_HUB_RECENT_LIMIT = 3;

export const PROMPT_MIN_LENGTH = 10;
export const PROMPT_MAX_LENGTH = 12_000;
export const PROMPT_OFFICIAL_QUALITY_MARKER = 'CRITÉRIOS GERAIS DE QUALIDADE PARA TODAS AS ETAPAS';
export const PROMPT_COMPLEMENTARY_HEADER = 'ORIENTAÇÃO COMPLEMENTAR DO ADMINISTRADOR:';

export const LESSON_THEME_MIN_LENGTH = 3;
export const LESSON_THEME_MAX_LENGTH = 255;
export const LESSON_REFERENCE_MIN_LENGTH = 3;
export const LESSON_REFERENCE_MAX_LENGTH = 500;
export const LESSON_ACTION_NOTE_MAX_LENGTH = 1000;

import { LessonCategory, LessonStageStatus, LessonStageType, LessonStatus } from './types';

export const AI_LESSONS_ENDPOINT = '/api/v1/lessons';
export const STUDIO_STAGE_ORDER = Object.values(LessonStageType);
export const SPECIAL_STUDIO_STAGE_ORDER: readonly LessonStageType[] = [
  LessonStageType.LESSON,
  LessonStageType.LESSON_VISUALS,
  LessonStageType.VERSE_VISUALS,
];

export function getStudioStageOrder(category?: LessonCategory | null): readonly LessonStageType[] {
  return category === LessonCategory.SPECIAL ? SPECIAL_STUDIO_STAGE_ORDER : STUDIO_STAGE_ORDER;
}

export const LESSON_SPECIAL_CONTEXT_MAX_LENGTH = 2000;
export const EDITABLE_STAGE_STATUSES = [
  LessonStageStatus.DRAFT,
  LessonStageStatus.PRODUCER_APPROVED,
  LessonStageStatus.CHANGES_REQUESTED,
  LessonStageStatus.STALE,
  LessonStageStatus.FAILED,
];
export const PRODUCTION_COMPLETED_STATUSES = [
  LessonStageStatus.PRODUCER_APPROVED,
  LessonStageStatus.IN_REVIEW,
  LessonStageStatus.APPROVED,
];
export const GENERATION_BLOCKED_LESSON_STATUSES = [
  LessonStatus.IN_REVIEW,
  LessonStatus.READY_FOR_PUBLICATION,
  LessonStatus.PUBLISHING,
  LessonStatus.PUBLISHED,
  LessonStatus.ARCHIVED,
];
export const STUDIO_LEAVE_MESSAGE =
  'Existem alterações não salvas. Deseja sair e descartar essas alterações?';
export const LESSON_LIST_PAGE_SIZE = 12;
export const LESSON_SEARCH_DEBOUNCE_MS = 400;
export const LESSON_PAGE_SIZE_OPTIONS = [6, 12, 24, 48];
export const REVIEW_LESSON_STATUSES = [
  LessonStatus.PACKAGE_READY,
  LessonStatus.IN_REVIEW,
  LessonStatus.CHANGES_REQUESTED,
  LessonStatus.READY_FOR_PUBLICATION,
  LessonStatus.PUBLISHING,
  LessonStatus.PUBLISHED,
];
export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  DRAFT: 'Novo pacote',
  IN_PROGRESS: 'Montando pacote',
  PACKAGE_READY: 'Pacote completo',
  IN_REVIEW: 'Em aprovação final',
  CHANGES_REQUESTED: 'Ajustes solicitados',
  READY_FOR_PUBLICATION: 'Aprovação concluída',
  PUBLISHING: 'Publicando',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};
export const PROMPT_STALE_TIME_MS = 30000;
export const PROMPT_COPY_FEEDBACK_MS = 2000;
export const PDF_ERROR_FALLBACK = 'Não foi possível gerar o PDF. Tente novamente.';
export const PDF_NETWORK_ERROR =
  'Falha de conexão ao gerar o PDF. Verifique sua conexão e tente novamente.';
export const PDF_TIMEOUT_ERROR = 'A geração do PDF demorou para responder. Tente novamente.';
