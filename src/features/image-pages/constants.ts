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

/** Quantidade de seções por página na visualização pública. */
export const IMAGE_SECTIONS_PAGE_SIZE = 2;

/** Rotas administrativas das telas de galeria de fotos. */
export const IMAGE_PAGE_ROUTES = {
  MANAGE: '/adm/paginas-fotos',
  /** O id vai na URL: sem ele um F5 na edição perdia a galeria carregada. */
  EDIT: '/adm/editar-pagina-imagens',
} as const;

/** Caminho da edição de uma galeria específica. */
export const imagePageEditPath = (id: string): string =>
  `${IMAGE_PAGE_ROUTES.EDIT}/${id}`;

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const IMAGE_PAGES_DEFAULT_LIMIT = 12;
export const IMAGE_PAGES_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Opções do filtro de visibilidade, na ordem em que aparecem. */
export const IMAGE_PAGE_VISIBILITY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'true', label: 'Publicadas' },
  { value: 'false', label: 'Rascunhos' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const IMAGE_PAGE_SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigas' },
  { value: 'title:ASC', label: 'Título (A–Z)' },
  { value: 'title:DESC', label: 'Título (Z–A)' },
] as const;
