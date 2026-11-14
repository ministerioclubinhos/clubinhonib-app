/** Caminho base dos endpoints de coordenador. */
export const COORDINATORS_ENDPOINT = "/coordinator-profiles";

/** Paginação da listagem. */
export const COORDINATORS_DEFAULT_LIMIT = 12;
export const COORDINATORS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: quem mudou por último aparece primeiro. */
export const COORDINATORS_DEFAULT_SORT = "updatedAt" as const;
export const COORDINATORS_DEFAULT_ORDER = "desc" as const;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";

/** Valor usado quando um filtro de seleção está sem escolha. */
export const ANY_FILTER = "";
