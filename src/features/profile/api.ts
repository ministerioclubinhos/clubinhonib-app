import api from "@/config/axiosConfig";
import {
  Profile,
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateProfileImageDto,
  CompleteProfile,
  CompleteProfileListItem,
  CreateCompleteProfileDto,
  UpdateCompleteProfileDto,
  QueryProfilesDto,
  PaginatedProfilesResponse
} from "./types";

export async function apiGetProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>("/profile");
  return data;
}

export async function apiUpdateProfile(payload: UpdateProfileDto): Promise<Profile> {
  const { data } = await api.patch<Profile>("/profile", payload);
  return data;
}

export async function apiChangePassword(payload: ChangePasswordDto): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>("/profile/password", payload);
  return data;
}

export async function apiUpdateProfileImage(
  payload: UpdateProfileImageDto | FormData
): Promise<Profile> {
  const { data } = await api.patch<Profile>("/profile/image", payload, {
    headers: payload instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' }
  });
  return data;
}

export async function apiGetCompleteProfile(): Promise<CompleteProfile> {
  const { data } = await api.get<CompleteProfile>("/profiles/me");
  return data;
}

export async function apiCreateCompleteProfile(
  payload: CreateCompleteProfileDto
): Promise<CompleteProfile> {
  const { data } = await api.post<CompleteProfile>("/profiles", payload);
  return data;
}

export async function apiUpdateCompleteProfile(
  payload: UpdateCompleteProfileDto
): Promise<CompleteProfile> {
  const { data } = await api.put<CompleteProfile>("/profiles/me", payload);
  return data;
}

export async function apiGetAllProfiles(params?: QueryProfilesDto): Promise<PaginatedProfilesResponse> {

  const cleanParams: Record<string, string | number> = {};

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
  }

  const { data } = await api.get<PaginatedProfilesResponse>("/profiles", { params: cleanParams });
  return data;
}

export async function apiGetProfileById(id: string): Promise<CompleteProfile> {
  const { data } = await api.get<CompleteProfile>(`/profiles/${id}`);
  return data;
}

export async function apiUpdateProfileById(
  id: string,
  payload: UpdateCompleteProfileDto
): Promise<CompleteProfile> {
  const { data } = await api.put<CompleteProfile>(`/profiles/${id}`, payload);
  return data;
}
