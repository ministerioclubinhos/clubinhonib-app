import { FeedbackCategory, FeedbackCategoryLabels } from '@/store/slices/types';

import {
  EMPTY_VALUE,
  FEEDBACKS_DEFAULT_ORDER,
  FEEDBACKS_DEFAULT_SORT,
} from './constants';
import type {
  CreateFeedbackRequest,
  FeedbackFilters,
  FeedbackFormErrors,
  FeedbackFormValues,
  FeedbackResponse,
  FeedbackSortField,
  FeedbackSortOrder,
  FeedbacksQueryParams,
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

/** Rótulo legível da categoria. */
export const feedbackCategoryLabel = (category: FeedbackCategory): string =>
  FeedbackCategoryLabels[category] ?? String(category);

/** Iniciais de quem avaliou, para o avatar do card. */
export const feedbackInitials = (name?: string | null): string => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

/**
 * Cor que traduz a nota.
 *
 * Verde a partir de 4, âmbar no 3, vermelho abaixo disso — a mesma escala das
 * outras listagens administrativas.
 */
export const ratingAccent = (
  rating: number,
): 'success' | 'warning' | 'error' => {
  if (rating >= 4) return 'success';
  if (rating === 3) return 'warning';
  return 'error';
};

/** Data e hora no formato do país. */
export const formatDateTime = (value?: string | null): string => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Query string da listagem, só com o que a API aceita.
 *
 * Filtro vazio não é enviado: `searchString=` peneiraria por texto vazio.
 */
export const buildFeedbacksQuery = (args: {
  page: number;
  limit: number;
  filters?: FeedbackFilters;
  sort?: FeedbackSortField;
  order?: FeedbackSortOrder;
}): FeedbacksQueryParams => ({
  page: args.page,
  limit: args.limit,
  searchString: args.filters?.searchString?.trim() || undefined,
  category: args.filters?.category,
  read: args.filters?.read,
  rating: args.filters?.rating,
  sort: args.sort ?? FEEDBACKS_DEFAULT_SORT,
  order: args.order ?? FEEDBACKS_DEFAULT_ORDER,
});

/** Resumo de uma avaliação, para leitores de tela e tooltips. */
export const feedbackSummary = (feedback: FeedbackResponse): string =>
  `${feedback.name} · ${feedback.rating} de 5 · ${feedbackCategoryLabel(feedback.category)}`;
