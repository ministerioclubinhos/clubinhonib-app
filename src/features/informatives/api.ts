import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';

import { INFORMATIVES_ENDPOINT } from './constants';
import type {
  InformativeQuery,
  InformativeRequest,
  InformativeResponse,
  PaginatedInformatives,
} from './types';

/**
 * Lista os informativos.
 *
 * Busca, filtro e ordenação são resolvidos pela API: antes a listagem inteira
 * era baixada só para ser peneirada no navegador.
 */
export async function apiListInformatives(
  query: InformativeQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedInformatives> {
  const { data } = await api.get<PaginatedInformatives>(
    INFORMATIVES_ENDPOINT,
    { ...config, params: query },
  );
  return data;
}

/** Carrega um informativo pelo id. */
export async function apiGetInformative(
  id: string,
): Promise<InformativeResponse> {
  const { data } = await api.get<InformativeResponse>(
    `${INFORMATIVES_ENDPOINT}/${id}`,
  );
  return data;
}

/** Cria um informativo. */
export async function apiCreateInformative(
  payload: InformativeRequest,
): Promise<InformativeResponse> {
  const { data } = await api.post<InformativeResponse>(
    INFORMATIVES_ENDPOINT,
    payload,
  );
  return data;
}

/** Atualiza um informativo. */
export async function apiUpdateInformative(
  id: string,
  payload: InformativeRequest,
): Promise<InformativeResponse> {
  const { data } = await api.patch<InformativeResponse>(
    `${INFORMATIVES_ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

/** Exclui o informativo e sua rota. */
export async function apiDeleteInformative(id: string): Promise<void> {
  await api.delete(`${INFORMATIVES_ENDPOINT}/${id}`);
}
