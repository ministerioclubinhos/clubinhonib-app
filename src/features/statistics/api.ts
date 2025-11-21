import axios from 'axios';
import apiAxios from '@/config/axiosConfig';

const BASE_URL = '/statistics';

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface SeriesDataPoint {
  date: string;
  series: {
    [key: string]: number;
  };
}

export interface ByGender {
  gender: string;
  total: number;
  presenceRate: number;
  meditationRate: number;
  verseRecitationRate: number;
}

export interface ByAgeGroup {
  ageGroup: string;
  total: number;
  presenceRate: number;
  meditationRate: number;
  verseRecitationRate: number;
}

export interface ByClub {
  clubId: string;
  clubNumber: number;
  total: number;
  presenceRate: number;
  meditationRate?: number;
  verseRecitationRate?: number;
}

export interface ByTeacher {
  teacherId: string;
  teacherName: string;
  total: number;
  presenceRate?: number;
}

export interface ByCity {
  city: string;
  state: string;
  total: number;
  uniqueChildren: number;
  presenceRate: number;
  meditationRate: number;
  verseRecitationRate: number;
}

export interface ByParticipationTime {
  timeRange: string;
  total: number;
  uniqueChildren: number;
  presenceRate: number;
  meditationRate: number;
  verseRecitationRate: number;
  avgMonthsParticipating: number;
}

export interface TopEngagedChild {
  childId: string;
  childName: string;
  gender: string;
  age: number;
  clubNumber: number | null;
  city: string | null;
  state: string | null;
  monthsParticipating: number;
  engagementScore: number;
  totalPagelas: number;
  presenceRate: number;
  hasDecision: boolean;
  decisionType: string | null;
}

export interface ClubRanking {
  clubId: string;
  clubNumber: number;
  totalChildren: number;
  avgPresenceRate: number;
  totalDecisions: number;
  performanceScore: number;
}

export interface PagelasChartData {
  timeSeries: {
    presence: TimeSeriesDataPoint[];
    meditation: TimeSeriesDataPoint[];
    verseRecitation: TimeSeriesDataPoint[];
    total: TimeSeriesDataPoint[];
  };
  byGender: ByGender[];
  byAgeGroup: ByAgeGroup[];
  byClub: ByClub[];
  byTeacher: ByTeacher[];
  byCity: ByCity[];
  byParticipationTime: ByParticipationTime[];
}

export interface AcceptedChristsChartData {
  timeSeries: SeriesDataPoint[];
  byGender: {
    gender: string;
    total: number;
    accepted: number;
    reconciled: number;
  }[];
  byAgeGroup: {
    ageGroup: string;
    total: number;
    accepted: number;
    reconciled: number;
  }[];
  byClub: {
    clubId: string;
    clubNumber: number;
    total: number;
    accepted: number;
    reconciled?: number;
  }[];
  byCity: {
    city: string;
    state: string;
    total: number;
    accepted: number;
    reconciled?: number;
  }[];
  byParticipationTime: {
    timeRange: string;
    total: number;
    accepted: number;
    reconciled?: number;
    avgMonthsParticipating: number;
  }[];
}

export interface InsightsData {
  topEngagedChildren: TopEngagedChild[];
  clubRankings: ClubRanking[];
}

export interface OverviewData {
  summary: {
    totalChildren: number;
    totalClubs: number;
    totalTeachers: number;
    activeChildrenThisMonth: number;
  };
  pagelas: {
    thisWeek: {
      total: number;
      presenceRate: number;
    };
    thisMonth: {
      total: number;
      presenceRate: number;
    };
    lastSixWeeks: TimeSeriesDataPoint[];
  };
  acceptedChrists: {
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    byDecisionType: {
      ACCEPTED: number;
      RECONCILED: number;
    };
    lastSixMonths: TimeSeriesDataPoint[];
  };
}

export interface StatisticsFilters {
  year?: number;
  week?: number;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
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
  decision?: string;
}

// Filtros específicos para Children
export interface ChildrenFilters extends StatisticsFilters {
  ageGroup?: string;
  minPagelas?: number;
  minPresenceRate?: number;
  minEngagementScore?: number;
  hasDecision?: boolean;
  decisionType?: 'ACCEPTED' | 'RECONCILED';
  isActive?: boolean;
  sortBy?: 'name' | 'age' | 'engagementScore' | 'totalPagelas' | 'presenceRate';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// Filtros específicos para Clubs
export interface ClubsFilters {
  coordinatorId?: string;
  city?: string;
  state?: string;
  district?: string;
  weekday?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  minChildren?: number;
  minPresenceRate?: number;
  minPerformanceScore?: number;
  sortBy?: 'number' | 'performanceScore' | 'totalChildren';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// Filtros específicos para Teachers
export interface TeachersFilters {
  clubId?: string;
  coordinatorId?: string;
  city?: string;
  state?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  minPagelas?: number;
  minChildren?: number;
  minPresenceRate?: number;
  minEffectivenessScore?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'effectivenessScore' | 'totalPagelas';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// Response types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ChildStat {
  childId: string;
  name: string;
  gender: string;
  age: number;
  club: {
    id: string;
    number: number;
    weekday: string;
  } | null;
  address: {
    city: string;
    state: string;
    district: string;
  } | null;
  monthsParticipating: number;
  // ⭐ NOVO v2.6.0: Data de entrada
  joinedAt?: string | null; // Data de entrada no clubinho
  stats: {
    totalPagelas: number;
    presenceRate: number;
    engagementScore: number;
    lastPagelaDate: string | null;
  };
  decisions: {
    hasDecision: boolean;
    decisionType: string | null;
  };
  // ⭐ CRÍTICO v2.6.0: Apenas crianças ativas são listadas
  isActive: boolean; // Sempre true nas respostas (apenas ativas são retornadas)
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

export interface ChildrenStatsResponse {
  filters: {
    applied: ChildrenFilters;
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

export interface ClubsStatsResponse {
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
}

export interface TeachersStatsResponse {
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

// Attendance Analysis Types
// ⭐ Pagination Meta v2.5.0
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ClubAttendanceResponse {
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
  missingWeeks: Array<{
    year: number;
    week: number;
    expectedDate: string;
    weekRange: {
      start: string;
      end: string;
    };
    reason: string;
    severity: 'info' | 'warning' | 'critical';
  }>;
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
  timelinePagination?: PaginationMeta;
  missingWeeksPagination?: PaginationMeta;
}

export interface WeeklyAttendanceResponse {
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

export const statisticsApi = {
  // Chart Data Endpoints
  getPagelasChartData: (params?: StatisticsFilters) =>
    apiAxios.get<PagelasChartData>(`${BASE_URL}/pagelas/charts`, { params }),

  getAcceptedChristsChartData: (params?: StatisticsFilters) =>
    apiAxios.get<AcceptedChristsChartData>(`${BASE_URL}/accepted-christs/charts`, { params }),

  getInsights: (params?: StatisticsFilters) =>
    apiAxios.get<InsightsData>(`${BASE_URL}/insights`, { params }),

  // Overview
  getOverview: () =>
    apiAxios.get<OverviewData>(`${BASE_URL}/overview`),

  // Complete Views
  getChildren: (params?: ChildrenFilters) =>
    apiAxios.get<ChildrenStatsResponse>(`${BASE_URL}/children`, { params }),

  getClubs: (params?: ClubsFilters) =>
    apiAxios.get<ClubsStatsResponse>(`${BASE_URL}/clubs`, { params }),

  getTeachers: (params?: TeachersFilters) =>
    apiAxios.get<TeachersStatsResponse>(`${BASE_URL}/teachers`, { params }),

  // Attendance Analysis (NOVOS!)
  // ⭐ Paginação v2.5.0
  getClubAttendance: (clubId: string, params: { year: number; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    apiAxios.get<ClubAttendanceResponse>(`${BASE_URL}/attendance/club/${clubId}`, { params }),

  getWeeklyAttendance: (params: { year: number; week: number; page?: number; limit?: number }) =>
    apiAxios.get<WeeklyAttendanceResponse>(`${BASE_URL}/attendance/week`, { params }),

  // Specific Views (Individual)
  getClubStats: (clubId: string, params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
    apiAxios.get(`${BASE_URL}/clubs/${clubId}`, { params }),

  getChildStats: (childId: string) =>
    apiAxios.get(`${BASE_URL}/children/${childId}`),

  getCityStats: (city: string, params?: { state?: string; startDate?: string; endDate?: string }) =>
    apiAxios.get(`${BASE_URL}/cities/${city}`, { params }),

  getTeacherStats: (teacherId: string, params?: { startDate?: string; endDate?: string }) =>
    apiAxios.get(`${BASE_URL}/teachers/${teacherId}`, { params }),
};

