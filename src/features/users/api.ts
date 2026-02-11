import api from "@/config/axiosConfig";
import { CreateUserForm, UsersPage, UserRow, UpdateUserForm } from "./types";
import { extractPhoneDigits } from "@/components/common/inputs";

export async function apiListUsers(params: {
  page: number;
  limit: number;
  q?: string;
  role?: string;
  active?: boolean | null;
  completed?: boolean | null;
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
      active: active === true ? "true" : active === false ? "false" : undefined,
      completed:
        completed === true ? "true" : completed === false ? "false" : undefined,
      sort,
      order,
    },
  });

  return data;
}

export async function apiCreateUser(
  payload: Omit<CreateUserForm, "confirmPassword">
): Promise<UserRow> {
  const { name, email, password, phone, role, active } = payload;

  const { data } = await api.post<UserRow>("/users", {
    name,
    email,
    password,
    phone: phone ? extractPhoneDigits(phone) : undefined,
    role,
    active,
  });

  return data;
}

export async function apiUpdateUser(
  id: string,
  payload: UpdateUserForm
): Promise<UserRow> {
  console.log(payload);

  const {
    name,
    email,
    role,
    phone,
    active,
    completed,
    commonUser,
    password,
  } = payload;

  const { data } = await api.put<UserRow>(`/users/${id}`, {
    name,
    email,
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

export async function apiUpdateUserImage(
  id: string,
  file: File
): Promise<UserRow> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.patch<UserRow>(`/users/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
