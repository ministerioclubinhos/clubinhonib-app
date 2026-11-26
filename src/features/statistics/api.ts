import apiAxios from '@/config/axiosConfig';

import type {
  AcceptedChristsChartDataDto,
  AcceptedChristsStatsQueryDto,
  AcceptedChristsStatsResponseDto,
  ChildrenStatsQueryDto,
  ChildrenStatsResponseDto,
  ClubAttendanceAnalysisDto,
  ClubsStatsQueryDto,
  ClubsStatsResponseDto,
  CombinedInsightsDto,
  OverviewStatsResponseDto,
  PagelasChartDataDto,
  PagelasStatsQueryDto,
  PagelasStatsResponseDto,
  TeachersStatsQueryDto,
  TeachersStatsResponseDto,
  WeeklyAttendanceDto,
} from './types';

const BASE_URL = '/statistics';

// --- API Implementation ---

export const statisticsApi = {

  // Charts & Visualization
  getPagelasChartData: (params?: PagelasStatsQueryDto) =>
    apiAxios.get<PagelasChartDataDto>(`${BASE_URL}/pagelas/charts`, { params }),

  getAcceptedChristsChartData: (params?: AcceptedChristsStatsQueryDto) =>
    apiAxios.get<AcceptedChristsChartDataDto>(`${BASE_URL}/accepted-christs/charts`, { params }),

  getInsights: (params?: PagelasStatsQueryDto) =>
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

};
