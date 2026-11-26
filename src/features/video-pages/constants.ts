import type { VideoPageFormErrors } from './types';

/** Caminho base dos endpoints da galeria de vídeos. */
export const VIDEO_PAGES_ENDPOINT = '/video-pages';

/** Campo multipart que carrega o JSON das requisições. */
export const VIDEO_PAGE_PAYLOAD_FIELD = 'videosPageData';

/**
 * O cliente Axios usa `application/json` por padrão, o que faria o Axios
 * serializar o FormData como JSON. Requisições multipart declaram o tipo; o
 * navegador acrescenta o boundary.
 */
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

/** Prefixo do campo multipart de cada vídeo enviado. */
export const VIDEO_FILE_FIELD_PREFIX = 'video';

/** Prefixo do campo multipart da miniatura de cada vídeo. */
export const VIDEO_THUMBNAIL_FIELD_PREFIX = 'video-thumb';

/** Rotas administrativas das telas de galeria de vídeos. */
export const VIDEO_PAGE_ROUTES = {
  MANAGE: '/adm/paginas-videos',
  /** O id vai na URL: sem ele um F5 na edição perdia a página carregada. */
  EDIT: '/adm/editar-pagina-videos',
} as const;

/** Caminho da edição de uma página específica. */
export const videoPageEditPath = (id: string): string => `${VIDEO_PAGE_ROUTES.EDIT}/${id}`;

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const VIDEO_PAGES_DEFAULT_LIMIT = 12;
export const VIDEO_PAGES_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Opções do filtro de visibilidade, na ordem em que aparecem. */
export const VIDEO_PAGE_VISIBILITY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'true', label: 'Publicadas' },
  { value: 'false', label: 'Rascunhos' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const VIDEO_PAGE_SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigas' },
  { value: 'title:ASC', label: 'Título (A–Z)' },
  { value: 'title:DESC', label: 'Título (Z–A)' },
] as const;

/** Limite de caracteres do título da galeria. */
export const VIDEO_TITLE_MAX_LENGTH = 255;

/** A partir disto a busca por vídeo aparece na lista. */
export const VIDEO_SEARCH_THRESHOLD = 6;

/** Subir vídeos para o S3 demora mais que o timeout padrão. */
export const VIDEO_PAGE_SAVE_TIMEOUT_MS = 300_000;

export const VIDEO_PAGE_NO_ERRORS: VideoPageFormErrors = {
  title: false,
  description: false,
};
