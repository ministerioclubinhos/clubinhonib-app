import apiAxios from '@/config/axiosConfig';

import type {
  AcademicPeriod,
  ClubCheckResult,
  CreateAcademicPeriodDto,
  CreateWeekdayExceptionDto,
  CurrentWeekInfo,
  DetailedIndicatorsResponse,
  PaginatedResponse,
  WeekCheckResult,
  WeekdayException,
} from './types';

const BASE_URL = '/club-control';

export const clubControlApi = {

  createPeriod: (data: CreateAcademicPeriodDto) =>
    apiAxios.post<AcademicPeriod>(`${BASE_URL}/periods`, data),

  getPeriods: (params?: { page?: number; limit?: number }) =>
    apiAxios.get<PaginatedResponse<AcademicPeriod>>(`${BASE_URL}/periods`, { params }),

  getPeriodByYear: (year: number) =>
    apiAxios.get<AcademicPeriod>(`${BASE_URL}/periods/${year}`),

  updatePeriod: (periodId: string, data: Partial<CreateAcademicPeriodDto>) =>
    apiAxios.put<AcademicPeriod>(`${BASE_URL}/periods/${periodId}`, data),

  deletePeriod: (periodId: string) =>
    apiAxios.delete(`${BASE_URL}/periods/${periodId}`),

  createException: (data: CreateWeekdayExceptionDto) =>
    apiAxios.post<WeekdayException>(`${BASE_URL}/exceptions`, data),

  getExceptions: (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    apiAxios.get<PaginatedResponse<WeekdayException>>(`${BASE_URL}/exceptions`, { params }),

  getExceptionByDate: (date: string) =>
    apiAxios.get<WeekdayException>(`${BASE_URL}/exceptions/${date}`),

  updateException: (exceptionId: string, data: Partial<CreateWeekdayExceptionDto>) =>
    apiAxios.patch<WeekdayException>(`${BASE_URL}/exceptions/${exceptionId}`, data),

  deleteException: (exceptionId: string) =>
    apiAxios.delete(`${BASE_URL}/exceptions/${exceptionId}`),

  checkClub: (clubId: string, params: { year: number; week: number }) =>
    apiAxios.get<ClubCheckResult>(`${BASE_URL}/check/club/${clubId}`, { params }),

  checkWeek: (params?: { year?: number; week?: number; page?: number; limit?: number }) =>
    apiAxios.get<WeekCheckResult>(`${BASE_URL}/check/week`, { params }),

  getDashboard: (params?: { page?: number; limit?: number }) =>
    apiAxios.get<WeekCheckResult>(`${BASE_URL}/dashboard`, { params }),

  getCurrentWeek: () =>
    apiAxios.get<CurrentWeekInfo>(`${BASE_URL}/current-week`),

  getDetailedIndicators: (params: { 
    year: number; 
    week: number;
    status?: 'ok' | 'partial' | 'missing' | 'exception' | 'inactive' | 'out_of_period';
    severity?: 'critical' | 'warning' | 'info' | 'success';
    weekday?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
    indicatorType?: 'all_ok' | 'some_missing' | 'no_pagela' | 'no_children' | 'exception' | 'no_weekday' | 'out_of_period' | 'club_inactive' | 'children_not_attending';
    hasProblems?: boolean;
    page?: number;
    limit?: number;
  }) =>
    apiAxios.get<DetailedIndicatorsResponse>(`${BASE_URL}/indicators/detailed`, { params }),
};
