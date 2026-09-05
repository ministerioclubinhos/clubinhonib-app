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

import { apiCreateVideoPage, apiDeleteVideoPage, apiGetVideoPage, apiListVideoPages, apiUpdateVideoPage } from './api';
import {
  VideoDraft,
  VideoPageFormErrors,
  VideoPageFormValues,
  VideoPageSortField,
  VideoPageSortOrder,
  VideoPageSummary,
} from './types';
import {
  buildVideoPageFormData,
  toFormValues,
  toVideoDrafts,
} from './utils';
import { VIDEO_PAGES_DEFAULT_LIMIT } from './constants';
import { VideoPageResponse } from './types';

/** Filtros que a tela envia à API. */
interface VideoPageListFilters {
  /** `''` para todas; `'true'`/`'false'` para o recorte de visibilidade. */
  visibility: string;
  sort: VideoPageSortField;
  order: VideoPageSortOrder;
}

const INITIAL_FILTERS: VideoPageListFilters = {
  visibility: '',
  sort: 'createdAt',
  order: 'DESC',
};

/** Página de galerias de vídeo, com busca e filtros resolvidos pela API. */
export function useVideoPages() {
  const [items, setItems] = useState<VideoPageSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(VIDEO_PAGES_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<VideoPageListFilters>(INITIAL_FILTERS);
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
        const data = await apiListVideoPages(
          {
            page,
            limit: pageSize,
            searchString: debouncedSearch.trim() || undefined,
            public:
              filters.visibility === ''
                ? undefined
                : filters.visibility === 'true',
            sort: filters.sort,
            order: filters.order,
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(
          extractErrorMessage(err, 'Erro ao carregar as páginas de vídeos'),
        );
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

/** Exclusão da página a partir da listagem. */
export function useVideoPageMutations(refresh: () => void) {
  const dispatch = useDispatch<AppDispatch>();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const remove = useCallback(
    async (id: string) => {
      setSaving(true);
      setActionError('');
      try {
        await apiDeleteVideoPage(id);
        // A página tem rota pública; o menu do site vem dessas rotas.
        await dispatch(fetchRoutes());
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, 'Erro ao excluir a página'));
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
 * Carrega a página da edição pelo id da URL.
 *
 * Antes a tela dependia do que a listagem tinha deixado no store; um F5 na
 * rota de edição abria o formulário vazio.
 */
export function useVideoPageById(id: string | undefined) {
  const [page, setPage] = useState<VideoPageResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  const nextController = useAbortController();

  useEffect(() => {
    if (!id) {
      setPage(null);
      setLoading(false);
      return;
    }

    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGetVideoPage(id, { signal: controller.signal });
        setPage(data);
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, 'Erro ao carregar a página'));
        setPage(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [id, nextController]);

  return { page, loading, error };
}

// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const NO_ERRORS: VideoPageFormErrors = { title: false, description: false };

interface UseVideoPageFormParams {
  isCreation: boolean;
  page: VideoPageResponse | null;
}

interface Feedback {
  message: string;
  severity: 'success' | 'error';
}

interface UseVideoPageFormResult {
  values: VideoPageFormValues;
  setValue: <K extends keyof VideoPageFormValues>(
    key: K,
    value: VideoPageFormValues[K],
  ) => void;
  videos: VideoDraft[];
  setVideos: (videos: VideoDraft[]) => void;
  errors: VideoPageFormErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: Feedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}

/** Estado, validação e submissão do formulário de galeria de vídeos. */
export function useVideoPageForm({
  isCreation,
  page,
}: UseVideoPageFormParams): UseVideoPageFormResult {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [values, setValues] = useState<VideoPageFormValues>(() =>
    toFormValues(isCreation ? null : page),
  );
  const [videos, setVideosState] = useState<VideoDraft[]>(() =>
    toVideoDrafts(isCreation ? null : page),
  );
  const [errors, setErrors] = useState<VideoPageFormErrors>(NO_ERRORS);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setValues(toFormValues(isCreation ? null : page));
    setVideosState(toVideoDrafts(isCreation ? null : page));
    setErrors(NO_ERRORS);
    setIsDirty(false);
  }, [isCreation, page]);

  const setValue = useCallback(
    <K extends keyof VideoPageFormValues>(
      key: K,
      value: VideoPageFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const setVideos = useCallback((next: VideoDraft[]) => {
    setVideosState(next);
    setIsDirty(true);
  }, []);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const save = useCallback(async () => {
    const nextErrors: VideoPageFormErrors = {
      title: !values.title.trim(),
      description: !values.description.trim(),
    };
    setErrors(nextErrors);

    if (nextErrors.title || nextErrors.description) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.REQUIRED_GENERIC,
        severity: 'error',
      });
      return;
    }

    if (!isCreation && !page?.id) {
      setFeedback({
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      const formData = buildVideoPageFormData(
        values,
        videos,
        isCreation ? undefined : page?.id,
      );

      const saved = isCreation
        ? await apiCreateVideoPage(formData)
        : await apiUpdateVideoPage(page?.id as string, formData);

      await dispatch(fetchRoutes());
      setIsDirty(false);
      setFeedback({
        message: isCreation
          ? FEATURE_SUCCESS_MESSAGES.PAGE_CREATED
          : FEATURE_SUCCESS_MESSAGES.PAGE_UPDATED,
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
  }, [values, videos, isCreation, page, dispatch, navigate]);

  return {
    values,
    setValue,
    videos,
    setVideos,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  };
}
