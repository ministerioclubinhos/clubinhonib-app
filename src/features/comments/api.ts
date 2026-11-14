import api from "@/config/axiosConfig";

import { COMMENTS_ENDPOINT } from "./constants";
import { buildCommentsQuery } from "./utils";
import type {
  ApiMessage,
  CommentFilters,
  CommentResponse,
  CommentSortField,
  CommentSortOrder,
  CreateCommentRequest,
  Paginated,
  UpdateCommentRequest,
} from "./types";

/** Página de comentários, com busca e filtros aplicados pela API. */
export async function apiFetchComments(
  args: {
    page: number;
    limit: number;
    filters?: CommentFilters;
    sort?: CommentSortField;
    order?: CommentSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<Paginated<CommentResponse>> {
  const { data } = await api.get<Paginated<CommentResponse>>(
    COMMENTS_ENDPOINT,
    { params: buildCommentsQuery(args), signal: options?.signal },
  );
  return data;
}

/** Comentários publicados, para as telas públicas. */
export async function apiFetchPublishedComments(): Promise<CommentResponse[]> {
  const { data } = await api.get<CommentResponse[]>(
    `${COMMENTS_ENDPOINT}/published`,
  );
  return data;
}

export async function apiCreateComment(
  payload: CreateCommentRequest,
): Promise<CommentResponse> {
  const { data } = await api.post<CommentResponse>(COMMENTS_ENDPOINT, payload);
  return data;
}

export async function apiUpdateComment(
  id: string,
  payload: UpdateCommentRequest,
): Promise<CommentResponse> {
  const { data } = await api.put<CommentResponse>(
    `${COMMENTS_ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

/** Publica ou despublica sem reenviar o comentário inteiro. */
export async function apiPublishComment(id: string): Promise<CommentResponse> {
  const { data } = await api.patch<CommentResponse>(
    `${COMMENTS_ENDPOINT}/${id}/publish`,
  );
  return data;
}

export async function apiUnpublishComment(
  id: string,
): Promise<CommentResponse> {
  const { data } = await api.patch<CommentResponse>(
    `${COMMENTS_ENDPOINT}/${id}/unpublish`,
  );
  return data;
}

/** Quantos comentários aguardam publicação. */
export async function apiCountUnpublishedComments(): Promise<{
  unpublished: number;
}> {
  const { data } = await api.get<{ unpublished: number }>(
    `${COMMENTS_ENDPOINT}/unpublished-count`,
  );
  return data;
}

export async function apiDeleteComment(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(
    `${COMMENTS_ENDPOINT}/${id}`,
  );
  return data;
}
