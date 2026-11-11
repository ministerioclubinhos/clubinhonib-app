import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CreatePagelaPayload,
  Pagela,
  PagelaLaunchWindow,
  UpdatePagelaPayload,
} from "./types";
import {
  apiListPagelasPaginated,
  apiCreatePagela,
  apiUpdatePagela,
  apiDeletePagela,
  apiFetchPagelaLaunchWindow,
} from "./api";
import { apiFetchChildrenSimple } from "@/features/children/api";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";
import type { ChildListItem } from "../children/types";
import { CHILDREN_BROWSER_PARAMS, PAGELA_PERIOD_TEXTS } from "./constants";
import { useSearchParams } from "react-router-dom";

export type Tri = "any" | "yes" | "no";
/** O filtro de três estados vira booleano, ou some quando é "qualquer um". */
const triToBoolean = (t: Tri): boolean | undefined =>
  t === "yes" ? true : t === "no" ? false : undefined;

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Lê um filtro de sim/não da URL; ausente ou inválido não filtra. */
function readBooleanParam(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

/**
 * Lista de crianças da área do professor.
 *
 * Busca, filtros e página moram na URL: voltar da tela de uma criança devolve
 * a lista exatamente onde estava, em vez de recomeçar na página 1.
 */
export function useChildrenBrowser(pageSize: number = 20) {
  const [params, setParams] = useSearchParams();
  const [searchString, setSearchStringState] = useState(
    () => params.get(CHILDREN_BROWSER_PARAMS.search) ?? "",
  );
  const isActiveFilter = readBooleanParam(params.get(CHILDREN_BROWSER_PARAMS.active));
  const acceptedChristFilter = readBooleanParam(
    params.get(CHILDREN_BROWSER_PARAMS.accepted),
  );
  const page = Math.max(1, Number(params.get(CHILDREN_BROWSER_PARAMS.page)) || 1);

  const [items, setItems] = useState<ChildListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setChildrenError] = useState<string>("");
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(searchString, 300);

  const patchParams = useCallback(
    (changes: Record<string, string | undefined>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === "") next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // A busca digitada chega à URL já com o atraso, e volta para a página 1.
  const urlSearch = params.get(CHILDREN_BROWSER_PARAMS.search) ?? "";
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    patchParams({
      [CHILDREN_BROWSER_PARAMS.search]: debouncedSearch || undefined,
      [CHILDREN_BROWSER_PARAMS.page]: undefined,
    });
    // `urlSearch` só é lido para comparar; reagir a ele desfaria a digitação.
  }, [debouncedSearch, patchParams]);

  const setSearchString = setSearchStringState;
  const setIsActiveFilter = useCallback(
    (value: boolean | undefined) =>
      patchParams({
        [CHILDREN_BROWSER_PARAMS.active]: value === undefined ? undefined : String(value),
        [CHILDREN_BROWSER_PARAMS.page]: undefined,
      }),
    [patchParams],
  );
  const setAcceptedChristFilter = useCallback(
    (value: boolean | undefined) =>
      patchParams({
        [CHILDREN_BROWSER_PARAMS.accepted]: value === undefined ? undefined : String(value),
        [CHILDREN_BROWSER_PARAMS.page]: undefined,
      }),
    [patchParams],
  );
  const handlePageChange = useCallback(
    (newPage: number) =>
      patchParams({
        [CHILDREN_BROWSER_PARAMS.page]: newPage > 1 ? String(newPage) : undefined,
      }),
    [patchParams],
  );

  useEffect(() => {
    // Cada busca cancela a anterior: uma resposta lenta e antiga não pode
    // sobrescrever a mais nova.
    const ctrl = new AbortController();
    setLoading(true);
    setChildrenError("");

    apiFetchChildrenSimple(
      {
        searchString: urlSearch || undefined,
        isActive: isActiveFilter,
        acceptedChrist: acceptedChristFilter,
        page,
        limit: pageSize,
      },
      { signal: ctrl.signal },
    )
      .then((response) => {
        const data = response.data || [];
        const pages = response.meta?.totalPages || 1;
        // Excluir ou desativar o último item da última página deixaria a
        // lista vazia: nesse caso a tela recua para a última página que existe.
        if (!data.length && page > 1) {
          handlePageChange(Math.min(page - 1, pages));
          return;
        }
        setItems(data);
        setTotalPages(pages);
        setTotalItems(response.meta?.totalItems || 0);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelledRequest(err)) return;
        setChildrenError(extractErrorMessage(err, "Erro ao listar crianças"));
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [urlSearch, isActiveFilter, acceptedChristFilter, page, pageSize, reloadToken, handlePageChange]);

  const refetch = useCallback(async () => {
    setReloadToken((token) => token + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchStringState("");
    patchParams({
      [CHILDREN_BROWSER_PARAMS.search]: undefined,
      [CHILDREN_BROWSER_PARAMS.active]: undefined,
      [CHILDREN_BROWSER_PARAMS.accepted]: undefined,
      [CHILDREN_BROWSER_PARAMS.page]: undefined,
    });
  }, [patchParams]);

  const byId = useMemo(() => new Map(items.map((c) => [c.id, c])), [items]);

  return {
    searchString,
    setSearchString,
    isActiveFilter,
    setIsActiveFilter,
    acceptedChristFilter,
    setAcceptedChristFilter,
    clearFilters,
    items,
    byId,
    loading,
    error,
    setError: setChildrenError,
    refetch,
    page,
    totalPages,
    totalItems,
    handlePageChange,
  };
}

export function useChildPagelas(
  childId: string | null | undefined,
  initial?: { year?: number; week?: number }
) {
  const [year, setYearState] = useState<number | undefined>(initial?.year);
  const [week, setWeekState] = useState<number | undefined>(initial?.week);
  const [presentQ, setPresentQState] = useState<Tri>("any");
  const [medQ, setMedQState] = useState<Tri>("any");
  const [verseQ, setVerseQState] = useState<Tri>("any");
  const [rows, setRows] = useState<Pagela[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const setYear = useCallback((v?: number) => { setYearState(v); setPage(1); }, []);
  const setWeek = useCallback((v?: number) => { setWeekState(v); setPage(1); }, []);
  const setPresentQ = useCallback((v: Tri) => { setPresentQState(v); setPage(1); }, []);
  const setMedQ = useCallback((v: Tri) => { setMedQState(v); setPage(1); }, []);
  const setVerseQ = useCallback((v: Tri) => { setVerseQState(v); setPage(1); }, []);

  const clearFilters = useCallback(() => {
    setYear(undefined);
    setWeek(undefined);
    setPresentQ("any");
    setMedQ("any");
    setVerseQ("any");
  }, [setYear, setWeek, setPresentQ, setMedQ, setVerseQ]);

  type Query = {
    childId: string;
    year?: number;
    week?: number;
    present?: boolean;
    didMeditation?: boolean;
    recitedVerse?: boolean;
    page: number;
    limit: number;
  };

  const query: Query | null = useMemo(() => {
    if (!childId) return null;
    return {
      childId,
      year,
      week,
      present: triToBoolean(presentQ),
      didMeditation: triToBoolean(medQ),
      recitedVerse: triToBoolean(verseQ),
      page,
      limit,
    };
  }, [childId, year, week, presentQ, medQ, verseQ, page, limit]);

  const debouncedQuery = useDebouncedValue(query, 250);
  // O recarregamento depois de salvar ou excluir precisa da consulta de agora.
  // Sem isto ele usava a da primeira renderização e a lista voltava para a
  // página 1 sem filtros, enquanto a tela seguia mostrando os filtros ativos.
  const queryRef = useRef<Query | null>(query);
  queryRef.current = query;
  const lastKeyRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(
    async (force = false, q: Query | null = queryRef.current) => {
      if (!q) {
        setRows([]);
        setTotal(0);
        return;
      }
      const key = JSON.stringify(q);
      if (!force && key === lastKeyRef.current) return;
      lastKeyRef.current = key;

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      setError("");
      try {
        const data = await apiListPagelasPaginated(q, { signal: ctrl.signal });
        setRows(data.data || []);
        setTotal(data.total || 0);
      } catch (err: unknown) {
        if (!isCancelledRequest(err)) {
          setError(extractErrorMessage(err, "Erro ao listar pagelas"));
        }
      } finally {
        // Uma busca cancelada não desliga o indicador da que a substituiu.
        if (abortRef.current === ctrl) {
          abortRef.current = null;
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void doFetch(false, debouncedQuery);
  }, [debouncedQuery]);

  /**
   * Procura a pagela da criança em uma semana.
   *
   * Olha primeiro o que já está na tela e, se não achar, pergunta à API: a
   * lista é paginada e filtrada, então a pagela pode existir fora dela.
   */
  const findByWeek = useCallback(
    async (targetYear: number, targetWeek: number): Promise<Pagela | null> => {
      if (!childId) return null;
      const data = await apiListPagelasPaginated({
        childId,
        year: targetYear,
        week: targetWeek,
        page: 1,
        limit: 1,
      });
      return data.data?.[0] ?? null;
    },
    [childId]
  );

  // As três gravam primeiro e só então mexem na lista: mudar a tela antes
  // deixava a pagela "excluída" ou "alterada" quando a API recusava.
  const create = useCallback(
    async (payload: CreatePagelaPayload) => {
      await apiCreatePagela(payload);
      await doFetch(true);
    },
    [doFetch]
  );

  const update = useCallback(
    async (id: string, payload: UpdatePagelaPayload) => {
      await apiUpdatePagela(id, payload);
      await doFetch(true);
    },
    [doFetch]
  );

  const remove = useCallback(
    async (id: string) => {
      await apiDeletePagela(id);
      await doFetch(true);
    },
    [doFetch]
  );

  return {
    filters: {
      year, week, presentQ, medQ, verseQ,
      setYear, setWeek, setPresentQ, setMedQ, setVerseQ, clearFilters,
    },
    list: {
      rows, total, page, limit,
      setPage, setLimit,
      loading, error, setError,
      refresh: () => doFetch(true),
    },
    actions: { create, update, remove, findByWeek },
  };
}

/**
 * A janela de lançamento de pagelas de hoje.
 *
 * Pagela só se lança dentro do período letivo. A tela pergunta à API antes de
 * abrir o formulário: é ela quem sabe o dia de hoje no fuso do Clubinho e a
 * semana letiva em andamento.
 */
export function usePagelaLaunchWindow() {
  const [window, setWindow] = useState<PagelaLaunchWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    apiFetchPagelaLaunchWindow({ signal: ctrl.signal })
      .then((data) => {
        setWindow(data);
        setError("");
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, PAGELA_PERIOD_TEXTS.unavailable));
        setLoading(false);
      });
    return () => ctrl.abort();
  }, []);

  return { window, loading, error };
}
