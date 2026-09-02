import api from '@/config/axiosConfig';
import { FeedbackData } from '@/store/slices/feedback/feedbackSlice';
import { FEEDBACKS_ENDPOINT } from './constants';
import { CreateFeedbackRequest, FeedbackResponse } from './types';

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

export async function apiListFeedbacks(): Promise<FeedbackData[]> {
  const { data } = await api.get<FeedbackData[]>("/site-feedbacks");
  return Array.isArray(data) ? data : [];
}

export async function apiDeleteFeedback(id: string): Promise<void> {
  await api.delete(`/site-feedbacks/${id}`);
}

export async function apiMarkAsRead(id: string): Promise<FeedbackData> {
  const { data } = await api.patch<FeedbackData>(`/site-feedbacks/${id}/read`);
  return data;
}
