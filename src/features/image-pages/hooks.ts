import { useCallback, useEffect, useMemo, useState } from 'react';
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
  apiCreateImagePage,
  apiDeleteImagePage,
  apiListImagePages,
  apiUpdateImagePage,
} from './api';
import {
  ImagePageFormErrors,
  ImagePageFormValues,
  ImagePageResponse,
  ImageSectionDraft,
} from './types';
import {
  buildImagePageFormData,
  toFormValues,
  toSectionDrafts,
} from './utils';

export function useImagePages() {
  const [pages, setPages] = useState<ImagePageResponse[]>([]);
  const [filtered, setFiltered] = useState<ImagePageResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiListImagePages();
      setPages(data);
      setFiltered(data);
    } catch (e) {
      console.error('Erro ao buscar páginas de imagens:', e);
      setError('Erro ao buscar páginas de imagens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => {
      const term = search.trim().toLowerCase();
      if (!term) {
        setFiltered(pages);
      } else {
        setFiltered(
          pages.filter((p) => (p.title ?? '').toLowerCase().includes(term)),
        );
      }
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, pages]);

  const removePage = useCallback(async (id: string) => {
    await apiDeleteImagePage(id);
    await fetchPages();
  }, [fetchPages]);

  const state = useMemo(() => ({
    pages, filtered, loading, isFiltering, error,
  }), [pages, filtered, loading, isFiltering, error]);

  return { ...state, search, setSearch, setError, fetchPages, removePage };
}

// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const NO_ERRORS: ImagePageFormErrors = { title: false, description: false };

interface UseImagePageFormParams {
  isCreation: boolean;
  page: ImagePageResponse | null;
}

interface Feedback {
  message: string;
  severity: 'success' | 'error';
}

interface UseImagePageFormResult {
  values: ImagePageFormValues;
  setValue: <K extends keyof ImagePageFormValues>(
    key: K,
    value: ImagePageFormValues[K],
  ) => void;
  sections: ImageSectionDraft[];
  setSections: (sections: ImageSectionDraft[]) => void;
  errors: ImagePageFormErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: Feedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}

/** Estado, validação e submissão do formulário de galeria de fotos. */
export function useImagePageForm({
  isCreation,
  page,
}: UseImagePageFormParams): UseImagePageFormResult {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [values, setValues] = useState<ImagePageFormValues>(() =>
    toFormValues(isCreation ? null : page),
  );
  const [sections, setSectionsState] = useState<ImageSectionDraft[]>(() =>
    toSectionDrafts(isCreation ? null : page),
  );
  const [errors, setErrors] = useState<ImagePageFormErrors>(NO_ERRORS);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setValues(toFormValues(isCreation ? null : page));
    setSectionsState(toSectionDrafts(isCreation ? null : page));
    setErrors(NO_ERRORS);
    setIsDirty(false);
  }, [isCreation, page]);

  const setValue = useCallback(
    <K extends keyof ImagePageFormValues>(
      key: K,
      value: ImagePageFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const setSections = useCallback((next: ImageSectionDraft[]) => {
    setSectionsState(next);
    setIsDirty(true);
  }, []);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const save = useCallback(async () => {
    const nextErrors: ImagePageFormErrors = {
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
      const formData = buildImagePageFormData(
        values,
        sections,
        isCreation ? undefined : page?.id,
      );

      const saved = isCreation
        ? await apiCreateImagePage(formData)
        : await apiUpdateImagePage(page?.id as string, formData);

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
  }, [values, sections, isCreation, page, dispatch, navigate]);

  return {
    values,
    setValue,
    sections,
    setSections,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  };
}
