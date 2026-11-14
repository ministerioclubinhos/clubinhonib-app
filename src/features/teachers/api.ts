import api from "@/config/axiosConfig";

import { TEACHERS_ENDPOINT } from "./constants";
import { buildTeachersQuery } from "./utils";
import type {
  ApiMessage,
  PageResponse,
  TeacherFilters,
  TeacherResponse,
  TeacherSimpleOption,
  TeacherSortField,
  TeacherSortOrder,
} from "./types";

/** Página de professores, com busca e filtros aplicados pela API. */
export async function apiFetchTeachers(
  args: {
    page: number;
    limit: number;
    filters?: TeacherFilters;
    sort?: TeacherSortField;
    order?: TeacherSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<PageResponse<TeacherResponse>> {
  const { data } = await api.get<PageResponse<TeacherResponse>>(
    TEACHERS_ENDPOINT,
    { params: buildTeachersQuery(args), signal: options?.signal },
  );

  return data;
}

export async function apiFetchTeacher(id: string): Promise<TeacherResponse> {
  const { data } = await api.get<TeacherResponse>(
    `${TEACHERS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Professores no formato usado pelos seletores de formulário. */
export async function apiListTeachersSimple(): Promise<TeacherSimpleOption[]> {
  const { data } = await api.get<TeacherSimpleOption[]>(
    `${TEACHERS_ENDPOINT}/simple`,
  );
  return data;
}

export async function apiAssignTeacherToClub(
  teacherId: string,
  clubId: string,
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `${TEACHERS_ENDPOINT}/${teacherId}/assign-club`,
    { clubId },
  );
  return data;
}

export async function apiUnassignTeacherFromClub(
  teacherId: string,
  clubId?: string,
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `${TEACHERS_ENDPOINT}/${teacherId}/unassign-club`,
    clubId ? { clubId } : {},
  );
  return data;
}
