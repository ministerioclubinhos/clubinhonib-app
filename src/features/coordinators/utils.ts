import { WEEKDAY_LABELS } from "@/features/clubs/constants";
import { formatPhone } from "@/utils/phone";

import {
  COORDINATORS_DEFAULT_ORDER,
  COORDINATORS_DEFAULT_SORT,
  EMPTY_VALUE,
} from "./constants";
import type {
  CoordinatorClub,
  CoordinatorFilters,
  CoordinatorResponse,
  CoordinatorSortField,
  CoordinatorSortOrder,
  CoordinatorsQueryParams,
} from "./types";

/** Nome de exibição do coordenador; sem nome, vale o e-mail. */
export function coordinatorName(coordinator: CoordinatorResponse): string {
  return coordinator.user?.name || coordinator.user?.email || EMPTY_VALUE;
}

/** Iniciais do nome, para o avatar do card. */
export function coordinatorInitials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Todos os professores dos clubinhos do coordenador, sem repetição. */
export function coordinatorTeachers(
  coordinator: CoordinatorResponse,
): CoordinatorClub["teachers"] {
  const byId = new Map<string, CoordinatorClub["teachers"][number]>();

  for (const club of coordinator.clubs ?? []) {
    for (const teacher of club.teachers ?? []) {
      byId.set(teacher.id, teacher);
    }
  }

  return [...byId.values()];
}

/** `Clubinho 12 · Sábado`. */
export function clubLabel(club: CoordinatorClub): string {
  const weekday = WEEKDAY_LABELS[club.weekday];
  return weekday ? `Clubinho ${club.number} · ${weekday}` : `Clubinho ${club.number}`;
}

/** Data no formato do país. */
export function formatDate(value?: string | null): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Query string da listagem, só com o que a API aceita.
 *
 * Filtro vazio não é enviado: `searchString=` peneiraria por texto vazio.
 */
export function buildCoordinatorsQuery(args: {
  page: number;
  limit: number;
  filters?: CoordinatorFilters;
  sort?: CoordinatorSortField;
  order?: CoordinatorSortOrder;
}): CoordinatorsQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    searchString: args.filters?.searchString?.trim() || undefined,
    active: args.filters?.active,
    hasClubs: args.filters?.hasClubs,
    clubNumber: args.filters?.clubNumber,
    sort: args.sort ?? COORDINATORS_DEFAULT_SORT,
    order: args.order ?? COORDINATORS_DEFAULT_ORDER,
  };
}

export { formatPhone };
