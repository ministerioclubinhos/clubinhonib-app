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

/** Atraso aplicado à busca por título na listagem. */
export const VIDEO_PAGE_SEARCH_DEBOUNCE_MS = 300;

/** Rotas administrativas das telas de galeria de vídeos. */
export const VIDEO_PAGE_ROUTES = {
  MANAGE: '/adm/paginas-videos',
} as const;
