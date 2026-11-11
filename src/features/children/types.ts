import type { Gender } from "./constants";

/**
 * Contratos de crianças.
 *
 * Espelham `src/modules/children/dto` da API, campo a campo. Quando o back
 * mudar, este arquivo muda junto.
 */

/** Decisão da criança. Espelha o enum `DecisionType` da API. */
export type DecisionType = "ACCEPTED" | "RECONCILED";

/** Decisão registrada, no recorte curto (`AcceptedChristShortDto`). */
export type AcceptedChristShort = {
  id: string;
  decision: DecisionType | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Decisão no contrato completo (`AcceptedChristResponseDto`).
 *
 * A criança entra só pelo id: a resposta não repete responsável, telefone e
 * endereço de quem acabou de ser registrado.
 */
export type AcceptedChristResponse = {
  id: string;
  decision: DecisionType | null;
  childId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Corpo de `POST /accepted-christs` (`CreateAcceptedChristDto`). */
export type CreateAcceptedChristRequest = {
  childId: string;
  /** Obrigatória: a API aplica as regras de decisão a partir do tipo. */
  decision: DecisionType;
  notes?: string | null;
};

/** Endereço no contrato de resposta (`AddressResponseDto`). */
export type ChildAddress = {
  id: string;
  street: string;
  number: string | null;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  complement: string | null;
};

/** Clubinho da criança (`ChildClubDto`). */
export type ChildClub = {
  id: string;
  number: number;
  weekday: string;
};

/** Criança no contrato completo (`ChildResponseDto`). */
export type ChildResponse = {
  id: string;
  name: string;
  /** `YYYY-MM-DD`. */
  birthDate: string;
  guardianName: string;
  gender: Gender;
  guardianPhone: string;
  /** `YYYY-MM-DD`, ou `null` quando não informado. */
  joinedAt: string | null;
  isActive: boolean;
  club: ChildClub | null;
  address: ChildAddress | null;
  createdAt: string;
  updatedAt: string;
};

/** Criança no formato enxuto dos seletores (`ChildListItemDto`). */
export type ChildListItem = {
  id: string;
  name: string;
  guardianName: string;
  gender: Gender;
  guardianPhone: string;
  isActive: boolean;
  clubId: string | null;
  acceptedChrists: AcceptedChristShort[];
};

/** Campo de ordenação aceito pela API (`ChildSortField`). */
export type ChildSortField =
  | "name"
  | "birthDate"
  | "joinedAt"
  | "createdAt"
  | "updatedAt";

export type ChildSortOrder = "ASC" | "DESC";

/** Metadados da paginação (`ChildrenPageMetaDto`). */
export type ChildrenPageMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  orderBy: ChildSortField;
  order: ChildSortOrder;
};

/** Página devolvida pelas listagens (`PaginatedResponseDto`). */
export type PaginatedChildren<T> = {
  data: T[];
  meta: ChildrenPageMeta;
};

/** Filtros da listagem, tal como a tela os mantém. */
export type ChildFilters = {
  searchString?: string;
  /** Filtra pelo clubinho por identidade; prefira este ao número. */
  clubId?: string;
  clubNumber?: number;
  birthDateFrom?: string;
  birthDateTo?: string;
  joinedFrom?: string;
  joinedTo?: string;
  isActive?: boolean;
};

/** Query string de `GET /children` (`QueryChildrenDto`). */
export type ChildrenQueryParams = {
  page: number;
  limit: number;
  searchString?: string;
  clubId?: string;
  clubNumber?: number;
  birthDateFrom?: string;
  birthDateTo?: string;
  joinedFrom?: string;
  joinedTo?: string;
  isActive?: boolean;
  orderBy: ChildSortField;
  order: ChildSortOrder;
};

/** Query string de `GET /children/simple` (`QueryChildrenSimpleDto`). */
export type ChildrenSimpleQueryParams = {
  page: number;
  limit: number;
  searchString?: string;
  isActive?: boolean;
  acceptedChrist?: boolean;
};

/** Endereço na entrada; a API recusa `id`, `createdAt` e `updatedAt`. */
export type ChildAddressInput = {
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  complement?: string;
};

/** Corpo de `POST /children` (`CreateChildDto`). */
export type CreateChildRequest = {
  name: string;
  birthDate: string;
  guardianName: string;
  gender: Gender;
  guardianPhone?: string;
  joinedAt?: string;
  isActive?: boolean;
  clubId?: string;
  address?: ChildAddressInput;
};

/** Corpo de `PUT /children/:id` (`UpdateChildDto`). */
export type UpdateChildRequest = {
  name?: string;
  birthDate?: string;
  guardianName?: string;
  gender?: Gender;
  guardianPhone?: string;
  joinedAt?: string | null;
  isActive?: boolean;
  clubId?: string | null;
  address?: ChildAddressInput | null;
};

/** Valores do formulário de cadastro e edição. */
export type ChildFormValues = {
  id?: string;
  name: string;
  gender: Gender;
  birthDate: string;
  guardianName: string;
  guardianPhone: string;
  joinedAt: string;
  clubId: string | null;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  complement: string;
};

/** Erro por campo do formulário. */
export type ChildFormErrors = Partial<Record<keyof ChildFormValues, string>>;

/** Resposta de `DELETE /children/:id`. */
export type DeleteChildResponse = { ok: true };
