import api from "@/config/axiosConfig";

import type {
  ApiMessage,
  ProfileBirthday,
  ChangePasswordRequest,
  CompleteProfile,
  CreateCompleteProfileRequest,
  MyProfile,
  PaginatedProfilesResponse,
  ProfilesQueryParams,
  UpdateCompleteProfileRequest,
  UpdateMyAccountRequest,
  UpdateProfileImageRequest,
} from "./types";

/* ------------------------------------------------------------------ *
 * A conta de quem está logado — `/profile`
 * ------------------------------------------------------------------ */

export async function apiFetchMyProfile(): Promise<MyProfile> {
  const { data } = await api.get<MyProfile>("/profile");
  return data;
}

export async function apiUpdateMyAccount(
  payload: UpdateMyAccountRequest,
): Promise<MyProfile> {
  const { data } = await api.patch<MyProfile>("/profile", payload);
  return data;
}

export async function apiChangePassword(
  payload: ChangePasswordRequest,
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>("/profile/password", payload);
  return data;
}

/**
 * Troca a foto do perfil.
 *
 * O arquivo vai como `FormData`; o link, como JSON. A instância compartilhada
 * do axios manda `application/json` por padrão, então o multipart precisa
 * declarar o próprio tipo.
 */
export async function apiUpdateProfileImage(
  payload: FormData | UpdateProfileImageRequest,
): Promise<MyProfile> {
  const { data } = await api.patch<MyProfile>("/profile/image", payload, {
    headers:
      payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
  });

  return data;
}

/* ------------------------------------------------------------------ *
 * Dados pessoais e preferências — `/profiles`
 * ------------------------------------------------------------------ */

export async function apiFetchMyCompleteProfile(): Promise<CompleteProfile> {
  const { data } = await api.get<CompleteProfile>("/profiles/me");
  return data;
}

export async function apiCreateMyCompleteProfile(
  payload: CreateCompleteProfileRequest,
): Promise<CompleteProfile> {
  const { data } = await api.post<CompleteProfile>("/profiles", payload);
  return data;
}

export async function apiUpdateMyCompleteProfile(
  payload: UpdateCompleteProfileRequest,
): Promise<CompleteProfile> {
  const { data } = await api.put<CompleteProfile>("/profiles/me", payload);
  return data;
}

/* ------------------------------------------------------------------ *
 * Perfis de outras pessoas — administração
 * ------------------------------------------------------------------ */

export async function apiFetchProfiles(
  params?: ProfilesQueryParams,
  options?: { signal?: AbortSignal },
): Promise<PaginatedProfilesResponse> {
  // Parâmetro vazio vira filtro vazio no back; melhor nem enviar.
  const cleaned: Record<string, string | number> = {};

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value as string | number;
    }
  });

  const { data } = await api.get<PaginatedProfilesResponse>("/profiles", {
    params: cleaned,
    signal: options?.signal,
  });

  return data;
}

/**
 * Aniversariantes do mês.
 *
 * A faixa da tela pedia a listagem inteira com `limit=1000` para descobrir
 * isto; agora a API devolve só quem faz aniversário no mês e só o que a faixa
 * mostra.
 */
export async function apiFetchProfileBirthdays(): Promise<ProfileBirthday[]> {
  const { data } = await api.get<ProfileBirthday[]>("/profiles/birthdays");
  return data;
}

export async function apiFetchProfileById(id: string): Promise<CompleteProfile> {
  const { data } = await api.get<CompleteProfile>(`/profiles/${id}`);
  return data;
}

export async function apiUpdateProfileById(
  id: string,
  payload: UpdateCompleteProfileRequest,
): Promise<CompleteProfile> {
  const { data } = await api.put<CompleteProfile>(`/profiles/${id}`, payload);
  return data;
}

export async function apiDeleteProfile(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(`/profiles/${id}`);
  return data;
}
