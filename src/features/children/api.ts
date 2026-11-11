import api from "@/config/axiosConfig";

import { CHILDREN_ENDPOINT } from "./constants";
import { buildChildrenQuery } from "./utils";
import type {
  ChildFilters,
  ChildListItem,
  ChildResponse,
  ChildSortField,
  ChildSortOrder,
  CreateChildRequest,
  DeleteChildResponse,
  PaginatedChildren,
  UpdateChildRequest,
} from "./types";

/** Página de crianças, com busca e filtros aplicados pela API. */
export async function apiFetchChildren(
  args: {
    page: number;
    limit: number;
    filters?: ChildFilters;
    orderBy?: ChildSortField;
    order?: ChildSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<PaginatedChildren<ChildResponse>> {
  const { data } = await api.get<PaginatedChildren<ChildResponse>>(
    CHILDREN_ENDPOINT,
    { params: buildChildrenQuery(args), signal: options?.signal },
  );

  return data;
}

export async function apiFetchChild(id: string): Promise<ChildResponse> {
  const { data } = await api.get<ChildResponse>(`${CHILDREN_ENDPOINT}/${id}`);
  return data;
}

/** Crianças no formato usado pelos seletores de formulário. */
export async function apiFetchChildrenSimple(params?: {
  searchString?: string;
  isActive?: boolean;
  acceptedChrist?: boolean;
  page?: number;
  limit?: number;
}, options?: { signal?: AbortSignal }): Promise<PaginatedChildren<ChildListItem>> {
  const { data } = await api.get<PaginatedChildren<ChildListItem>>(
    `${CHILDREN_ENDPOINT}/simple`,
    {
      signal: options?.signal,
      params: {
        searchString: params?.searchString?.trim() || undefined,
        isActive: params?.isActive,
        acceptedChrist: params?.acceptedChrist,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    },
  );

  return data;
}

export async function apiCreateChild(
  payload: CreateChildRequest,
): Promise<ChildResponse> {
  const { data } = await api.post<ChildResponse>(CHILDREN_ENDPOINT, payload);
  return data;
}

export async function apiUpdateChild(
  id: string,
  payload: UpdateChildRequest,
): Promise<ChildResponse> {
  const { data } = await api.put<ChildResponse>(
    `${CHILDREN_ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function apiDeleteChild(
  id: string,
): Promise<DeleteChildResponse> {
  const { data } = await api.delete<DeleteChildResponse>(
    `${CHILDREN_ENDPOINT}/${id}`,
  );
  return data;
}

export async function apiToggleChildActive(
  id: string,
): Promise<ChildResponse> {
  const { data } = await api.patch<ChildResponse>(
    `${CHILDREN_ENDPOINT}/${id}/toggle-active`,
  );
  return data;
}
