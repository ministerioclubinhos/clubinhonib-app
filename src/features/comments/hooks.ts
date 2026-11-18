import { useCallback, useEffect, useState } from "react";

import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import {
  apiDeleteComment,
  apiFetchComments,
  apiPublishComment,
  apiUnpublishComment,
  apiUpdateComment,
} from "./api";
import { COMMENTS_DEFAULT_LIMIT } from "./constants";
import type {
  CommentFilters,
  CommentResponse,
  UpdateCommentRequest,
} from "./types";

/**
 * Página de comentários da administração.
 *
 * O estado é local de propósito. A versão anterior guardava a listagem inteira
 * no Redux, o mesmo lugar de onde a home lê os comentários publicados — depois
 * de abrir esta tela, a home passava a exibir também os não publicados.
 */
export function useComments() {
  const [items, setItems] = useState<CommentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(COMMENTS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Omit<CommentFilters, "searchString">>({});
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
        const data = await apiFetchComments(
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
        setError(extractErrorMessage(err, "Erro ao carregar os comentários"));
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
export function useCommentMutations(refresh: () => void) {
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

  const setPublished = useCallback(
    (id: string, published: boolean) =>
      run(async () => {
        await (published ? apiPublishComment(id) : apiUnpublishComment(id));
      }, "Erro ao alterar a publicação do comentário"),
    [run],
  );

  const update = useCallback(
    (id: string, payload: UpdateCommentRequest) =>
      run(async () => {
        await apiUpdateComment(id, payload);
      }, "Erro ao salvar o comentário"),
    [run],
  );

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await apiDeleteComment(id);
      }, "Erro ao excluir o comentário"),
    [run],
  );

  return {
    actionLoading,
    actionError,
    setActionError,
    setPublished,
    update,
    remove,
  };
}
