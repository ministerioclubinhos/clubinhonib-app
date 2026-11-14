import api from "@/config/axiosConfig";

import { buildPagelasQuery } from "./utils";
import type {
  ApiMessage,
  CreatePagelaRequest,
  PagelaFilters,
  PagelaLaunchWindow,
  PagelaResponse,
  Paginated,
  UpdatePagelaRequest,
} from "./types";

/** Página de pagelas de uma criança. */
export async function apiFetchPagelas(
  args: {
    childId: string;
    page: number;
    limit: number;
    filters?: PagelaFilters;
  },
  options?: { signal?: AbortSignal },
): Promise<Paginated<PagelaResponse>> {
  const { data } = await api.get<Paginated<PagelaResponse>>(
    "/pagelas/paginated",
    { params: buildPagelasQuery(args), signal: options?.signal },
  );

  return data;
}

/** Se hoje aceita lançamento de pagela, e até qual semana letiva. */
export async function apiFetchPagelaLaunchWindow(options?: {
  signal?: AbortSignal;
}): Promise<PagelaLaunchWindow> {
  const { data } = await api.get<PagelaLaunchWindow>("/pagelas/launch-window", {
    signal: options?.signal,
  });

  return data;
}

export async function apiFetchPagela(id: string): Promise<PagelaResponse> {
  const { data } = await api.get<PagelaResponse>(`/pagelas/${id}`);
  return data;
}

export async function apiCreatePagela(
  payload: CreatePagelaRequest,
): Promise<PagelaResponse> {
  const { data } = await api.post<PagelaResponse>("/pagelas", payload);
  return data;
}

export async function apiUpdatePagela(
  id: string,
  payload: UpdatePagelaRequest,
): Promise<PagelaResponse> {
  const { data } = await api.patch<PagelaResponse>(`/pagelas/${id}`, payload);
  return data;
}

export async function apiDeletePagela(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(`/pagelas/${id}`);
  return data;
}
