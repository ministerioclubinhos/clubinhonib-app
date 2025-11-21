import apiAxios from '@/config/axiosConfig';

const BASE_URL = '/club-control';

// ========================================
// ESTRUTURA GLOBAL - Sem ClubId
// ========================================

// Types - Academic Period (GLOBAL)
export interface AcademicPeriod {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Types - Weekday Exception (GLOBAL)
export interface WeekdayException {
  id: string;
  exceptionDate: string;
  reason: string;
  type: 'holiday' | 'event' | 'maintenance' | 'vacation' | 'other';
  notes?: string;
  isActive: boolean;
  isRecurrent: boolean; // Novo campo: se repete todo ano
  createdAt?: string;
  updatedAt?: string;
}

// Types - Club Check Result (permanece igual)
export interface ClubCheckResult {
  clubId: string;
  clubNumber: number;
  weekday: string;
  week: {
    year: number;
    week: number;
    expectedDate: string;
  };
  children: {
    total: number;
    withPagela: number;
    missing: number;
    missingList: Array<{
      childId: string;
      childName: string;
    }>;
    // ⭐ NOVO v1.4.0: Status de crianças
    activeCount?: number; // Crianças ativas (isActive = true)
    inactiveCount?: number; // Crianças inativas (isActive = false)
    note?: string; // Nota sobre regras aplicadas
  };
  status: 'ok' | 'pending' | 'partial' | 'missing' | 'exception' | 'inactive' | 'out_of_period'; // ⭐ v1.8.2: Adicionado 'pending'
  alerts?: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
    message: string;
  }>;
  // ⭐ Indicadores melhorados v1.3.0
  indicators?: Array<{
    type: 'all_ok' | 'some_missing' | 'no_pagela' | 'no_children' | 'exception' | 'no_weekday' | 'out_of_period';
    severity: 'success' | 'warning' | 'critical' | 'info';
    message: string;
    details?: {
      totalChildren: number;
      childrenWithPagela: number;
      childrenMissing: number;
      completionRate: number;
      missingRate: number;
      isPerfect: boolean;
      needsAttention: boolean;
      urgency?: 'low' | 'medium' | 'high' | 'critical';
    };
  }>;
  exception: null | {
    date: string;
    reason: string;
  };
  period?: {
    year: number;
    startDate: string;
    endDate: string;
  };
}

// Types - Pagination (v1.1.0)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Types - Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

// Types - Current Week Info (v1.2.0)
export interface CurrentWeekInfo {
  academicYear: number | null;
  academicWeek: number | null;
  isWithinPeriod: boolean;
  periodStartDate: string | null;
  periodEndDate: string | null;
}

// Types - Detailed Indicators Response (v1.3.0)
export interface DetailedIndicatorsResponse {
  executiveSummary: {
    week: {
      year: number;
      week: number;
    };
    overall: {
      totalClubs: number;
      clubsOk: number;
      clubsMissing: number;
      clubsCritical: number;
      clubsPartial?: number;
      clubsException?: number;
      clubsInactive?: number;
      clubsOutOfPeriod?: number;
    };
    children: {
      total: number;
      completionRate: number;
      missingRate: number;
    };
  };
  indicators: {
    critical: Array<{
      type: string;
      severity: 'critical';
      message: string;
      details?: {
        totalChildren: number;
        childrenWithPagela: number;
        childrenMissing: number;
        completionRate: number;
        missingRate: number;
        isPerfect: boolean;
        needsAttention: boolean;
        urgency?: 'low' | 'medium' | 'high' | 'critical';
      };
      clubId: string;
      clubNumber: number;
    }>;
    warning: Array<{
      type: string;
      severity: 'warning';
      message: string;
      details?: {
        totalChildren: number;
        childrenWithPagela: number;
        childrenMissing: number;
        completionRate: number;
        missingRate: number;
        isPerfect: boolean;
        needsAttention: boolean;
        urgency?: 'low' | 'medium' | 'high' | 'critical';
      };
      clubId: string;
      clubNumber: number;
    }>;
    info?: Array<{
      type: string;
      severity: 'info';
      message: string;
      clubId: string;
      clubNumber: number;
    }>;
    success?: Array<{
      type: string;
      severity: 'success';
      message: string;
      clubId: string;
      clubNumber: number;
    }>;
  };
  clubs: {
    withProblems: Array<{
      clubId: string;
      clubNumber: number;
      status: string;
      indicators: Array<{
        type: string;
        severity: string;
        message: string;
        details?: {
          totalChildren: number;
          childrenWithPagela: number;
          childrenMissing: number;
          completionRate: number;
          missingRate: number;
          isPerfect: boolean;
          needsAttention: boolean;
          urgency?: 'low' | 'medium' | 'high' | 'critical';
        };
      }>;
    }>;
    critical: Array<{
      clubId: string;
      clubNumber: number;
      status: string;
      indicators: Array<{
        type: string;
        severity: string;
        message: string;
        details?: {
          totalChildren: number;
          childrenWithPagela: number;
          childrenMissing: number;
          completionRate: number;
          missingRate: number;
          isPerfect: boolean;
          needsAttention: boolean;
          urgency?: 'low' | 'medium' | 'high' | 'critical';
        };
      }>;
    }>;
  };
  statistics?: {
    byWeekday?: Array<{
      weekday: string;
      totalClubs: number;
      clubsOk: number;
      clubsMissing: number;
      completionRate: number;
    }>;
  };
  recommendations?: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    action?: string;
  }>;
  currentWeek?: CurrentWeekInfo;
}

// Types - Week Check Result (atualizado para v1.2.0 com currentWeek e v1.5.0 com note)
export interface WeekCheckResult {
  year: number | string; // Dashboard: number, check/week: string
  week: number | string; // Dashboard: number, check/week: string
  period?: {
    year: number;
    week?: number; // Opcional: pode não estar presente quando clubs está vazio
    weekRange?: {
      start: string;
      end: string;
    };
    startDate?: string; // ⭐ NOVO v1.5.0: Para quando clubs está vazio
    endDate?: string; // ⭐ NOVO v1.5.0: Para quando clubs está vazio
  };
  summary: {
    totalClubs: number;
    clubsOk: number;
    clubsPending?: number; // ⭐ v1.8.2: NOVO - Clubes pendentes (ainda dentro do prazo)
    clubsPartial: number;
    clubsMissing: number;
    clubsException: number;
    clubsInactive: number;
    clubsOutOfPeriod: number;
    overallCompleteness?: number;
  };
  clubs: ClubCheckResult[];
  pagination?: PaginationMeta; // ⭐ NOVO v1.1.0
  criticalAlerts?: Array<{
    clubId: string;
    clubNumber: number;
    message: string;
    missingChildren: number;
  }>;
  currentWeek?: CurrentWeekInfo; // ⭐ NOVO v1.2.0
  note?: string; // ⭐ NOVO v1.5.0: Mensagem quando clubs está vazio
}

// DTOs - ESTRUTURA GLOBAL
export interface CreateAcademicPeriodDto {
  year: number;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CreateWeekdayExceptionDto {
  exceptionDate: string;
  reason: string;
  type: 'holiday' | 'event' | 'maintenance' | 'vacation' | 'other';
  isRecurrent?: boolean;
  notes?: string;
}

// API Service - ESTRUTURA GLOBAL
export const clubControlApi = {
  // ========================================
  // Academic Periods (GLOBAL - sem clubId)
  // ========================================
  
  // POST /club-control/periods - Criar período GLOBAL
  createPeriod: (data: CreateAcademicPeriodDto) =>
    apiAxios.post<AcademicPeriod>(`${BASE_URL}/periods`, data),

  // GET /club-control/periods - Listar períodos (com paginação v1.1.0)
  getPeriods: (params?: { page?: number; limit?: number }) =>
    apiAxios.get<PaginatedResponse<AcademicPeriod>>(`${BASE_URL}/periods`, { params }),

  // GET /club-control/periods/:year - Buscar período por ano
  getPeriodByYear: (year: number) =>
    apiAxios.get<AcademicPeriod>(`${BASE_URL}/periods/${year}`),

  // PATCH /club-control/periods/:id - Atualizar período
  updatePeriod: (periodId: string, data: Partial<CreateAcademicPeriodDto>) =>
    apiAxios.patch<AcademicPeriod>(`${BASE_URL}/periods/${periodId}`, data),

  // DELETE /club-control/periods/:id - Deletar período
  deletePeriod: (periodId: string) =>
    apiAxios.delete(`${BASE_URL}/periods/${periodId}`),

  // ========================================
  // Weekday Exceptions (GLOBAL - sem clubId)
  // ========================================

  // POST /club-control/exceptions - Criar exceção GLOBAL
  createException: (data: CreateWeekdayExceptionDto) =>
    apiAxios.post<WeekdayException>(`${BASE_URL}/exceptions`, data),

  // GET /club-control/exceptions - Listar exceções (com filtros e paginação v1.1.0)
  getExceptions: (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    apiAxios.get<PaginatedResponse<WeekdayException>>(`${BASE_URL}/exceptions`, { params }),

  // GET /club-control/exceptions/:date - Buscar exceção por data
  getExceptionByDate: (date: string) =>
    apiAxios.get<WeekdayException>(`${BASE_URL}/exceptions/${date}`),

  // PATCH /club-control/exceptions/:id - Atualizar exceção
  updateException: (exceptionId: string, data: Partial<CreateWeekdayExceptionDto>) =>
    apiAxios.patch<WeekdayException>(`${BASE_URL}/exceptions/${exceptionId}`, data),

  // DELETE /club-control/exceptions/:id - Deletar exceção
  deleteException: (exceptionId: string) =>
    apiAxios.delete(`${BASE_URL}/exceptions/${exceptionId}`),

  // ========================================
  // Control and Verification (permanece igual)
  // ========================================

  // GET /club-control/check/club/:clubId - Verificar clube específico
  checkClub: (clubId: string, params: { year: number; week: number }) =>
    apiAxios.get<ClubCheckResult>(`${BASE_URL}/check/club/${clubId}`, { params }),

  // GET /club-control/check/week - Verificar todos os clubes (com paginação v1.1.0)
  // ⭐ v1.8.0: year e week são opcionais - se não fornecidos, calcula semana atual automaticamente
  checkWeek: (params?: { year?: number; week?: number; page?: number; limit?: number }) =>
    apiAxios.get<WeekCheckResult>(`${BASE_URL}/check/week`, { params }),

  // GET /club-control/dashboard - Dashboard da semana atual (com paginação)
  getDashboard: (params?: { page?: number; limit?: number }) =>
    apiAxios.get<WeekCheckResult>(`${BASE_URL}/dashboard`, { params }),

  // GET /club-control/current-week - Obter semana atual do ano letivo ⭐ NOVO v1.2.0
  getCurrentWeek: () =>
    apiAxios.get<CurrentWeekInfo>(`${BASE_URL}/current-week`),

  // GET /club-control/indicators/detailed - Análise detalhada dos indicadores ⭐ NOVO v1.3.0
  getDetailedIndicators: (params: { year: number; week: number }) =>
    apiAxios.get<DetailedIndicatorsResponse>(`${BASE_URL}/indicators/detailed`, { params }),
};
