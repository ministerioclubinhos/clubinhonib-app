import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAbortController, useDebouncedValue } from '@/hooks';
import { extractErrorMessage, getApiErrorCode, getHttpStatus, isCancelledRequest } from '@/utils/apiError';

import {
  apiDeleteAuditRange,
  apiDeleteAuditRecord,
  apiDeleteObservabilityRange,
  apiDeleteObservabilityRecord,
  apiListAuditRecords,
  apiListObservabilityRecords,
} from './api';
import { LOG_QUERY_UNAVAILABLE_CODE, OBSERVABILITY_AUDIT_MESSAGES } from './constants';
import type {
  AuditFilters,
  AuditRecordResponse,
  DeleteLogRecordsResponse,
  ObservabilityFilters,
  ObservabilityRecordResponse,
  PaginatedResponse,
  PeriodValidation,
  RecordsBaseFilters,
} from './types';
import {
  activeFilterCount,
  buildAuditQuery,
  buildObservabilityQuery,
  defaultBaseFilters,
  queryKeyOf,
  validatePeriod,
} from './utils';

const INITIAL_OBSERVABILITY_FILTERS: ObservabilityFilters = { level: '', errorCode: '', sourceType: '' };
const INITIAL_AUDIT_FILTERS: AuditFilters = { actorId: '', actorRole: '', outcome: '', actionName: '', sourceType: '' };

const HTTP_FORBIDDEN = 403;
const FIRST_PAGE = 1;

interface PagedRecordsOptions<TQuery extends object, TItem> {
  /** `false` enquanto o período for inválido: nenhuma request sai. */
  enabled: boolean;
  /** Consulta para a página informada; mudar qualquer outro campo volta à primeira. */
  buildQuery: (page: number) => TQuery;
  fetch: (query: TQuery, signal: AbortSignal) => Promise<PaginatedResponse<TItem>>;
  refreshToken: number;
  errorMessage: string;
}

interface PageState {
  /** A consulta a que esta página pertence. */
  key: string;
  page: number;
}

/**
 * Uma listagem paginada por página/limite com total.
 *
 * Único dono da resposta: nada vai para Redux nem para o storage do
 * navegador. Uma request nova aborta a anterior; recarregar mantém as linhas
 * visíveis; `403` limpa tudo o que estava em memória.
 */
export function usePagedRecords<TQuery extends object, TItem>({
  enabled,
  buildQuery,
  fetch,
  refreshToken,
  errorMessage,
}: PagedRecordsOptions<TQuery, TItem>) {
  const queryKey = queryKeyOf(buildQuery(FIRST_PAGE));
  const [pageState, setPageState] = useState<PageState>({ key: queryKey, page: FIRST_PAGE });
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  /** Limite que a API aplicou de fato; o resumo conta por ele, não pelo pedido. */
  const [appliedLimit, setAppliedLimit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState('');
  /** A API respondeu `LOG_9101`: storage `file`, sem consulta nem exclusão. */
  const [unavailable, setUnavailable] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const nextController = useAbortController();

  // Trocar um filtro descarta a página da consulta anterior.
  const page = pageState.key === queryKey ? pageState.page : FIRST_PAGE;

  const buildQueryRef = useRef(buildQuery);
  buildQueryRef.current = buildQuery;
  const fetchRef = useRef(fetch);
  fetchRef.current = fetch;

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = nextController();
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await fetchRef.current(buildQueryRef.current(page), controller.signal);
        if (controller.signal.aborted) return;
        setItems(Array.isArray(result?.data) ? result.data : []);
        setTotal(Number(result?.total ?? 0));
        setPageCount(Number(result?.pageCount ?? 0));
        setAppliedLimit(Number(result?.limit ?? 0));
        setUnavailable(false);
        setLoadedOnce(true);
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        if (getApiErrorCode(err) === LOG_QUERY_UNAVAILABLE_CODE) {
          // Não é falha: é o modo `file`. A aba explica em vez de oferecer retry.
          setUnavailable(true);
          setItems([]);
          setTotal(0);
          setPageCount(0);
          setAppliedLimit(0);
          setLoadedOnce(true);
          return;
        }
        setError(extractErrorMessage(err, errorMessage));
        // Sem permissão, nada do que estava em memória pode continuar na tela.
        if (getHttpStatus(err) === HTTP_FORBIDDEN) {
          setItems([]);
          setTotal(0);
          setPageCount(0);
          setAppliedLimit(0);
        }
        setLoadedOnce(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void run();
    return undefined;
  }, [enabled, queryKey, page, refreshToken, reloadToken, errorMessage, nextController]);

  const setPage = useCallback((next: number) => setPageState({ key: queryKey, page: Math.max(FIRST_PAGE, next) }), [queryKey]);
  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    items,
    total,
    pageCount,
    appliedLimit,
    page,
    setPage,
    loading,
    /** Primeiro carregamento: skeleton; depois, linhas esmaecidas. */
    initialLoading: loading && !loadedOnce,
    error,
    unavailable,
    retry,
  };
}

interface DeletionOptions<TItem> {
  deleteOne: (item: TItem) => Promise<DeleteLogRecordsResponse>;
  deleteRange: (from: string, to: string) => Promise<DeleteLogRecordsResponse>;
  /** Período válido atual, para a exclusão em intervalo. */
  validPeriod: { from: string; to: string } | null;
  /** Recarrega a lista depois de apagar. */
  refresh: () => void;
}

/**
 * Exclusão de um item ou do intervalo da aba.
 *
 * Devolve quantos itens saíram (ou `null` na falha) para a tela dar o retorno;
 * a lista é recarregada em seguida. O erro fica no `actionError`, e a tela o
 * mostra no próprio painel.
 */
export function useRecordsDeletion<TItem>({ deleteOne, deleteRange, validPeriod, refresh }: DeletionOptions<TItem>) {
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const run = useCallback(
    async (operation: () => Promise<DeleteLogRecordsResponse>): Promise<number | null> => {
      setDeleting(true);
      setActionError('');
      try {
        const result = await operation();
        refresh();
        return Number(result?.deleted ?? 0);
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, OBSERVABILITY_AUDIT_MESSAGES.deleteFailed));
        return null;
      } finally {
        setDeleting(false);
      }
    },
    [refresh],
  );

  const removeOne = useCallback((item: TItem) => run(() => deleteOne(item)), [run, deleteOne]);
  const removeRange = useCallback(
    () => (validPeriod ? run(() => deleteRange(validPeriod.from, validPeriod.to)) : Promise.resolve(null)),
    [run, deleteRange, validPeriod],
  );

  return { deleting, actionError, setActionError, removeOne, removeRange };
}

/** Filtros base de uma aba, com validação de período e refresh. */
function useBaseFilters() {
  const [base, setBase] = useState<RecordsBaseFilters>(() => defaultBaseFilters());
  const [refreshToken, setRefreshToken] = useState(0);
  // Só o que é digitado espera a pessoa terminar; período e limite valem na hora.
  const debouncedRequestId = useDebouncedValue(base.requestId);
  const period: PeriodValidation = useMemo(() => validatePeriod(base.from, base.to), [base.from, base.to]);
  const validPeriod = useMemo(() => (period.ok ? { from: period.from, to: period.to } : null), [period]);
  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);
  const setLimit = useCallback((limit: number) => setBase((previous) => ({ ...previous, limit })), []);
  return { base, setBase, setLimit, period, validPeriod, debouncedRequestId, refreshToken, refresh };
}

/** Aba de observabilidade: toolbar própria + listagem paginada. */
export function useObservabilityPanel() {
  const filters = useBaseFilters();
  const [specific, setSpecific] = useState<ObservabilityFilters>(INITIAL_OBSERVABILITY_FILTERS);
  const debouncedErrorCode = useDebouncedValue(specific.errorCode);
  const { validPeriod, base, debouncedRequestId } = filters;

  const buildQuery = useCallback(
    (page: number) =>
      buildObservabilityQuery(
        validPeriod ?? { from: '', to: '' },
        { requestId: debouncedRequestId, limit: base.limit },
        { ...specific, errorCode: debouncedErrorCode },
        page,
      ),
    [validPeriod, debouncedRequestId, base.limit, specific, debouncedErrorCode],
  );

  const records = usePagedRecords<ReturnType<typeof buildQuery>, ObservabilityRecordResponse>({
    enabled: validPeriod !== null,
    buildQuery,
    fetch: (query, signal) => apiListObservabilityRecords(query, { signal }),
    refreshToken: filters.refreshToken,
    errorMessage: OBSERVABILITY_AUDIT_MESSAGES.observabilityError,
  });

  const clearFilters = useCallback(() => {
    filters.setBase((previous) => ({ ...previous, requestId: '' }));
    setSpecific(INITIAL_OBSERVABILITY_FILTERS);
  }, [filters]);

  const deletion = useRecordsDeletion<ObservabilityRecordResponse>({
    deleteOne: (item) => apiDeleteObservabilityRecord(item.eventId, item.occurredAt),
    deleteRange: apiDeleteObservabilityRange,
    validPeriod,
    refresh: filters.refresh,
  });

  return {
    ...filters,
    specific,
    setSpecific,
    clearFilters,
    activeFilters: activeFilterCount(base, specific),
    ...records,
    ...deletion,
  };
}

/** Aba de auditoria: toolbar própria + listagem paginada. */
export function useAuditPanel() {
  const filters = useBaseFilters();
  const [specific, setSpecific] = useState<AuditFilters>(INITIAL_AUDIT_FILTERS);
  const debouncedActorId = useDebouncedValue(specific.actorId);
  const debouncedActionName = useDebouncedValue(specific.actionName);
  const { validPeriod, base, debouncedRequestId } = filters;

  const buildQuery = useCallback(
    (page: number) =>
      buildAuditQuery(
        validPeriod ?? { from: '', to: '' },
        { requestId: debouncedRequestId, limit: base.limit },
        { ...specific, actorId: debouncedActorId, actionName: debouncedActionName },
        page,
      ),
    [validPeriod, debouncedRequestId, base.limit, specific, debouncedActorId, debouncedActionName],
  );

  const records = usePagedRecords<ReturnType<typeof buildQuery>, AuditRecordResponse>({
    enabled: validPeriod !== null,
    buildQuery,
    fetch: (query, signal) => apiListAuditRecords(query, { signal }),
    refreshToken: filters.refreshToken,
    errorMessage: OBSERVABILITY_AUDIT_MESSAGES.auditError,
  });

  const clearFilters = useCallback(() => {
    filters.setBase((previous) => ({ ...previous, requestId: '' }));
    setSpecific(INITIAL_AUDIT_FILTERS);
  }, [filters]);

  const deletion = useRecordsDeletion<AuditRecordResponse>({
    deleteOne: (item) => apiDeleteAuditRecord(item.eventId, item.occurredAt),
    deleteRange: apiDeleteAuditRange,
    validPeriod,
    refresh: filters.refresh,
  });

  return {
    ...filters,
    specific,
    setSpecific,
    clearFilters,
    activeFilters: activeFilterCount(base, specific),
    ...records,
    ...deletion,
  };
}
