import api from '@/config/axiosConfig';
import {
  IMAGE_PAGES_ENDPOINT,
  IMAGE_SECTIONS_PAGE_SIZE,
  MULTIPART_HEADERS,
} from './constants';
import { ImagePageResponse, PaginatedImageSectionsResponse } from './types';

/** Lista todas as galerias de fotos. */
export async function apiListImagePages(): Promise<ImagePageResponse[]> {
  const { data } = await api.get<ImagePageResponse[]>(IMAGE_PAGES_ENDPOINT);
  return data ?? [];
}

/** Carrega uma galeria pelo id. */
export async function apiGetImagePage(id: string): Promise<ImagePageResponse> {
  const { data } = await api.get<ImagePageResponse>(
    `${IMAGE_PAGES_ENDPOINT}/${id}`,
  );
  return data;
}

/** Carrega uma página de seções da galeria. */
export async function apiGetImageSections(
  pageId: string,
  page: number,
  limit: number = IMAGE_SECTIONS_PAGE_SIZE,
): Promise<PaginatedImageSectionsResponse> {
  const { data } = await api.get<PaginatedImageSectionsResponse>(
    `${IMAGE_PAGES_ENDPOINT}/${pageId}/sections`,
    { params: { page, limit } },
  );
  return data;
}

/** Cria uma galeria a partir do corpo multipart. */
export async function apiCreateImagePage(
  formData: FormData,
): Promise<ImagePageResponse> {
  const { data } = await api.post<ImagePageResponse>(
    IMAGE_PAGES_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Atualiza uma galeria a partir do corpo multipart. */
export async function apiUpdateImagePage(
  id: string,
  formData: FormData,
): Promise<ImagePageResponse> {
  const { data } = await api.patch<ImagePageResponse>(
    `${IMAGE_PAGES_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Exclui a galeria, suas seções, imagens e rota. */
export async function apiDeleteImagePage(id: string): Promise<void> {
  await api.delete(`${IMAGE_PAGES_ENDPOINT}/${id}`);
}
