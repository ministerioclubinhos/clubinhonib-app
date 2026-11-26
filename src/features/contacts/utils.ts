import {
  CONTACTS_DEFAULT_ORDER,
  CONTACTS_DEFAULT_SORT,
  EMPTY_VALUE,
} from "./constants";
import type {
  ContactFilters,
  ContactSortField,
  ContactSortOrder,
  ContactsQueryParams,
} from "./types";

/** Iniciais de quem escreveu, para o avatar do card. */
export function contactInitials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Telefone em `(00) 00000-0000`, ou como veio quando não dá para formatar. */
export function formatPhone(phone?: string | null): string {
  if (!phone) return EMPTY_VALUE;

  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  if (digits.length >= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  return phone;
}

/** Data e hora no formato do país. */
export function formatDateTime(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Só os dígitos, como o WhatsApp espera na URL. */
export function whatsappHref(phone?: string | null): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length < 10) return null;

  // Sem o código do país o link abre vazio; 55 é o padrão local.
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;

  return `https://wa.me/${withCountry}`;
}

/**
 * Query string da listagem, só com o que a API aceita.
 *
 * Filtro vazio não é enviado: `searchString=` peneiraria por texto vazio.
 */
export function buildContactsQuery(args: {
  page: number;
  limit: number;
  filters?: ContactFilters;
  sort?: ContactSortField;
  order?: ContactSortOrder;
}): ContactsQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    searchString: args.filters?.searchString?.trim() || undefined,
    read: args.filters?.read,
    sort: args.sort ?? CONTACTS_DEFAULT_SORT,
    order: args.order ?? CONTACTS_DEFAULT_ORDER,
  };
}
