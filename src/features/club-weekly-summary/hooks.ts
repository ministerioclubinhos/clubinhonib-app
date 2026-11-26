import { useQuery } from '@tanstack/react-query';

import {
  CLUB_WEEKLY_SUMMARY_QUERY_KEY,
  CLUB_WEEKLY_SUMMARY_STALE_TIME_MS,
} from './constants';
import { apiGetClubWeeklySummary } from './api';
import type {
  ClubWeeklySummaryQuery,
  ClubWeeklySummaryResponse,
} from './types';

/**
 * O resumo semanal, com a consulta inteira na chave de cache.
 *
 * Ano e clubinho mudam o resultado, então mudam a chave: sem isso, trocar de
 * ano mostraria o quadro do ano anterior até a resposta nova chegar.
 */
export function useClubWeeklySummary(query: ClubWeeklySummaryQuery) {
  return useQuery<ClubWeeklySummaryResponse>({
    queryKey: [
      CLUB_WEEKLY_SUMMARY_QUERY_KEY,
      query.year ?? null,
      query.clubId ?? null,
    ],
    queryFn: ({ signal }) => apiGetClubWeeklySummary(query, signal),
    staleTime: CLUB_WEEKLY_SUMMARY_STALE_TIME_MS,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
