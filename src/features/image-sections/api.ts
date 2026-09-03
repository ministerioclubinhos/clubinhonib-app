import api from "@/config/axiosConfig";

import { IMAGE_SECTIONS_ENDPOINT } from "./constants";
import { buildImageSectionsQuery } from "./utils";
import type {
  ApiMessage,
  ImageSectionFilters,
  ImageSectionResponse,
  ImageSectionSortField,
  ImageSectionSortOrder,
  Paginated,
} from "./types";

/** Fila de revisão, com busca e filtros aplicados pela API. */
export async function apiFetchImageSections(
  args: {
    page: number;
    limit: number;
    filters?: ImageSectionFilters;
    sort?: ImageSectionSortField;
    order?: ImageSectionSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<Paginated<ImageSectionResponse>> {
  const { data } = await api.get<Paginated<ImageSectionResponse>>(
    IMAGE_SECTIONS_ENDPOINT,
    { params: buildImageSectionsQuery(args), signal: options?.signal },
  );
  return data;
}

export async function apiFetchImageSection(
  id: string,
): Promise<ImageSectionResponse> {
  const { data } = await api.get<ImageSectionResponse>(
    `${IMAGE_SECTIONS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Quantas publicações aguardam aprovação. */
export async function apiCountPendingImageSections(): Promise<{
  pending: number;
}> {
  const { data } = await api.get<{ pending: number }>(
    `${IMAGE_SECTIONS_ENDPOINT}/pending-count`,
  );
  return data;
}

/**
 * Envia fotos. O corpo é multipart, então declara o próprio tipo: a instância
 * compartilhada do axios manda `application/json` por padrão.
 */
export async function apiCreateImageSection(
  payload: FormData,
): Promise<ImageSectionResponse> {
  const { data } = await api.post<ImageSectionResponse>(
    IMAGE_SECTIONS_ENDPOINT,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** Revisa e aprova: leva a publicação para o feed. */
export async function apiUpdateImageSection(
  id: string,
  payload: FormData,
): Promise<ImageSectionResponse> {
  const { data } = await api.patch<ImageSectionResponse>(
    `${IMAGE_SECTIONS_ENDPOINT}/${id}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** Recusa a publicação. */
export async function apiDeleteImageSection(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(
    `${IMAGE_SECTIONS_ENDPOINT}/${id}`,
  );
  return data;
}
