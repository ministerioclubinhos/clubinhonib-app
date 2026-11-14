/**
 * Contratos de clubinhos.
 *
 * Os tipos de resposta espelham `src/modules/clubs/dto` da API. Quando o back
 * mudar, este arquivo muda junto — nada aqui é inferido de uso.
 */

/** Dias em que um clubinho pode acontecer. Espelha o enum `Weekday` da API. */
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

/** Usuário por trás de um perfil, no recorte que a API devolve em clubinhos. */
export type ClubUserMini = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
};

/** Coordenador do clubinho. */
export type ClubCoordinator = {
  id: string;
  active: boolean;
  user: ClubUserMini | null;
};

/** Professor vinculado ao clubinho. */
export type ClubTeacher = {
  id: string;
  active: boolean;
  user: ClubUserMini | null;
};

/**
 * Endereço no formato devolvido pela API (`ClubAddressResponseDto`).
 *
 * Toda coluna é anulável no banco, então a API devolve `null` em vez de omitir
 * a chave — e o campo nunca some do objeto.
 */
export type ClubAddress = {
  id: string;
  street: string | null;
  number: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  complement: string | null;
};

/** Clubinho sem os vínculos, usado em listas leves (`GET /clubs/all`). */
export type ClubSimpleResponse = {
  id: string;
  number: number;
  weekday: Weekday;
  time: string | null;
  isActive: boolean;
  address: ClubAddress | null;
  createdAt: string;
  updatedAt: string;
};

/** Clubinho completo (`GET /clubs`, `GET /clubs/:id`). */
export type ClubResponse = ClubSimpleResponse & {
  coordinator: ClubCoordinator | null;
  teachers: ClubTeacher[];
};

/** Opção de clubinho nos seletores (`GET /clubs/simple-options`). */
export type ClubSelectOption = {
  id: string;
  /** Rótulo pronto: `Clubinho 12 : Centro`. */
  label: string;
  /** Indica se o clubinho já tem coordenador. */
  coordinator: boolean;
};

/** Página devolvida por `GET /clubs`. */
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

/** Endereço na entrada: só os campos que a API aceita gravar. */
export type ClubAddressInput = {
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  complement?: string;
};

/**
 * Estado do formulário.
 *
 * É o que a tela edita, e não o que vai para a rede: `buildCreateClubRequest` e
 * `buildUpdateClubRequest` fazem a tradução.
 */
export type ClubFormValues = {
  number: number | null;
  weekday: Weekday;
  time: string | null;
  isActive: boolean;
  address: ClubAddressInput;
  coordinatorProfileId: string | null;
  teacherProfileIds: string[];
};

/** Corpo de `POST /clubs`. */
export type CreateClubRequest = {
  number: number;
  weekday: Weekday;
  time?: string;
  isActive?: boolean;
  address?: ClubAddressInput;
  coordinatorProfileId?: string;
  teacherProfileIds?: string[];
};

/** Corpo de `PATCH /clubs/:id`. */
export type UpdateClubRequest = {
  number?: number;
  weekday?: Weekday;
  time?: string | null;
  isActive?: boolean;
  address?: ClubAddressInput;
  coordinatorProfileId?: string | null;
  teacherProfileIds?: string[];
};

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };

/** Filtros da listagem. */
export type ClubFilters = {
  searchString?: string;
  isActive?: boolean;
};

/** Campo de ordenação aceito pela API. */
export type ClubSortField =
  | "number"
  | "weekday"
  | "time"
  | "createdAt"
  | "updatedAt"
  | "city"
  | "state";

export type ClubSortOrder = "ASC" | "DESC";

export type ClubSort = { id: ClubSortField; desc: boolean } | null;

/** Query string de `GET /clubs`, espelhando `QueryClubsDto`. */
export type ClubsQueryParams = {
  page: number;
  limit: number;
  searchString?: string;
  isActive?: boolean;
  sort: ClubSortField;
  order: ClubSortOrder;
};

/** Opções dos seletores do formulário. */
export type CoordinatorOption = { coordinatorProfileId: string; name: string };
export type TeacherOption = {
  teacherProfileId: string;
  name: string;
  vinculado: boolean;
  /** Onde o professor está hoje; `null` quando não tem turma. */
  clubId: string | null;
  clubNumber: number | null;
};
