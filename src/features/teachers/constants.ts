/** Caminho base dos endpoints de professor. */
export const TEACHERS_ENDPOINT = "/teacher-profiles";

/** Paginação da listagem. */
export const TEACHERS_DEFAULT_LIMIT = 12;
export const TEACHERS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: quem mudou por último aparece primeiro. */
export const TEACHERS_DEFAULT_SORT = "updatedAt" as const;
export const TEACHERS_DEFAULT_ORDER = "desc" as const;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";

/** Valor usado quando um filtro de seleção está sem escolha. */
export const ANY_FILTER = "";
