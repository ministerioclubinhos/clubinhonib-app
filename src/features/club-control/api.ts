import apiAxios from '@/config/axiosConfig';

const BASE_URL = '/club-control';

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

export interface WeekdayException {
  id: string;
  exceptionDate: string;
  reason: string;
  type: 'holiday' | 'event' | 'maintenance' | 'vacation' | 'other';
  notes?: string;
  isActive: boolean;
  isRecurrent: boolean; 
  createdAt?: string;
  updatedAt?: string;
}

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
    
    activeCount?: number; 
    inactiveCount?: number; 
    
    notAttendingCount?: number; 
    notAttendingList?: Array<{
      childId: string;
      childName: string;
      isActive: boolean;
    }>;
    note?: string; 
  };
  status: 'ok' | 'pending' | 'partial' | 'missing' | 'exception' | 'inactive' | 'out_of_period'; 
  alerts?: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
    message: string;
  }>;
  
  indicators?: Array<{
    type: 'all_ok' | 'some_missing' | 'no_pagela' | 'no_children' | 'exception' | 'no_weekday' | 'out_of_period' | 'club_inactive' | 'children_not_attending';
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
      
      childrenList?: Array<{
        childId: string;
        childName: string;
        isActive: boolean;
        reason?: string;
      }>;
      
      childrenNotAttending?: number;
      note?: string;
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
  note?: string; 
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface CurrentWeekInfo {
  academicYear: number | null;
  academicWeek: number | null;
  isWithinPeriod: boolean;
  periodStartDate: string | null;
  periodEndDate: string | null;
}

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
      clubsWithProblems?: number;
      clubsWarning?: number;
      
      totalClubsInactive?: number;
    };
    children: {
      total: number;
      withPagela: number;
      missing: number;
      completionRate: number;
      missingRate: number;
      
      notAttending?: {
        total: number;
        fromInactiveClubs: number;
        fromInactiveChildren: number;
      };
    };
  };
  indicators: {
    byType?: {
      all_ok?: Array<any>;
      some_missing?: Array<any>;
      no_pagela?: Array<any>;
      no_children?: Array<any>;
      exception?: Array<any>;
      no_weekday?: Array<any>;
      out_of_period?: Array<any>;
      club_inactive?: Array<any>;
      children_not_attending?: Array<any>;
    };
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
        needsAttention?: boolean;
        urgency?: 'low' | 'medium' | 'high' | 'critical';
        
        childrenList?: Array<{
          childId: string;
          childName: string;
          isActive: boolean;
          reason?: string;
        }>;
        
        childrenNotAttending?: number;
        
        lastPagelaDate?: string | null;
        note?: string;
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
        needsAttention?: boolean;
        urgency?: 'low' | 'medium' | 'high' | 'critical';
        
        childrenList?: Array<{
          childId: string;
          childName: string;
          isActive: boolean;
          reason?: string;
        }>;
        
        childrenNotAttending?: number;
        
        lastPagelaDate?: string | null;
        note?: string;
      };
      clubId: string;
      clubNumber: number;
    }>;
    info?: Array<{
      type: string;
      severity: 'info';
      message: string;
      details?: {
        totalChildren?: number;
        childrenNotAttending?: number;
        note?: string;
      };
      clubId: string;
      clubNumber: number;
    }>;
    success?: Array<{
      type: string;
      severity: 'success';
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
          
          childrenList?: Array<{
            childId: string;
            childName: string;
            isActive: boolean;
            reason?: string;
          }>;
          
          childrenNotAttending?: number;
          note?: string;
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
          
          childrenList?: Array<{
            childId: string;
            childName: string;
            isActive: boolean;
            reason?: string;
          }>;
          
          childrenNotAttending?: number;
          note?: string;
        };
      }>;
    }>;
  };
  statistics?: {
    byWeekday?: Array<{
      weekday: string;
      totalClubs: number;
      clubsOk: number;
      clubsPartial?: number;
      clubsMissing: number;
      totalChildren: number;
      childrenWithPagela: number;
      childrenMissing: number;
      completionRate: number;
    }>;
    overall?: {
      completionRate: number;
      missingRate: number;
      problemsRate: number;
    };
  };
  recommendations?: string[]; 
  currentWeek?: CurrentWeekInfo;
  pagination?: PaginationMeta; 
  
  inactiveClubs?: Array<{
    clubId: string;
    clubNumber: number;
    weekday: string;
    isActive: false;
  }>;
  
  childrenNotAttending?: {
    total: number;
    list: Array<{
      childId: string;
      childName: string;
      isActive: boolean;
    }>;
  };
}

export interface WeekCheckResult {
  year: number | string; 
  week: number | string; 
  period?: {
    year: number;
    week?: number; 
    weekRange?: {
      start: string;
      end: string;
    };
    startDate?: string; 
    endDate?: string; 
  };
  summary: {
    totalClubs: number;
    clubsOk: number;
    clubsPending?: number; 
    clubsPartial: number;
    clubsMissing: number;
    clubsException: number;
    clubsInactive: number;
    clubsOutOfPeriod: number;
    overallCompleteness?: number;
    
    totalClubsInactive?: number;
    totalChildrenNotAttending?: number;
    inactiveClubsCount?: number;
  };
  clubs: ClubCheckResult[];
  pagination?: PaginationMeta; 
  criticalAlerts?: Array<{
    clubId: string;
    clubNumber: number;
    message: string;
    missingChildren: number;
  }>;
  currentWeek?: CurrentWeekInfo; 
  note?: string; 
  
  inactiveClubs?: Array<{
    clubId: string;
    clubNumber: number;
    weekday: string;
    isActive: false;
  }>;
  
  childrenNotAttending?: {
    total: number;
    list: Array<{
      childId: string;
      childName: string;
      isActive: boolean;
    }>;
  };
}

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
