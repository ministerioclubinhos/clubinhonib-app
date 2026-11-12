import { LessonStatus } from './types';

/** Parâmetros da URL que guardam os filtros da lista de produção. */
export const PRODUCTION_LIST_PARAMS = {
  status: 'status',
  category: 'tipo',
  sort: 'ordem',
  search: 'busca',
  page: 'pagina',
} as const;

export const PRODUCTION_LIST_DEFAULT_SORT = 'updatedAt:DESC';

/**
 * O que a lista mostra sem filtro de status.
 *
 * Arquivadas ficam de fora: saíram do trabalho do dia a dia e só aparecem
 * quando alguém escolhe o status "Arquivado".
 */
export const PRODUCTION_LIST_DEFAULT_STATUSES: readonly LessonStatus[] = Object.values(
  LessonStatus
).filter((status) => status !== LessonStatus.ARCHIVED);

export const PRODUCTION_LIST_TEXTS = {
  title: 'Produção de lições',
  failedBadge: 'Geração falhou',
  generatingBadge: 'Gerando…',
  openFinished: 'Ver lição',
  pdfTooltip: 'Baixar o PDF do pacote',
  deleteTooltip: 'Excluir lição',
  deleteBlockedTooltip: 'Aguarde a geração terminar para excluir',
  emptyTitle: 'Nenhuma lição encontrada',
  emptySubtitle: 'Ajuste a busca ou os filtros, ou crie uma nova lição.',
} as const;
