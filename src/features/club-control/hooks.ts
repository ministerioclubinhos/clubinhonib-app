import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubControlApi, CreateAcademicPeriodDto, CreateWeekdayExceptionDto } from './api';

// ⚠️ BACKEND NOT READY - Queries desabilitadas por padrão
// Para ativar: configure VITE_CLUB_CONTROL_ENABLED=true no .env
const BACKEND_ENABLED = import.meta.env.VITE_CLUB_CONTROL_ENABLED === 'true';

// ========================================
// Hooks para Dashboard e Verificação
// ========================================

// Hook para dashboard (semana atual) - com paginação
export const useControlDashboard = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['controlDashboard', page, limit],
    queryFn: async () => {
      const response = await clubControlApi.getDashboard({ page, limit });
      return response.data;
    },
    enabled: BACKEND_ENABLED, // 🔴 DESABILITADO até backend estar pronto
    staleTime: 1 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook para verificar semana específica (com paginação v1.1.0)
// ⭐ v1.8.0: year e week são opcionais - se não fornecidos, calcula semana atual automaticamente
// ⭐ v1.8.0: Limite padrão é 50 conforme documentação
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
    enabled: BACKEND_ENABLED, // ⭐ v1.8.0: Sempre habilitado, mesmo sem year/week (calcula automaticamente)
    staleTime: 0, // ⭐ v1.8.0: staleTime 0 para garantir que dados sejam atualizados quando parâmetros mudarem
    gcTime: 0, // ⭐ v1.8.1: gcTime 0 para garantir que não use dados em cache de outras semanas (React Query v5)
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook para verificar clube específico
export const useClubCheck = (clubId: string, year: number, week: number) => {
  return useQuery({
    queryKey: ['clubCheck', clubId, year, week],
    queryFn: async () => {
      const response = await clubControlApi.checkClub(clubId, { year, week });
      return response.data;
    },
    enabled: BACKEND_ENABLED && !!clubId && !!year && !!week, // 🔴 DESABILITADO
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook para obter semana atual do ano letivo ⭐ NOVO v1.2.0
export const useCurrentWeek = () => {
  return useQuery({
    queryKey: ['currentWeek'],
    queryFn: async () => {
      const response = await clubControlApi.getCurrentWeek();
      return response.data;
    },
    enabled: BACKEND_ENABLED, // 🔴 DESABILITADO
    staleTime: 5 * 60 * 1000, // 5 minutos (semana muda raramente)
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

// Hook para análise detalhada dos indicadores ⭐ NOVO v1.3.0
// ⭐ v1.3.1: Suporta filtros avançados e paginação
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
    enabled: BACKEND_ENABLED && !!year && !!week, // 🔴 DESABILITADO
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });
};

// ========================================
// Hooks para Períodos GLOBAIS
// ========================================

// Hook para listar períodos (com paginação v1.1.0)
export const useAcademicPeriods = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['academicPeriods', page, limit],
    queryFn: async () => {
      const response = await clubControlApi.getPeriods({ page, limit });
      return response.data;
    },
    enabled: BACKEND_ENABLED, // 🔴 DESABILITADO
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar período de um ano específico
export const usePeriodByYear = (year: number) => {
  return useQuery({
    queryKey: ['academicPeriod', year],
    queryFn: async () => {
      const response = await clubControlApi.getPeriodByYear(year);
      return response.data;
    },
    enabled: BACKEND_ENABLED && !!year, // 🔴 DESABILITADO
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Mutation para criar período GLOBAL
export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicPeriodDto) => clubControlApi.createPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicPeriods'] });
    },
  });
};

// Mutation para atualizar período
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

// Mutation para deletar período
export const useDeletePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => clubControlApi.deletePeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicPeriods'] });
    },
  });
};

// ========================================
// Hooks para Exceções GLOBAIS
// ========================================

// Hook para listar exceções (com filtros e paginação v1.1.0)
export const useWeekdayExceptions = (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['weekdayExceptions', params],
    queryFn: async () => {
      const response = await clubControlApi.getExceptions(params);
      return response.data;
    },
    enabled: BACKEND_ENABLED, // 🔴 DESABILITADO
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar exceção por data
export const useExceptionByDate = (date: string) => {
  return useQuery({
    queryKey: ['weekdayException', date],
    queryFn: async () => {
      const response = await clubControlApi.getExceptionByDate(date);
      return response.data;
    },
    enabled: BACKEND_ENABLED && !!date, // 🔴 DESABILITADO
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Mutation para criar exceção GLOBAL
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

// Mutation para deletar exceção
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
