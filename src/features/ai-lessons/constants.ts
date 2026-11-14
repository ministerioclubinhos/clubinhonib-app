import {
  LessonCategory,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  LessonVisualStyle,
  LessonVisualType,
} from './types';

export const AI_LESSON_EVENTS_RECONNECT_DELAY_MS = 2000;
export const AI_LESSON_EVENTS_RECONNECT_MAX_DELAY_MS = 30_000;
export const AI_LESSON_EVENTS_RECONNECT_JITTER_RATIO = 0.25;
/** Falhas seguidas toleradas antes de avisar o usuário sobre a conexão. */
export const AI_LESSON_EVENTS_FAILURES_BEFORE_NOTICE = 3;
export const AI_LESSON_EVENTS_STALE_TIMEOUT_MS = 10000;
/** Até o primeiro byte: cobre refresh de token e a abertura da conexão. */
export const AI_LESSON_EVENTS_CONNECT_TIMEOUT_MS = 30_000;
/** O servidor encerra em ~178 s; o cliente só gira sozinho se isso não acontecer. */
export const AI_LESSON_EVENTS_MAX_DURATION_MS = 240_000;
export const AI_LESSON_EVENTS_MAX_BYTES = 2_097_152;
export const AI_LESSON_DETAIL_VIEW = 'compact';
export const STUDIO_STORAGE_PREFIX = 'clubinho:studio:v1';
export const STUDIO_STORAGE_MAX_CHARS = 1_500_000;
export const STUDIO_STORAGE_DEBOUNCE_MS = 400;
export const STUDIO_ELAPSED_TICK_MS = 1000;
export const STUDIO_STAGE_QUERY_PARAM = 'stage';

export const STORY_VISUAL_SETUP_STEPS = ['Quantidade', 'Tipo e desenho', 'Formato'] as const;
export const DEFAULT_LESSON_VISUAL_STYLE = LessonVisualStyle.CUTE_CARTOON;
/** Versions saved before styles existed were drawn in this style. */
export const LEGACY_LESSON_VISUAL_STYLE = LessonVisualStyle.ILLUSTRATED;
/** Formats a weekly lesson can choose; the cutout kit stays the default. */
export const REGULAR_STORY_VISUAL_TYPES: readonly LessonVisualType[] = [
  LessonVisualType.CUTOUT_KIT,
  LessonVisualType.STORY_SEQUENCE,
];
export const LESSON_VISUAL_STYLE_OPTIONS: readonly {
  value: LessonVisualStyle;
  title: string;
  description: string;
}[] = [
  {
    value: LessonVisualStyle.CUTE_CARTOON,
    title: 'Infantil fofo (padrão)',
    description:
      'Cartoon para crianças: cabeça e olhos grandes, bochechas rosadas, cores vivas e contorno escuro grosso.',
  },
  {
    value: LessonVisualStyle.CLASSIC_CARTOON,
    title: 'Desenho bíblico clássico',
    description:
      'Contorno preto forte, cores chapadas e sombra simples, como os kits feitos à mão do acervo.',
  },
  {
    value: LessonVisualStyle.ILLUSTRATED,
    title: 'Livro ilustrado',
    description: 'Pintura suave, cores claras e luminosas. Ainda é desenho, nunca realista.',
  },
];
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

export const PROMPT_MIN_LENGTH = 10;
export const PROMPT_MAX_LENGTH = 12_000;
export const PROMPT_OFFICIAL_QUALITY_MARKER = 'CRITÉRIOS GERAIS DE QUALIDADE PARA TODAS AS ETAPAS';
/** Mirror `composeEffectivePrompt` in the API (admin-lesson-prompt.service.ts). */
export const PROMPT_COMPLEMENTARY_HEADER = 'ORIENTAÇÃO COMPLEMENTAR DO ADMINISTRADOR';
export const PROMPT_COMPLEMENTARY_FOOTER =
  'A orientação complementar não substitui estrutura, fidelidade bíblica, segurança infantil, formato de impressão ou critérios editoriais obrigatórios acima.';

export const LESSON_THEME_MIN_LENGTH = 3;
export const LESSON_THEME_MAX_LENGTH = 255;
export const LESSON_REFERENCE_MIN_LENGTH = 3;
export const LESSON_REFERENCE_MAX_LENGTH = 500;
export const LESSON_ACTION_NOTE_MAX_LENGTH = 1000;

export const AI_LESSONS_ENDPOINT = '/api/v1/lessons';
/** Id of the single image that compiles the whole fun game (item 3). */
export const LESSON_GAME_SUMMARY_ASSET_ID = 'compilado-01';
/** Production order of the eight items; explicit so it never depends on enum declaration order. */
export const STUDIO_STAGE_ORDER: readonly LessonStageType[] = [
  LessonStageType.LESSON,
  LessonStageType.LESSON_VISUALS,
  LessonStageType.STANDARD_GAME,
  LessonStageType.VERSE_VISUALS,
  LessonStageType.VERSE_FIXATION,
  LessonStageType.MEDITATION_YOUNGER,
  LessonStageType.MEDITATION_OLDER,
  LessonStageType.MANUAL_WORK,
];
export const SPECIAL_STUDIO_STAGE_ORDER: readonly LessonStageType[] = [
  LessonStageType.LESSON,
  LessonStageType.LESSON_VISUALS,
  LessonStageType.VERSE_VISUALS,
];

export function getStudioStageOrder(category?: LessonCategory | null): readonly LessonStageType[] {
  return category === LessonCategory.SPECIAL ? SPECIAL_STUDIO_STAGE_ORDER : STUDIO_STAGE_ORDER;
}

export const LESSON_SPECIAL_CONTEXT_MAX_LENGTH = 2000;
/** Purpose / central message the admin wants the lesson to teach (API limit). */
export const LESSON_EDITORIAL_PURPOSE_MIN_LENGTH = 10;
export const LESSON_EDITORIAL_PURPOSE_MAX_LENGTH = 1000;
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
export const PROMPT_STALE_TIME_MS = 30000;
export const PROMPT_COPY_FEEDBACK_MS = 2000;
export const PDF_ERROR_FALLBACK = 'Não foi possível gerar o PDF. Tente novamente.';
export const PDF_NETWORK_ERROR =
  'Falha de conexão ao gerar o PDF. Verifique sua conexão e tente novamente.';
export const PDF_TIMEOUT_ERROR = 'A geração do PDF demorou para responder. Tente novamente.';
export const EMPTY_STRUCTURED_DATA: Record<string, unknown> = Object.freeze({});
export const EMPTY_TIPTAP_DOCUMENT = Object.freeze({ type: 'doc' as const, content: [] });
export const HTTP_STATUS_CONFLICT = 409;
/** Mirror `ErrorCode` in the API (shared/exceptions/error-codes.enum.ts). */
export const LESSON_ERROR_CODES = {
  stageLockConflict: 'LESSON_9303',
  staleUpstream: 'LESSON_9308',
  stagePdfUnavailable: 'LESSON_9314',
} as const;
/** Statuses a approval answers with when the item cannot become a PDF (422) or the converter is busy (503). */
export const STAGE_PDF_FAILURE_HTTP_STATUSES: readonly number[] = [422, 503];
/** Items in any of these statuses mean the package is inside a review cycle. */
export const REVIEW_CYCLE_STAGE_STATUSES: readonly LessonStageStatus[] = [
  LessonStageStatus.IN_REVIEW,
  LessonStageStatus.APPROVED,
  LessonStageStatus.CHANGES_REQUESTED,
];
/** Items the reviewer holds: they must be returned or reopened before a new generation. */
export const REGENERATION_LOCKED_STAGE_STATUSES: readonly LessonStageStatus[] = [
  LessonStageStatus.IN_REVIEW,
  LessonStageStatus.APPROVED,
];
/** Lesson statuses in which the consolidated PDF of the approved package can be downloaded. */
export const PACKAGE_DOWNLOAD_LESSON_STATUSES: readonly LessonStatus[] = [
  LessonStatus.READY_FOR_PUBLICATION,
  LessonStatus.PUBLISHED,
  LessonStatus.ARCHIVED,
];
export const PUBLICATION_KIND_LABELS = {
  special: 'Material Especial',
  weekly: 'material semanal',
} as const;
export const PUBLICATION_PREVIEW_STALE_TIME_MS = 15_000;
/** Stage statuses whose content was already signed off by someone. */
export const SIGNED_OFF_STAGE_STATUSES = [
  LessonStageStatus.PRODUCER_APPROVED,
  LessonStageStatus.IN_REVIEW,
  LessonStageStatus.APPROVED,
];
export const FINAL_REVIEW_LESSON_STATUSES = [
  LessonStatus.IN_REVIEW,
  LessonStatus.READY_FOR_PUBLICATION,
  LessonStatus.PUBLISHING,
  LessonStatus.PUBLISHED,
];
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_DENIED: readonly number[] = [401, 403];
