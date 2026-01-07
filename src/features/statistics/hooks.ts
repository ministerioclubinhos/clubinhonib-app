import { useQuery } from '@tanstack/react-query';
import { statisticsApi, StatisticsFilters } from './api';
import { clubControlApi, CurrentWeekInfo } from '../club-control/api';

// Hook para dados de gráficos de Pagelas
export const usePagelasChartData = (filters?: StatisticsFilters) => {
  return useQuery({
    queryKey: ['pagelasCharts', JSON.stringify(filters)],
    queryFn: async () => {
      const response = await statisticsApi.getPagelasChartData(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

// Hook para dados de gráficos de Accepted Christs
export const useAcceptedChristsChartData = (filters?: StatisticsFilters) => {
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

// Hook para insights
export const useInsights = (filters?: StatisticsFilters) => {
  return useQuery({
    queryKey: ['insights', JSON.stringify(filters)],
    queryFn: async () => {
      const response = await statisticsApi.getInsights(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para overview geral
export const useOverview = () => {
  return useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const response = await statisticsApi.getOverview();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
  });
};

// Hook para estatísticas de um clube específico
export const useClubStats = (
  clubId: string,
  params?: { startDate?: string; endDate?: string; groupBy?: string }
) => {
  return useQuery({
    queryKey: ['clubStats', clubId, JSON.stringify(params)],
    queryFn: async () => {
      const response = await statisticsApi.getClubStats(clubId, params);
      return response.data;
    },
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para estatísticas de uma criança específica
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

// Hook para estatísticas de uma cidade
export const useCityStats = (
  city: string,
  params?: { state?: string; startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: ['cityStats', city, JSON.stringify(params)],
    queryFn: async () => {
      const response = await statisticsApi.getCityStats(city, params);
      return response.data;
    },
    enabled: !!city,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para estatísticas de um professor
export const useTeacherStats = (
  teacherId: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: ['teacherStats', teacherId, JSON.stringify(params)],
    queryFn: async () => {
      const response = await statisticsApi.getTeacherStats(teacherId, params);
      return response.data;
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para lista de crianças (NOVO!)
export const useChildren = (filters?: import('./api').ChildrenFilters) => {
  return useQuery({
    queryKey: ['children', JSON.stringify(filters)],
    queryFn: async () => {
      const response = await statisticsApi.getChildren(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para lista de clubes (NOVO!)
export const useClubs = (filters?: import('./api').ClubsFilters) => {
  return useQuery({
    queryKey: ['clubs', JSON.stringify(filters)],
    queryFn: async () => {
      const response = await statisticsApi.getClubs(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para lista de professores (NOVO!)
export const useTeachers = (filters?: import('./api').TeachersFilters) => {
  return useQuery({
    queryKey: ['teachers', JSON.stringify(filters)],
    queryFn: async () => {
      const response = await statisticsApi.getTeachers(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para frequência de clube (com paginação v2.5.0)
export const useClubAttendance = (
  clubId: string,
  params: { year: number; startDate?: string; endDate?: string; page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ['clubAttendance', clubId, JSON.stringify(params)],
    queryFn: async () => {
      const response = await statisticsApi.getClubAttendance(clubId, params);
      return response.data;
    },
    enabled: !!clubId && !!params.year,
    staleTime: 5 * 60 * 1000,
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

export const useWeeklyAttendance = (params: {
  year: number;
  week: number;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['weeklyAttendance', JSON.stringify(params)],
    queryFn: async () => {
      const response = await statisticsApi.getWeeklyAttendance(params);
      return response.data;
    },
    enabled: !!params.year && !!params.week,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
