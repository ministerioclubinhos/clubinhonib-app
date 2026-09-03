import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';
import {
  IDEAS_PAGES_ENDPOINT,
  IDEAS_PAGES_SELECTOR_LIMIT,
  MULTIPART_HEADERS,
} from './constants';
import {
  IdeasPageQuery,
  IdeasPageResponse,
  IdeasPageSummary,
  PaginatedIdeasPages,
} from './types';

/**
 * Lista as páginas de ideias, em resumo.
 *
 * Busca, filtro e ordenação são resolvidos pela API: antes a listagem inteira
 * — com todas as seções e mídias — era baixada só para ser peneirada aqui.
 */
export async function apiListIdeasPages(
  query: IdeasPageQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedIdeasPages> {
  const { data } = await api.get<PaginatedIdeasPages>(IDEAS_PAGES_ENDPOINT, {
    ...config,
    params: query,
  });
  return data;
}

/**
 * Páginas oferecidas no seletor de destino de uma ideia.
 *
 * O seletor precisa apenas de id e título; uma página só de resumos cobre o
 * acervo inteiro sem carregar seção nenhuma.
 */
export async function apiListIdeasPageOptions(): Promise<IdeasPageSummary[]> {
  const page = await apiListIdeasPages({
    limit: IDEAS_PAGES_SELECTOR_LIMIT,
    sort: 'title',
    order: 'ASC',
  });
  return page.data;
}

/** Carrega uma página de ideias pelo id, com suas seções. */
export async function apiGetIdeasPage(
  id: string,
  config?: AxiosRequestConfig,
): Promise<IdeasPageResponse> {
  const { data } = await api.get<IdeasPageResponse>(
    `${IDEAS_PAGES_ENDPOINT}/${id}`,
    config,
  );
  return data;
}

/** Cria uma página de ideias a partir do corpo multipart. */
export async function apiCreateIdeasPage(
  formData: FormData,
): Promise<IdeasPageResponse> {
  const { data } = await api.post<IdeasPageResponse>(
    IDEAS_PAGES_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Atualiza uma página de ideias a partir do corpo multipart. */
export async function apiUpdateIdeasPage(
  id: string,
  formData: FormData,
): Promise<IdeasPageResponse> {
  const { data } = await api.patch<IdeasPageResponse>(
    `${IDEAS_PAGES_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Exclui a página, suas seções, mídias e rota. */
export async function apiDeleteIdeasPage(id: string): Promise<void> {
  await api.delete(`${IDEAS_PAGES_ENDPOINT}/${id}`);
}
