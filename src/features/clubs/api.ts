import api from "@/config/axiosConfig";
import {
  ClubResponseDto, Paginated, CreateClubForm, EditClubForm,
  CoordinatorMiniDto, TeacherOption, UserPublicDto,
  ClubFilters, ClubSort,
  CoordinatorOption,
  SimpleClubResponseDto
} from "./types";
import { CoordinatorProfile } from "../coordinators/types";
import { TeacherProfile } from "../teachers/types";

// src/modules/clubs/api.ts (função apiFetchClubs)

export async function apiFetchClubs(args: {
  page: number;
  limit: number;
  filters?: ClubFilters;
  sort?: ClubSort;
}) {
  const { page, limit, filters, sort } = args;
  const {
    addressSearchString,
    userSearchString,
    clubSearchString,
  } = filters || {};

  const sortField = sort?.id ?? "updatedAt";
  const order = sort?.desc ? "DESC" : "ASC";

  const { data } = await api.get<Paginated<ClubResponseDto>>("/clubs", {
    params: {
      page,
      limit,
      addressSearchString: addressSearchString || undefined,
      userSearchString: userSearchString || undefined,
      clubSearchString: clubSearchString || undefined,
      sort: sortField,
      order,
    },
  });
  return data;
}


export async function apiFetchClub(id: string) {
  const { data } = await api.get<ClubResponseDto>(`/clubs/${id}`);
  return data;
}

export async function apiFetchSimpleClubs() {
  const { data } = await api.get<SimpleClubResponseDto[]>(`/clubs/simple-options`);
  return data;
}

export async function apiCreateClub(payload: CreateClubForm) {
  const { data } = await api.post<ClubResponseDto>("/clubs", payload);
  return data;
}

export async function apiUpdateClub(id: string, payload: Omit<EditClubForm, "id">) {
  const { data } = await api.patch<ClubResponseDto>(`/clubs/${id}`, payload);
  return data;
}

export async function apiDeleteClub(id: string) {
  await api.delete(`/clubs/${id}`);
}

// Options (coordinators / teachers) — inalterado
export async function apiListUsersByRole(role: "coordinator" | "teacher", limit = 500) {
  const { data } = await api.get<{ items: { id: string; name?: string; email?: string }[] }>("/users", {
    params: { role, page: 1, limit, sort: "name", order: "ASC" },
  });
  return (Array.isArray(data?.items) ? data.items : []);
}

export async function apiGetCoordinatorProfile(userId: string) {
  const { data } = await api.get<CoordinatorMiniDto>(`/coordinator-profiles/${userId}`);
  return data;
}

export async function apiGetTeacherProfile(userId: string) {
  const { data } = await api.get<{ id: string; user: UserPublicDto; club?: { id: string; number?: number } | null }>(`/teacher-profiles/${userId}`);
  return data;
}
// GET /coordinator-profiles  -> CoordinatorOption[]
export async function apiLoadCoordinatorOptions() {
  const { data } = await api.get<CoordinatorProfile[]>("/coordinator-profiles");
  // name = user.name || user.email || id
  return data.map((c) => ({
    coordinatorProfileId: c.coordinatorProfileId,
    name: c.user?.name,
  })) as CoordinatorOption[];
}

// GET /teacher-profiles -> TeacherOption[]
export async function apiLoadTeacherOptions() {
  const { data } = await api.get<TeacherProfile[]>("/teacher-profiles");
  return data.map((t) => ({
    teacherProfileId: t.teacherProfileId,
    name: t.user?.name ?? t.user?.email ?? t.teacherProfileId,
    assignedClub: t.club?.number ?? null,
    vinculado: t.vinculado,
  })) as TeacherOption[];
}

// modelos retornados pelo back
export type TeacherSimpleApi = {
  teacherProfileId: string;
  name: string;
  vinculado: boolean;
};

export type CoordinatorSimpleApi = {
  coordinatorProfileId: string;
  name: string;
  vinculado: boolean;
};

export async function apiListTeachersSimple(): Promise<TeacherSimpleApi[]> {
  const { data } = await api.get<TeacherSimpleApi[]>("/teacher-profiles/simple");
  return data;
}

export async function apiListCoordinatorsSimple(): Promise<CoordinatorSimpleApi[]> {
  const { data } = await api.get<CoordinatorSimpleApi[]>("/coordinator-profiles/simple");
  return data;
}

