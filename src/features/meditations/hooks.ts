import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import {
  FORM_VALIDATION_MESSAGES,
  GENERIC_ERROR_MESSAGES,
} from '@/constants/errorMessages';
import { FEATURE_SUCCESS_MESSAGES } from '@/constants/successMessages';
import { MediaUploadType } from '@/store/slices/types';

import { useAbortController, useDebouncedValue } from '@/hooks';
import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';

import { createMeditation, deleteMeditation, getMeditation, listMeditations, updateMeditation } from './api';
import {
  MEDITATIONS_DEFAULT_LIMIT,
  MEDITATION_DAYS_COUNT,
  MEDITATION_ROUTES,
} from './constants';
import {
  MeditationDayDraft,
  MeditationFormErrors,
  MeditationFormValues,
  MeditationPeriodFilter,
  MeditationResponse,
  MeditationSortField,
  MeditationSortOrder,
} from './types';
import {
  buildMeditationFormData,
  isFriday,
  isMonday,
  toDayDrafts,
  toFormValues,
} from './utils';

/** Filtros que a tela envia à API. */
interface MeditationListFilters {
  /** `''` para todas; `current`, `upcoming` ou `past` para o recorte. */
  period: string;
  sort: MeditationSortField;
  order: MeditationSortOrder;
}

const INITIAL_FILTERS: MeditationListFilters = {
  period: '',
  sort: 'startDate',
  order: 'DESC',
};

/** Página de meditações, com busca e filtros resolvidos pela API. */
export function useMeditations() {
  const [items, setItems] = useState<MeditationResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(MEDITATIONS_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MeditationListFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();

  // Trocar busca ou filtro recomeça da primeira página: a página 5 do
  // resultado anterior quase nunca existe no novo.
  useEffect(() => setPage(1), [debouncedSearch, filters, pageSize]);

  useEffect(() => {
    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await listMeditations(
          {
            page,
            limit: pageSize,
            searchString: debouncedSearch.trim() || undefined,
            period: (filters.period || undefined) as
              | MeditationPeriodFilter
              | undefined,
            sort: filters.sort,
            order: filters.order,
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, 'Erro ao carregar as meditações'));
        setItems([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [page, pageSize, debouncedSearch, filters, reloadToken, nextController]);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    items,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    loading,
    error,
    setError,
    refresh,
  };
}

/** Exclusão da meditação a partir da listagem. */
export function useMeditationMutations(refresh: () => void) {
  const dispatch = useDispatch<AppDispatch>();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const remove = useCallback(
    async (id: string) => {
      setSaving(true);
      setActionError('');
      try {
        await deleteMeditation(id);
        // A meditação tem rota pública; o menu do site vem dessas rotas.
        await dispatch(fetchRoutes());
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, 'Erro ao excluir a meditação'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dispatch, refresh],
  );

  return { saving, actionError, setActionError, remove };
}

/**
 * Carrega a meditação da edição pelo id da URL.
 *
 * Antes a tela dependia do que a listagem tinha deixado no store; um F5 na
 * rota de edição abria o formulário vazio.
 */
export function useMeditationById(id: string | undefined) {
  const [meditation, setMeditation] = useState<MeditationResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  const nextController = useAbortController();

  useEffect(() => {
    if (!id) {
      setMeditation(null);
      setLoading(false);
      return;
    }

    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMeditation(id, { signal: controller.signal });
        setMeditation(data);
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, 'Erro ao carregar a meditação'));
        setMeditation(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [id, nextController]);

  return { meditation, loading, error };
}



// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const NO_ERRORS: MeditationFormErrors = {
  topic: false,
  startDate: false,
  endDate: false,
};

interface UseMeditationFormParams {
  isCreation: boolean;
  meditation: MeditationResponse | null;
}

interface Feedback {
  message: string;
  severity: 'success' | 'error';
}

interface UseMeditationFormResult {
  values: MeditationFormValues;
  setValue: <K extends keyof MeditationFormValues>(
    key: K,
    value: MeditationFormValues[K],
  ) => void;
  days: MeditationDayDraft[];
  setDays: (days: MeditationDayDraft[]) => void;
  errors: MeditationFormErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: Feedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}

/** Estado, validação e submissão do formulário de meditação. */
export function useMeditationForm({
  isCreation,
  meditation,
}: UseMeditationFormParams): UseMeditationFormResult {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [values, setValues] = useState<MeditationFormValues>(() =>
    toFormValues(isCreation ? null : meditation),
  );
  const [days, setDaysState] = useState<MeditationDayDraft[]>(() =>
    toDayDrafts(isCreation ? null : meditation),
  );
  const [errors, setErrors] = useState<MeditationFormErrors>(NO_ERRORS);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setValues(toFormValues(isCreation ? null : meditation));
    setDaysState(toDayDrafts(isCreation ? null : meditation));
    setErrors(NO_ERRORS);
    setIsDirty(false);
  }, [isCreation, meditation]);

  const setValue = useCallback(
    <K extends keyof MeditationFormValues>(
      key: K,
      value: MeditationFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const setDays = useCallback((next: MeditationDayDraft[]) => {
    setDaysState(next);
    setIsDirty(true);
  }, []);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const save = useCallback(async () => {
    const nextErrors: MeditationFormErrors = {
      topic: !values.topic.trim(),
      startDate: !values.startDate,
      endDate: !values.endDate,
    };
    setErrors(nextErrors);

    if (nextErrors.topic || nextErrors.startDate || nextErrors.endDate) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.REQUIRED_GENERIC,
        severity: 'error',
      });
      return;
    }

    if (!isMonday(values.startDate)) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_DATE_MONDAY,
        severity: 'error',
      });
      return;
    }

    if (!isFriday(values.endDate)) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_DATE_FRIDAY,
        severity: 'error',
      });
      return;
    }

    if (days.length !== MEDITATION_DAYS_COUNT) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_DAYS_COUNT,
        severity: 'error',
      });
      return;
    }

    const missingMedia =
      values.uploadType === MediaUploadType.LINK
        ? !values.url.trim()
        : !values.file && !meditation?.media;

    if (missingMedia) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.MEDITATION_MEDIA_REQUIRED,
        severity: 'error',
      });
      return;
    }

    if (!isCreation && !meditation?.id) {
      setFeedback({
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      const formData = buildMeditationFormData(
        values,
        days,
        isCreation ? undefined : meditation?.id,
      );

      if (isCreation) {
        await createMeditation(formData);
      } else {
        await updateMeditation(meditation?.id as string, formData);
      }

      await dispatch(fetchRoutes());
      setIsDirty(false);
      setFeedback({
        message: FEATURE_SUCCESS_MESSAGES.MEDITATION_SAVED,
        severity: 'success',
      });
      navigate(MEDITATION_ROUTES.MANAGE);
    } catch (saveError: unknown) {
      // A API diz o que recusou — arquivo ausente, sessão expirada, payload
      // grande demais, validação. Trocar isso por um texto fixo deixava o
      // administrador sem a única informação capaz de guiar a próxima
      // tentativa.
      setFeedback({
        message: extractErrorMessage(saveError, GENERIC_ERROR_MESSAGES.SAVE_ERROR),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [values, days, isCreation, meditation, dispatch, navigate]);

  return {
    values,
    setValue,
    days,
    setDays,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  };
}
