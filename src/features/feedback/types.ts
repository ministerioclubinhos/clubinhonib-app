import { FeedbackCategory } from '@/store/slices/types';

/**
 * Avaliação do site (`SiteFeedbackResponseDto`).
 *
 * Espelha o contrato da API campo a campo; `email` vem `null` nas avaliações
 * antigas, gravadas antes de a rota exigir autenticação.
 */
export interface FeedbackResponse {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  comment: string;
  category: FeedbackCategory;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Página devolvida por `GET /site-feedbacks`. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo de ordenação aceito pela API. */
export type FeedbackSortField = 'createdAt' | 'rating' | 'name' | 'category';
export type FeedbackSortOrder = 'ASC' | 'DESC';

/** Filtros da listagem administrativa. */
export interface FeedbackFilters {
  searchString?: string;
  category?: FeedbackCategory;
  read?: boolean;
  rating?: number;
}

/** Query string de `GET /site-feedbacks` (`QueryFeedbacksDto`). */
export interface FeedbacksQueryParams {
  page: number;
  limit: number;
  searchString?: string;
  category?: FeedbackCategory;
  read?: boolean;
  rating?: number;
  sort: FeedbackSortField;
  order: FeedbackSortOrder;
}

/** Resposta das rotas que só confirmam a operação. */
export interface ApiMessage {
  message: string;
}

/**
 * Corpo aceito por `POST /site-feedbacks`.
 *
 * Só o que a pessoa preenche. **Nome e e-mail não vão aqui**: a rota exige
 * autenticação e a API assina a avaliação com os dados do perfil. `id`,
 * `createdAt`, `updatedAt` e `read` também são do servidor — mandá-los faz a
 * API recusar a requisição inteira.
 */
export interface CreateFeedbackRequest {
  rating: number;
  comment: string;
  category: FeedbackCategory;
}

/** Campos do formulário de avaliação. */
export interface FeedbackFormValues {
  rating: number | null;
  comment: string;
  category: FeedbackCategory | '';
}

/** Quais campos obrigatórios estão pendentes. */
export interface FeedbackFormErrors {
  rating: boolean;
  comment: boolean;
  category: boolean;
}
