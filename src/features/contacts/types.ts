/**
 * Contratos de contatos.
 *
 * Espelham `src/modules/contacts/dto` da API campo a campo. Antes a rota
 * devolvia a entidade crua e o tipo daqui era um palpite.
 */

/** Mensagem de contato (`ContactResponseDto`). */
export type ContactResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Página devolvida por `GET /contact`. */
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

/** Campo de ordenação aceito pela API. */
export type ContactSortField = "createdAt" | "name" | "email";
export type ContactSortOrder = "ASC" | "DESC";

/** Filtros da listagem. */
export type ContactFilters = {
  searchString?: string;
  read?: boolean;
};

/** Query string de `GET /contact` (`QueryContactsDto`). */
export type ContactsQueryParams = {
  page: number;
  limit: number;
  searchString?: string;
  read?: boolean;
  sort: ContactSortField;
  order: ContactSortOrder;
};

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };

export type SnackbarKind = "success" | "error";
