import api from '@/config/axiosConfig';

import { FEEDBACKS_ENDPOINT } from './constants';
import { buildFeedbacksQuery } from './utils';
import type {
  ApiMessage,
  CreateFeedbackRequest,
  FeedbackFilters,
  FeedbackResponse,
  FeedbackSortField,
  FeedbackSortOrder,
  Paginated,
} from './types';

/** Envia uma avaliação do site. */
export async function apiCreateFeedback(
  payload: CreateFeedbackRequest,
): Promise<FeedbackResponse> {
  const { data } = await api.post<FeedbackResponse>(
    FEEDBACKS_ENDPOINT,
    payload,
  );
  return data;
}

/** Página de avaliações, com busca e filtros aplicados pela API. */
export async function apiFetchFeedbacks(
  args: {
    page: number;
    limit: number;
    filters?: FeedbackFilters;
    sort?: FeedbackSortField;
    order?: FeedbackSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<Paginated<FeedbackResponse>> {
  const { data } = await api.get<Paginated<FeedbackResponse>>(
    FEEDBACKS_ENDPOINT,
    { params: buildFeedbacksQuery(args), signal: options?.signal },
  );
  return data;
}

export async function apiFetchFeedback(id: string): Promise<FeedbackResponse> {
  const { data } = await api.get<FeedbackResponse>(
    `${FEEDBACKS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Quantas avaliações aguardam leitura. */
export async function apiCountUnreadFeedbacks(): Promise<{ unread: number }> {
  const { data } = await api.get<{ unread: number }>(
    `${FEEDBACKS_ENDPOINT}/unread-count`,
  );
  return data;
}

export async function apiMarkFeedbackAsRead(
  id: string,
): Promise<FeedbackResponse> {
  const { data } = await api.patch<FeedbackResponse>(
    `${FEEDBACKS_ENDPOINT}/${id}/read`,
  );
  return data;
}

export async function apiMarkFeedbackAsUnread(
  id: string,
): Promise<FeedbackResponse> {
  const { data } = await api.patch<FeedbackResponse>(
    `${FEEDBACKS_ENDPOINT}/${id}/unread`,
  );
  return data;
}

export async function apiDeleteFeedback(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(
    `${FEEDBACKS_ENDPOINT}/${id}`,
  );
  return data;
}
