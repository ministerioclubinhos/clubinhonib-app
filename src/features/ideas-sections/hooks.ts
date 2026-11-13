import { useCallback, useEffect, useRef, useState } from 'react';

import { useAbortController, useDebouncedValue } from '@/hooks';
import { extractErrorMessage, getHttpStatus, isCancelledRequest } from '@/utils/apiError';

import {
  apiCancelIdeaAiEnhancement,
  apiRestoreIdeaAiResult,
  apiRequestIdeaAiEnhancement,
  apiAttachIdeasSectionToPage,
  apiCreateIdeasSection,
  apiDeleteIdeasSection,
  apiFetchIdeasPages,
  apiFetchIdeasSection,
  apiFetchIdeasSections,
} from './api';
import {
  HTTP_CONFLICT,
  IDEAS_SECTIONS_DEFAULT_LIMIT,
  IDEA_AI_POLL_MS,
  IDEAS_SECTION_INITIAL_FILTERS,
} from './constants';
import {
  IDEA_AI_POLL_BACKOFF_MS,
  IDEA_AI_POLL_MAX_ERRORS,
  IDEA_AI_POLL_TERMINAL_STATUSES,
  IDEA_AI_QUEUE_POLL_MS,
} from './ai-constants';
import { isIdeaAiQueueWorking, isIdeaAiWorking } from './ai-utils';
import { IdeaShareStatus } from './types';
import type {
  IdeaAiEnhancementRequest,
  IdeasSectionListFilters,
  IdeaShareFormValues,
  IdeaShareMaterial,
  IdeasPage,
  IdeasSectionDraft,
  IdeasSectionResponse,
} from './types';
import { buildReviewSubmission, buildSectionFormData } from './utils';
import { buildIdeaShareSubmission } from './share-utils';
import { GENERIC_ERROR_MESSAGES } from '@/constants/errorMessages';


export function useShareIdea() {
  const submissionLock = useRef(false);
  const [status, setStatus] = useState<IdeaShareStatus>(IdeaShareStatus.EDITING);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const submit = async (
    values: IdeaShareFormValues,
    materials: IdeaShareMaterial[]
  ): Promise<void> => {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setError('');
    setProgress(0);
    setStatus(IdeaShareStatus.SUBMITTING);
    try {
      await apiCreateIdeasSection(buildIdeaShareSubmission(values, materials), {
        onUploadProgress: setProgress,
      });
      setStatus(IdeaShareStatus.SUCCESS);
    } catch (caught: unknown) {
      setError(extractErrorMessage(caught, GENERIC_ERROR_MESSAGES.SAVE_ERROR));
      setStatus(IdeaShareStatus.ERROR);
    } finally {
      submissionLock.current = false;
    }
  };

  const reset = () => {
    setStatus(IdeaShareStatus.EDITING);
    setProgress(0);
    setError('');
  };
  return {
    status,
    progress,
    error,
    submit,
    reset,
    isSubmitting: status === IdeaShareStatus.SUBMITTING,
    isSuccess: status === IdeaShareStatus.SUCCESS,
  };
}

/** Fila de ideias compartilhadas, com busca resolvida pela API. */
export function useIdeasSections() {
  const [items, setItems] = useState<IdeasSectionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(IDEAS_SECTIONS_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IdeasSectionListFilters>(IDEAS_SECTION_INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();

  // Trocar busca ou ordenação recomeça da primeira página.
  useEffect(() => setPage(1), [debouncedSearch, filters, pageSize]);

  useEffect(() => {
    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetchIdeasSections(
          {
            page,
            limit: pageSize,
            filters: {
              searchString: debouncedSearch.trim() || undefined,
              aiStatus: filters.aiStatus,
            },
            sort: filters.sort,
            order: filters.order,
          },
          { signal: controller.signal }
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, 'Erro ao carregar as ideias'));
        setItems([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [page, pageSize, debouncedSearch, filters, reloadToken, nextController]);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  // Enquanto alguma ideia da página está na IA, os chips se atualizam sozinhos.
  const working = items.some((item) => isIdeaAiQueueWorking(item.aiStatus));
  useEffect(() => {
    if (!working) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, IDEA_AI_QUEUE_POLL_MS);
    return () => clearInterval(timer);
  }, [working, refresh]);

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

/** Páginas onde a administração pode publicar uma ideia. */
export function useIdeasPages() {
  const [pages, setPages] = useState<IdeasPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPages(await apiFetchIdeasPages());
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Erro ao carregar as páginas'));
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pages, loading, error, setError, fetchPages };
}

/** Ações da fila. Cada uma devolve se deu certo. */
export function useIdeasSectionMutations(refresh: () => void) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const remove = useCallback(
    async (id: string) => {
      setActionLoading(true);
      setActionError('');
      try {
        await apiDeleteIdeasSection(id);
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, 'Erro ao excluir a ideia'));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [refresh]
  );

  return { actionLoading, actionError, setActionError, remove };
}

/**
 * Carrega a ideia da revisão pelo id da URL e acompanha a IA.
 *
 * O acompanhamento roda enquanto há tentativa ativa: pausa com a aba oculta,
 * repete erros transitórios com espera maior e para em erros definitivos
 * (ideia excluída, sem permissão), em vez de consultar para sempre.
 */
export function useIdeasSectionById(id: string | undefined) {
  const [section, setSection] = useState<IdeasSectionResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const loadedId = useRef<string | undefined>(undefined);
  const processing = useRef(false);
  const failures = useRef(0);
  const refresh = useCallback(() => {
    processing.current = true;
    failures.current = 0;
    setReload((value) => value + 1);
  }, []);
  useEffect(() => {
    if (!id) {
      setSection(null);
      setLoading(false);
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (loadedId.current !== id) {
      setSection(null);
      processing.current = false;
      failures.current = 0;
    }
    const schedule = (delay: number) => {
      if (!active || !processing.current) return;
      if (document.visibilityState === 'hidden') return;
      timer = setTimeout(() => void run(), delay);
    };
    const run = async () => {
      if (loadedId.current !== id) setLoading(true);
      let delay = IDEA_AI_POLL_MS;
      try {
        const data = await apiFetchIdeasSection(id, { silent: loadedId.current === id });
        if (!active) return;
        loadedId.current = id;
        failures.current = 0;
        setSection(data);
        setError('');
        processing.current = isIdeaAiWorking(data);
      } catch (caught: unknown) {
        if (!active) return;
        setError(extractErrorMessage(caught, 'Não foi possível atualizar a ideia.'));
        failures.current += 1;
        const status = getHttpStatus(caught);
        if (
          (status !== null && IDEA_AI_POLL_TERMINAL_STATUSES.includes(status)) ||
          failures.current >= IDEA_AI_POLL_MAX_ERRORS
        )
          processing.current = false;
        delay = IDEA_AI_POLL_BACKOFF_MS;
      } finally {
        if (active) {
          setLoading(false);
          schedule(delay);
        }
      }
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !processing.current) return;
      if (timer) clearTimeout(timer);
      void run();
    };
    document.addEventListener('visibilitychange', onVisible);
    void run();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [id, reload]);
  return { section, loading, error, refresh };
}

/**
 * Ações da administração sobre a IA: pedir (re)geração, cancelar e voltar a
 * um resultado anterior. Um 409 de "já está trabalhando" passa a acompanhar a
 * tentativa em vez de só mostrar o erro.
 */
export function useIdeaAiActions(id: string | undefined, refresh: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const run = useCallback(
    async (action: (sectionId: string) => Promise<unknown>, fallback: string) => {
      if (!id || lock.current) return false;
      lock.current = true;
      setBusy(true);
      setError('');
      try {
        await action(id);
        refresh();
        return true;
      } catch (caught: unknown) {
        setError(extractErrorMessage(caught, fallback));
        // O estado mudou do outro lado (outra aba, outro admin, automática).
        if (getHttpStatus(caught) === HTTP_CONFLICT) refresh();
        return false;
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
    [id, refresh]
  );
  const request = useCallback(
    (body: IdeaAiEnhancementRequest) =>
      run(
        (sectionId) => apiRequestIdeaAiEnhancement(sectionId, body),
        'Não foi possível iniciar a melhoria.'
      ),
    [run]
  );
  const cancel = useCallback(
    () => run(apiCancelIdeaAiEnhancement, 'Não foi possível cancelar a melhoria.'),
    [run]
  );
  const restore = useCallback(
    (attemptId: string) =>
      run(
        (sectionId) => apiRestoreIdeaAiResult(sectionId, attemptId),
        'Não foi possível usar este resultado.'
      ),
    [run]
  );
  return { busy, error, setError, request, cancel, restore };
}

/** Publica a ideia revisada na página escolhida. */
export function useIdeasSectionReview() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveErrorStatus, setSaveErrorStatus] = useState<number | null>(null);

  const lock = useRef(false);
  const publish = useCallback(
    async (sectionId: string, pageId: string, draft: IdeasSectionDraft): Promise<boolean> => {
      // Duplo clique antes do novo render não dispara duas publicações.
      if (lock.current) return false;
      lock.current = true;
      setSaving(true);
      setSaveError('');
      setSaveErrorStatus(null);
      try {
        // "Publicar original" agora preserva as edições: o rascunho vai inteiro.
        const { payload, uploads } = buildReviewSubmission(draft);
        await apiAttachIdeasSectionToPage(
          sectionId,
          pageId,
          buildSectionFormData(payload, uploads)
        );
        return true;
      } catch (err: unknown) {
        setSaveError(extractErrorMessage(err, 'Erro ao publicar a ideia'));
        setSaveErrorStatus(getHttpStatus(err));
        return false;
      } finally {
        lock.current = false;
        setSaving(false);
      }
    },
    []
  );

  return { saving, saveError, saveErrorStatus, setSaveError, publish };
}
