/** Caminho base dos endpoints de criança. */
export const CHILDREN_ENDPOINT = "/children";

/** Paginação da listagem. */
export const CHILDREN_DEFAULT_LIMIT = 12;
export const CHILDREN_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: em ordem alfabética, como a API também assume. */
export const CHILDREN_DEFAULT_SORT = "name" as const;
export const CHILDREN_DEFAULT_ORDER = "ASC" as const;

/** Sexo da criança. Espelha o enum `Gender` da API. */
export enum Gender {
  MALE = "M",
  FEMALE = "F",
}

/** Rótulo de cada sexo, em um lugar só. */
export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "Menino",
  [Gender.FEMALE]: "Menina",
};

export const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: Gender.MALE, label: GENDER_LABELS[Gender.MALE] },
  { value: Gender.FEMALE, label: GENDER_LABELS[Gender.FEMALE] },
];

/** Tamanho mínimo dos nomes, igual ao validador da API. */
export const CHILD_NAME_MIN_LENGTH = 2;

/** Sigla da unidade federativa. */
export const STATE_LENGTH = 2;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";

/** Valor usado quando um filtro de seleção está sem escolha. */
export const ANY_FILTER = "";
