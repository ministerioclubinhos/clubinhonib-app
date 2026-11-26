import { useCallback, useEffect, useState } from "react";

import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import { apiDeleteImageSection, apiFetchImageSections } from "./api";
import {
  IMAGE_SECTIONS_DEFAULT_LIMIT,
} from "./constants";
import type { ImageSectionFilters, ImageSectionResponse } from "./types";

/** Fila de fotos, com busca e filtros resolvidos pela API. */
export function useImageSections() {
  const [items, setItems] = useState<ImageSectionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(IMAGE_SECTIONS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Omit<ImageSectionFilters, "searchString">
  >({});
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
        const data = await apiFetchImageSections(
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
        setError(extractErrorMessage(err, "Erro ao carregar as fotos"));
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

/** Ações da fila. Cada uma devolve se deu certo. */
export function useImageSectionMutations(refresh: () => void) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const remove = useCallback(
    async (id: string) => {
      setActionLoading(true);
      setActionError("");
      try {
        await apiDeleteImageSection(id);
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(
          extractErrorMessage(err, "Erro ao excluir a publicação"),
        );
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [refresh],
  );

  return { actionLoading, actionError, setActionError, remove };
}
