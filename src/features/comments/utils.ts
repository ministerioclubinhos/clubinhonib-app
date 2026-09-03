import {
  COMMENTS_DEFAULT_ORDER,
  COMMENTS_DEFAULT_SORT,
  EMPTY_VALUE,
} from "./constants";
import type {
  CommentFilters,
  CommentFormErrors,
  CommentFormValues,
  CommentResponse,
  CommentSortField,
  CommentSortOrder,
  CommentsQueryParams,
  UpdateCommentRequest,
} from "./types";

/** Iniciais de quem comentou, para o avatar do card. */
export function commentInitials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Data e hora no formato do país. */
export function formatDateTime(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Query string da listagem, só com o que a API aceita.
 *
 * Filtro vazio não é enviado: `searchString=` peneiraria por texto vazio.
 */
export function buildCommentsQuery(args: {
  page: number;
  limit: number;
  filters?: CommentFilters;
  sort?: CommentSortField;
  order?: CommentSortOrder;
}): CommentsQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    searchString: args.filters?.searchString?.trim() || undefined,
    published: args.filters?.published,
    sort: args.sort ?? COMMENTS_DEFAULT_SORT,
    order: args.order ?? COMMENTS_DEFAULT_ORDER,
  };
}

/** Formulário preenchido a partir de um comentário existente. */
export function toCommentFormValues(
  comment: CommentResponse,
): CommentFormValues {
  return {
    name: comment.name,
    comment: comment.comment,
    clubinho: comment.clubinho,
    neighborhood: comment.neighborhood,
  };
}

/** Quais campos obrigatórios ficaram pendentes. */
export function validateCommentForm(
  values: CommentFormValues,
): CommentFormErrors {
  return {
    name: values.name.trim() === "",
    comment: values.comment.trim() === "",
    clubinho: values.clubinho.trim() === "",
    neighborhood: values.neighborhood.trim() === "",
  };
}

/**
 * Corpo do PUT.
 *
 * Só os campos alterados vão adiante, e `published` fica de fora: publicar tem
 * rota própria. A versão anterior mandava o comentário inteiro com
 * `published: true` embutido, então salvar uma edição publicava sem querer.
 */
export function buildUpdateCommentRequest(
  values: CommentFormValues,
  current: CommentResponse,
): UpdateCommentRequest {
  const request: UpdateCommentRequest = {};

  const name = values.name.trim();
  const comment = values.comment.trim();
  const clubinho = values.clubinho.trim();
  const neighborhood = values.neighborhood.trim();

  if (name !== current.name) request.name = name;
  if (comment !== current.comment) request.comment = comment;
  if (clubinho !== current.clubinho) request.clubinho = clubinho;
  if (neighborhood !== current.neighborhood) {
    request.neighborhood = neighborhood;
  }

  return request;
}
