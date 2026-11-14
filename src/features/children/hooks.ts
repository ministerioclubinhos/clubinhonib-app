import { useCallback, useEffect, useState } from "react";

import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import {
  apiCreateChild,
  apiDeleteChild,
  apiFetchChildren,
  apiToggleChildActive,
  apiUpdateChild,
} from "./api";
import { CHILDREN_DEFAULT_LIMIT } from "./constants";
import type { ChildFilters, ChildFormValues, ChildResponse } from "./types";
import { toCreateChildRequest, toUpdateChildRequest } from "./utils";

/** Página de crianças, com busca e filtros resolvidos pela API. */
export function useChildren() {
  const [items, setItems] = useState<ChildResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(CHILDREN_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Omit<ChildFilters, "searchString">>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();

  useEffect(() => setPage(1), [debouncedSearch, filters, pageSize]);

  useEffect(() => {
    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetchChildren(
          {
            page,
            limit: pageSize,
            filters: { ...filters, searchString: debouncedSearch || undefined },
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.meta?.totalItems ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao carregar as crianças"));
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

/** Escritas da tela. Cada operação devolve se deu certo. */
export function useChildMutations(refresh: () => void) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const run = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string) => {
      setActionLoading(true);
      setActionError("");
      try {
        await action();
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, fallbackMessage));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [refresh],
  );

  const createChild = useCallback(
    (values: ChildFormValues) =>
      run(async () => {
        await apiCreateChild(toCreateChildRequest(values));
      }, "Erro ao cadastrar a criança"),
    [run],
  );

  const updateChild = useCallback(
    (id: string, values: ChildFormValues) =>
      run(async () => {
        await apiUpdateChild(id, toUpdateChildRequest(values));
      }, "Erro ao atualizar a criança"),
    [run],
  );

  const deleteChild = useCallback(
    (id: string) =>
      run(async () => {
        await apiDeleteChild(id);
      }, "Erro ao remover a criança"),
    [run],
  );

  const toggleActive = useCallback(
    (id: string) =>
      run(async () => {
        await apiToggleChildActive(id);
      }, "Erro ao alterar a situação da criança"),
    [run],
  );

  return {
    actionLoading,
    actionError,
    setActionError,
    createChild,
    updateChild,
    deleteChild,
    toggleActive,
  };
}
