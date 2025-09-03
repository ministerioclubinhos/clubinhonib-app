// src/modules/coordinator-profiles/types.ts
export const TZ = "America/Manaus";

/* ===== Tipos mínimos ===== */
export type MinimalUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  completed?: boolean;
  commonUser?: boolean;
};

export type MinimalTeacher = {
  id: string;
  active?: boolean;
  user?: MinimalUser;
};

export type ClubSimple = {
  id: string;
  number?: number;
  weekday?: string;
};

export type ClubWithTeachers = ClubSimple & {
  teachers?: MinimalTeacher[];
};

/* ===== DTO principal da lista/detalhe ===== */
export type CoordinatorProfile = {
  id: string; // padronizado como "id"
  active?: boolean;
  user: MinimalUser;
  clubs?: ClubWithTeachers[];
  createdAt?: string;
  updatedAt?: string;
};

/* ===== Resposta paginada ===== */
export type PageDto<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

/* ===== Filtros de UI ===== */
export type CoordinatorFilters = {
  searchString: string;              // <— trocado de q -> searchString
  active: "all" | "active" | "inactive";
  hasClubs: "all" | "yes" | "no";
  clubNumber?: number | "";          // "" = limpar campo
};
