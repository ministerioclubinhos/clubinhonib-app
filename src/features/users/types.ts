import { RoleUser } from "@/store/slices/auth/authSlice";

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
  role: RoleUser;
};

export type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  role: RoleUser
};


export type UpadateUserForm = {
  name: string;
  role: RoleUser;
  phone: string;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
  password: string;
  confirmPassword?: string;
};

export type UsersPage = {
  items: UserRow[];
  meta?: { total?: number };
};

export type UserFilters = {
  q: string;
  role: "all" | RoleUser | string;
  onlyActive: boolean;
  onlyCompleted: boolean;
};

export type SortParam = { id: string; desc: boolean } | null;

export const TZ = "America/Manaus";
export const SENSITIVE_KEYS = new Set(["password", "refreshToken"]);
export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: TZ }) : "—";
