import { UserRole } from "@/types/shared";

export type UserRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  phone: string;
  name: string;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
  role: UserRole;
};

export type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  role: UserRole;
  active?: boolean;
};

export type UpdateUserForm = {
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  active?: boolean;
  completed?: boolean;
  commonUser?: boolean;
  password?: string;
  confirmPassword?: string;
};

export type UsersPage = {
  items: UserRow[];
  meta?: { total?: number };
};

export type UserFilters = {
  q: string;
  role: "all" | UserRole | string;
  active?: boolean | null;
  completed?: boolean | null;
};

export type SortParam = { id: string; desc: boolean } | null;

export const TZ = "America/Manaus";
export const SENSITIVE_KEYS = new Set(["password", "refreshToken"]);

