import type { Weekday } from "@/features/clubs/types";

/**
 * Contratos de coordenadores.
 *
 * Espelham `src/modules/coordinator-profiles/dto` da API, campo a campo.
 * Quando o back mudar, este arquivo muda junto.
 */

/** Usuário por trás de um perfil (`UserMiniDto`). */
export type CoordinatorUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
};

/** Professor de um clubinho do coordenador (`TeacherMiniDto`). */
export type CoordinatorClubTeacher = {
  id: string;
  active: boolean;
  user: CoordinatorUser;
};

/** Clubinho sob a coordenação (`ClubWithTeachersDto`). */
export type CoordinatorClub = {
  id: string;
  number: number;
  weekday: Weekday;
  teachers: CoordinatorClubTeacher[];
};

/** Coordenador (`CoordinatorResponseDto`). */
export type CoordinatorResponse = {
  id: string;
  active: boolean;
  user: CoordinatorUser;
  clubs: CoordinatorClub[];
  createdAt: string;
  updatedAt: string;
};

/** Coordenador no formato dos seletores (`CoordinatorSimpleListDto`). */
export type CoordinatorSimpleOption = {
  coordinatorProfileId: string;
  name: string;
  vinculado: boolean;
};

/** Página devolvida por `GET /coordinator-profiles` (`PageDto`). */
export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

/** Campo de ordenação aceito pela API (`CoordinatorSortField`). */
export type CoordinatorSortField = "name" | "createdAt" | "updatedAt";

export type CoordinatorSortOrder = "asc" | "desc";

/** Filtros da listagem, tal como a tela os mantém. */
export type CoordinatorFilters = {
  searchString?: string;
  active?: boolean;
  hasClubs?: boolean;
  clubNumber?: number;
};

/** Query string de `GET /coordinator-profiles`. */
export type CoordinatorsQueryParams = {
  page: number;
  limit: number;
  searchString?: string;
  active?: boolean;
  hasClubs?: boolean;
  clubNumber?: number;
  sort: CoordinatorSortField;
  order: CoordinatorSortOrder;
};

/** Corpo de `PATCH /coordinator-profiles/:id/assign-club`. */
export type AssignCoordinatorClubRequest = { clubId: string };

/** Corpo de `PATCH /coordinator-profiles/:id/unassign-club`. */
export type UnassignCoordinatorClubRequest = { clubId: string };

/** Corpo de `PATCH /coordinator-profiles/:id/move-club`. */
export type MoveCoordinatorClubRequest = {
  clubId: string;
  toCoordinatorProfileId: string;
};

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };
