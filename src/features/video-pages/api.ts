import api from '@/config/axiosConfig';
import { MULTIPART_HEADERS, VIDEO_PAGES_ENDPOINT } from './constants';
import { VideoPageResponse } from './types';

/** Lista todas as galerias de vídeo. */
export async function apiListVideoPages(): Promise<VideoPageResponse[]> {
  const { data } = await api.get<VideoPageResponse[]>(VIDEO_PAGES_ENDPOINT);
  return data ?? [];
}

/** Carrega uma galeria de vídeos pelo id. */
export async function apiGetVideoPage(id: string): Promise<VideoPageResponse> {
  const { data } = await api.get<VideoPageResponse>(
    `${VIDEO_PAGES_ENDPOINT}/${id}`,
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
