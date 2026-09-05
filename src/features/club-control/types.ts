/**
 * Contratos de `/club-control`.
 *
 * Ficavam dentro de `api.ts`, que por isso tinha 487 linhas — 429 delas só de
 * declaração. Separar deixa o `api.ts` com as chamadas e nada mais, que é o
 * formato que as outras 23 features seguem.
 *
 * Os nomes acompanham os DTOs do back (`src/modules/club-control/dto`).
 */

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

/**
 * Uma criança listada no detalhe de um indicador.
 *
 * Corresponde a `IndicatorChildDto` no back.
 */
export interface IndicatorChild {
  childId: string;
  childName: string;
  isActive: boolean;
  reason?: string;
}

/** O detalhe que acompanha um indicador (`ClubIndicatorDetailsDto` no back). */
export interface ClubIndicatorDetails {
  totalChildren?: number;
  childrenWithPagela?: number;
  childrenMissing?: number;
  childrenNotAttending?: number;
  childrenList?: IndicatorChild[];
  completionRate?: number;
  missingRate?: number;
  isPerfect?: boolean;
  needsAttention?: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  lastPagelaDate?: string | null;
  possibleIssue?: string;
  exceptionDate?: string;
  reason?: string;
  type?: string;
  isRecurrent?: boolean;
  note?: string;
}

/** Um indicador emitido para um clubinho. */
export interface ClubIndicator {
  type: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  message: string;
  details?: ClubIndicatorDetails;
}

/**
 * Um indicador agrupado por tipo, com o clubinho a que pertence.
 *
 * Corresponde a `ClubIndicatorDetailDto` no back. Era `Array<any>` nos nove
 * grupos de `byType`, o que apagava a checagem do payload inteiro — não só do
 * campo.
 */
export interface ClubIndicatorByType {
  clubId: string;
  clubNumber: number;
  weekday: string;
  indicator: ClubIndicator;
  children: ClubCheckResult['children'];
  week: {
    year: number;
    week: number;
    expectedDate: string | null;
  };
}

/** Situação de um clubinho numa semana. Espelha o que o back devolve. */
export type ClubCheckStatus =
  | 'ok'
  | 'pending'
  | 'partial'
  | 'missing'
  | 'exception'
  | 'inactive'
  | 'out_of_period';

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
  status: ClubCheckStatus;
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
    byType?: Partial<
      Record<
        | 'all_ok'
        | 'some_missing'
        | 'no_pagela'
        | 'no_children'
        | 'exception'
        | 'no_weekday'
        | 'out_of_period'
        | 'club_inactive'
        | 'children_not_attending',
        ClubIndicatorByType[]
      >
    >;
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
