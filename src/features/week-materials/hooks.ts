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

import { useAbortController, useDebouncedValue } from '@/hooks';
import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';

import { createWeekMaterial, deleteWeekMaterial, getWeekMaterial, listWeekMaterials, setCurrentWeek, updateWeekMaterial } from './api';
import { WEEK_MATERIALS_DEFAULT_LIMIT } from './constants';
import {
  WeekMaterialFormErrors,
  WeekMaterialFormValues,
  WeekMaterialMediaDraft,
  WeekMaterialResponse,
  WeekMaterialSortField,
  WeekMaterialSortOrder,
  WeekMaterialSummary,
} from './types';
import { buildWeekMaterialFormData } from './utils';

const LIST_ERROR_MESSAGE = 'Erro ao buscar materiais semanais';
const DETAIL_ERROR_MESSAGE =
  'Erro ao carregar os materiais de estudo. Tente novamente mais tarde.';

// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

/** Filtros que a tela envia à API. */
interface WeekMaterialListFilters {
  /** `''` para todas; `'true'`/`'false'` para o recorte da semana atual. */
  currentWeek: string;
  sort: WeekMaterialSortField;
  order: WeekMaterialSortOrder;
}

const INITIAL_FILTERS: WeekMaterialListFilters = {
  currentWeek: '',
  sort: 'createdAt',
  order: 'DESC',
};

/** Página de materiais semanais, com busca e filtros resolvidos pela API. */
export function useWeekMaterials() {
  const [items, setItems] = useState<WeekMaterialSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(WEEK_MATERIALS_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] =
    useState<WeekMaterialListFilters>(INITIAL_FILTERS);
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
        const data = await listWeekMaterials(
          {
            page,
            limit: pageSize,
            searchString: debouncedSearch.trim() || undefined,
            currentWeek:
              filters.currentWeek === ''
                ? undefined
                : filters.currentWeek === 'true',
            sort: filters.sort,
            order: filters.order,
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, LIST_ERROR_MESSAGE));
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

/** Exclusão e publicação da semana, a partir da listagem. */
export function useWeekMaterialMutations(refresh: () => void) {
  const dispatch = useDispatch<AppDispatch>();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const run = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string) => {
      setActionLoading(true);
      setActionError('');
      try {
        await action();
        // A página tem rota pública, e o banner da home lê essas rotas.
        await dispatch(fetchRoutes());
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, fallbackMessage));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [dispatch, refresh],
  );

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await deleteWeekMaterial(id);
      }, 'Erro ao excluir a página'),
    [run],
  );

  const markAsCurrent = useCallback(
    (id: string) =>
      run(async () => {
        await setCurrentWeek(id);
      }, 'Erro ao publicar a página como material da semana'),
    [run],
  );

  return { actionLoading, actionError, setActionError, remove, markAsCurrent };
}

/**
 * Carrega uma página pelo id, com todas as suas mídias.
 *
 * A listagem só traz o resumo; tanto o detalhe quanto a edição pedem a página
 * inteira por aqui. Antes a edição dependia do que a listagem havia deixado no
 * store, e um F5 abria o formulário vazio.
 */
export function useWeekMaterialById(id: string | undefined) {
  const [material, setMaterial] = useState<WeekMaterialResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  const nextController = useAbortController();

  useEffect(() => {
    if (!id) {
      setMaterial(null);
      setLoading(false);
      return;
    }

    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getWeekMaterial(id, { signal: controller.signal });
        setMaterial(data);
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, DETAIL_ERROR_MESSAGE));
        setMaterial(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [id, nextController]);

  return { material, loading, error };
}

interface UseWeekMaterialPageResult {
  material: WeekMaterialResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Página pública de um material semanal.
 *
 * O estado é local: a cópia no Redux existia só para a edição do painel, que
 * hoje carrega a página pelo id da URL.
 */
export function useWeekMaterialPage(
  idToFetch: string,
): UseWeekMaterialPageResult {
  const [material, setMaterial] = useState<WeekMaterialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWeekMaterial(idToFetch);
        if (!active) return;
        setMaterial(data);
      } catch {
        if (active) setError(DETAIL_ERROR_MESSAGE);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [idToFetch]);

  return { material, loading, error };
}

interface UseWeekMaterialFormParams {
  isCreation: boolean;
  pageId?: string;
}

interface UseWeekMaterialFormResult {
  values: WeekMaterialFormValues;
  setValue: <K extends keyof WeekMaterialFormValues>(
    key: K,
    value: WeekMaterialFormValues[K],
  ) => void;
  media: WeekMaterialMediaDraft;
  setMedia: <K extends keyof WeekMaterialMediaDraft>(
    key: K,
    value: WeekMaterialMediaDraft[K],
  ) => void;
  reset: (
    values: WeekMaterialFormValues,
    media: WeekMaterialMediaDraft,
  ) => void;
  errors: WeekMaterialFormErrors;
  /** True enquanto houver alteração feita nesta sessão e ainda não salva. */
  isDirty: boolean;
  saving: boolean;
  feedback: { message: string; severity: 'success' | 'error' } | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}

const EMPTY_VALUES: WeekMaterialFormValues = {
  pageTitle: '',
  pageSubtitle: '',
  pageDescription: '',
  currentWeek: false,
};

const EMPTY_MEDIA: WeekMaterialMediaDraft = {
  videos: [],
  documents: [],
  images: [],
  audios: [],
};

const NO_ERRORS: WeekMaterialFormErrors = {
  title: false,
  subtitle: false,
  description: false,
};

/** Owns the admin create/edit form: draft state, validation and submission. */
export function useWeekMaterialForm({
  isCreation,
  pageId,
}: UseWeekMaterialFormParams): UseWeekMaterialFormResult {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [values, setValues] = useState<WeekMaterialFormValues>(EMPTY_VALUES);
  const [media, setMediaState] = useState<WeekMaterialMediaDraft>(EMPTY_MEDIA);
  const [errors, setErrors] = useState<WeekMaterialFormErrors>(NO_ERRORS);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<UseWeekMaterialFormResult['feedback']>(
    null,
  );

  const setValue = useCallback(
    <K extends keyof WeekMaterialFormValues>(
      key: K,
      value: WeekMaterialFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const setMedia = useCallback(
    <K extends keyof WeekMaterialMediaDraft>(
      key: K,
      value: WeekMaterialMediaDraft[K],
    ) => {
      setMediaState((previous) => ({ ...previous, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const reset = useCallback(
    (nextValues: WeekMaterialFormValues, nextMedia: WeekMaterialMediaDraft) => {
      setValues(nextValues);
      setMediaState(nextMedia);
      setErrors(NO_ERRORS);
      setIsDirty(false);
    },
    [],
  );

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const save = useCallback(async () => {
    const nextErrors: WeekMaterialFormErrors = {
      title: !values.pageTitle,
      subtitle: !values.pageSubtitle,
      description: !values.pageDescription,
    };
    setErrors(nextErrors);

    if (nextErrors.title || nextErrors.subtitle || nextErrors.description) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.REQUIRED_GENERIC,
        severity: 'error',
      });
      return;
    }

    if (!isCreation && !pageId) {
      setFeedback({
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      const formData = buildWeekMaterialFormData(
        values,
        media,
        isCreation ? undefined : pageId,
      );

      const saved = isCreation
        ? await createWeekMaterial(formData)
        : await updateWeekMaterial(pageId as string, formData);

      await dispatch(fetchRoutes());
      setIsDirty(false);
      setFeedback({
        message: FEATURE_SUCCESS_MESSAGES.PAGE_SAVED,
        severity: 'success',
      });
      navigate(`/${saved.route.path}`);
    } catch {
      setFeedback({
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [values, media, isCreation, pageId, dispatch, navigate]);

  return {
    values,
    setValue,
    media,
    setMedia,
    reset,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  };
}
