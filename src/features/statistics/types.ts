/**
 * Contratos de `/statistics`.
 *
 * Ficavam dentro de `api.ts`, que por isso tinha 728 linhas — mais de 680 só de
 * declaração. Separar deixa o `api.ts` com as chamadas e nada mais.
 *
 * Os nomes acompanham os DTOs do back (`src/modules/statistics/dto`), e as
 * fórmulas por trás de cada número estão em `clubinhonib-api/docs/api-statistics.md`.
 */

/** Uma semana no recorte de pagelas (`WeeklyPagelaStatsDto` no back). */
export interface WeeklyPagelaStats {
  year: number;
  week: number;
  totalPagelas: number;
  presentCount: number;
  didMeditationCount: number;
  recitedVerseCount: number;
  presenceRate: number;
  meditationRate: number;
  verseRecitationRate: number;
  uniqueChildren: number;
  uniqueTeachers: number;
}

/** Uma criança no topo do recorte de pagelas. */
export interface PagelaTopPerformer {
  childId: string;
  childName: string;
  presenceCount: number;
  meditationCount: number;
  verseRecitationCount: number;
}

/** Um período no recorte de decisões (`AcceptedChristPeriodStatsDto` no back). */
export interface AcceptedChristPeriodStats {
  period: string;
  totalDecisions: number;
  byDecisionType: Partial<Record<string, number>>;
  uniqueChildren: number;
}

/** Uma decisão recente, como a lista da tela a mostra. */
export interface RecentDecision {
  id: string;
  childId: string;
  childName: string;
  decision: string | null;
  createdAt: string;
  notes?: string | null;
}

// --- Enums & Common Types ---

export enum PeriodShortcut {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  THIS_YEAR = 'this_year',
  CUSTOM = 'custom'
}

export type GroupBy = 'day' | 'week' | 'month' | 'year';

export enum DecisionType {
  ACCEPTED = 'ACCEPTED',
  RECONCILED = 'RECONCILED'
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationMeta { // Kept for compatibility if needed, but PaginationInfo is preferred by doc
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// --- Query DTOs ---

export interface PagelasStatsQueryDto {
  period?: PeriodShortcut;
  year?: number;
  week?: number;
  startDate?: string;
  endDate?: string;
  clubId?: string;
  teacherId?: string;
  coordinatorId?: string;
  gender?: 'M' | 'F';
  minAge?: number;
  maxAge?: number;
  city?: string;
  state?: string;
  district?: string;
  joinedAfter?: string;
  joinedBefore?: string;
  onlyPresent?: boolean;
  onlyDidMeditation?: boolean;
  onlyRecitedVerse?: boolean;
  groupBy?: GroupBy;
}

export interface ChildrenStatsQueryDto {
  period?: PeriodShortcut;
  year?: number;
  startDate?: string;
  endDate?: string;
  clubId?: string;
  teacherId?: string;
  coordinatorId?: string;
  gender?: 'M' | 'F';
  minAge?: number;
  maxAge?: number;
  ageGroup?: '0-5' | '6-10' | '11-15' | '16+';
  city?: string;
  state?: string;
  district?: string;
  joinedAfter?: string;
  joinedBefore?: string;
  minPagelas?: number;
  minPresenceRate?: number;
  maxPresenceRate?: number;
  minEngagementScore?: number;
  maxEngagementScore?: number;
  hasDecision?: boolean;
  decisionType?: DecisionType;
  isActive?: boolean;
  hasLowEngagement?: boolean;
  isNewcomer?: boolean;
  isVeteran?: boolean;
  search?: string;
  sortBy?: 'name' | 'age' | 'engagementScore' | 'presenceRate';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ClubsStatsQueryDto {
  period?: PeriodShortcut;
  year?: number;
  startDate?: string;
  endDate?: string;
  coordinatorId?: string;
  weekday?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  city?: string;
  state?: string;
  district?: string;
  minChildren?: number;
  maxChildren?: number;
  minPresenceRate?: number;
  maxPresenceRate?: number;
  minPerformanceScore?: number;
  maxPerformanceScore?: number;
  minDecisions?: number;
  minTeachers?: number;
  sortBy?: 'clubNumber' | 'performanceScore' | 'presenceRate' | 'totalChildren' | 'totalDecisions';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface TeachersStatsQueryDto {
  period?: PeriodShortcut;
  year?: number;
  startDate?: string;
  endDate?: string;
  clubId?: string;
  coordinatorId?: string;
  city?: string;
  state?: string;
  minPagelas?: number;
  minChildren?: number;
  minPresenceRate?: number;
  maxPresenceRate?: number;
  minEffectivenessScore?: number;
  maxEffectivenessScore?: number;
  minDecisions?: number;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'effectivenessScore' | 'presenceRate' | 'totalChildren';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface AcceptedChristsStatsQueryDto {
  period?: PeriodShortcut;
  /** O back declara `year` neste DTO; faltava aqui. */
  year?: number;
  startDate?: string;
  endDate?: string;
  clubId?: string;
  coordinatorId?: string;
  decision?: DecisionType;
  gender?: 'M' | 'F';
  minAge?: number;
  maxAge?: number;
  city?: string;
  state?: string;
  district?: string;
  joinedAfter?: string;
  joinedBefore?: string;
  groupBy?: GroupBy;
}

// --- Response Objects Helpers ---

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface SeriesDataPoint {
  date: string;
  series: {
    [key: string]: number;
  };
}

export interface ChildStat {
  childId: string;
  name: string;
  gender: string;
  age: number;
  birthDate?: string;
  joinedAt?: string | null;
  monthsParticipating: number;
  participationTimeRange?: string;
  club: {
    id: string;
    number: number;
    weekday: string;
  } | null;
  address: {
    city: string;
    state: string;
    district?: string;
  } | null;
  stats: {
    totalPagelas: number;
    presenceCount?: number;
    meditationCount?: number;
    verseRecitationCount?: number;
    presenceRate: number;
    meditationRate?: number;
    verseRecitationRate?: number;
    engagementScore: number;
    consecutiveWeeks?: number;
    lastPagelaDate: string | null;
  };
  decisions: {
    hasDecision: boolean;
    decisionType: string | null;
    decisionDate?: string;
    totalDecisions?: number;
  };
  isActive: boolean;
  rank: number;
}

export interface ClubStat {
  clubId: string;
  clubNumber: number;
  weekday: string;
  time: string;
  address: {
    city: string;
    state: string;
    district: string;
    street: string;
  };
  coordinator: {
    id: string;
    name: string;
  } | null;
  children: {
    total: number;
    active: number;
    byGender: { M: number; F: number };
    withDecisions: number;
    avgAge?: number;
  };
  teachers: {
    total: number;
    active: number;
    list: Array<{ id: string; name: string }>;
  };
  performance: {
    totalPagelas: number;
    presenceRate: number;
    meditationRate: number;
    verseRecitationRate?: number;
    performanceScore: number;
    totalDecisions: number;
  };
  /** `null` (ou ausente) quando o clubinho nunca lançou pagela. */
  lastActivity?: {
    date: string | null;
    type: string;
  } | null;
  rank: number;
}

export interface TeacherStat {
  teacherId: string;
  name: string;
  club: {
    id: string;
    number: number;
    weekday: string;
    city: string;
    state: string;
  } | null;
  coordinator: {
    id: string;
    name: string;
  } | null;
  children: {
    total: number;
    unique: number;
    active: number;
    withDecisions: number;
    avgEngagement?: number;
  };
  performance: {
    totalPagelas: number;
    avgPresenceRate: number;
    avgMeditationRate: number;
    avgVerseRate: number;
    effectivenessScore: number;
  };
  /** `null` (ou ausente) quando o professor nunca lançou pagela. */
  lastActivity?: {
    date: string | null;
    totalPagelas: number;
  } | null;
  isActive: boolean;
  rank: number;
}

export interface MissingWeekDto {
  year: number;
  week: number;
  expectedDate: string;
  weekRange: {
    start: string;
    end: string;
  };
  reason: string;
  severity: 'info' | 'warning' | 'critical';
  expectedChildren?: number;
}

// --- Response DTOs ---

export interface OverviewStatsResponseDto {
  summary: {
    totalChildren: number;
    totalClubs: number;
    totalTeachers: number;
    activeChildrenThisMonth: number;
    activeTeachersThisMonth: number;
    inactiveChildren: number;
    inactiveClubs: number;
  };
  pagelas: {
    thisWeek: {
      total: number;
      presenceRate: number;
      meditationRate: number;
      verseRecitationRate: number;
    };
    thisMonth: {
      total: number;
      presenceRate: number;
      meditationRate: number;
      verseRecitationRate: number;
    };
    lastSixWeeks: Array<{
      week: number;
      year: number;
      total: number;
      presenceRate: number;
    }>;
  };
  acceptedChrists: {
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    byDecisionType: Record<string, number>;
    lastSixMonths: Array<{ month: string; total: number }>;
  };
  engagement?: {
    avgEngagementScore: number;
    topPerformingClubs: Array<{
      clubId: string;
      clubNumber: number;
      performanceScore: number;
      city: string;
    }>;
    topEngagedChildren: Array<{
      childId: string;
      name: string;
      engagementScore: number;
      clubNumber: number;
    }>;
    recentActivity: {
      last7Days: number;
      last30Days: number;
    };
  };
  indicators?: {
    clubsWithLowAttendance: number;
    childrenWithLowEngagement: number;
    clubsMissingPagelas: number;
    growthRate: {
      children: number;
      decisions: number;
    };
  };
  quickStats?: {
    childrenByGender: { M: number; F: number };
    clubsByState: Array<{ state: string; count: number }>;
    topCities: Array<{ city: string; state: string; totalChildren: number; totalClubs: number }>;
  };
}

export interface PagelasChartDataDto {
  timeSeries?: {
    presence: TimeSeriesDataPoint[];
    meditation: TimeSeriesDataPoint[];
    verseRecitation: TimeSeriesDataPoint[];
    total: TimeSeriesDataPoint[];
  };
  byGender?: Array<{
    gender: string;
    total: number;
    presenceRate: number;
    meditationRate: number;
    verseRecitationRate: number;
  }>;
  byAgeGroup?: Array<{
    ageGroup: string;
    total: number;
    presenceRate: number;
    meditationRate: number;
    verseRecitationRate: number;
  }>;
  byClub?: Array<{ clubId: string; clubNumber: number; total: number; presenceRate: number }>;
  byTeacher?: Array<{ teacherId: string; teacherName: string; total: number; presenceRate?: number }>;
  byCity?: Array<{ city: string; state: string; total: number; uniqueChildren: number; presenceRate: number; meditationRate: number; verseRecitationRate: number }>;
  byParticipationTime?: Array<{ timeRange: string; total: number; uniqueChildren: number; presenceRate: number; meditationRate: number; verseRecitationRate: number; avgMonthsParticipating: number }>;
}

export interface AcceptedChristsChartDataDto {
  timeSeries: SeriesDataPoint[];
  byGender: Array<{
    gender: string;
    total: number;
    accepted: number;
    reconciled: number;
  }>;
  byAgeGroup: Array<{
    ageGroup: string;
    total: number;
    accepted: number;
    reconciled: number;
  }>;
  byClub: Array<{
    clubId: string;
    clubNumber: number;
    total: number;
    accepted: number;
    reconciled?: number;
  }>;
  byCity: Array<{
    city: string;
    state: string;
    total: number;
    accepted: number;
    reconciled?: number;
  }>;
  byParticipationTime: Array<{
    timeRange: string;
    total: number;
    accepted: number;
    reconciled?: number;
    avgMonthsParticipating: number;
  }>;
  // `conversionFunnel` saiu daqui: o DTO do back o declara como opcional, mas
  // nenhum serviço o preenche — a tela tipava um dado que nunca chega.
}

export interface CombinedInsightsDto {
  topEngagedChildren: Array<{
    childId: string;
    childName: string;
    gender: string;
    age: number;
    clubNumber: number;
    engagementScore: number;
    totalPagelas: number;
    presenceRate: number;
    hasDecision: boolean;
    decisionType: string;
    city?: string;
    state?: string;
    monthsParticipating?: number;
  }>;
  clubRankings: Array<{
    clubId: string;
    clubNumber: number;
    totalChildren: number;
    avgPresenceRate: number;
    totalDecisions: number;
    performanceScore: number;
  }>;
  // `teacherEffectiveness` e `trends` saíram daqui: o DTO do back os declara
  // como opcionais, mas `/statistics/insights` nunca os preenche.
}

export interface PagelasStatsResponseDto {
  period: {
    startDate: string;
    endDate: string;
    year: number;
  };
  overall: {
    totalPagelas: number;
    totalChildren: number;
    totalTeachers: number;
    averagePresenceRate: number;
    averageMeditationRate: number;
    averageVerseRecitationRate: number;
  };
  byWeek?: WeeklyPagelaStats[];
  topPerformers?: PagelaTopPerformer[];
}

export interface AcceptedChristsStatsResponseDto {
  period: {
    startDate?: string;
    endDate?: string;
  };
  overall: {
    totalDecisions: number;
    uniqueChildren: number;
    /**
     * As chaves são as do enum (`ACCEPTED`/`RECONCILED`), e um tipo sem
     * nenhuma decisão no recorte simplesmente não vem.
     */
    byDecisionType: Partial<Record<DecisionType, number>>;
  };
  byPeriod?: AcceptedChristPeriodStats[];
  recentDecisions?: RecentDecision[];
}

export interface ChildrenStatsResponseDto {
  filters: {
    applied: ChildrenStatsQueryDto;
    summary: string;
  };
  summary: {
    totalChildren: number;
    filteredChildren: number;
    avgAge: number;
    avgEngagementScore: number;
    avgPresenceRate: number;
    childrenWithDecisions: number;
    activeChildren: number;
  };
  distribution: {
    byGender: Array<{ gender: string; count: number; percentage: number }>;
    byAgeGroup: Array<{ ageGroup: string; count: number; percentage: number }>;
    byClub: Array<{ clubId: string; clubNumber: number; count: number }>;
    byCity: Array<{ city: string; state: string; count: number }>;
    byParticipationTime: Array<{ timeRange: string; count: number }>;
  };
  children: ChildStat[];
  pagination: PaginationInfo;
}

export interface ClubsStatsResponseDto {
  filters: {
    applied: Partial<ClubsStatsQueryDto>;
    summary: string;
  };
  summary: {
    totalClubs: number;
    filteredClubs: number;
    totalChildren: number;
    totalTeachers: number;
    avgPerformanceScore: number;
    avgPresenceRate: number;
    totalDecisions: number;
  };
  distribution: {
    byCity: Array<{ city: string; state: string; count: number }>;
    byWeekday: Array<{ weekday: string; count: number }>;
    byCoordinator: Array<{ coordinatorId: string; coordinatorName: string; count: number }>;
    byPerformance: Array<{ range: string; count: number }>;
  };
  clubs: ClubStat[];
  pagination: PaginationInfo;
  inactiveClubs?: {
    total: number;
    list: Array<{
      clubId: string;
      clubNumber: number;
      weekday: string;
      isActive: boolean;
    }>;
  };
  inactiveChildren?: {
    total: number;
    fromInactiveClubs: number;
  };
}

export interface TeachersStatsResponseDto {
  filters: {
    applied: Partial<TeachersStatsQueryDto>;
    summary: string;
  };
  summary: {
    totalTeachers: number;
    filteredTeachers: number;
    activeTeachers: number;
    totalChildren: number;
    avgEffectivenessScore: number;
    avgPresenceRate: number;
  };
  distribution: {
    byClub: Array<{ clubId: string; clubNumber: number; count: number }>;
    byCity: Array<{ city: string; state: string; count: number }>;
    byEffectiveness: Array<{ range: string; count: number }>;
  };
  teachers: TeacherStat[];
  pagination: PaginationInfo;
}

/**
 * Uma semana da linha do tempo de um clubinho (`AttendanceTimelineWeekDto`).
 *
 * `isException` e `isPending` sempre vieram do back e não constavam aqui: a
 * tela só lia `hasPagela`, então feriado e semana futura viravam "faltou".
 * O back não manda `presenceRate` — manda `presenceCount`, e só quando há
 * pagela.
 */
export interface AttendanceTimelineWeek {
  year: number;
  week: number;
  date: string;
  hasPagela: boolean;
  /** Semana marcada como exceção (feriado, recesso): não conta como falta. */
  isException: boolean;
  /** A data ainda não chegou: não é falta, é futuro. */
  isPending: boolean;
  expectedChildren: number;
  totalPagelas?: number;
  firstDate?: string;
  presenceCount?: number;
}

/** Como uma semana da linha do tempo é mostrada. */
export enum AttendanceWeekState {
  WithPagela = 'with_pagela',
  Missing = 'missing',
  Pending = 'pending',
  Exception = 'exception',
}

/**
 * Situação de um clubinho numa semana (`WeeklyClubStatus` no back).
 *
 * `pending` e `partial` já eram devolvidos e não constavam na união daqui —
 * caíam no `default` e apareciam como "Desconhecido".
 */
export enum WeeklyClubStatus {
  Ok = 'ok',
  Partial = 'partial',
  Missing = 'missing',
  Pending = 'pending',
  Vacation = 'vacation',
  Inactive = 'inactive',
  /** O dia do clubinho naquela semana cai fora do período letivo. */
  OutOfPeriod = 'out_of_period',
}

export interface ClubAttendanceAnalysisDto {
  clubId: string;
  clubNumber: number;
  weekday: string;
  period: {
    startDate: string;
    endDate: string;
    totalWeeks: number;
    activeWeeks: number;
    /** Quantas semanas do período caíram em exceção (feriado, recesso). */
    exceptionsCount: number;
    /** `false` quando o ano não tem período letivo cadastrado. */
    hasAcademicPeriod: boolean;
  };
  attendance: {
    weeksWithPagela: number;
    weeksExpected: number;
    weeksMissing: number;
    attendanceRate: number;
    consecutiveWeeksPresent: number;
    consecutiveWeeksMissing: number;
  };
  missingWeeks: MissingWeekDto[];
  alerts: Array<{
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    weeksMissing?: number;
    lastPagelaDate?: string;
  }>;
  timeline: AttendanceTimelineWeek[];
  /** As rotas de frequência paginam com `hasNextPage`/`hasPreviousPage`. */
  timelinePagination?: PaginationMeta;
  missingWeeksPagination?: PaginationMeta;
  note?: string;
}

export interface WeeklyAttendanceDto {
  year: number;
  week: number;
  weekRange: {
    start: string | null;
    end: string | null;
  };
  clubs: Array<{
    clubId: string;
    clubNumber: number;
    weekday: string;
    hasPagela: boolean;
    totalPagelas?: number;
    expectedChildren: number;
    expectedDate: string;
    status: WeeklyClubStatus;
  }>;
  summary: {
    totalClubs: number;
    clubsActive: number;
    clubsWithPagela: number;
    clubsMissing: number;
    attendanceRate: number;
  };
  pagination?: PaginationMeta;
  period?: {
    year: number;
    startDate: string;
    endDate: string;
  };
  note?: string;
}
