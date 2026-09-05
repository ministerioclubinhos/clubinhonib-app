/** Verde da marca, usado nos destaques da área do professor. */
export const BRAND_GREEN = "#81d742";

/**
 * Limites da semana ISO.
 *
 * Um ano tem 52 ou 53 semanas ISO; o teto é 53 para não recusar a semana extra
 * dos anos que a têm.
 */
export const MIN_ISO_WEEK = 1;
export const MAX_ISO_WEEK = 53;

/** Página e tamanho padrão da listagem de pagelas da criança. */
export const PAGELAS_DEFAULT_PAGE = 1;
export const PAGELAS_DEFAULT_LIMIT = 10;

/** Rótulos das situações de uma pagela na semana. */
export const PAGELA_STATUS_LABELS = {
  complete: "Completa",
  partial: "Parcial",
  absent: "Ausente",
} as const;
