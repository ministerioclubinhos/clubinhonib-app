import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from './api';
import { clubControlApi } from '../club-control/api';
import type { CurrentWeekInfo } from '../club-control/types';
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

export const usePagelasChartData = (filters?: StatisticsQueryBag) => {
  const params = toPagelasQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'pagelasCharts', params],
    queryFn: async () => {
      const response = await statisticsApi.getPagelasChartData(params);
      return response.data;
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useAcceptedChristsChartData = (filters?: StatisticsQueryBag) => {
  const params = toAcceptedChristsQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'acceptedChristsCharts', params],
    queryFn: async () => {
      const response = await statisticsApi.getAcceptedChristsChartData(params);
      return response.data;
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useInsights = (filters?: StatisticsQueryBag) => {
  const params = toPagelasQuery(filters);

  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'insights', params],
    queryFn: async () => {
      const response = await statisticsApi.getInsights(params);
      return response.data;
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

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

export const useClubAttendance = (
  clubId: string,
  params: { year: number; startDate?: string; endDate?: string; page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'clubAttendance', clubId, params],
    queryFn: async () => {
      const response = await statisticsApi.getClubAttendance(clubId, params);
      return response.data;
    },
    enabled: !!clubId && !!params.year,
    staleTime: STATISTICS_LIST_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
};

export const useCurrentWeek = () => {
  return useQuery<CurrentWeekInfo>({
    queryKey: ['currentWeek'],
    queryFn: async () => {
      const response = await clubControlApi.getCurrentWeek();
      return response.data;
    },
    staleTime: STATISTICS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
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
