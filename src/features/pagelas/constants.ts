import type { PagelaStatus } from "./types";

/** Faixa aceita pela API para semana e ano. */
export const PAGELA_MIN_WEEK = 1;
export const PAGELA_MAX_WEEK = 53;
export const PAGELA_MIN_YEAR = 2000;
export const PAGELA_MAX_YEAR = 9999;

/** Tamanho da observação, igual ao da coluna no banco. */
export const PAGELA_NOTES_MAX_LENGTH = 500;

/** Paginação da lista de pagelas. */
export const PAGELAS_DEFAULT_LIMIT = 9;
export const PAGELAS_LIMIT_STEP = 6;
export const PAGELAS_MIN_LIMIT = 6;
export const PAGELAS_MAX_LIMIT = 48;

/** Paginação das listas de apoio da tela. */
export const CLUBS_PAGE_LIMIT = 6;
export const CHILDREN_PAGE_LIMIT = 12;

/** Espera antes de buscar enquanto se digita. */
export const SEARCH_DEBOUNCE_MS = 350;

/** Rótulo de cada situação da semana. */
export const PAGELA_STATUS_LABELS: Record<PagelaStatus, string> = {
  complete: "Semana completa",
  partial: "Semana parcial",
  absent: "Ausente",
};

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";
