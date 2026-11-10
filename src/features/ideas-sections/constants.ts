import type { IdeaShareFormFields, IdeasSectionDraft } from './types';
/** Caminho base dos endpoints de ideias compartilhadas. */
export const IDEAS_SECTIONS_ENDPOINT = '/ideas-sections';

/** Campo do multipart que carrega o JSON da ideia. */
export const IDEAS_SECTION_PAYLOAD_FIELD = 'sectionData';

/** Paginação da fila. */
export const IDEAS_SECTIONS_DEFAULT_LIMIT = 12;
export const IDEAS_SECTIONS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: as mais recentes primeiro. */
export const IDEAS_SECTIONS_DEFAULT_SORT = 'createdAt';
export const IDEAS_SECTIONS_DEFAULT_ORDER = 'DESC';

/** Rótulo de cada tipo de mídia. */
export const MEDIA_TYPE_LABELS: Record<string, string> = {
  image: 'Imagem',
  video: 'Vídeo',
  audio: 'Áudio',
  document: 'Documento',
};

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = '—';

/** Rotas administrativas das telas de ideia compartilhada. */
export const IDEAS_SECTION_ROUTES = {
  QUEUE: '/adm/ideias-compartilhadas',
  /** O id vai na URL: sem ele um F5 na revisão perdia a ideia carregada. */
  REVIEW: '/adm/editar-ideias-compartilhadas',
} as const;

/** Caminho da revisão de uma ideia específica. */
export const ideasSectionReviewPath = (id: string): string =>
  `${IDEAS_SECTION_ROUTES.REVIEW}/${id}`;

/** Opções de ordenação da fila, na ordem em que aparecem. */
export const IDEAS_SECTION_SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigas' },
  { value: 'title:ASC', label: 'Título (A–Z)' },
  { value: 'title:DESC', label: 'Título (Z–A)' },
] as const;

/** Título da página de compartilhamento público de ideias na aba do navegador. */
export const IDEAS_SECTION_PAGE_TITLE = 'Compartilhar Ideia Incrível';

export const IDEA_SHARE_MAX_MEDIAS = 20;
export const IDEA_SHARE_MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const IDEA_SHARE_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IDEA_SHARE_MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const IDEA_SHARE_UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;
export const IDEA_SHARE_ACCEPT_BY_KIND = {
  document: '.pdf,.doc,.docx',
  image: '.jpg,.jpeg,.png,.webp,.gif',
  video: '.mp4,.webm',
} as const;
export const IDEA_SHARE_ALLOWED_EXTENSIONS = {
  document: ['pdf', 'doc', 'docx'],
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  video: ['mp4', 'webm'],
} as const;
export const IDEA_SHARE_MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
};
export const IDEA_AI_POLL_MS = 5000;

export const IDEA_SHARE_INITIAL_VALUES: IdeaShareFormFields = {
  title: '',
  description: '',
  materials: [],
};
export const IDEA_REVIEW_EMPTY_DRAFT: IdeasSectionDraft = {
  title: '',
  description: '',
  public: true,
  medias: [],
};
