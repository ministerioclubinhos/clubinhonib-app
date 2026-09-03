import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';
import { MEDITATIONS_ENDPOINT, MULTIPART_HEADERS } from './constants';
import {
  MeditationQuery,
  MeditationResponse,
  PaginatedMeditations,
} from './types';

/**
 * Lista as meditações.
 *
 * Busca, período e ordenação são resolvidos pela API: antes a listagem inteira
 * era baixada só para ser peneirada no navegador.
 */
export async function listMeditations(
  query: MeditationQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedMeditations> {
  const { data } = await api.get<PaginatedMeditations>(MEDITATIONS_ENDPOINT, {
    ...config,
    params: query,
  });
  return data;
}

/** Carrega uma meditação pelo id. */
export async function getMeditation(
  id: string,
  config?: AxiosRequestConfig,
): Promise<MeditationResponse> {
  const { data } = await api.get<MeditationResponse>(
    `${MEDITATIONS_ENDPOINT}/${id}`,
    config,
  );
  return data;
}

/** Meditação que cobre a data de hoje, quando existir. */
export async function getThisWeekMeditation(): Promise<MeditationResponse | null> {
  const { data } = await api.get<MeditationResponse | null>(
    `${MEDITATIONS_ENDPOINT}/this-week`,
  );
  return data;
}

/** Exclui uma meditação, sua mídia e sua rota. */
export async function deleteMeditation(id: string): Promise<void> {
  await api.delete(`${MEDITATIONS_ENDPOINT}/${id}`);
}

/** Cria uma meditação a partir do corpo multipart. */
export async function createMeditation(
  formData: FormData,
): Promise<MeditationResponse> {
  const { data } = await api.post<MeditationResponse>(
    MEDITATIONS_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Atualiza uma meditação a partir do corpo multipart. */
export async function updateMeditation(
  id: string,
  formData: FormData,
): Promise<MeditationResponse> {
  const { data } = await api.patch<MeditationResponse>(
    `${MEDITATIONS_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}
