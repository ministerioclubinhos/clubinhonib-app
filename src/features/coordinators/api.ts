import api from "@/config/axiosConfig";

import { COORDINATORS_ENDPOINT } from "./constants";
import { buildCoordinatorsQuery } from "./utils";
import type {
  ApiMessage,
  CoordinatorFilters,
  CoordinatorResponse,
  CoordinatorSimpleOption,
  CoordinatorSortField,
  CoordinatorSortOrder,
  PageResponse,
} from "./types";

/** Página de coordenadores, com busca e filtros aplicados pela API. */
export async function apiFetchCoordinators(
  args: {
    page: number;
    limit: number;
    filters?: CoordinatorFilters;
    sort?: CoordinatorSortField;
    order?: CoordinatorSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<PageResponse<CoordinatorResponse>> {
  const { data } = await api.get<PageResponse<CoordinatorResponse>>(
    COORDINATORS_ENDPOINT,
    { params: buildCoordinatorsQuery(args), signal: options?.signal },
  );

  return data;
}

export async function apiFetchCoordinator(
  id: string,
): Promise<CoordinatorResponse> {
  const { data } = await api.get<CoordinatorResponse>(
    `${COORDINATORS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Coordenadores no formato usado pelos seletores de formulário. */
export async function apiListCoordinatorsSimple(): Promise<
  CoordinatorSimpleOption[]
> {
  const { data } = await api.get<CoordinatorSimpleOption[]>(
    `${COORDINATORS_ENDPOINT}/simple`,
  );
  return data;
}

export async function apiAssignClub(
  coordinatorId: string,
  clubId: string,
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `${COORDINATORS_ENDPOINT}/${coordinatorId}/assign-club`,
    { clubId },
  );
  return data;
}

export async function apiUnassignClub(
  coordinatorId: string,
  clubId: string,
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `${COORDINATORS_ENDPOINT}/${coordinatorId}/unassign-club`,
    { clubId },
  );
  return data;
}

export async function apiMoveClub(
  fromCoordinatorId: string,
  clubId: string,
  toCoordinatorProfileId: string,
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `${COORDINATORS_ENDPOINT}/${fromCoordinatorId}/move-club`,
    { clubId, toCoordinatorProfileId },
  );
  return data;
}
