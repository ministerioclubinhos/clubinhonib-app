import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from './api';
import { clubControlApi } from '../club-control/api';
import { apiFetchCoordinators } from '../coordinators/api';
import { previousWeek } from './utils/alerts';
import { elapsedRange, percentChange, previousRange } from './utils/comparison';
import type { PeriodShortcut } from './types';
import {
  toAcceptedChristsQuery,
  toChildrenQuery,
  toClubsQuery,
  toPagelasQuery,
  toTeachersQuery,
  type StatisticsQueryBag,
} from './utils/queryPayload';
import {
  STATISTICS_QUERY_KEY,
  STATISTICS_STALE_TIME_MS,
  STATISTICS_LIST_STALE_TIME_MS,
  LIST_FETCH_LIMIT,
} from './constants';

/**
 * As leituras de `/statistics`.
 *
 * Toda consulta passa por um construtor de payload (`utils/queryPayload`), que
 * é o único lugar que decide o que cada endpoint recebe. As telas montam o
 * recorte que quiserem — o que não couber no contrato daquele endpoint não
 * sai daqui, e a validação global do back não tem o que recusar.
 *
 * A chave de cache carrega o payload **já filtrado**, e não o amontoado da
 * tela: dois recortes que produzem a mesma requisição compartilham a resposta
 * em vez de baterem no banco duas vezes.
 */

export const usePagelasStats = (filters?: StatisticsQueryBag) => {
  const params = toPagelasQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'pagelas', params],
    queryFn: async () => {
      const response = await statisticsApi.getPagelas(params);
      return response.data;
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useAcceptedChristsStats = (filters?: StatisticsQueryBag) => {
  const params = toAcceptedChristsQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'acceptedChrists', params],
    queryFn: async () => {
      const response = await statisticsApi.getAcceptedChrists(params);
      return response.data;
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

/** Coordenadores cadastrados, com os clubinhos de cada um. */
export const useCoordinatorsList = () =>
  useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'coordinators'],
    queryFn: () => apiFetchCoordinators({ page: 1, limit: LIST_FETCH_LIMIT }),
    staleTime: STATISTICS_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

export const useOverview = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'overview'],
    queryFn: async () => {
      const response = await statisticsApi.getOverview();
      return response.data;
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useChildren = (filters?: StatisticsQueryBag) => {
  const params = toChildrenQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'children', params],
    queryFn: async () => {
      const response = await statisticsApi.getChildren(params);
      return response.data;
    },
    staleTime: STATISTICS_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useClubs = (filters?: StatisticsQueryBag) => {
  const params = toClubsQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'clubs', params],
    queryFn: async () => {
      const response = await statisticsApi.getClubs(params);
      return response.data;
    },
    staleTime: STATISTICS_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useTeachers = (filters?: StatisticsQueryBag) => {
  const params = toTeachersQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'teachers', params],
    queryFn: async () => {
      const response = await statisticsApi.getTeachers(params);
      return response.data;
    },
    staleTime: STATISTICS_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useWeeklyAttendance = (params: { year: number; week: number; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'weeklyAttendance', params],
    queryFn: async () => {
      const response = await statisticsApi.getWeeklyAttendance(params);
      return response.data;
    },
    enabled: !!params.year && !!params.week,
    staleTime: STATISTICS_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

/**
 * A pagela da semana letiva atual e da anterior, para os avisos.
 *
 * Na segunda-feira a semana atual ainda não tem ninguém "faltando": quem
 * importa é a semana que acabou de fechar. Por isso as duas vêm juntas.
 */
export function useRecentWeeklyAttendance() {
  const overview = useOverview();
  const current = overview.data?.indicators?.currentAcademicWeek ?? null;
  const previous = current ? previousWeek(current.year, current.week) : null;

  const currentQuery = useWeeklyAttendance({ year: current?.year ?? 0, week: current?.week ?? 0, limit: LIST_FETCH_LIMIT });
  const previousQuery = useWeeklyAttendance({ year: previous?.year ?? 0, week: previous?.week ?? 0, limit: LIST_FETCH_LIMIT });

  return { current, previous, currentQuery, previousQuery };
}

/**
 * Quando os agregados do painel foram buscados de fato.
 *
 * Lê o `dataUpdatedAt` das consultas que alimentam o topo da tela — o rodapé
 * antes imprimia a hora do render, que com cache de minutos afirmava uma
 * frescura que o número não tinha. `null` enquanto nada chegou.
 */
export function useStatisticsLastUpdated(): number | null {
  const overview = useOverview();
  const maisRecente = overview.dataUpdatedAt;

  return maisRecente > 0 ? maisRecente : null;
}

/**
 * Os anos letivos que existem de fato, do mais novo para o mais antigo.
 *
 * O seletor de ano do painel montava `[anoAtual, anoAtual-1, anoAtual-2]` —
 * anos de calendário inventados na tela. Todo o domínio (pagela, controle,
 * resumo) é indexado pelo **período letivo cadastrado**: dava para escolher um
 * ano sem período e receber um painel vazio sem explicação, e um período fora
 * daquela janela de três anos ficava inalcançável.
 *
 * Sem período nenhum cadastrado, cai no ano corrente — é o que o seletor
 * precisa mostrar para não ficar vazio.
 */
export function useAcademicYears() {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'academicYears'],
    queryFn: async (): Promise<number[]> => {
      const response = await clubControlApi.getPeriods({ page: 1, limit: 100 });
      const years = (response.data.items ?? [])
        .map((period) => period.year)
        .filter((year): year is number => Number.isFinite(year));

      const unicos = [...new Set(years)].sort((a, b) => b - a);
      return unicos.length > 0 ? unicos : [new Date().getFullYear()];
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
}

/**
 * Presenças do recorte escolhido contra o recorte anterior de mesmo tamanho, em %.
 *
 * O resumo geral do back só compara mês com mês. Aqui a comparação segue o
 * período da tela (semana, mês, 30 dias, ano). `rate` fica `undefined` sem
 * base de comparação (nada no recorte anterior).
 */
export function usePeriodGrowth(period: PeriodShortcut): { rate: number | undefined } {
  const current = elapsedRange(period);
  const previous = previousRange(period);

  const usePresences = (range: { startDate: string; endDate: string } | undefined) =>
    useQuery({
      queryKey: [STATISTICS_QUERY_KEY, 'periodPresences', range],
      queryFn: async () => {
        const response = await statisticsApi.getPagelas(toPagelasQuery({ ...range, groupBy: 'week' }));
        return (response.data.byWeek ?? []).reduce((sum, row) => sum + row.presentCount, 0);
      },
      enabled: !!range,
      staleTime: STATISTICS_STALE_TIME_MS,
      refetchOnWindowFocus: false,
    });

  const now = usePresences(current);
  const before = usePresences(previous);
  if (now.data === undefined || before.data === undefined) return { rate: undefined };
  return { rate: percentChange(now.data, before.data) };
}
