/**
 * Contratos de `GET /club-control/weekly-summary`.
 *
 * Espelham `src/modules/club-control/dto/club-weekly-summary.dto.ts` campo a
 * campo. Nada aqui é derivado na tela: o que o back não promete, a tela não
 * inventa.
 */

/** Situação de um clubinho numa semana. É o enum do back, valor a valor. */
export enum ClubWeekStatus {
  Ok = 'ok',
  Partial = 'partial',
  Missing = 'missing',
  Pending = 'pending',
  Exception = 'exception',
  Inactive = 'inactive',
  OutOfPeriod = 'out_of_period',
}

/** Onde a semana está em relação a hoje. */
export enum ClubWeekTimeline {
  Past = 'past',
  Current = 'current',
  Future = 'future',
}

/** Dia da semana do clubinho, como o back o nomeia. */
export enum ClubWeekday {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
}

export interface ClubWeeklySummaryCounts {
  children: number;
  childrenWithPagela: number;
  childrenMissing: number;
  childrenPresent: number;
  /** Percentual de pagelas lançadas, com uma casa decimal. */
  completionRate: number;
}

export interface ClubWeeklySummaryStatusCounts {
  ok: number;
  partial: number;
  missing: number;
  pending: number;
  exception: number;
  inactive: number;
  outOfPeriod: number;
}

export interface ClubWeeklySummaryClub {
  clubId: string;
  clubNumber: number;
  weekday: ClubWeekday;
  isActive: boolean;
}

export interface ClubWeeklySummaryCell {
  clubId: string;
  clubNumber: number;
  status: ClubWeekStatus;
  expectedDate: string | null;
  exceptionReason: string | null;
  counts: ClubWeeklySummaryCounts;
}

export interface ClubWeeklySummaryWeek {
  week: number;
  startDate: string;
  endDate: string;
  timeline: ClubWeekTimeline;
  counts: ClubWeeklySummaryCounts;
  statusCounts: ClubWeeklySummaryStatusCounts;
  clubs: ClubWeeklySummaryCell[];
}

export interface ClubWeeklySummaryPeriod {
  year: number;
  startDate: string;
  endDate: string;
  totalWeeks: number;
}

export interface ClubWeeklySummaryHighlights {
  weeksElapsed: number;
  counts: ClubWeeklySummaryCounts;
  bestWeek: number | null;
  worstWeek: number | null;
  weeksWithPendency: number;
}

/** Resposta completa do resumo. */
export interface ClubWeeklySummaryResponse {
  year: number;
  availableYears: number[];
  currentWeek: number | null;
  period: ClubWeeklySummaryPeriod | null;
  clubs: ClubWeeklySummaryClub[];
  weeks: ClubWeeklySummaryWeek[];
  highlights: ClubWeeklySummaryHighlights;
}

/** Filtros aceitos pelo endpoint. */
export interface ClubWeeklySummaryQuery {
  year?: number;
  clubId?: string;
}

/** Um ponto da linha do tempo de cobertura. */
export interface WeekCoveragePoint {
  week: number;
  label: string;
  completionRate: number;
  timeline: ClubWeekTimeline;
}

/** Recorte de tempo que a tela mostra por vez. */
export enum RangeGranularity {
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

/** Um recorte navegável: as semanas que ele contém e como se chama. */
export interface WeekRange {
  /** Estável entre recargas: `week:12`, `month:2026-03`, `quarter:2026-1`. */
  id: string;
  /** Nome por extenso, para o navegador. */
  label: string;
  /** Complemento com as datas, quando ajuda a situar. */
  caption: string;
  weeks: ClubWeeklySummaryWeek[];
}

/** O que um clubinho fez dentro do recorte. */
export interface ClubRangeSummary {
  clubId: string;
  clubNumber: number;
  weekday: ClubWeekday;
  isActive: boolean;
  counts: ClubWeeklySummaryCounts;
  /** Semanas do recorte em que o clubinho ficou devendo pagela. */
  weeksWithPendency: number;
  /** Encontros que deviam acontecer: fora dia sem Clubinho e semana futura. */
  meetings: number;
  /**
   * A situação, quando o recorte tem uma semana só.
   *
   * Em mês ou trimestre não existe "a" situação do clubinho — existem quatro
   * ou treze, e resumi-las numa só esconderia justamente a que interessa.
   */
  status: ClubWeekStatus | null;
  expectedDate: string | null;
  exceptionReason: string | null;
}

/** Os números do recorte inteiro. */
export interface RangeTotals {
  counts: ClubWeeklySummaryCounts;
  /** Presença entre quem teve pagela lançada, de 0 a 100. */
  presenceRate: number;
  /** Encontros previstos no recorte (clubinho × semana). */
  meetings: number;
  /** Encontros que caíram em dia sem Clubinho. */
  exceptions: number;
  /** Semanas do recorte em que algum clubinho ficou devendo. */
  weeksWithPendency: number;
  bestWeek: number | null;
  worstWeek: number | null;
}
