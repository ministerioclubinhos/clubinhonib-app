import api from "@/config/axiosConfig";

import { USERS_ENDPOINT } from "./constants";
import { buildUsersQuery } from "./utils";
import type {
  ApiMessage,
  CreateUserRequest,
  PaginatedUsersResponse,
  UpdateUserRequest,
  UserFilters,
  UserResponse,
  UserSortField,
  UserSortOrder,
} from "./types";

/** Página de usuários, com busca e filtros aplicados pela API. */
export async function apiFetchUsers(
  args: {
    page: number;
    limit: number;
    filters?: UserFilters;
    sort?: UserSortField;
    order?: UserSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<PaginatedUsersResponse> {
  const { data } = await api.get<PaginatedUsersResponse>(USERS_ENDPOINT, {
    params: buildUsersQuery(args),
    signal: options?.signal,
  });

  return data;
}

export async function apiFetchUser(id: string): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`${USERS_ENDPOINT}/${id}`);
  return data;
}

export async function apiCreateUser(
  payload: CreateUserRequest,
): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>(USERS_ENDPOINT, payload);
  return data;
}

export async function apiUpdateUser(
  id: string,
  payload: UpdateUserRequest,
): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>(
    `${USERS_ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function apiDeleteUser(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(`${USERS_ENDPOINT}/${id}`);
  return data;
}

/**
 * Troca a foto de um usuário.
 *
 * O arquivo vai como `FormData`; a instância compartilhada do axios manda
 * `application/json` por padrão, então o multipart precisa declarar o próprio
 * tipo. O nome do campo é o que o `UpdateUserImageService` procura.
 */
export async function apiUpdateUserImage(
  id: string,
  file: File,
): Promise<UserResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.patch<UserResponse>(
    `${USERS_ENDPOINT}/${id}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data;
}
