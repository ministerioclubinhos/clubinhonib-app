import { useQuery } from '@tanstack/react-query';
import { statisticsApi, PagelasStatsQueryDto, AcceptedChristsStatsQueryDto, ChildrenStatsQueryDto, ClubsStatsQueryDto, TeachersStatsQueryDto } from './api';
import { clubControlApi, CurrentWeekInfo } from '../club-control/api';

export const usePagelasChartData = (filters?: PagelasStatsQueryDto) => {
  return useQuery({
    queryKey: ['pagelasCharts', filters?.startDate, filters?.endDate, filters?.groupBy, filters?.gender, filters?.minAge, filters?.maxAge, filters?.city, filters?.state, filters?.district],
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
    queryKey: ['acceptedChristsCharts', JSON.stringify(filters)],
    queryFn: async () => {
      const response = await statisticsApi.getAcceptedChristsChartData(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useInsights = (filters?: any) => {
  return useQuery({
    queryKey: ['insights', filters?.startDate, filters?.endDate, filters?.groupBy, filters?.gender, filters?.minAge, filters?.maxAge, filters?.city, filters?.state, filters?.district, filters?.period],
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
    queryKey: ['overview'],
    queryFn: async () => {
      const response = await statisticsApi.getOverview();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useClubStats = (
  clubId: string,
  params?: { startDate?: string; endDate?: string; groupBy?: string }
) => {
  return useQuery({
    queryKey: ['clubStats', clubId, params?.startDate, params?.endDate, params?.groupBy],
    queryFn: async () => {
      const response = await statisticsApi.getClubStats(clubId, params);
      return response.data;
    },
    enabled: !!clubId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useChildStats = (childId: string) => {
  return useQuery({
    queryKey: ['childStats', childId],
    queryFn: async () => {
      const response = await statisticsApi.getChildStats(childId);
      return response.data;
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCityStats = (
  city: string,
  params?: { state?: string; startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: ['cityStats', city, params?.state, params?.startDate, params?.endDate],
    queryFn: async () => {
      const response = await statisticsApi.getCityStats(city, params);
      return response.data;
    },
    enabled: !!city,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useTeacherStats = (
  teacherId: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: ['teacherStats', teacherId, params?.startDate, params?.endDate],
    queryFn: async () => {
      const response = await statisticsApi.getTeacherStats(teacherId, params);
      return response.data;
    },
    enabled: !!teacherId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useChildren = (filters?: ChildrenStatsQueryDto) => {
  return useQuery({
    queryKey: ['children', filters?.startDate, filters?.endDate, filters?.page, filters?.limit, filters?.sortBy, filters?.sortOrder, filters?.gender, filters?.minAge, filters?.maxAge, filters?.city, filters?.state, filters?.district],
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
    queryKey: ['clubs', filters?.startDate, filters?.endDate, filters?.page, filters?.limit, filters?.sortBy, filters?.sortOrder, filters?.city, filters?.state, filters?.weekday, filters?.minChildren, filters?.maxChildren],
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
    queryKey: ['teachers', filters?.startDate, filters?.endDate, filters?.page, filters?.limit, filters?.sortBy, filters?.sortOrder, filters?.city, filters?.state],
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
    queryKey: ['clubAttendance', clubId, params.year, params.startDate, params.endDate, params.page, params.limit],
    queryFn: async () => {
      const response = await statisticsApi.getClubAttendance(clubId, params);
      return response.data;
    },
    enabled: !!clubId && !!params.year,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCurrentWeek = (): { data?: CurrentWeekInfo; isLoading: boolean; error: any } => {
  return useQuery({
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
    queryKey: ['weeklyAttendance', params.year, params.week, params.page, params.limit],
    queryFn: async () => {
      const response = await statisticsApi.getWeeklyAttendance(params);
      return response.data;
    },
    enabled: !!params.year && !!params.week,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

