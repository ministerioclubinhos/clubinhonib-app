import { WEEKDAY_LABELS } from "@/features/clubs/constants";
import { formatPhone } from "@/utils/phone";

import {
  EMPTY_VALUE,
  TEACHERS_DEFAULT_ORDER,
  TEACHERS_DEFAULT_SORT,
} from "./constants";
import type {
  TeacherClub,
  TeacherFilters,
  TeacherResponse,
  TeacherSortField,
  TeacherSortOrder,
  TeachersQueryParams,
} from "./types";

/** Nome de exibição do professor; sem nome, vale o e-mail. */
export function teacherName(teacher: TeacherResponse): string {
  return teacher.user?.name || teacher.user?.email || EMPTY_VALUE;
}

/** Iniciais do nome, para o avatar do card. */
export function teacherInitials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Nome do coordenador do clubinho do professor. */
export function teacherCoordinatorName(club: TeacherClub | null): string {
  return (
    club?.coordinator?.user?.name ||
    club?.coordinator?.user?.email ||
    EMPTY_VALUE
  );
}

/** `Clubinho 12 · Sábado`, ou o aviso de que não há vínculo. */
export function clubLabel(club: TeacherClub | null): string {
  if (!club) return "Sem clubinho";

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
export function buildTeachersQuery(args: {
  page: number;
  limit: number;
  filters?: TeacherFilters;
  sort?: TeacherSortField;
  order?: TeacherSortOrder;
}): TeachersQueryParams {
  return {
    page: args.page,
    limit: args.limit,
    searchString: args.filters?.searchString?.trim() || undefined,
    active: args.filters?.active,
    hasClub: args.filters?.hasClub,
    clubNumber: args.filters?.clubNumber,
    sort: args.sort ?? TEACHERS_DEFAULT_SORT,
    order: args.order ?? TEACHERS_DEFAULT_ORDER,
  };
}

export { formatPhone };
