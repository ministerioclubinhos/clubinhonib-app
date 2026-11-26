import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';
import { PLAY_ADMIN_ENDPOINT, PLAY_ENDPOINT, PLAY_VIDEOS_ENDPOINT } from './constants';
import type {
  PaginatedPlayVideos,
  PlayCategory,
  PlayHome,
  PlayStats,
  PlayVideo,
  PlayVideoQuery,
} from './types';

/** Lista os vídeos do Play (paginada; busca, filtros e ordem resolvidos pela API). */
export async function apiListPlayVideos(
  query: PlayVideoQuery,
  config?: AxiosRequestConfig
): Promise<PaginatedPlayVideos> {
  const { data } = await api.get<PaginatedPlayVideos>(PLAY_VIDEOS_ENDPOINT, {
    ...config,
    params: query,
  });
  return data;
}

/** Fila completa (sem paginação) com os mesmos filtros da listagem. */
export async function apiGetPlayQueue(query: PlayVideoQuery): Promise<PlayVideo[]> {
  const { data } = await api.get<PlayVideo[]>(`${PLAY_ENDPOINT}/queue`, {
    params: { ...query, page: undefined, limit: undefined },
  });
  return data;
}

export async function apiGetPlayHome(config?: AxiosRequestConfig): Promise<PlayHome> {
  const { data } = await api.get<PlayHome>(`${PLAY_ENDPOINT}/home`, config);
  return data;
}

export async function apiGetPlayVideo(id: string, config?: AxiosRequestConfig): Promise<PlayVideo> {
  const { data } = await api.get<PlayVideo>(`${PLAY_VIDEOS_ENDPOINT}/${id}`, config);
  return data;
}

export async function apiListRelatedPlayVideos(
  id: string,
  config?: AxiosRequestConfig
): Promise<PlayVideo[]> {
  const { data } = await api.get<PlayVideo[]>(`${PLAY_VIDEOS_ENDPOINT}/${id}/related`, config);
  return data;
}

export async function apiListPlayCategories(config?: AxiosRequestConfig): Promise<PlayCategory[]> {
  const { data } = await api.get<PlayCategory[]>(`${PLAY_ENDPOINT}/categories`, config);
  return data;
}

/** Conta uma visualização (a API ignora repetições em 30 minutos). */
export async function apiRecordPlayView(id: string): Promise<void> {
  await api.post(`${PLAY_VIDEOS_ENDPOINT}/${id}/view`);
}

export async function apiSavePlayProgress(
  id: string,
  positionSeconds: number,
  durationSeconds?: number
): Promise<void> {
  await api.put(`${PLAY_VIDEOS_ENDPOINT}/${id}/progress`, {
    positionSeconds,
    ...(durationSeconds ? { durationSeconds } : {}),
  });
}

export async function apiSetPlayFavorite(id: string, favorite: boolean): Promise<void> {
  if (favorite) await api.put(`${PLAY_VIDEOS_ENDPOINT}/${id}/favorite`);
  else await api.delete(`${PLAY_VIDEOS_ENDPOINT}/${id}/favorite`);
}

export async function apiGetPlayStats(config?: AxiosRequestConfig): Promise<PlayStats> {
  const { data } = await api.get<PlayStats>(`${PLAY_ADMIN_ENDPOINT}/stats`, config);
  return data;
}

export async function apiCreatePlayCategory(name: string): Promise<PlayCategory> {
  const { data } = await api.post<PlayCategory>(`${PLAY_ADMIN_ENDPOINT}/categories`, { name });
  return data;
}

export async function apiUpdatePlayCategory(id: string, name: string): Promise<PlayCategory> {
  const { data } = await api.patch<PlayCategory>(`${PLAY_ADMIN_ENDPOINT}/categories/${id}`, {
    name,
  });
  return data;
}

export async function apiDeletePlayCategory(id: string): Promise<void> {
  await api.delete(`${PLAY_ADMIN_ENDPOINT}/categories/${id}`);
}
