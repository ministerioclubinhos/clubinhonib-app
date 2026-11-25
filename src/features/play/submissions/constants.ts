import type { PlaySubmissionStatus } from './types';

export const PLAY_SUBMISSIONS_ENDPOINT = '/play/submissions';
export const PLAY_SUBMISSIONS_ADMIN_ENDPOINT = '/play/admin/submissions';

/** Rotas das telas. */
export const PLAY_SUBMIT_ROUTE = '/area-do-professor/play/enviar';
export const PLAY_SUBMISSIONS_ADMIN_ROUTE = '/adm/play/envios';

/** Campos do multipart (espelham a API). */
export const PLAY_SUBMISSION_PAYLOAD_FIELD = 'submissionData';
export const PLAY_SUBMISSION_VIDEO_FIELD = 'video';
export const PLAY_SUBMISSION_THUMBNAIL_FIELD = 'thumbnail';

export const PLAY_SUBMISSION_TITLE_MAX_LENGTH = 255;
export const PLAY_SUBMISSION_DESCRIPTION_MAX_LENGTH = 2000;
export const PLAY_SUBMISSION_REASON_MAX_LENGTH = 500;
export const PLAY_SUBMISSION_MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** Subir vídeo demora mais que o timeout padrão. */
export const PLAY_SUBMISSION_TIMEOUT_MS = 300_000;

export const PLAY_SUBMISSION_STATUS_LABEL: Record<PlaySubmissionStatus, string> = {
  pending: 'Aguardando aprovação',
  approved: 'Publicado',
  rejected: 'Reprovado',
};

export const PLAY_SUBMISSION_STATUS_COLOR: Record<
  PlaySubmissionStatus,
  'warning' | 'success' | 'error'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export const PLAY_ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordenação',
  teacher: 'Professor',
};
