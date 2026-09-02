import api from '@/config/axiosConfig';
import { EVENTS_ENDPOINT, MULTIPART_HEADERS } from './constants';
import { EventResponse } from './types';

/** Lista todos os eventos, do mais antigo para o mais novo. */
export async function apiListEvents(): Promise<EventResponse[]> {
  const { data } = await api.get<EventResponse[]>(EVENTS_ENDPOINT);
  return data ?? [];
}

/** Eventos de hoje em diante. */
export async function apiListUpcomingEvents(): Promise<EventResponse[]> {
  const { data } = await api.get<EventResponse[]>(
    `${EVENTS_ENDPOINT}/upcoming`,
  );
  return data ?? [];
}

/** Carrega um evento pelo id. */
export async function apiGetEvent(id: string): Promise<EventResponse> {
  const { data } = await api.get<EventResponse>(`${EVENTS_ENDPOINT}/${id}`);
  return data;
}

/** Cria um evento a partir do corpo multipart. */
export async function apiCreateEvent(
  formData: FormData,
): Promise<EventResponse> {
  const { data } = await api.post<EventResponse>(EVENTS_ENDPOINT, formData, {
    headers: MULTIPART_HEADERS,
  });
  return data;
}

/** Atualiza um evento a partir do corpo multipart. */
export async function apiUpdateEvent(
  id: string,
  formData: FormData,
): Promise<EventResponse> {
  const { data } = await api.patch<EventResponse>(
    `${EVENTS_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Exclui o evento e a mídia dele. */
export async function apiDeleteEvent(id: string): Promise<void> {
  await api.delete(`${EVENTS_ENDPOINT}/${id}`);
}
