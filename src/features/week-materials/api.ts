import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';
import { MULTIPART_HEADERS, WEEK_MATERIALS_ENDPOINT } from './constants';
import {
  PaginatedWeekMaterials,
  WeekMaterialQuery,
  WeekMaterialResponse,
} from './types';

/**
 * Lista as páginas de materiais semanais, em resumo.
 *
 * Busca, filtro e ordenação são resolvidos pela API: antes a listagem inteira
 * — com todas as mídias de cada página — era baixada só para ser peneirada e
 * ordenada aqui.
 */
export async function listWeekMaterials(
  query: WeekMaterialQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedWeekMaterials> {
  const { data } = await api.get<PaginatedWeekMaterials>(
    WEEK_MATERIALS_ENDPOINT,
    { ...config, params: query },
  );
  return data;
}

/** Loads a single week material page with its media. */
export async function getWeekMaterial(
  id: string,
  config?: AxiosRequestConfig,
): Promise<WeekMaterialResponse> {
  const { data } = await api.get<WeekMaterialResponse>(
    `${WEEK_MATERIALS_ENDPOINT}/${id}`,
    config,
  );
  return data;
}

/** Loads the page published as the current week material, if any. */
export async function getCurrentWeekMaterial(): Promise<WeekMaterialResponse | null> {
  const { data } = await api.get<WeekMaterialResponse | null>(
    `${WEEK_MATERIALS_ENDPOINT}/current-week`,
  );
  return data;
}

/** Creates a week material page from a multipart body. */
export async function createWeekMaterial(
  formData: FormData,
): Promise<WeekMaterialResponse> {
  const { data } = await api.post<WeekMaterialResponse>(
    WEEK_MATERIALS_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Updates a week material page from a multipart body. */
export async function updateWeekMaterial(
  id: string,
  formData: FormData,
): Promise<WeekMaterialResponse> {
  const { data } = await api.patch<WeekMaterialResponse>(
    `${WEEK_MATERIALS_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Deletes a week material page, its media and its route. */
export async function deleteWeekMaterial(id: string): Promise<void> {
  await api.delete(`${WEEK_MATERIALS_ENDPOINT}/${id}`);
}

/** Publishes a page as the current week material and returns the saved page. */
export async function setCurrentWeek(
  id: string,
): Promise<WeekMaterialResponse> {
  const { data } = await api.post<WeekMaterialResponse>(
    `${WEEK_MATERIALS_ENDPOINT}/current-week/${id}`,
  );
  return data;
}
