import api from "@/config/axiosConfig";
import { ChildResponseDto, Paginated, CreateChildForm, EditChildForm, ChildFilters, ChildSort, ChildSimpleResponseDto } from "./types";

export async function apiFetchChildren(args: {
  page: number;
  limit: number;
  filters?: ChildFilters;
  sort?: ChildSort;
}) {
  const { page, limit, filters, sort } = args;
  const orderBy = sort?.id ?? 'updatedAt';
  const order = sort?.desc ? 'DESC' : 'ASC';

  const { data } = await api.get<Paginated<ChildResponseDto>>("/children", {
    params: {
      page,
      limit,
      orderBy,
      order,
      searchString: filters?.searchString || undefined,
      clubNumber: filters?.clubNumber ?? undefined,
      birthDateFrom: filters?.birthDateFrom || undefined,
      birthDateTo: filters?.birthDateTo || undefined,
      joinedFrom: filters?.joinedFrom || undefined,
      joinedTo: filters?.joinedTo || undefined,
      isActive: filters?.isActive !== undefined ? filters.isActive : undefined,
    },
  });
  return data;
}

export async function apiFetchChild(id: string) {
  const { data } = await api.get<ChildResponseDto>(`/children/${id}`);
  return data;
}

export async function apiFetchChildSimple() {
  const { data } = await api.get<ChildSimpleResponseDto[]>(`/children/simple`);
  return data;
}

export async function apiCreateChild(payload: CreateChildForm) {
  const { data } = await api.post<ChildResponseDto>("/children", payload);
  return data;
}

export async function apiUpdateChild(id: string, payload: Omit<EditChildForm, "id">) {
  const { data } = await api.put<ChildResponseDto>(`/children/${id}`, payload);
  return data;
}

export async function apiDeleteChild(id: string) {
  await api.delete(`/children/${id}`);
}

export async function apiToggleChildActive(id: string) {
  const { data } = await api.patch<ChildResponseDto>(`/children/${id}/toggle-active`);
  return data;
}
