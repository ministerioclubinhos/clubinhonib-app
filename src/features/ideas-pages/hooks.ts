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

// O guarda de alterações não salvas é o mesmo em todos os formulários.
export { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

import { useAbortController, useDebouncedValue } from '@/hooks';
import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';

import {
  apiCreateIdeasPage,
  apiDeleteIdeasPage,
  apiGetIdeasPage,
  apiListIdeasPages,
  apiUpdateIdeasPage,
} from './api';
import { IDEAS_PAGES_DEFAULT_LIMIT } from './constants';
import {
  IdeasPageFormErrors,
  IdeasPageFormValues,
  IdeasPageResponse,
  IdeasPageSortField,
  IdeasPageSortOrder,
  IdeasPageSummary,
  IdeasSectionDraft,
} from './types';
import {
  buildIdeasPageFormData,
  toFormValues,
  toSectionDrafts,
} from './utils';

/** Filtros que a tela envia à API. */
interface IdeasPageListFilters {
  /** `''` para todas; `'true'`/`'false'` para o recorte de visibilidade. */
  visibility: string;
  sort: IdeasPageSortField;
  order: IdeasPageSortOrder;
}

const INITIAL_FILTERS: IdeasPageListFilters = {
  visibility: '',
  sort: 'createdAt',
  order: 'DESC',
};

/** Página de páginas de ideias, com busca e filtros resolvidos pela API. */
export function useIdeasPages() {
  const [items, setItems] = useState<IdeasPageSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(IDEAS_PAGES_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IdeasPageListFilters>(INITIAL_FILTERS);
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
        const data = await apiListIdeasPages(
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
          extractErrorMessage(err, 'Erro ao carregar as páginas de ideias'),
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
export function useIdeasPageMutations(refresh: () => void) {
  const dispatch = useDispatch<AppDispatch>();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const remove = useCallback(
    async (id: string) => {
      setSaving(true);
      setActionError('');
      try {
        await apiDeleteIdeasPage(id);
        // A página tem rota própria; o menu da área do professor vem dela.
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
export function useIdeasPageById(id: string | undefined) {
  const [page, setPage] = useState<IdeasPageResponse | null>(null);
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
        const data = await apiGetIdeasPage(id, { signal: controller.signal });
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
