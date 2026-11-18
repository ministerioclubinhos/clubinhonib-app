import api from '@/config/axiosConfig';

import { CLUB_WEEKLY_SUMMARY_ENDPOINT } from './constants';
import type {
  ClubWeeklySummaryQuery,
  ClubWeeklySummaryResponse,
} from './types';

/**
 * O resumo semanal dos clubinhos que a sessão enxerga.
 *
 * O recorte é do back: um coordenador recebe os clubinhos dele, e nenhum id
 * enviado daqui amplia isso.
 */
export async function apiGetClubWeeklySummary(
  query: ClubWeeklySummaryQuery,
  signal?: AbortSignal,
): Promise<ClubWeeklySummaryResponse> {
  const { data } = await api.get<ClubWeeklySummaryResponse>(
    CLUB_WEEKLY_SUMMARY_ENDPOINT,
    { params: query, signal },
  );
  return data;
}
