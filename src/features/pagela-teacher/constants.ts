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

/** Título da página de seleção de crianças na aba do navegador. */
export const CHILDREN_BROWSER_PAGE_TITLE = "Lançar Pagela • Selecionar Criança";

/** Tamanho máximo da observação da pagela, igual ao da coluna na API. */
export const PAGELA_NOTES_MAX_LENGTH = 500;

/** Textos da regra do período letivo no formulário de pagela. */
export const PAGELA_PERIOD_TEXTS = {
  loading: "Conferindo o período letivo...",
  unavailable:
    "Não foi possível conferir o período letivo. Tente de novo em instantes.",
  closedFallback: "Pagelas só podem ser lançadas dentro do período letivo.",
  closedTitle: "Lançamento de pagelas fechado",
  weekHelper: "Semana letiva — só as que já aconteceram",
  saveError: "Não foi possível salvar a pagela.",
  lockedWeek: "Semana de outro período: não pode ser trocada",
} as const;

/** Nomes dos parâmetros da URL que guardam busca, filtros e página da lista. */
export const CHILDREN_BROWSER_PARAMS = {
  search: "busca",
  active: "ativas",
  accepted: "aceitaram",
  page: "pagina",
} as const;

/** Tamanho máximo da observação da decisão, igual ao da coluna na API. */
export const DECISION_NOTES_MAX_LENGTH = 500;

/** Rótulos das decisões no histórico da criança. */
export const DECISION_LABELS = {
  ACCEPTED: "Aceitou Jesus",
  RECONCILED: "Reconciliou-se com Jesus",
  UNSPECIFIED: "Decisão sem tipo (registro antigo)",
} as const;

/** Textos do modal de decisão. */
export const DECISION_TEXTS = {
  acceptTitle: "A criança fez a decisão de aceitar Jesus?",
  reconcileTitle: "A criança quer se reconciliar com Jesus?",
  inactive:
    "Esta criança está desativada. Reative-a para registrar uma decisão.",
  history: "Decisões já registradas",
  saveError: "Não foi possível salvar a decisão.",
  deleteError: "Não foi possível excluir a decisão.",
  deleteConfirm: "Excluir este registro?",
} as const;

/** Aviso da tela de pagelas quando a criança está desativada. */
export const INACTIVE_CHILD_PAGELA_TEXT =
  "Esta criança está desativada. Reative-a na lista de crianças para lançar ou editar pagelas.";
