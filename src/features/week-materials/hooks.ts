import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { setWeekMaterialData } from '@/store/slices/week-material/weekMaterialSlice';
import {
  FORM_VALIDATION_MESSAGES,
  GENERIC_ERROR_MESSAGES,
} from '@/constants/errorMessages';
import { FEATURE_SUCCESS_MESSAGES } from '@/constants/successMessages';

import {
  createWeekMaterial,
  deleteWeekMaterial,
  getWeekMaterial,
  listWeekMaterials,
  setCurrentWeek,
  updateWeekMaterial,
} from './api';
import { WEEK_MATERIAL_SEARCH_DEBOUNCE_MS } from './constants';
import {
  WeekMaterialFormErrors,
  WeekMaterialFormValues,
  WeekMaterialMediaDraft,
  WeekMaterialResponse,
} from './types';
import { buildWeekMaterialFormData, filterByTitle } from './utils';

const LIST_ERROR_MESSAGE = 'Erro ao buscar materiais semanais';
const DETAIL_ERROR_MESSAGE =
  'Erro ao carregar os materiais de estudo. Tente novamente mais tarde.';

// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

interface UseWeekMaterialsResult {
  materials: WeekMaterialResponse[];
  filtered: WeekMaterialResponse[];
  search: string;
  setSearch: (value: string) => void;
  loading: boolean;
  isFiltering: boolean;
  error: string;
  setError: (value: string) => void;
  fetchAll: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  markAsCurrent: (id: string) => Promise<void>;
}

/** Owns the admin list of week material pages: loading, search and mutations. */
export function useWeekMaterials(): UseWeekMaterialsResult {
  const [materials, setMaterials] = useState<WeekMaterialResponse[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMaterials(await listWeekMaterials());
    } catch {
      setError(LIST_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(search),
      WEEK_MATERIAL_SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const filtered = useMemo(
    () => filterByTitle(materials, debouncedSearch),
    [materials, debouncedSearch],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteWeekMaterial(id);
      await fetchAll();
    },
    [fetchAll],
  );

  const markAsCurrent = useCallback(
    async (id: string) => {
      await setCurrentWeek(id);
      await fetchAll();
    },
    [fetchAll],
  );

  return {
    materials,
    filtered,
    search,
    setSearch,
    loading,
    isFiltering: search !== debouncedSearch,
    error,
    setError,
    fetchAll,
    remove,
    markAsCurrent,
  };
}

interface UseWeekMaterialPageResult {
  material: WeekMaterialResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Owns the public page of one week material: loads it and keeps the Redux copy
 * in sync so the admin form can edit the page that is being viewed.
 */
export function useWeekMaterialPage(
  idToFetch: string,
): UseWeekMaterialPageResult {
  const dispatch = useDispatch<AppDispatch>();

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
        dispatch(setWeekMaterialData(data));
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
  }, [idToFetch, dispatch]);

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
