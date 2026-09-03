import { useCallback, useEffect, useState } from "react";

import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import {
  apiAttachIdeasSectionToPage,
  apiDeleteIdeasSection,
  apiFetchIdeasPages,
  apiFetchIdeasSection,
  apiFetchIdeasSections,
} from "./api";
import { IDEAS_SECTIONS_DEFAULT_LIMIT } from "./constants";
import type {
  IdeasPage,
  IdeasSectionDraft,
  IdeasSectionResponse,
  IdeasSectionSortField,
  IdeasSectionSortOrder,
} from "./types";
import { buildReviewSubmission, buildSectionFormData } from "./utils";

/** Filtros que a tela envia à API. */
interface IdeasSectionListFilters {
  sort: IdeasSectionSortField;
  order: IdeasSectionSortOrder;
}

const INITIAL_FILTERS: IdeasSectionListFilters = {
  sort: "createdAt",
  order: "DESC",
};

/** Fila de ideias compartilhadas, com busca resolvida pela API. */
export function useIdeasSections() {
  const [items, setItems] = useState<IdeasSectionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(IDEAS_SECTIONS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<IdeasSectionListFilters>(
    INITIAL_FILTERS,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();

  // Trocar busca ou ordenação recomeça da primeira página.
  useEffect(() => setPage(1), [debouncedSearch, filters, pageSize]);

  useEffect(() => {
    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetchIdeasSections(
          {
            page,
            limit: pageSize,
            filters: { searchString: debouncedSearch.trim() || undefined },
            sort: filters.sort,
            order: filters.order,
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao carregar as ideias"));
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

/** Páginas onde a administração pode publicar uma ideia. */
export function useIdeasPages() {
  const [pages, setPages] = useState<IdeasPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPages(await apiFetchIdeasPages());
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Erro ao carregar as páginas"));
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
  const [actionError, setActionError] = useState("");

  const remove = useCallback(
    async (id: string) => {
      setActionLoading(true);
      setActionError("");
      try {
        await apiDeleteIdeasSection(id);
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, "Erro ao excluir a ideia"));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [refresh],
  );

  return { actionLoading, actionError, setActionError, remove };
}

/**
 * Carrega a ideia da revisão pelo id da URL.
 *
 * Antes a tela dependia do que a fila tinha deixado no store; um F5 na rota de
 * revisão abria a tela vazia e o salvamento falhava por falta de id.
 */
export function useIdeasSectionById(id: string | undefined) {
  const [section, setSection] = useState<IdeasSectionResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setSection(null);
      setLoading(false);
      return;
    }

    let active = true;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetchIdeasSection(id);
        if (active) setSection(data);
      } catch (err: unknown) {
        if (!active) return;
        setError(extractErrorMessage(err, "Erro ao carregar a ideia"));
        setSection(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [id]);

  return { section, loading, error };
}

/** Publica a ideia revisada na página escolhida. */
export function useIdeasSectionReview() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const publish = useCallback(
    async (
      sectionId: string,
      pageId: string,
      draft: IdeasSectionDraft,
    ): Promise<boolean> => {
      setSaving(true);
      setSaveError("");
      try {
        const { payload, uploads } = buildReviewSubmission(draft);
        await apiAttachIdeasSectionToPage(
          sectionId,
          pageId,
          buildSectionFormData(payload, uploads),
        );
        return true;
      } catch (err: unknown) {
        setSaveError(extractErrorMessage(err, "Erro ao publicar a ideia"));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saving, saveError, setSaveError, publish };
}
