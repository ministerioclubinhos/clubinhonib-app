import api from '@/config/axiosConfig';
import { IDEAS_PAGES_ENDPOINT, MULTIPART_HEADERS } from './constants';
import { IdeasPageResponse } from './types';

/** Lista todas as páginas de ideias. */
export async function apiListIdeasPages(): Promise<IdeasPageResponse[]> {
  const { data } = await api.get<IdeasPageResponse[]>(IDEAS_PAGES_ENDPOINT);
  return data ?? [];
}

/** Carrega uma página de ideias pelo id. */
export async function apiGetIdeasPage(id: string): Promise<IdeasPageResponse> {
  const { data } = await api.get<IdeasPageResponse>(
    `${IDEAS_PAGES_ENDPOINT}/${id}`,
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
