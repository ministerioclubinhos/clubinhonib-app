import { useCallback, useEffect, useState } from "react";

import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import {
  apiDeleteFeedback,
  apiFetchFeedbacks,
  apiMarkFeedbackAsRead,
  apiMarkFeedbackAsUnread,
} from "./api";
import {
  FEEDBACKS_DEFAULT_LIMIT,
} from "./constants";
import type { FeedbackFilters, FeedbackResponse } from "./types";

/** Página de avaliações, com busca e filtros resolvidos pela API. */
export function useFeedbacks() {
  const [items, setItems] = useState<FeedbackResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(FEEDBACKS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Omit<FeedbackFilters, "searchString">>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      setError("");
      try {
        const data = await apiFetchFeedbacks(
          {
            page,
            limit: pageSize,
            filters: { ...filters, searchString: debouncedSearch || undefined },
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao carregar as avaliações"));
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

/** Ações da listagem. Cada uma devolve se deu certo. */
export function useFeedbackMutations(refresh: () => void) {
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

  const setRead = useCallback(
    (id: string, read: boolean) =>
      run(async () => {
        await (read ? apiMarkFeedbackAsRead(id) : apiMarkFeedbackAsUnread(id));
      }, "Erro ao alterar a situação da avaliação"),
    [run],
  );

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await apiDeleteFeedback(id);
      }, "Erro ao excluir a avaliação"),
    [run],
  );

  return { actionLoading, actionError, setActionError, setRead, remove };
}
