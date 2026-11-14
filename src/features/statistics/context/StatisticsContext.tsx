import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { PeriodShortcut } from '../types';
import type { PagelasStatsQueryDto } from '../types';
import { StatisticsTab } from '../constants';
import { resolveRangeOnPeriodChange } from '../utils/periodRange';
import dayjs from 'dayjs';

export interface DateRange {
  startDate: string;
  endDate: string;
}

/** Como as listagens do painel se apresentam. */
export type StatisticsViewMode = 'cards' | 'table' | 'charts';

/**
 * Um recorte de filtros guardado pela pessoa.
 *
 * Guarda os **valores**, e não só um rótulo. O painel tinha um botão "Filtros
 * Salvos" cuja lista era de `string`: mesmo que algo a preenchesse, clicar num
 * item não teria o que reaplicar. E `search` fica de fora de propósito — é o
 * único campo que pode carregar o nome de uma criança, e nada disso vai para o
 * navegador.
 */
export interface SavedFilter {
  id: string;
  label: string;
  filters: Omit<StatisticsContextFilters, 'search'>;
}

export type StatisticsContextFilters = PagelasStatsQueryDto & {
  period?: PeriodShortcut;
  search?: string;
};

/**
 * O estado do painel.
 *
 * Enxuto de propósito. O reducer tinha dezessete ações e sete delas nunca
 * eram despachadas: `recentSearches`, `isFilterPanelOpen`, `notifications` e
 * `compareFilters` eram guardados, hidratados e persistidos sem que nada os
 * preenchesse ou lesse. `recentSearches` ainda ia para o `localStorage` — e o
 * dia em que alguém ligasse a busca das abas de crianças àquele campo, nomes
 * de criança passariam a ficar gravados no navegador, contra a regra de
 * privacidade do repositório. Estado que ninguém alimenta não guarda nada:
 * guarda uma promessa.
 */
export interface StatisticsState {
  filters: StatisticsContextFilters;
  activeTab: StatisticsTab;
  compareMode: boolean;
  viewMode: StatisticsViewMode;
  savedFilters: SavedFilter[];
  customDateRange: DateRange | null;
  selectedEntities: {
    childId?: string;
    clubId?: string;
    teacherId?: string;
    city?: string;
  };
}

type StatisticsAction =
  | { type: 'SET_FILTERS'; payload: Partial<StatisticsContextFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_PERIOD'; payload: PeriodShortcut }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_TAB'; payload: StatisticsTab }
  | { type: 'TOGGLE_COMPARE_MODE' }
  | { type: 'SET_VIEW_MODE'; payload: StatisticsViewMode }
  | { type: 'SAVE_CURRENT_FILTERS'; payload: { id: string; label: string } }
  | { type: 'APPLY_SAVED_FILTER'; payload: string }
  | { type: 'REMOVE_SAVED_FILTER'; payload: string }
  | { type: 'SELECT_ENTITY'; payload: Partial<StatisticsState['selectedEntities']> }
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
      {
        const daysSinceMonday = now.day() === 0 ? 6 : now.day() - 1;
        const monday = now.subtract(daysSinceMonday, 'day');
      return {
          startDate: monday.format('YYYY-MM-DD'),
          endDate: monday.add(5, 'day').format('YYYY-MM-DD'),
      };
      }
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
    activeTab: StatisticsTab.Overview,
    compareMode: false,
    viewMode: 'cards',
    savedFilters: [],
    customDateRange: null,
    selectedEntities: {},
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
      // "Personalizado" mantém as datas em uso até a pessoa escolher outras;
      // antes as duas eram apagadas e `period=custom` saía sozinho.
      const dateRange = resolveRangeOnPeriodChange(
        action.payload,
        getPeriodDateRange(action.payload),
        state.filters,
      );
      const isCustom = action.payload === PeriodShortcut.CUSTOM;
      const keptRange =
        isCustom && dateRange.startDate && dateRange.endDate
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : null;
      return {
        ...state,
        filters: {
          ...state.filters,
          period: action.payload,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          // O agrupamento também fica como estava: a janela não mudou.
          groupBy: isCustom ? state.filters.groupBy : getGroupByForPeriod(action.payload),
          year: action.payload === PeriodShortcut.THIS_YEAR ? dayjs().year() : undefined,
        },
        customDateRange: isCustom ? (state.customDateRange ?? keptRange) : null,
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
      return { ...state, compareMode: !state.compareMode };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SAVE_CURRENT_FILTERS': {
      const { search: _ignored, ...persistable } = state.filters;

      return {
        ...state,
        savedFilters: [
          ...state.savedFilters.filter((item) => item.label !== action.payload.label),
          { ...action.payload, filters: persistable },
        ].slice(-MAX_SAVED_FILTERS),
      };
    }

    case 'APPLY_SAVED_FILTER': {
      const chosen = state.savedFilters.find((item) => item.id === action.payload);
      if (!chosen) return state;

      // A busca em curso é preservada: o recorte salvo não a contém, e apagá-la
      // ao aplicar um filtro seria uma perda silenciosa do que se digitou.
      return {
        ...state,
        filters: { ...chosen.filters, search: state.filters.search },
        customDateRange:
          chosen.filters.period === PeriodShortcut.CUSTOM &&
          chosen.filters.startDate &&
          chosen.filters.endDate
            ? { startDate: chosen.filters.startDate, endDate: chosen.filters.endDate }
            : null,
      };
    }

    case 'REMOVE_SAVED_FILTER':
      return {
        ...state,
        savedFilters: state.savedFilters.filter((item) => item.id !== action.payload),
      };

    case 'SELECT_ENTITY':
      return {
        ...state,
        selectedEntities: { ...state.selectedEntities, ...action.payload },
      };

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
  setTab: (tab: StatisticsTab) => void;
  saveCurrentFilters: (label: string) => void;
  applySavedFilter: (id: string) => void;
  removeSavedFilter: (id: string) => void;
  toggleCompareMode: () => void;
  setViewMode: (mode: 'cards' | 'table' | 'charts') => void;
  selectEntity: (entity: Partial<StatisticsState['selectedEntities']>) => void;
  // Computed values
  formattedPeriod: string;
  isCustomPeriod: boolean;
  hasActiveFilters: boolean;
}

const StatisticsContext = createContext<StatisticsContextValue | null>(null);

// Storage key
const STORAGE_KEY = 'clubinho-statistics-state';

/** Quantos recortes o painel guarda; os mais antigos saem. */
const MAX_SAVED_FILTERS = 10;

/** As preferências que sobrevivem à visita. */
interface StoredPreferences {
  savedFilters: SavedFilter[];
  viewMode: StatisticsViewMode;
}

const VIEW_MODES: StatisticsViewMode[] = ['cards', 'table', 'charts'];

/**
 * Lê as preferências guardadas, estreitando o `unknown` na fronteira.
 *
 * `JSON.parse` devolve `any`, e o código anterior lia `parsed.favorites` sem
 * conferir nada: bastava um valor estranho no storage para o estado do painel
 * nascer inválido. Qualquer falha — storage bloqueado, JSON corrompido — cai
 * no padrão, que é o mesmo estado inicial.
 */
function readStoredPreferences(): Partial<StoredPreferences> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed !== 'object' || parsed === null) return {};

    const record = parsed as Record<string, unknown>;
    const savedFilters = Array.isArray(record.savedFilters)
      ? record.savedFilters.filter(isSavedFilter).slice(-MAX_SAVED_FILTERS)
      : undefined;
    const viewMode = VIEW_MODES.find((mode) => mode === record.viewMode);

    return {
      ...(savedFilters ? { savedFilters } : {}),
      ...(viewMode ? { viewMode } : {}),
    };
  } catch {
    return {};
  }
}

/** Reconhece um recorte salvo vindo do storage, campo a campo. */
function isSavedFilter(value: unknown): value is SavedFilter {
  if (typeof value !== 'object' || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.label === 'string' &&
    typeof record.filters === 'object' &&
    record.filters !== null
  );
}

/** Guarda as preferências; um storage indisponível não derruba a tela. */
function writeStoredPreferences(preferences: StoredPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Navegador em modo privado ou storage cheio: a tela segue sem lembrar.
  }
}

// Provider
export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(statisticsReducer, getInitialState());

  /**
   * O que o navegador guarda entre visitas.
   *
   * Só preferência de apresentação. Nada que identifique criança, professor
   * ou família entra aqui — as buscas recentes, que entravam, saíram junto com
   * o estado que ninguém preenchia.
   */
  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: readStoredPreferences() });
  }, []);

  useEffect(() => {
    writeStoredPreferences({
      savedFilters: state.savedFilters,
      viewMode: state.viewMode,
    });
  }, [state.savedFilters, state.viewMode]);

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

  const setTab = useCallback((tab: StatisticsTab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  }, []);

  const toggleCompareMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_COMPARE_MODE' });
  }, []);

  const setViewMode = useCallback((mode: StatisticsViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const selectEntity = useCallback((entity: Partial<StatisticsState['selectedEntities']>) => {
    dispatch({ type: 'SELECT_ENTITY', payload: entity });
  }, []);

  const saveCurrentFilters = useCallback((label: string) => {
    dispatch({
      type: 'SAVE_CURRENT_FILTERS',
      payload: { id: crypto.randomUUID(), label },
    });
  }, []);

  const applySavedFilter = useCallback((id: string) => {
    dispatch({ type: 'APPLY_SAVED_FILTER', payload: id });
  }, []);

  const removeSavedFilter = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SAVED_FILTER', payload: id });
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
      saveCurrentFilters,
      applySavedFilter,
      removeSavedFilter,
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
      saveCurrentFilters,
      applySavedFilter,
      removeSavedFilter,
    ]
  );

  const computedValue = useMemo(
    () => ({
      formattedPeriod,
      isCustomPeriod,
      hasActiveFilters,
    }),
    [formattedPeriod, isCustomPeriod, hasActiveFilters]
  );

  const value = useMemo(
    () => ({
      state,
      ...actionsValue,
      ...computedValue,
    }),
    [state, actionsValue, computedValue]
  );

  return <StatisticsContext.Provider data-testid="statistics-context-statistics-context-statistics-provider" value={value}>{children}</StatisticsContext.Provider>;
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
