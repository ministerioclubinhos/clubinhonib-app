import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';
import { MULTIPART_HEADERS, VIDEO_PAGES_ENDPOINT } from './constants';
import {
  PaginatedVideoPages,
  VideoPageQuery,
  VideoPageResponse,
} from './types';

/**
 * Lista as galerias de vídeo, em resumo.
 *
 * Busca, filtro e ordenação são resolvidos pela API: antes a listagem inteira
 * — com todos os vídeos de cada página — era baixada só para ser peneirada
 * aqui.
 */
export async function apiListVideoPages(
  query: VideoPageQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedVideoPages> {
  const { data } = await api.get<PaginatedVideoPages>(VIDEO_PAGES_ENDPOINT, {
    ...config,
    params: query,
  });
  return data;
}

/** Carrega uma galeria de vídeos pelo id, com seus vídeos. */
export async function apiGetVideoPage(
  id: string,
  config?: AxiosRequestConfig,
): Promise<VideoPageResponse> {
  const { data } = await api.get<VideoPageResponse>(
    `${VIDEO_PAGES_ENDPOINT}/${id}`,
    config,
  );
  return data;
}

/** Cria uma galeria de vídeos a partir do corpo multipart. */
export async function apiCreateVideoPage(
  formData: FormData,
): Promise<VideoPageResponse> {
  const { data } = await api.post<VideoPageResponse>(
    VIDEO_PAGES_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Atualiza uma galeria de vídeos a partir do corpo multipart. */
export async function apiUpdateVideoPage(
  id: string,
  formData: FormData,
): Promise<VideoPageResponse> {
  const { data } = await api.patch<VideoPageResponse>(
    `${VIDEO_PAGES_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Exclui a galeria, seus vídeos e sua rota. */
export async function apiDeleteVideoPage(id: string): Promise<void> {
  await api.delete(`${VIDEO_PAGES_ENDPOINT}/${id}`);
}
