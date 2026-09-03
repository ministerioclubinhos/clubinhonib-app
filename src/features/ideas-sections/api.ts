import api from "@/config/axiosConfig";

import { apiListIdeasPageOptions } from "@/features/ideas-pages/api";

import { IDEAS_SECTIONS_ENDPOINT } from "./constants";
import { buildIdeasSectionsQuery } from "./utils";
import type {
  ApiMessage,
  IdeasPage,
  IdeasSectionFilters,
  IdeasSectionResponse,
  IdeasSectionSortField,
  IdeasSectionSortOrder,
  Paginated,
} from "./types";

/** Fila de ideias aguardando decisão, com busca aplicada pela API. */
export async function apiFetchIdeasSections(
  args: {
    page: number;
    limit: number;
    filters?: IdeasSectionFilters;
    sort?: IdeasSectionSortField;
    order?: IdeasSectionSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<Paginated<IdeasSectionResponse>> {
  const { data } = await api.get<Paginated<IdeasSectionResponse>>(
    IDEAS_SECTIONS_ENDPOINT,
    { params: buildIdeasSectionsQuery(args), signal: options?.signal },
  );
  return data;
}

export async function apiFetchIdeasSection(
  id: string,
): Promise<IdeasSectionResponse> {
  const { data } = await api.get<IdeasSectionResponse>(
    `${IDEAS_SECTIONS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Quantas ideias aguardam decisão. */
export async function apiCountPendingIdeasSections(): Promise<{
  pending: number;
}> {
  const { data } = await api.get<{ pending: number }>(
    `${IDEAS_SECTIONS_ENDPOINT}/pending-count`,
  );
  return data;
}

/**
 * Envia uma ideia. O corpo é multipart, então declara o próprio tipo: a
 * instância compartilhada do axios manda `application/json` por padrão.
 */
export async function apiCreateIdeasSection(
  payload: FormData,
): Promise<IdeasSectionResponse> {
  const { data } = await api.post<IdeasSectionResponse>(
    IDEAS_SECTIONS_ENDPOINT,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** Edita a ideia sem mexer em onde ela está publicada. */
export async function apiUpdateIdeasSection(
  id: string,
  payload: FormData,
): Promise<IdeasSectionResponse> {
  const { data } = await api.patch<IdeasSectionResponse>(
    `${IDEAS_SECTIONS_ENDPOINT}/${id}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** Aceita a ideia e a publica na página escolhida. */
export async function apiAttachIdeasSectionToPage(
  id: string,
  pageId: string,
  payload: FormData,
): Promise<IdeasSectionResponse> {
  const { data } = await api.patch<IdeasSectionResponse>(
    `${IDEAS_SECTIONS_ENDPOINT}/${id}/attach/${pageId}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** Recusa a ideia. */
export async function apiDeleteIdeasSection(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(
    `${IDEAS_SECTIONS_ENDPOINT}/${id}`,
  );
  return data;
}

/**
 * Páginas de ideias disponíveis para publicar.
 *
 * Vem do resumo da listagem: o seletor precisa apenas do título, e carregar
 * cada página inteira só para preencher um menu era desperdício.
 */
export async function apiFetchIdeasPages(): Promise<IdeasPage[]> {
  return apiListIdeasPageOptions();
}
