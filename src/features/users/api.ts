// api.ts
import api from "@/config/axiosConfig";
import { CreateUserForm, UsersPage, UserRow } from "./types";

export async function apiListUsers(params: {
  page: number;
  limit: number;
  q?: string;
  role?: string;
  active?: boolean;
  completed?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}) {
  const { data } = await api.get<UsersPage>("/users", {
    params: {
      page: params.page,
      limit: params.limit,
      q: params.q || undefined,
      role: params.role && params.role !== "all" ? params.role : undefined,
      active: params.active ? "true" : undefined,
      completed: params.completed ? "true" : undefined,
      sort: params.sort || "updatedAt",
      order: params.order || "DESC",
    },
  });
  return data;
}

export async function apiCreateUser(payload: Omit<CreateUserForm, "confirmPassword">) {
  const { name, email, password, phone, role } = payload;
  const { data } = await api.post<UserRow>("/users", {
    name, email, password, phone, role,
  });
  return data;
}

export async function apiUpdateUser(id: string, payload: Partial<UserRow>) {
  const { data } = await api.put<UserRow>(`/users/${id}`, payload);
  return data;
}

export async function apiDeleteUser(id: string) {
  await api.delete(`/users/${id}`);
}
