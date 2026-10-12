export const AI_LESSON_EVENTS_RECONNECT_DELAY_MS = 2000;
export const AI_LESSON_EVENTS_STALE_TIMEOUT_MS = 10000;

export const STORY_VISUAL_SETUP_STEPS = ['Quantidade', 'Estilo', 'Formato'] as const;
export const STORY_VISUAL_MIN_QUANTITY = 4;
export const STORY_VISUAL_MAX_QUANTITY = 10;

export const AI_LESSON_HUB_RECENT_LIMIT = 3;

import { LessonStageStatus, LessonStageType, LessonStatus } from './types';

export const AI_LESSONS_ENDPOINT = '/api/v1/lessons';
export const STUDIO_STAGE_ORDER = Object.values(LessonStageType);
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
