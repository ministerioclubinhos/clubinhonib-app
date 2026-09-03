/**
 * Contratos de pagelas.
 *
 * Espelham `src/modules/pagelas/dto` da API, campo a campo. Quando o back
 * mudar, este arquivo muda junto — nada aqui é inferido de uso.
 */

/** Resposta de `/pagelas` (`PagelaResponseDto`). */
export type PagelaResponse = {
  id: string;
  childId: string;
  teacherProfileId: string | null;
  /** Data do encontro, em `YYYY-MM-DD`. */
  referenceDate: string;
  year: number;
  week: number;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Página devolvida por `GET /pagelas/paginated`. */
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

/** Corpo de `POST /pagelas`. */
export type CreatePagelaRequest = {
  childId: string;
  teacherProfileId?: string | null;
  referenceDate: string;
  /** Semana e ano saem do período letivo quando não forem informados. */
  week?: number;
  year?: number;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  notes?: string | null;
};

/** Corpo de `PATCH /pagelas/:id`. */
export type UpdatePagelaRequest = {
  teacherProfileId?: string | null;
  referenceDate?: string;
  week?: number;
  year?: number;
  present?: boolean;
  didMeditation?: boolean;
  recitedVerse?: boolean;
  /** `null` limpa a observação. */
  notes?: string | null;
};

/** Query string de `GET /pagelas/paginated`, espelhando `QueryPagelasDto`. */
export type PagelasQueryParams = {
  page: number;
  limit: number;
  childId?: string;
  year?: number;
  week?: number;
  present?: boolean;
  didMeditation?: boolean;
  recitedVerse?: boolean;
  /** Busca livre por semana e ano: `2026-48`, `2026` ou `48`. */
  searchString?: string;
};

/** Filtros da tela, antes de virarem query string. */
export type PagelaFilters = {
  searchString?: string;
  year?: number;
  week?: number;
  present?: boolean;
  didMeditation?: boolean;
  recitedVerse?: boolean;
};

/** Como a semana da criança foi cumprida. */
export type PagelaStatus = "complete" | "partial" | "absent";

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };
