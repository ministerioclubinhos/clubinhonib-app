import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChildSimpleResponseDto,
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

// use a função existente
import { apiFetchChildSimple } from "@/features/children/api";

/* ===== Crianças (busca) ===== */
export function useChildrenBrowser() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ChildSimpleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setChildrenError] = useState<string>("");

  const search = useCallback(async (term: string) => {
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

  // ✅ adicionado: refetch que usa o termo atual
  const refetch = useCallback(async () => {
    await search(q);
  }, [search, q]);

  const byId = useMemo(() => new Map(items.map((c) => [c.id, c])), [items]);

  return { q, onChangeQ, items, byId, loading, error, setError: setChildrenError, refetch };
  //                                                                 ^^^^^^^^ exportado
}

/* ===== Pagelas (list/CRUD) ===== */
export function useChildPagelas(
  childId: string | null | undefined,
  initial?: { year?: number; week?: number }
) {
  const [year, setYear] = useState<number | undefined>(initial?.year);
  const [week, setWeek] = useState<number | undefined>(initial?.week);
  const [rows, setRows] = useState<Pagela[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetch = useCallback(async () => {
    if (!childId) {
      setRows([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiListPagelasPaginated({ childId, year, week, page, limit });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Erro ao listar pagelas");
    } finally {
      setLoading(false);
    }
  }, [childId, year, week, page, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(async (payload: CreatePagelaPayload) => {
    const res = await apiCreatePagela(payload);
    setRows((prev) => [res, ...prev]);
    fetch();
  }, [fetch]);

  const update = useCallback(async (id: string, payload: UpdatePagelaPayload) => {
    setRows((prev) => prev.map((p) => (p.id === id ? ({ ...p, ...payload } as Pagela) : p)));
    const res = await apiUpdatePagela(id, payload);
    setRows((prev) => prev.map((p) => (p.id === id ? res : p)));
    fetch();
  }, [fetch]);

  const remove = useCallback(async (id: string) => {
    setRows((prev) => prev.filter((p) => p.id !== id));
    await apiDeletePagela(id);
    fetch();
  }, [fetch]);

  return {
    filters: { year, week, setYear, setWeek },
    list: { rows, total, page, limit, setPage, setLimit, loading, error, setError, refresh: fetch },
    actions: { create, update, remove },
  };
}
