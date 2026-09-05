import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from './api';
import type { PagelasStatsQueryDto, AcceptedChristsStatsQueryDto, ChildrenStatsQueryDto, ClubsStatsQueryDto, TeachersStatsQueryDto } from './types';
import { clubControlApi } from '../club-control/api';
import type { CurrentWeekInfo } from '../club-control/types';

export const usePagelasChartData = (filters?: PagelasStatsQueryDto) => {
  return useQuery({
    queryKey: ['statistics', 'pagelasCharts', filters ?? {}],
    queryFn: async () => {
      const response = await statisticsApi.getPagelasChartData(filters);
      return response.data;
    },
    staleTime: 0, // Force refetch on filter change
    refetchOnWindowFocus: false,
  });
};

export const useAcceptedChristsChartData = (filters?: AcceptedChristsStatsQueryDto) => {
  return useQuery({
    queryKey: ['statistics', 'acceptedChristsCharts', filters ?? {}],
    queryFn: async () => {
      const response = await statisticsApi.getAcceptedChristsChartData(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useInsights = (filters?: PagelasStatsQueryDto) => {
  return useQuery({
    queryKey: ['statistics', 'insights', filters ?? {}],
    queryFn: async () => {
      const response = await statisticsApi.getInsights(filters);
      return response.data;
    },
    staleTime: 0, // Force refetch on filter change
    refetchOnWindowFocus: false,
  });
};

export const useOverview = () => {
  return useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: async () => {
      const response = await statisticsApi.getOverview();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useChildren = (filters?: ChildrenStatsQueryDto) => {
  return useQuery({
    queryKey: ['statistics', 'children', filters ?? {}],
    queryFn: async () => {
      const response = await statisticsApi.getChildren(filters);
      return response.data;
    },
    staleTime: 0, 
    refetchOnWindowFocus: false,
  });
};

export const useClubs = (filters?: ClubsStatsQueryDto) => {
  return useQuery({
    queryKey: ['statistics', 'clubs', filters ?? {}],
    queryFn: async () => {
      const response = await statisticsApi.getClubs(filters);
      return response.data;
    },
    staleTime: 0, 
    refetchOnWindowFocus: false,
  });
};

export const useTeachers = (filters?: TeachersStatsQueryDto) => {
  return useQuery({
    queryKey: ['statistics', 'teachers', filters ?? {}],
    queryFn: async () => {
      const response = await statisticsApi.getTeachers(filters);
      return response.data;
    },
    staleTime: 0, 
    refetchOnWindowFocus: false,
  });
};

export const useClubAttendance = (
  clubId: string,
  params: { year: number; startDate?: string; endDate?: string; page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ['statistics', 'clubAttendance', clubId, params],
    queryFn: async () => {
      const response = await statisticsApi.getClubAttendance(clubId, params);
      return response.data;
    },
    enabled: !!clubId && !!params.year,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCurrentWeek = () => {
  return useQuery<CurrentWeekInfo>({
    queryKey: ['currentWeek'],
    queryFn: async () => {
      const response = await clubControlApi.getCurrentWeek();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useWeeklyAttendance = (params: { year: number; week: number; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['statistics', 'weeklyAttendance', params],
    queryFn: async () => {
      const response = await statisticsApi.getWeeklyAttendance(params);
      return response.data;
    },
    enabled: !!params.year && !!params.week,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};
