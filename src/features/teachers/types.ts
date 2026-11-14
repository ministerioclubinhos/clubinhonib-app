import type { Weekday } from "@/features/clubs/types";

/**
 * Contratos de professores.
 *
 * Espelham `src/modules/teacher-profiles/dto` da API, campo a campo. Quando o
 * back mudar, este arquivo muda junto.
 */

/** Usuário por trás de um perfil (`UserMiniDto`). */
export type TeacherUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
};

/** Coordenador do clubinho (`CoordinatorMiniDto`). */
export type TeacherClubCoordinator = {
  id: string;
  active: boolean;
  user: TeacherUser;
};

/** Clubinho do professor (`ClubMiniWithCoordinatorDto`). */
export type TeacherClub = {
  id: string;
  number: number;
  weekday: Weekday;
  coordinator: TeacherClubCoordinator | null;
};

/** Professor (`TeacherResponseDto`). */
export type TeacherResponse = {
  id: string;
  active: boolean;
  user: TeacherUser;
  club: TeacherClub | null;
  createdAt: string;
  updatedAt: string;
};

/** Professor no formato dos seletores (`TeacherSimpleListDto`). */
export type TeacherSimpleOption = {
  teacherProfileId: string;
  name: string;
  vinculado: boolean;
  /** Onde o professor está hoje; `null` quando não tem turma. */
  clubId: string | null;
  clubNumber: number | null;
};

/** Página devolvida por `GET /teacher-profiles` (`PageDto`). */
export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

/** Campo de ordenação aceito pela API (`TeacherSortField`). */
export type TeacherSortField =
  | "name"
  | "clubNumber"
  | "createdAt"
  | "updatedAt";

export type TeacherSortOrder = "asc" | "desc";

/** Filtros da listagem, tal como a tela os mantém. */
export type TeacherFilters = {
  searchString?: string;
  active?: boolean;
  hasClub?: boolean;
  clubNumber?: number;
};

/** Query string de `GET /teacher-profiles` (`TeacherProfilesQueryDto`). */
export type TeachersQueryParams = {
  page: number;
  limit: number;
  searchString?: string;
  active?: boolean;
  hasClub?: boolean;
  clubNumber?: number;
  sort: TeacherSortField;
  order: TeacherSortOrder;
};

/** Corpo de `PATCH /teacher-profiles/:id/assign-club`. */
export type AssignTeacherClubRequest = { clubId: string };

/** Corpo de `PATCH /teacher-profiles/:id/unassign-club`. */
export type UnassignTeacherClubRequest = { clubId?: string };

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };
