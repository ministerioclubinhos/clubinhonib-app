import { UserRole } from "@/types/shared";

/** Caminho base dos endpoints de usuário. */
export const USERS_ENDPOINT = "/users";

/** Paginação da listagem administrativa. */
export const USERS_DEFAULT_LIMIT = 12;
export const USERS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Ordenação inicial: quem mudou por último aparece primeiro. */
export const USERS_DEFAULT_SORT = "updatedAt" as const;
export const USERS_DEFAULT_ORDER = "DESC" as const;

/** Papéis que a tela cria e edita. O administrador não é criado por aqui. */
export const USER_ASSIGNABLE_ROLES: readonly UserRole[] = [
  UserRole.COORDINATOR,
  UserRole.TEACHER,
];

/** Rótulo de cada papel, em um lugar só. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.COORDINATOR]: "Coordenador",
  [UserRole.TEACHER]: "Professor",
};

/** Tamanho mínimo da senha, igual ao validador da API. */
export const PASSWORD_MIN_LENGTH = 6;

/** Tamanho mínimo do nome. */
export const NAME_MIN_LENGTH = 2;

/** Texto exibido quando o campo não tem valor. */
export const EMPTY_VALUE = "—";

/** Valor usado quando um filtro de seleção está sem escolha. */
export const ANY_FILTER = "";
