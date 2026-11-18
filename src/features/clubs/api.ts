import api from "@/config/axiosConfig";

import { DEFAULT_CLUB_SORT } from "./constants";
import type {
  ApiMessage,
  ClubFilters,
  ClubResponse,
  ClubSelectOption,
  ClubSimpleResponse,
  ClubSort,
  ClubsQueryParams,
  CreateClubRequest,
  Paginated,
  UpdateClubRequest,
} from "./types";

/** Página de clubinhos, com filtros e ordenação aplicados pela API. */
export async function apiFetchClubs(args: {
  page: number;
  limit: number;
  filters?: ClubFilters;
  sort?: ClubSort;
  /** Permite cancelar a busca quando outra começa. */
  signal?: AbortSignal;
}): Promise<Paginated<ClubResponse>> {
  const { page, limit, filters, sort, signal } = args;
  const active = sort ?? DEFAULT_CLUB_SORT;

  const params: ClubsQueryParams = {
    page,
    limit,
    searchString: filters?.searchString?.trim() || undefined,
    isActive: filters?.isActive,
    sort: active?.id ?? "number",
    order: active?.desc ? "DESC" : "ASC",
  };

  const { data } = await api.get<Paginated<ClubResponse>>("/clubs", {
    params,
    signal,
  });

  return data;
}

/** Um clubinho, com coordenador, professores e endereço. */
export async function apiFetchClub(id: string): Promise<ClubResponse> {
  const { data } = await api.get<ClubResponse>(`/clubs/${id}`);
  return data;
}

/** Todos os clubinhos visíveis, sem paginação, para listas leves. */
export async function apiFetchAllClubs(): Promise<ClubSimpleResponse[]> {
  const { data } = await api.get<ClubSimpleResponse[]>("/clubs/all");
  return data;
}

/** Opções prontas para os seletores de clubinho. */
export async function apiFetchClubOptions(): Promise<ClubSelectOption[]> {
  const { data } = await api.get<ClubSelectOption[]>("/clubs/simple-options");
  return data;
}

export async function apiCreateClub(
  payload: CreateClubRequest,
): Promise<ClubResponse> {
  const { data } = await api.post<ClubResponse>("/clubs", payload);
  return data;
}

export async function apiUpdateClub(
  id: string,
  payload: UpdateClubRequest,
): Promise<ClubResponse> {
  const { data } = await api.patch<ClubResponse>(`/clubs/${id}`, payload);
  return data;
}

export async function apiDeleteClub(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(`/clubs/${id}`);
  return data;
}

/** Inverte o status do clubinho e devolve como ele ficou. */
export async function apiToggleClubActive(id: string): Promise<ClubResponse> {
  const { data } = await api.patch<ClubResponse>(`/clubs/${id}/toggle-active`);
  return data;
}
