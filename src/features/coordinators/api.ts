import api from "@/config/axiosConfig";
import type { CoordinatorProfile, ClubSimple, PageDto } from "./types";

export type ListCoordinatorsParams = {
  page: number; 
  limit: number;
  sort?: "updatedAt" | "createdAt" | "name";
  order?: "asc" | "desc";
  q?: string;
  active?: boolean;
  hasClubs?: boolean;
  clubNumber?: number;
  searchString?: string;
};

export type ApiMessage = { message?: string };

export async function apiListCoordinators(params: ListCoordinatorsParams) {
  const { data } = await api.get<PageDto<CoordinatorProfile>>(
    "/coordinator-profiles",
    { params }
  );
  return data;
}

export async function apiGetCoordinator(coordinatorId: string) {
  const { data } = await api.get<CoordinatorProfile>(
    `/coordinator-profiles/${coordinatorId}`
  );
  return data;
}

export async function apiAssignClub(
  coordinatorId: string,
  clubId: string
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `/coordinator-profiles/${coordinatorId}/assign-club`,
    { clubId }
  );
  return data;
}

export async function apiUnassignClub(
  coordinatorId: string,
  clubId: string
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `/coordinator-profiles/${coordinatorId}/unassign-club`,
    { clubId }
  );
  return data;
}

export async function apiMoveClub(
  fromCoordinatorId: string,
  clubId: string,
  toCoordinatorProfileId: string
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `/coordinator-profiles/${fromCoordinatorId}/move-club`,
    { clubId, toCoordinatorProfileId }
  );
  return data;
}

export async function apiListClubsSimple() {
  const { data } = await api.get<ClubSimple[]>("/clubs/all");
  return data;
}
