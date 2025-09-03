// types.ts
export const TZ = "America/Manaus";

export type MinimalUser = { id: string; name?: string; email?: string; phone?: string };

export type ClubSimple = { id: string; number?: number; weekday?: string };

export type TeacherProfile = {
  /** Garantimos "id" pois a tabela e mutações usam row.original.id */
  id: string;
  user: MinimalUser;
  club?: (ClubSimple & {
    coordinator?: { user?: MinimalUser } | null;
  }) | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** mantido se você já usava em algum lugar */
  vinculado?: boolean;
};

/** Resposta paginada genérica do backend */
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

/** Filtros e paginação/ordenação aceitos pelo endpoint */
export type TeacherQuery = {
  searchString?: string; // ou q
  q?: string;
  active?: boolean;
  hasClub?: boolean;
  clubNumber?: number;
  page?: number;   // 1-based
  limit?: number;  // itens por página
  sort?: "updatedAt" | "createdAt" | "name" | "clubNumber";
  order?: "asc" | "desc";
};
