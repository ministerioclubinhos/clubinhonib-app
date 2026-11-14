import { UserRole } from "@/types/shared";

/**
 * Contratos de usuários.
 *
 * Espelham `src/core/user/dto/user-response.dto.ts` e
 * `src/core/user/dto/get-users-query.dto.ts` da API, campo a campo. Quando o
 * back mudar, este arquivo muda junto.
 */

/** Usuário na administração (`UserResponseDto`). */
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string | null;
  role: UserRole;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Campo de ordenação aceito por `GET /users` (`UserSortField`). */
export type UserSortField =
  | "name"
  | "email"
  | "phone"
  | "role"
  | "createdAt"
  | "updatedAt";

export type UserSortOrder = "ASC" | "DESC";

/** Metadados da paginação (`UsersPageMetaDto`). */
export type UsersPageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort: UserSortField;
  order: UserSortOrder;
};

/** Página devolvida por `GET /users` (`PaginatedUsersResponseDto`). */
export type PaginatedUsersResponse = {
  items: UserResponse[];
  meta: UsersPageMeta;
};

/** Filtros da listagem, tal como a tela os mantém. */
export type UserFilters = {
  searchString?: string;
  role?: UserRole;
  active?: boolean;
  completed?: boolean;
};

/** Query string de `GET /users` (`GetUsersQueryDto`). */
export type UsersQueryParams = {
  page: number;
  limit: number;
  q?: string;
  role?: UserRole;
  active?: boolean;
  completed?: boolean;
  sort: UserSortField;
  order: UserSortOrder;
};

/** Corpo de `POST /users` (`CreateUserDto`). */
export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  active?: boolean;
};

/** Corpo de `PUT /users/:id` (`UpdateUserDto`). */
export type UpdateUserRequest = {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  active?: boolean;
  completed?: boolean;
  commonUser?: boolean;
  password?: string;
};

/**
 * Valores do formulário.
 *
 * A confirmação de senha e o interruptor de troca de senha só existem na tela;
 * nenhum dos dois vai para a API.
 */
export type UserFormValues = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
  editPassword: boolean;
  password: string;
  confirmPassword: string;
};

/** Erro por campo do formulário. */
export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };
