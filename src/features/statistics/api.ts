import apiAxios from '@/config/axiosConfig';

const BASE_URL = '/statistics';

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
  ACCEPTED = 'accepted',
  RECONCILED = 'reconciled'
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
  ageGroup?: string;
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
  sortBy?: string;
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
  weekday?: string;
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
  sortBy?: string;
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
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface AcceptedChristsStatsQueryDto {
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
  lastActivity: {
    date: string | null;
    type: string;
  };
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
  lastActivity: {
    date: string | null;
    totalPagelas: number;
  };
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
  conversionFunnel?: {
    totalChildren: number;
    childrenWithPagelas: number;
    childrenWithDecisions: number;
    childrenAccepted: number;
    childrenReconciled: number;
    conversionRate: number;
  };
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
  teacherEffectiveness?: Array<{
    teacherId: string;
    name: string;
    effectivenessScore: number;
  }>;
  trends?: Array<{
    metric: string;
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
  }>;
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
  byWeek: Array<any>; // Define structure if needed
  topPerformers: Array<any>;
}

export interface AcceptedChristsStatsResponseDto {
  period: {
    startDate: string;
    endDate: string;
  };
  overall: {
    totalDecisions: number;
    uniqueChildren: number;
    byDecisionType: {
      accepted: number;
      reconciled: number;
    };
  };
  byPeriod: Array<any>;
  recentDecisions: Array<any>;
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

export interface ClubAttendanceAnalysisDto {
  clubId: string;
  clubNumber: number;
  weekday: string;
  period: {
    startDate: string;
    endDate: string;
    totalWeeks: number;
    activeWeeks: number;
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
  timeline: Array<{
    year: number;
    week: number;
    date: string;
    hasPagela: boolean;
    totalPagelas?: number;
    presenceRate?: number;
  }>;
  timelinePagination?: PaginationInfo;
  missingWeeksPagination?: PaginationInfo;
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
    expectedDate: string;
    status: 'ok' | 'missing' | 'vacation' | 'inactive';
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

// --- API Implementation ---

export const statisticsApi = {

  // Charts & Visualization
  getPagelasChartData: (params?: PagelasStatsQueryDto) =>
    apiAxios.get<PagelasChartDataDto>(`${BASE_URL}/pagelas/charts`, { params }),

  getAcceptedChristsChartData: (params?: AcceptedChristsStatsQueryDto) =>
    apiAxios.get<AcceptedChristsChartDataDto>(`${BASE_URL}/accepted-christs/charts`, { params }),

  getInsights: (params?: any) => // Mixed filters support
    apiAxios.get<CombinedInsightsDto>(`${BASE_URL}/insights`, { params }),

  // Overview & Dashboard
  getOverview: () =>
    apiAxios.get<OverviewStatsResponseDto>(`${BASE_URL}/overview`),

  getPagelas: (params?: PagelasStatsQueryDto) =>
    apiAxios.get<PagelasStatsResponseDto>(`${BASE_URL}/pagelas`, { params }),

  getAcceptedChrists: (params?: AcceptedChristsStatsQueryDto) =>
    apiAxios.get<AcceptedChristsStatsResponseDto>(`${BASE_URL}/accepted-christs`, { params }),

  // Paginated Lists
  getChildren: (params?: ChildrenStatsQueryDto) =>
    apiAxios.get<ChildrenStatsResponseDto>(`${BASE_URL}/children`, { params }),

  getClubs: (params?: ClubsStatsQueryDto) =>
    apiAxios.get<ClubsStatsResponseDto>(`${BASE_URL}/clubs`, { params }),

  getTeachers: (params?: TeachersStatsQueryDto) =>
    apiAxios.get<TeachersStatsResponseDto>(`${BASE_URL}/teachers`, { params }),

  // Attendance Analysis
  getClubAttendance: (clubId: string, params: { year: number; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    apiAxios.get<ClubAttendanceAnalysisDto>(`${BASE_URL}/attendance/club/${clubId}`, { params }),

  getWeeklyAttendance: (params: { year: number; week: number; page?: number; limit?: number }) =>
    apiAxios.get<WeeklyAttendanceDto>(`${BASE_URL}/attendance/week`, { params }),

  // Detailed Views (WIP)
  getClubStats: (clubId: string, params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
    apiAxios.get(`${BASE_URL}/clubs/${clubId}`, { params }),

  getChildStats: (childId: string) =>
    apiAxios.get(`${BASE_URL}/children/${childId}`),

  getCityStats: (city: string, params?: { state?: string; startDate?: string; endDate?: string }) =>
    apiAxios.get(`${BASE_URL}/cities/${city}`, { params }),

  getTeacherStats: (teacherId: string, params?: { startDate?: string; endDate?: string }) =>
    apiAxios.get(`${BASE_URL}/teachers/${teacherId}`, { params }),
};
