import { extractPhoneDigits, formatPhone } from "@/utils/phone";
import { UserRole } from "@/types/shared";

import {
  EMPTY_VALUE,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERS_DEFAULT_ORDER,
  USERS_DEFAULT_SORT,
  USER_ROLE_LABELS,
} from "./constants";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserFormErrors,
  UserFormValues,
  UserSortField,
  UserSortOrder,
  UsersQueryParams,
} from "./types";

/** Iniciais do nome, para o avatar do card. */
export function userInitials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Rótulo do papel; papel desconhecido aparece como veio. */
export function userRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] ?? String(role);
}

/** Data no formato do país. */
export function formatDate(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Query string da listagem, só com o que a API aceita.
 *
 * Filtro vazio não é enviado: `q=` peneiraria por texto vazio, e `role=all`
 * seria recusado pelo validador de enum.
 */
export function buildUsersQuery(args: {
  page: number;
  limit: number;
  filters?: UserFilters;
  sort?: UserSortField;
  order?: UserSortOrder;
}): UsersQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    q: args.filters?.searchString?.trim() || undefined,
    role: args.filters?.role,
    active: args.filters?.active,
    completed: args.filters?.completed,
    sort: args.sort ?? USERS_DEFAULT_SORT,
    order: args.order ?? USERS_DEFAULT_ORDER,
  };
}

/** Formulário vazio, para criar um usuário. */
export function emptyUserForm(): UserFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    role: UserRole.TEACHER,
    active: true,
    completed: false,
    commonUser: true,
    editPassword: true,
    password: "",
    confirmPassword: "",
  };
}

/** Formulário preenchido a partir de um usuário existente. */
export function userToForm(user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
}): UserFormValues {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    active: user.active,
    completed: user.completed,
    commonUser: user.commonUser,
    editPassword: false,
    password: "",
    confirmPassword: "",
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Quantidade mínima de dígitos de um telefone brasileiro com DDD. */
const PHONE_MIN_DIGITS = 10;

/**
 * O que falta preencher.
 *
 * A validação da tela melhora a experiência, mas não substitui a da API: o
 * mesmo payload é validado de novo no NestJS.
 */
export function validateUserForm(
  values: UserFormValues,
  mode: "create" | "edit",
): UserFormErrors {
  const errors: UserFormErrors = {};

  if (values.name.trim().length < NAME_MIN_LENGTH) {
    errors.name = `Informe ao menos ${NAME_MIN_LENGTH} caracteres.`;
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  const phoneDigits = extractPhoneDigits(values.phone);
  if (phoneDigits.length < PHONE_MIN_DIGITS) {
    errors.phone = "Informe o telefone com DDD.";
  }

  const passwordRequired = mode === "create" || values.editPassword;
  if (passwordRequired) {
    if (values.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `A senha precisa de ao menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem.";
    }
  }

  return errors;
}

/** Corpo de `POST /users` a partir do formulário. */
export function toCreateUserRequest(
  values: UserFormValues,
): CreateUserRequest {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
    phone: extractPhoneDigits(values.phone),
    role: values.role,
    active: values.active,
  };
}

/**
 * Corpo de `PUT /users/:id` a partir do formulário.
 *
 * A senha só entra quando a troca foi pedida: mandar string vazia faria a API
 * recusar o payload inteiro pelo tamanho mínimo.
 */
export function toUpdateUserRequest(
  values: UserFormValues,
): UpdateUserRequest {
  const payload: UpdateUserRequest = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: extractPhoneDigits(values.phone),
    role: values.role,
    active: values.active,
    completed: values.completed,
    commonUser: values.commonUser,
  };

  if (values.editPassword && values.password) {
    payload.password = values.password;
  }

  return payload;
}

export { formatPhone };
