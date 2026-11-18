/** Endpoint dos documentos. */
export const DOCUMENTS_ENDPOINT = '/documents';

/** Campo multipart que carrega o JSON da requisição. */
export const DOCUMENT_PAYLOAD_FIELD = 'documentData';

/** Campo multipart que carrega o arquivo. */
export const DOCUMENT_FILE_FIELD = 'file';

/** Requisições com arquivo precisam declarar o tipo do corpo. */
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const DOCUMENTS_DEFAULT_LIMIT = 12;
export const DOCUMENTS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Opções do filtro de anexo, na ordem em que aparecem. */
export const DOCUMENT_MEDIA_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Com anexo' },
  { value: 'false', label: 'Sem anexo' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const DOCUMENT_SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigos' },
  { value: 'name:ASC', label: 'Nome (A–Z)' },
  { value: 'name:DESC', label: 'Nome (Z–A)' },
] as const;
