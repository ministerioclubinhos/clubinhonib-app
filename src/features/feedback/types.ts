import { FeedbackCategory } from '@/store/slices/types';

/** Avaliação do site, como a API devolve. */
export interface FeedbackResponse {
  id: string;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  category: FeedbackCategory;
  read: boolean;
  createdAt: string;
  updatedAt: string;
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
