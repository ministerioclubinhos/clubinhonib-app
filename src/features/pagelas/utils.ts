import {
  EMPTY_VALUE,
  PAGELA_MAX_WEEK,
  PAGELA_MAX_YEAR,
  PAGELA_MIN_WEEK,
  PAGELA_MIN_YEAR,
} from "./constants";
import type {
  CreatePagelaRequest,
  PagelaFilters,
  PagelaResponse,
  PagelaStatus,
  PagelasQueryParams,
  UpdatePagelaRequest,
} from "./types";

/**
 * Data `YYYY-MM-DD` em `dd/mm/aaaa`.
 *
 * A data é lida por componentes, e não por `new Date(texto)`: em fuso negativo
 * a string vira meia-noite UTC e a tela mostrava o dia anterior.
 */
export function formatReferenceDate(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return EMPTY_VALUE;

  const [year, month, day] = raw.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return raw;

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/** Rótulo da semana letiva. */
export function formatWeekLabel(year: number, week: number): string {
  return `Semana ${String(week).padStart(2, "0")} · ${year}`;
}

/**
 * Como a semana foi cumprida.
 *
 * Sem presença nada mais conta; presente com meditação e verso é semana
 * completa; o resto é parcial.
 */
export function pagelaStatus(pagela: PagelaResponse): PagelaStatus {
  if (!pagela.present) return "absent";
  if (pagela.didMeditation && pagela.recitedVerse) return "complete";
  return "partial";
}

function isYear(value: number): boolean {
  return (
    Number.isInteger(value) && value >= PAGELA_MIN_YEAR && value <= PAGELA_MAX_YEAR
  );
}

function isWeek(value: number): boolean {
  return (
    Number.isInteger(value) && value >= PAGELA_MIN_WEEK && value <= PAGELA_MAX_WEEK
  );
}

/**
 * Confere se a busca livre chega a filtrar alguma coisa.
 *
 * A API entende `2026-48`, `2026` ou `48` e ignora o resto; saber disso aqui
 * deixa a tela avisar em vez de devolver a lista inteira sem explicação.
 */
export function weekSearchIsMeaningful(searchString?: string): boolean {
  const raw = searchString?.trim();
  if (!raw) return true;

  const parts = raw.split("-");
  if (parts.length === 2) {
    return isYear(Number(parts[0])) || isWeek(Number(parts[1]));
  }

  const value = Number(raw);
  return isYear(value) || isWeek(value);
}

/** Query string da listagem, só com o que a API aceita. */
export function buildPagelasQuery(args: {
  childId: string;
  page: number;
  limit: number;
  filters?: PagelaFilters;
}): PagelasQueryParams {
  const { childId, page, limit, filters } = args;

  return {
    childId,
    page,
    limit,
    searchString: filters?.searchString?.trim() || undefined,
    present: filters?.present,
    didMeditation: filters?.didMeditation,
    recitedVerse: filters?.recitedVerse,
  };
}

/**
 * Corpo do POST.
 *
 * Campo vazio é omitido em vez de enviado como `null`: a criação não tem o que
 * limpar, e a API recusa propriedade que não esteja no DTO.
 */
export function buildCreatePagelaRequest(values: {
  childId: string;
  referenceDate: string;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  week?: number | null;
  year?: number | null;
  teacherProfileId?: string | null;
  notes?: string | null;
}): CreatePagelaRequest {
  const request: CreatePagelaRequest = {
    childId: values.childId,
    referenceDate: values.referenceDate,
    present: values.present,
    didMeditation: values.didMeditation,
    recitedVerse: values.recitedVerse,
  };

  if (values.week != null) request.week = values.week;
  if (values.year != null) request.year = values.year;
  if (values.teacherProfileId) {
    request.teacherProfileId = values.teacherProfileId;
  }
  if (values.notes?.trim()) request.notes = values.notes.trim();

  return request;
}

/**
 * Corpo do PATCH.
 *
 * Aqui `null` é informação: limpa a observação e desvincula o professor. O que
 * for `undefined` fica como está.
 */
export function buildUpdatePagelaRequest(
  changes: UpdatePagelaRequest,
): UpdatePagelaRequest {
  const request: UpdatePagelaRequest = {};

  if (changes.referenceDate !== undefined) {
    request.referenceDate = changes.referenceDate;
  }
  if (changes.week !== undefined) request.week = changes.week;
  if (changes.year !== undefined) request.year = changes.year;
  if (changes.present !== undefined) request.present = changes.present;
  if (changes.didMeditation !== undefined) {
    request.didMeditation = changes.didMeditation;
  }
  if (changes.recitedVerse !== undefined) {
    request.recitedVerse = changes.recitedVerse;
  }
  if (changes.notes !== undefined) {
    request.notes = changes.notes?.trim() ? changes.notes.trim() : null;
  }
  if (changes.teacherProfileId !== undefined) {
    request.teacherProfileId = changes.teacherProfileId;
  }

  return request;
}
