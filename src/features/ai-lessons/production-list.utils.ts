import { getStudioStageOrder } from './constants';
import {
  PRODUCTION_LIST_DEFAULT_SORT,
  PRODUCTION_LIST_DEFAULT_STATUSES,
  PRODUCTION_LIST_PARAMS,
} from './production-list.constants';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStatus,
  StudioHubAction,
  type Lesson,
  type StudioHubQueueItem,
} from './types';
import { STUDIO_HUB_ROUTES } from './hub.constants';
import { buildHubQueue } from './hub.utils';
import { PRODUCTION_LIST_TEXTS } from './production-list.constants';
import { formatLessonBadgeLabel, parseLessonCategory, parseLessonStatus } from './utils';

/**
 * Regras puras da lista de produção de lições.
 */

/**
 * O PDF do pacote pode ser baixado?
 *
 * A API só exporta quando **todas** as etapas estão aprovadas; oferecer o
 * botão antes disso levava a um erro em quase toda lição da lista.
 */
export function canExportLessonPdf(lesson: Pick<Lesson, 'stages' | 'category'>): boolean {
  const expected = getStudioStageOrder(lesson.category).length;
  return (
    lesson.stages.length === expected &&
    lesson.stages.every((stage) => stage.status === LessonStageStatus.APPROVED)
  );
}

/** Há uma geração por IA em andamento nesta lição? */
export function isLessonGenerating(lesson: Pick<Lesson, 'stages'>): boolean {
  return lesson.stages.some((stage) => stage.status === LessonStageStatus.GENERATING);
}

/** Alguma etapa parou em falha de geração? */
export function hasFailedStage(lesson: Pick<Lesson, 'stages'>): boolean {
  return lesson.stages.some((stage) => stage.status === LessonStageStatus.FAILED);
}

/** Status enviados à API: o escolhido, ou todos menos "Arquivado". */
export function productionListStatuses(status: LessonStatus | ''): LessonStatus[] {
  return status ? [status] : [...PRODUCTION_LIST_DEFAULT_STATUSES];
}

export interface ProductionListState {
  status: LessonStatus | '';
  category: LessonCategory | '';
  sort: string;
  search: string;
  page: number;
}

/** Filtros lidos da URL; o que não é válido volta ao padrão. */
export function readProductionListState(params: URLSearchParams): ProductionListState {
  return {
    status: parseLessonStatus(params.get(PRODUCTION_LIST_PARAMS.status) ?? ''),
    category: parseLessonCategory(params.get(PRODUCTION_LIST_PARAMS.category) ?? ''),
    sort: params.get(PRODUCTION_LIST_PARAMS.sort) || PRODUCTION_LIST_DEFAULT_SORT,
    search: params.get(PRODUCTION_LIST_PARAMS.search) ?? '',
    page: Math.max(1, Number(params.get(PRODUCTION_LIST_PARAMS.page)) || 1),
  };
}

/**
 * Filtros gravados na URL.
 *
 * Só entra o que difere do padrão, para o endereço limpo continuar sendo a
 * lista sem filtro. É a URL que devolve a lista como estava ao voltar de uma
 * lição.
 */
export function writeProductionListState(
  current: URLSearchParams,
  state: ProductionListState
): URLSearchParams {
  const next = new URLSearchParams(current);
  const set = (key: string, value: string, fallback = '') => {
    if (value && value !== fallback) next.set(key, value);
    else next.delete(key);
  };
  set(PRODUCTION_LIST_PARAMS.status, state.status);
  set(PRODUCTION_LIST_PARAMS.category, state.category);
  set(PRODUCTION_LIST_PARAMS.sort, state.sort, PRODUCTION_LIST_DEFAULT_SORT);
  set(PRODUCTION_LIST_PARAMS.search, state.search.trim());
  set(PRODUCTION_LIST_PARAMS.page, state.page > 1 ? String(state.page) : '');
  return next;
}

/**
 * Aviso de semana repetida ao criar uma lição, ou `null` quando não há.
 *
 * Só conta material do mesmo tipo e que ainda vale (arquivada não conta): duas
 * lições na mesma semana acabam disputando o mesmo material semanal.
 */
export function duplicateWeekWarning(
  weekNumber: number | '',
  category: LessonCategory,
  lessons: readonly Pick<Lesson, 'theme' | 'weekNumber' | 'category' | 'status'>[] | undefined
): string | null {
  if (weekNumber === '') return null;
  const same = (lessons ?? []).filter(
    (lesson) =>
      lesson.weekNumber === weekNumber &&
      (lesson.category ?? LessonCategory.REGULAR) === category &&
      lesson.status !== LessonStatus.ARCHIVED
  );
  if (same.length === 0) return null;

  const [first] = same;
  const others = same.length > 1 ? ` e mais ${same.length - 1}` : '';
  return `Já existe lição para a ${formatLessonBadgeLabel(first).toLowerCase()}: “${first.theme}”${others}. Você pode criar outra mesmo assim.`;
}

/**
 * As lições da página, cada uma com o próximo passo e as etapas.
 *
 * Reaproveita a conta do painel do Estúdio, com duas diferenças: a ordem é a
 * que a API devolveu (a do filtro escolhido, não a de urgência), e uma lição
 * que já saiu do fluxo — publicada ou arquivada — só pode ser aberta.
 */
export function productionCardItems(lessons: readonly Lesson[]): StudioHubQueueItem[] {
  const byId = new Map(buildHubQueue(lessons).map((item) => [item.lesson.id, item]));
  return lessons.flatMap((lesson) => {
    const item = byId.get(lesson.id);
    if (!item) return [];
    const finished = [LessonStatus.PUBLISHED, LessonStatus.ARCHIVED].includes(lesson.status);
    return finished
      ? [
          {
            ...item,
            action: StudioHubAction.WAIT,
            actionLabel: PRODUCTION_LIST_TEXTS.openFinished,
            href: `${STUDIO_HUB_ROUTES.production}/${lesson.id}`,
          },
        ]
      : [item];
  });
}
