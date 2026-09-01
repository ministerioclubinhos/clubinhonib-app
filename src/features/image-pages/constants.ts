/** Caminho base dos endpoints da galeria de fotos. */
export const IMAGE_PAGES_ENDPOINT = '/image-pages';

/** Campo multipart que carrega o JSON das requisições. */
export const IMAGE_PAGE_PAYLOAD_FIELD = 'imageData';

/**
 * O cliente Axios usa `application/json` por padrão, o que faria o Axios
 * serializar o FormData como JSON. Requisições multipart declaram o tipo; o
 * navegador acrescenta o boundary.
 */
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

/** Atraso aplicado à busca por título na listagem. */
export const IMAGE_PAGE_SEARCH_DEBOUNCE_MS = 300;

/** Quantidade de seções por página na visualização pública. */
export const IMAGE_SECTIONS_PAGE_SIZE = 2;

/** Rotas administrativas das telas de galeria de fotos. */
export const IMAGE_PAGE_ROUTES = {
  MANAGE: '/adm/paginas-fotos',
} as const;
