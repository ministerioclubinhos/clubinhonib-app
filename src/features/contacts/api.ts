import api from "@/config/axiosConfig";

import { CONTACTS_ENDPOINT } from "./constants";
import { buildContactsQuery } from "./utils";
import type {
  ApiMessage,
  ContactFilters,
  ContactResponse,
  ContactSortField,
  ContactSortOrder,
  Paginated,
} from "./types";

/** Página de contatos, com busca e filtros aplicados pela API. */
export async function apiFetchContacts(
  args: {
    page: number;
    limit: number;
    filters?: ContactFilters;
    sort?: ContactSortField;
    order?: ContactSortOrder;
  },
  options?: { signal?: AbortSignal },
): Promise<Paginated<ContactResponse>> {
  const { data } = await api.get<Paginated<ContactResponse>>(
    CONTACTS_ENDPOINT,
    { params: buildContactsQuery(args), signal: options?.signal },
  );
  return data;
}

export async function apiFetchContact(id: string): Promise<ContactResponse> {
  const { data } = await api.get<ContactResponse>(
    `${CONTACTS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Quantos contatos aguardam leitura. */
export async function apiCountUnreadContacts(): Promise<{ unread: number }> {
  const { data } = await api.get<{ unread: number }>(
    `${CONTACTS_ENDPOINT}/unread-count`,
  );
  return data;
}

export async function apiMarkContactAsRead(
  id: string,
): Promise<ContactResponse> {
  const { data } = await api.patch<ContactResponse>(
    `${CONTACTS_ENDPOINT}/${id}/read`,
  );
  return data;
}

export async function apiMarkContactAsUnread(
  id: string,
): Promise<ContactResponse> {
  const { data } = await api.patch<ContactResponse>(
    `${CONTACTS_ENDPOINT}/${id}/unread`,
  );
  return data;
}

export async function apiDeleteContact(id: string): Promise<ApiMessage> {
  const { data } = await api.delete<ApiMessage>(`${CONTACTS_ENDPOINT}/${id}`);
  return data;
}
