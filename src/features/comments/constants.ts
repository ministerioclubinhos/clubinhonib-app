/** Caminho base dos endpoints de comentário. */
export const COMMENTS_ENDPOINT = "/comments";

/** Paginação da listagem. */
export const COMMENTS_DEFAULT_LIMIT = 12;
export const COMMENTS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: os mais recentes primeiro. */
export const COMMENTS_DEFAULT_SORT = "createdAt";
export const COMMENTS_DEFAULT_ORDER = "DESC";

/** Limites de tamanho, iguais aos das colunas no banco. */
export const COMMENT_NAME_MAX_LENGTH = 100;
export const COMMENT_CLUBINHO_MAX_LENGTH = 100;
export const COMMENT_NEIGHBORHOOD_MAX_LENGTH = 100;
export const COMMENT_TEXT_MAX_LENGTH = 2000;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";
