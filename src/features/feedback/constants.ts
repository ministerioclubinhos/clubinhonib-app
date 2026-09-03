/** Caminho base dos endpoints de avaliação do site. */
export const FEEDBACKS_ENDPOINT = '/site-feedbacks';

/** Nota máxima da avaliação. */
export const FEEDBACK_MAX_RATING = 5;

/** Rota pública do formulário. */
export const FEEDBACK_ROUTE = '/avaliar-site';

/** Nota mínima da avaliação. */
export const FEEDBACK_MIN_RATING = 1;

/** Paginação da listagem administrativa. */
export const FEEDBACKS_DEFAULT_LIMIT = 12;
export const FEEDBACKS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: as mais recentes primeiro. */
export const FEEDBACKS_DEFAULT_SORT = 'createdAt';
export const FEEDBACKS_DEFAULT_ORDER = 'DESC';

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = '—';
