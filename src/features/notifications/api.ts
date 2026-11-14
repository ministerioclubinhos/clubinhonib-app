import api from '@/config/axiosConfig';
import { EMAIL_PREFERENCES_ENDPOINT, NOTIFICATIONS_ENDPOINT } from './constants';
import type {
  MyEmailPreferencesDto,
  UpdateMyEmailPreferencesDto,
  NotificationDetailDto,
  NotificationItemDto,
  NotificationsListQuery,
  NotificationsPageDto,
  NotificationsReadAllDto,
  NotificationSummaryDto,
} from './types';

/*
 * A central mostra os próprios erros (estado de erro e "Tentar novamente");
 * o polling não pode gerar um toast global a cada 30 segundos. Sessão expirada
 * continua passando pelo refresh único do cliente Axios.
 */

export async function fetchNotificationSummary(
  signal?: AbortSignal
): Promise<NotificationSummaryDto> {
  const { data } = await api.get<NotificationSummaryDto>(`${NOTIFICATIONS_ENDPOINT}/summary`, {
    signal,
    skipGlobalError: true,
  });
  return data;
}

export async function fetchNotifications(
  params: NotificationsListQuery,
  signal?: AbortSignal
): Promise<NotificationsPageDto> {
  const { data } = await api.get<NotificationsPageDto>(NOTIFICATIONS_ENDPOINT, {
    params,
    signal,
    skipGlobalError: true,
  });
  return data;
}

export async function fetchNotificationDetail(
  id: string,
  signal?: AbortSignal
): Promise<NotificationDetailDto> {
  const { data } = await api.get<NotificationDetailDto>(`${NOTIFICATIONS_ENDPOINT}/${id}`, {
    signal,
    skipGlobalError: true,
  });
  return data;
}

export async function markNotificationRead(id: string): Promise<NotificationItemDto> {
  const { data } = await api.patch<NotificationItemDto>(
    `${NOTIFICATIONS_ENDPOINT}/${id}/read`,
    undefined,
    { skipGlobalError: true }
  );
  return data;
}

export async function markAllNotificationsRead(): Promise<NotificationsReadAllDto> {
  const { data } = await api.patch<NotificationsReadAllDto>(
    `${NOTIFICATIONS_ENDPOINT}/read-all`,
    undefined,
    { skipGlobalError: true }
  );
  return data;
}

export async function fetchMyEmailPreferences(signal?: AbortSignal): Promise<MyEmailPreferencesDto> {
  const { data } = await api.get<MyEmailPreferencesDto>(EMAIL_PREFERENCES_ENDPOINT, {
    signal,
    skipGlobalError: true,
  });
  return data;
}

export async function updateMyEmailPreferences(
  input: UpdateMyEmailPreferencesDto
): Promise<MyEmailPreferencesDto> {
  const { data } = await api.put<MyEmailPreferencesDto>(EMAIL_PREFERENCES_ENDPOINT, input, {
    skipGlobalError: true,
  });
  return data;
}
