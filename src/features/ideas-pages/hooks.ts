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

// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

import {
  apiCreateIdeasPage,
  apiDeleteIdeasPage,
  apiListIdeasPages,
  apiUpdateIdeasPage,
} from './api';
import { IDEAS_PAGE_SEARCH_DEBOUNCE_MS } from './constants';
import {
  IdeasPageFormErrors,
  IdeasPageFormValues,
  IdeasPageResponse,
  IdeasSectionDraft,
} from './types';
import {
  buildIdeasPageFormData,
  filterByTitle,
  toFormValues,
  toSectionDrafts,
} from './utils';

interface UseIdeasPagesResult {
  pages: IdeasPageResponse[];
  filtered: IdeasPageResponse[];
  loading: boolean;
  isFiltering: boolean;
  error: string;
  search: string;
  setSearch: (term: string) => void;
  setError: (message: string) => void;
  fetchPages: () => Promise<void>;
  removePage: (id: string) => Promise<void>;
}

/** Listagem administrativa das páginas de ideias, com busca e exclusão. */
export function useIdeasPages(): UseIdeasPagesResult {
  const [pages, setPages] = useState<IdeasPageResponse[]>([]);
  const [filtered, setFiltered] = useState<IdeasPageResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiListIdeasPages();
      setPages(data);
      setFiltered(data);
    } catch (fetchError) {
      console.error('Erro ao buscar páginas de ideias:', fetchError);
      setError('Erro ao buscar páginas de ideias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setFiltered(filterByTitle(pages, search));
      setIsFiltering(false);
    }, IDEAS_PAGE_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, pages]);

  const removePage = useCallback(
    async (id: string) => {
      await apiDeleteIdeasPage(id);
      await fetchPages();
    },
    [fetchPages],
  );

  const state = useMemo(
    () => ({ pages, filtered, loading, isFiltering, error }),
    [pages, filtered, loading, isFiltering, error],
  );

  return { ...state, search, setSearch, setError, fetchPages, removePage };
}

const NO_ERRORS: IdeasPageFormErrors = {
  title: false,
  description: false,
  sections: false,
  sectionTitles: false,
};

interface UseIdeasPageFormParams {
  isCreation: boolean;
  page: IdeasPageResponse | null;
}

interface Feedback {
  message: string;
  severity: 'success' | 'error';
}

interface UseIdeasPageFormResult {
  values: IdeasPageFormValues;
  setValue: <K extends keyof IdeasPageFormValues>(
    key: K,
    value: IdeasPageFormValues[K],
  ) => void;
  sections: IdeasSectionDraft[];
  setSections: (sections: IdeasSectionDraft[]) => void;
  errors: IdeasPageFormErrors;
  isDirty: boolean;
  saving: boolean;
  feedback: Feedback | null;
  dismissFeedback: () => void;
  save: () => Promise<void>;
}

/** Estado, validação e submissão do formulário de página de ideias. */
export function useIdeasPageForm({
  isCreation,
  page,
}: UseIdeasPageFormParams): UseIdeasPageFormResult {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [values, setValues] = useState<IdeasPageFormValues>(() =>
    toFormValues(isCreation ? null : page),
  );
  const [sections, setSectionsState] = useState<IdeasSectionDraft[]>(() =>
    toSectionDrafts(isCreation ? null : page),
  );
  const [errors, setErrors] = useState<IdeasPageFormErrors>(NO_ERRORS);
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
    <K extends keyof IdeasPageFormValues>(
      key: K,
      value: IdeasPageFormValues[K],
    ) => {
      setValues((previous) => ({ ...previous, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const setSections = useCallback((next: IdeasSectionDraft[]) => {
    setSectionsState(next);
    setIsDirty(true);
  }, []);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const save = useCallback(async () => {
    const nextErrors: IdeasPageFormErrors = {
      title: !values.title.trim(),
      description: !values.description.trim(),
      sections: sections.length === 0,
      sectionTitles: sections.some((section) => !section.title.trim()),
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setFeedback({
        message: FORM_VALIDATION_MESSAGES.REQUIRED_GENERIC,
        severity: 'error',
      });
      return;
    }

    // Sem o id não há o que atualizar: a página em edição vem do store, que não
    // é persistido, e um F5 nesta rota deixaria o formulário sem referência.
    if (!isCreation && !page?.id) {
      setFeedback({
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      const formData = buildIdeasPageFormData(
        values,
        sections,
        isCreation ? undefined : page?.id,
      );

      const saved = isCreation
        ? await apiCreateIdeasPage(formData)
        : await apiUpdateIdeasPage(page?.id as string, formData);

      await dispatch(fetchRoutes());
      setIsDirty(false);
      setFeedback({
        message: isCreation
          ? FEATURE_SUCCESS_MESSAGES.PAGE_CREATED
          : FEATURE_SUCCESS_MESSAGES.PAGE_UPDATED,
        severity: 'success',
      });
      navigate(`/${saved.route.path}`);
    } catch (saveError) {
      console.error('Erro ao salvar página de ideias:', saveError);
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
