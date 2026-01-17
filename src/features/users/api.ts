import api from "@/config/axiosConfig";
import { CreateUserForm, UsersPage, UserRow, UpadateUserForm } from "./types";
import { extractPhoneDigits } from "@/components/common/inputs";

export async function apiListUsers(params: {
  page: number;
  limit: number;
  q?: string;
  role?: string;
  active?: boolean;
  completed?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}): Promise<UsersPage> {
  const {
    page,
    limit,
    q,
    role,
    active,
    completed,
    sort = "updatedAt",
    order = "DESC",
  } = params;

  const { data } = await api.get<UsersPage>("/users", {
    params: {
      page,
      limit,
      q: q || undefined,
      role: role && role !== "all" ? role : undefined,
      active: active ? "true" : undefined,
      completed: completed ? "true" : undefined,
      sort,
      order,
    },
  });

  return data;
}

export async function apiCreateUser(
  payload: Omit<CreateUserForm, "confirmPassword">
): Promise<UserRow> {
  const { name, email, password, phone, role } = payload;

  const { data } = await api.post<UserRow>("/users", {
    name,
    email,
    password,
    phone: phone ? extractPhoneDigits(phone) : undefined,
    role,
  });

  return data;
}

export async function apiUpdateUser(
  id: string,
  payload: UpadateUserForm
): Promise<UserRow> {
  console.log(payload);
  
  const {
    name,
    role,
    phone,
    active,
    completed,
    commonUser,
    password,
  } = payload;  

  const { data } = await api.put<UserRow>(`/users/${id}`, {
    name,
    role,
    phone: phone ? extractPhoneDigits(phone) : undefined,
    active,
    completed,
    commonUser,
    password,
  });

  return data;
}

export async function apiDeleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
