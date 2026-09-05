import type { ClubFormValues, ClubSort, ClubSortField, Weekday } from "./types";

/** Dias disponíveis, na ordem em que aparecem no seletor. */
export const WEEKDAY_OPTIONS: ReadonlyArray<{ value: Weekday; label: string }> = [
  { value: "monday", label: "Segunda" },
  { value: "tuesday", label: "Terça" },
  { value: "wednesday", label: "Quarta" },
  { value: "thursday", label: "Quinta" },
  { value: "friday", label: "Sexta" },
  { value: "saturday", label: "Sábado" },
];

/** Rótulo por dia, para exibição. */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
};

/** Dia sugerido ao criar um clubinho. */
export const DEFAULT_WEEKDAY: Weekday = "saturday";

/** Campos de ordenação aceitos pela API. */
export const CLUB_SORT_FIELDS: readonly ClubSortField[] = [
  "number",
  "weekday",
  "time",
  "createdAt",
  "updatedAt",
  "city",
  "state",
];

/** Rótulo de cada campo de ordenação, para o seletor do celular. */
export const CLUB_SORT_OPTIONS: ReadonlyArray<{
  id: ClubSortField;
  label: string;
}> = [
  { id: "number", label: "Número" },
  { id: "weekday", label: "Dia da semana" },
  { id: "time", label: "Horário" },
  { id: "city", label: "Cidade" },
  { id: "state", label: "Estado" },
  { id: "updatedAt", label: "Atualizado em" },
  { id: "createdAt", label: "Criado em" },
];

/** Ordenação inicial da listagem, igual ao padrão da API. */
export const DEFAULT_CLUB_SORT: ClubSort = { id: "number", desc: false };

/** Paginação da listagem. */
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 50];

/** Valor do filtro "qualquer situação" nos seletores da barra. */
export const ANY_FILTER = "";

/**
 * Espera antes de buscar enquanto se digita.
 *
 * Sem isso, cada tecla vira uma requisição — caro em rede de celular.
 */
export const SEARCH_DEBOUNCE_MS = 400;

/** Formato aceito no horário do encontro, igual ao validador da API. */
export const CLUB_TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";

/** Formulário zerado, usado ao abrir a criação. */
export const EMPTY_CLUB_FORM: ClubFormValues = {
  number: null,
  weekday: DEFAULT_WEEKDAY,
  time: null,
  isActive: true,
  address: {
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
    postalCode: "",
    complement: "",
  },
  coordinatorProfileId: null,
  teacherProfileIds: [],
};
