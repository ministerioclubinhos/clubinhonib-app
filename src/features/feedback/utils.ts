import { FeedbackCategory } from '@/store/slices/types';
import {
  CreateFeedbackRequest,
  FeedbackFormErrors,
  FeedbackFormValues,
} from './types';

/** Quais campos obrigatórios ficaram pendentes. */
export const validateFeedbackForm = (
  values: FeedbackFormValues,
): FeedbackFormErrors => ({
  rating: values.rating === null,
  comment: values.comment.trim() === '',
  category: values.category === '',
});

/**
 * Monta só o que a API aceita.
 *
 * Nome e e-mail ficam de fora de propósito: a rota exige autenticação e o
 * servidor assina a avaliação com o perfil. Campos do servidor no corpo fazem
 * a validação global recusar a requisição inteira.
 */
export const buildFeedbackRequest = (
  values: FeedbackFormValues,
): CreateFeedbackRequest => ({
  rating: values.rating as number,
  comment: values.comment.trim(),
  category: values.category as FeedbackCategory,
});
