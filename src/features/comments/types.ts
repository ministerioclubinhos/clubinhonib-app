/**
 * Contratos de comentários.
 *
 * Espelham `src/modules/comments/dto` da API campo a campo.
 */

/** Comentário (`CommentResponseDto`). */
export type CommentResponse = {
  id: string;
  name: string;
  comment: string;
  clubinho: string;
  neighborhood: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Página devolvida por `GET /comments`. */
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

/** Campo de ordenação aceito pela API. */
export type CommentSortField = "createdAt" | "name" | "clubinho";
export type CommentSortOrder = "ASC" | "DESC";

/** Filtros da listagem. */
export type CommentFilters = {
  searchString?: string;
  published?: boolean;
};

/** Query string de `GET /comments` (`QueryCommentsDto`). */
export type CommentsQueryParams = {
  page: number;
  limit: number;
  searchString?: string;
  published?: boolean;
  sort: CommentSortField;
  order: CommentSortOrder;
};

/** Corpo de `POST /comments` (`CreateCommentDto`). */
export type CreateCommentRequest = {
  name: string;
  comment: string;
  clubinho: string;
  neighborhood: string;
};

/**
 * Corpo de `PUT /comments/:id` (`UpdateCommentDto`).
 *
 * Todo campo é opcional: altera-se só o que mudou. A publicação tem rota
 * própria (`PATCH /comments/:id/publish`).
 */
export type UpdateCommentRequest = Partial<CreateCommentRequest>;

/** Campos do formulário de edição. */
export type CommentFormValues = CreateCommentRequest;

/** Quais campos obrigatórios estão pendentes. */
export type CommentFormErrors = {
  name: boolean;
  comment: boolean;
  clubinho: boolean;
  neighborhood: boolean;
};

/** Resposta das rotas que só confirmam a operação. */
export type ApiMessage = { message: string };
