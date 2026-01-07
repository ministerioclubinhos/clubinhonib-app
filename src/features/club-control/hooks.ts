import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubControlApi, CreateAcademicPeriodDto, CreateWeekdayExceptionDto } from './api';

export const useControlDashboard = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['controlDashboard', page, limit],
    queryFn: async () => {
      const response = await clubControlApi.getDashboard({ page, limit });
      return response.data;
    },
    enabled: true,
    staleTime: 1 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useWeekCheck = (year?: number, week?: number, page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['weekCheck', year, week, page, limit],
    queryFn: async () => {
      const params: { year?: number; week?: number; page?: number; limit?: number } = { page, limit };
      if (year !== undefined && week !== undefined) {
        params.year = year;
        params.week = week;
      }
      const response = await clubControlApi.checkWeek(params);
      return response.data;
    },
    enabled: true, 
    staleTime: 0, 
    gcTime: 0, 
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useClubCheck = (clubId: string, year: number, week: number) => {
  return useQuery({
    queryKey: ['clubCheck', clubId, year, week],
    queryFn: async () => {
      const response = await clubControlApi.checkClub(clubId, { year, week });
      return response.data;
    },
    enabled: !!clubId && !!year && !!week,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useCurrentWeek = () => {
  return useQuery({
    queryKey: ['currentWeek'],
    queryFn: async () => {
      const response = await clubControlApi.getCurrentWeek();
      return response.data;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useDetailedIndicators = (
  year: number, 
  week: number,
  filters?: {
    status?: 'ok' | 'partial' | 'missing' | 'exception' | 'inactive' | 'out_of_period';
    severity?: 'critical' | 'warning' | 'info' | 'success';
    weekday?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
    indicatorType?: 'all_ok' | 'some_missing' | 'no_pagela' | 'no_children' | 'exception' | 'no_weekday' | 'out_of_period' | 'club_inactive' | 'children_not_attending';
    hasProblems?: boolean;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: ['detailedIndicators', year, week, filters],
    queryFn: async () => {
      const response = await clubControlApi.getDetailedIndicators({ year, week, ...filters });
      return response.data;
    },
    enabled: !!year && !!week,
    staleTime: 2 * 60 * 1000, 
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useAcademicPeriods = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['academicPeriods', page, limit],
    queryFn: async () => {
      const response = await clubControlApi.getPeriods({ page, limit });
      return response.data;
    },
    enabled: true,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePeriodByYear = (year: number) => {
  return useQuery({
    queryKey: ['academicPeriod', year],
    queryFn: async () => {
      const response = await clubControlApi.getPeriodByYear(year);
      return response.data;
    },
    enabled: !!year,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicPeriodDto) => clubControlApi.createPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicPeriods'] });
    },
  });
};

export const useUpdatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ periodId, data }: { periodId: string; data: Partial<CreateAcademicPeriodDto> }) =>
      clubControlApi.updatePeriod(periodId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['academicPeriod'] });
      queryClient.invalidateQueries({ queryKey: ['controlDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['weekCheck'] });
      queryClient.invalidateQueries({ queryKey: ['currentWeek'] });
    },
  });
};

export const useDeletePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => clubControlApi.deletePeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicPeriods'] });
    },
  });
};

export const useWeekdayExceptions = (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['weekdayExceptions', params],
    queryFn: async () => {
      const response = await clubControlApi.getExceptions(params);
      return response.data;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useExceptionByDate = (date: string) => {
  return useQuery({
    queryKey: ['weekdayException', date],
    queryFn: async () => {
      const response = await clubControlApi.getExceptionByDate(date);
      return response.data;
    },
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateException = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWeekdayExceptionDto) => clubControlApi.createException(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekdayExceptions'] });
      queryClient.invalidateQueries({ queryKey: ['controlDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['weekCheck'] });
    },
  });
};

export const useDeleteException = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exceptionId: string) => clubControlApi.deleteException(exceptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekdayExceptions'] });
      queryClient.invalidateQueries({ queryKey: ['controlDashboard'] });
    },
  });
};
