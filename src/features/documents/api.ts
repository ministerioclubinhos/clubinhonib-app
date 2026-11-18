import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';

import { DOCUMENTS_ENDPOINT, MULTIPART_HEADERS } from './constants';
import type {
  DocumentQuery,
  DocumentResponse,
  PaginatedDocuments,
} from './types';

/**
 * Lista os documentos.
 *
 * Busca, filtro e ordenação são resolvidos pela API: antes a listagem inteira
 * era baixada só para ser peneirada no navegador.
 */
export async function apiListDocuments(
  query: DocumentQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedDocuments> {
  const { data } = await api.get<PaginatedDocuments>(DOCUMENTS_ENDPOINT, {
    ...config,
    params: query,
  });
  return data;
}

/** Carrega um documento pelo id. */
export async function apiGetDocument(id: string): Promise<DocumentResponse> {
  const { data } = await api.get<DocumentResponse>(
    `${DOCUMENTS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Cria um documento a partir do corpo multipart. */
export async function apiCreateDocument(
  formData: FormData,
): Promise<DocumentResponse> {
  const { data } = await api.post<DocumentResponse>(
    DOCUMENTS_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Atualiza um documento a partir do corpo multipart. */
export async function apiUpdateDocument(
  id: string,
  formData: FormData,
): Promise<DocumentResponse> {
  const { data } = await api.patch<DocumentResponse>(
    `${DOCUMENTS_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Exclui o documento, sua mídia e sua rota. */
export async function apiDeleteDocument(id: string): Promise<void> {
  await api.delete(`${DOCUMENTS_ENDPOINT}/${id}`);
}
