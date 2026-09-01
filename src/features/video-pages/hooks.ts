import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import {
  FORM_VALIDATION_MESSAGES,
  GENERIC_ERROR_MESSAGES,
} from '@/constants/errorMessages';
import { FEATURE_SUCCESS_MESSAGES } from '@/constants/successMessages';

import {
  apiCreateVideoPage,
  apiDeleteVideoPage,
  apiListVideoPages,
  apiUpdateVideoPage,
} from './api';
import {
  VideoDraft,
  VideoPageFormErrors,
  VideoPageFormValues,
} from './types';
import {
  buildVideoPageFormData,
  toFormValues,
  toVideoDrafts,
} from './utils';
import { VIDEO_PAGE_SEARCH_DEBOUNCE_MS } from './constants';
import { VideoPageResponse } from './types';

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDebounced(value), delay) as unknown as number;
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [value, delay]);

  return debounced;
}

export function useVideoPages() {
  const [pages, setPages] = useState<VideoPageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, VIDEO_PAGE_SEARCH_DEBOUNCE_MS);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await apiListVideoPages();
      setPages(list);
    } catch {
      setError('Erro ao buscar páginas de vídeos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return pages;
    return pages.filter((p) => p.title?.toLowerCase().includes(term));
  }, [pages, debouncedSearch]);

  const removePage = useCallback(async (id: string) => {
    await apiDeleteVideoPage(id);
    await fetchPages();
  }, [fetchPages]);

  return {
    pages,
    filtered,
    loading,
    error,
    search,
    setSearch,
    fetchPages,
    removePage,
    setError,
  };
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
