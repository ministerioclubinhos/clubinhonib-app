import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CreatePagelaPayload,
  Pagela,
  UpdatePagelaPayload,
} from "./types";
import {
  apiListPagelasPaginated,
  apiCreatePagela,
  apiUpdatePagela,
  apiDeletePagela,
} from "./api";
import { apiFetchChildSimple } from "@/features/children/api";
import type { ChildSimpleResponseDto } from "../children/types";

export type Tri = "any" | "yes" | "no";
const triToBoolString = (t: Tri): "true" | "false" | undefined =>
  t === "yes" ? "true" : t === "no" ? "false" : undefined;

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useChildrenBrowser() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ChildSimpleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setChildrenError] = useState<string>("");

  const search = useCallback(async (_term: string) => {
    setLoading(true);
    setChildrenError("");
    try {
      const list = await apiFetchChildSimple();
      setItems(list);
    } catch (e: any) {
      setChildrenError(
        e?.response?.data?.message || e?.message || "Erro ao listar crianças"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search("");
  }, [search]);

  const onChangeQ = (v: string) => {
    setQ(v);
    search(v);
  };

  const refetch = useCallback(async () => {
    await search(q);
  }, [search, q]);

  const byId = useMemo(() => new Map(items.map((c) => [c.id, c])), [items]);

  return { q, onChangeQ, items, byId, loading, error, setError: setChildrenError, refetch };
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
    present?: "true" | "false";
    didMeditation?: "true" | "false";
    recitedVerse?: "true" | "false";
    page: number;
    limit: number;
  };

  const query: Query | null = useMemo(() => {
    if (!childId) return null;
    return {
      childId,
      year,
      week,
      present: triToBoolString(presentQ),
      didMeditation: triToBoolString(medQ),
      recitedVerse: triToBoolString(verseQ),
      page,
      limit,
    };
  }, [childId, year, week, presentQ, medQ, verseQ, page, limit]);

  const debouncedQuery = useDebouncedValue(query, 250);
  const lastKeyRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(
    async (force = false, q: Query | null = query) => {
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
        setRows(data.items || []);
        setTotal(data.total || 0);
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
          setError(e?.response?.data?.message || e?.message || "Erro ao listar pagelas");
        }
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void doFetch(false, debouncedQuery);
  }, [debouncedQuery]);

  const create = useCallback(
    async (payload: CreatePagelaPayload) => {
      const res = await apiCreatePagela(payload);
      setRows((prev) => [res, ...prev]);
      await doFetch(true);
    },
    [doFetch]
  );

  const update = useCallback(
    async (id: string, payload: UpdatePagelaPayload) => {
      setRows((prev) => prev.map((p) => (p.id === id ? ({ ...p, ...payload } as Pagela) : p)));
      const res = await apiUpdatePagela(id, payload);
      setRows((prev) => prev.map((p) => (p.id === id ? res : p)));
      await doFetch(true);
    },
    [doFetch]
  );

  const remove = useCallback(
    async (id: string) => {
      setRows((prev) => prev.filter((p) => p.id !== id));
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
    actions: { create, update, remove },
  };
}
