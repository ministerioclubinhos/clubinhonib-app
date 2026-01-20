import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { PagelasStatsQueryDto, PeriodShortcut } from '../api';
import dayjs from 'dayjs';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type StatisticsContextFilters = PagelasStatsQueryDto & {
  period?: PeriodShortcut;
  search?: string;
};

export interface StatisticsState {
  filters: StatisticsContextFilters;
  activeTab: number;
  compareMode: boolean;
  compareFilters: StatisticsContextFilters | null;
  viewMode: 'cards' | 'table' | 'charts';
  favorites: string[];
  recentSearches: string[];
  customDateRange: DateRange | null;
  isFilterPanelOpen: boolean;
  selectedEntities: {
    childId?: string;
    clubId?: string;
    teacherId?: string;
    city?: string;
  };
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

type StatisticsAction =
  | { type: 'SET_FILTERS'; payload: Partial<StatisticsContextFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_PERIOD'; payload: PeriodShortcut }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_TAB'; payload: number }
  | { type: 'TOGGLE_COMPARE_MODE' }
  | { type: 'SET_COMPARE_FILTERS'; payload: StatisticsContextFilters | null }
  | { type: 'SET_VIEW_MODE'; payload: 'cards' | 'table' | 'charts' }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'TOGGLE_FILTER_PANEL' }
  | { type: 'SELECT_ENTITY'; payload: Partial<StatisticsState['selectedEntities']> }
  | { type: 'CLEAR_ENTITY_SELECTION' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'HYDRATE'; payload: Partial<StatisticsState> };

// Helpers
const getDefaultDateRange = (): DateRange => {
  const now = dayjs();
  return {
    startDate: now.startOf('month').format('YYYY-MM-DD'),
    endDate: now.endOf('month').format('YYYY-MM-DD'),
  };
};

const getPeriodDateRange = (period: PeriodShortcut): DateRange | null => {
  const now = dayjs();

  switch (period) {
    case PeriodShortcut.TODAY:
      return {
        startDate: now.format('YYYY-MM-DD'),
        endDate: now.format('YYYY-MM-DD'),
      };
    case PeriodShortcut.THIS_WEEK:
      return {
        startDate: now.startOf('week').format('YYYY-MM-DD'),
        endDate: now.endOf('week').format('YYYY-MM-DD'),
      };
    case PeriodShortcut.THIS_MONTH:
      return {
        startDate: now.startOf('month').format('YYYY-MM-DD'),
        endDate: now.endOf('month').format('YYYY-MM-DD'),
      };
    case PeriodShortcut.LAST_7_DAYS:
      return {
        startDate: now.subtract(6, 'day').format('YYYY-MM-DD'),
        endDate: now.format('YYYY-MM-DD'),
      };
    case PeriodShortcut.LAST_30_DAYS:
      return {
        startDate: now.subtract(29, 'day').format('YYYY-MM-DD'),
        endDate: now.format('YYYY-MM-DD'),
      };
    case PeriodShortcut.THIS_YEAR:
      return {
        startDate: now.startOf('year').format('YYYY-MM-DD'),
        endDate: now.endOf('year').format('YYYY-MM-DD'),
      };
    case PeriodShortcut.CUSTOM:
    default:
      return null;
  }
};

const getGroupByForPeriod = (period: PeriodShortcut): 'day' | 'week' | 'month' | 'year' => {
  switch (period) {
    case PeriodShortcut.TODAY:
    case PeriodShortcut.THIS_WEEK:
    case PeriodShortcut.LAST_7_DAYS:
      return 'day';
    case PeriodShortcut.THIS_MONTH:
    case PeriodShortcut.LAST_30_DAYS:
      return 'week';
    case PeriodShortcut.THIS_YEAR:
      return 'month';
    default:
      return 'week';
  }
};

// Initial State
const getInitialState = (): StatisticsState => {
  const defaultRange = getDefaultDateRange();
  return {
    filters: {
      startDate: defaultRange.startDate,
      endDate: defaultRange.endDate,
      groupBy: 'week',
      period: PeriodShortcut.THIS_MONTH,
    },
    activeTab: 0,
    compareMode: false,
    compareFilters: null,
    viewMode: 'cards',
    favorites: [],
    recentSearches: [],
    customDateRange: null,
    isFilterPanelOpen: false,
    selectedEntities: {},
    notifications: [],
  };
};

// Reducer
const statisticsReducer = (state: StatisticsState, action: StatisticsAction): StatisticsState => {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'RESET_FILTERS': {
      const defaultRange = getDefaultDateRange();
      return {
        ...state,
        filters: {
          startDate: defaultRange.startDate,
          endDate: defaultRange.endDate,
          groupBy: 'week',
          period: PeriodShortcut.THIS_MONTH,
        },
        customDateRange: null,
      };
    }

    case 'SET_PERIOD': {
      const dateRange = getPeriodDateRange(action.payload);
      const groupBy = getGroupByForPeriod(action.payload);
      return {
        ...state,
        filters: {
          ...state.filters,
          period: action.payload,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
          groupBy,
          year: action.payload === 'this_year' ? dayjs().year() : undefined,
        },
        customDateRange: action.payload === 'custom' ? state.customDateRange : null,
      };
    }

    case 'SET_DATE_RANGE':
      return {
        ...state,
        filters: {
          ...state.filters,
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
          period: PeriodShortcut.CUSTOM,
        },
        customDateRange: action.payload,
      };

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'TOGGLE_COMPARE_MODE':
      return {
        ...state,
        compareMode: !state.compareMode,
        compareFilters: state.compareMode ? null : state.compareFilters,
      };

    case 'SET_COMPARE_FILTERS':
      return { ...state, compareFilters: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.payload)
          ? state.favorites
          : [...state.favorites, action.payload],
      };

    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter((f) => f !== action.payload),
      };

    case 'ADD_RECENT_SEARCH':
      return {
        ...state,
        recentSearches: [
          action.payload,
          ...state.recentSearches.filter((s) => s !== action.payload),
        ].slice(0, 10),
      };

    case 'TOGGLE_FILTER_PANEL':
      return { ...state, isFilterPanelOpen: !state.isFilterPanelOpen };

    case 'SELECT_ENTITY':
      return {
        ...state,
        selectedEntities: { ...state.selectedEntities, ...action.payload },
      };

    case 'CLEAR_ENTITY_SELECTION':
      return { ...state, selectedEntities: {} };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          {
            ...action.payload,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            read: false,
          },
          ...state.notifications,
        ].slice(0, 50),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'HYDRATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Context
interface StatisticsContextValue {
  state: StatisticsState;
  dispatch: React.Dispatch<StatisticsAction>;
  // Convenience methods
  setFilters: (filters: Partial<StatisticsContextFilters>) => void;
  resetFilters: () => void;
  setPeriod: (period: PeriodShortcut) => void;
  setDateRange: (range: DateRange) => void;
  setTab: (tab: number) => void;
  toggleCompareMode: () => void;
  setViewMode: (mode: 'cards' | 'table' | 'charts') => void;
  selectEntity: (entity: Partial<StatisticsState['selectedEntities']>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  // Computed values
  formattedPeriod: string;
  isCustomPeriod: boolean;
  hasActiveFilters: boolean;
  unreadNotifications: number;
}

const StatisticsContext = createContext<StatisticsContextValue | null>(null);

// Storage key
const STORAGE_KEY = 'clubinho-statistics-state';

// Provider
export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(statisticsReducer, getInitialState());

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only hydrate certain fields
        dispatch({
          type: 'HYDRATE',
          payload: {
            favorites: parsed.favorites || [],
            recentSearches: parsed.recentSearches || [],
            viewMode: parsed.viewMode || 'cards',
          },
        });
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      const toSave = {
        favorites: state.favorites,
        recentSearches: state.recentSearches,
        viewMode: state.viewMode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore errors
    }
  }, [state.favorites, state.recentSearches, state.viewMode]);

  // Convenience methods
  const setFilters = useCallback((filters: Partial<StatisticsContextFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const setPeriod = useCallback((period: PeriodShortcut) => {
    dispatch({ type: 'SET_PERIOD', payload: period });
  }, []);

  const setDateRange = useCallback((range: DateRange) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: range });
  }, []);

  const setTab = useCallback((tab: number) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  }, []);

  const toggleCompareMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_COMPARE_MODE' });
  }, []);

  const setViewMode = useCallback((mode: 'cards' | 'table' | 'charts') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const selectEntity = useCallback((entity: Partial<StatisticsState['selectedEntities']>) => {
    dispatch({ type: 'SELECT_ENTITY', payload: entity });
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  // Computed values
  const formattedPeriod = useMemo(() => {
    const { startDate, endDate, period } = state.filters;
    if (!startDate || !endDate) return 'Selecione um período';

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (period === PeriodShortcut.TODAY) return 'Hoje';
    if (period === PeriodShortcut.THIS_WEEK) return 'Esta semana';
    if (period === PeriodShortcut.THIS_MONTH) return start.format('MMMM [de] YYYY');
    if (period === PeriodShortcut.LAST_7_DAYS) return 'Últimos 7 dias';
    if (period === PeriodShortcut.LAST_30_DAYS) return 'Últimos 30 dias';
    if (period === PeriodShortcut.THIS_YEAR) return `Ano de ${start.year()}`;

    return `${start.format('DD/MM/YY')} - ${end.format('DD/MM/YY')}`;
  }, [state.filters]);

  const isCustomPeriod = state.filters.period === PeriodShortcut.CUSTOM;

  const hasActiveFilters = useMemo(() => {
    const { filters } = state;
    return !!(
      filters.clubId ||
      filters.teacherId ||
      filters.coordinatorId ||
      filters.gender ||
      filters.minAge ||
      filters.maxAge ||
      filters.city ||
      filters.state ||
      filters.district
    );
  }, [state.filters]);

  const unreadNotifications = state.notifications.filter((n) => !n.read).length;

  // Split context into state and actions to prevent unnecessary re-renders
  const actionsValue = useMemo(
    () => ({
      dispatch,
      setFilters,
      resetFilters,
      setPeriod,
      setDateRange,
      setTab,
      toggleCompareMode,
      setViewMode,
      selectEntity,
      addNotification,
    }),
    [
      setFilters,
      resetFilters,
      setPeriod,
      setDateRange,
      setTab,
      toggleCompareMode,
      setViewMode,
      selectEntity,
      addNotification,
    ]
  );

  const computedValue = useMemo(
    () => ({
      formattedPeriod,
      isCustomPeriod,
      hasActiveFilters,
      unreadNotifications,
    }),
    [formattedPeriod, isCustomPeriod, hasActiveFilters, unreadNotifications]
  );

  const value = useMemo(
    () => ({
      state,
      ...actionsValue,
      ...computedValue,
    }),
    [state, actionsValue, computedValue]
  );

  return <StatisticsContext.Provider value={value}>{children}</StatisticsContext.Provider>;
};

// Hook
export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};

export default StatisticsContext;
