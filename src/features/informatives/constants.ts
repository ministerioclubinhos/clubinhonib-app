/** Endpoint dos informativos. */
export const INFORMATIVES_ENDPOINT = '/informatives';

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const INFORMATIVES_DEFAULT_LIMIT = 12;
export const INFORMATIVES_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Opções do filtro de visibilidade, na ordem em que aparecem. */
export const INFORMATIVE_VISIBILITY_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Publicados' },
  { value: 'false', label: 'Rascunhos' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const INFORMATIVE_SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigos' },
  { value: 'title:ASC', label: 'Título (A–Z)' },
  { value: 'title:DESC', label: 'Título (Z–A)' },
] as const;
