import { useCallback, useEffect, useState } from "react";

import { apiFetchClubOptions } from "@/features/clubs/api";
import type { ClubSelectOption } from "@/features/clubs/types";
import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import {
  apiAssignClub,
  apiFetchCoordinator,
  apiFetchCoordinators,
  apiUnassignClub,
} from "./api";
import { COORDINATORS_DEFAULT_LIMIT } from "./constants";
import type { CoordinatorFilters, CoordinatorResponse } from "./types";

/** Página de coordenadores, com busca e filtros resolvidos pela API. */
export function useCoordinators() {
  const [items, setItems] = useState<CoordinatorResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(COORDINATORS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Omit<CoordinatorFilters, "searchString">
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
        const data = await apiFetchCoordinators(
          {
            page,
            limit: pageSize,
            filters: { ...filters, searchString: debouncedSearch || undefined },
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao carregar os coordenadores"));
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

/** Vínculo entre clubinho e coordenador. Cada operação devolve se deu certo. */
export function useCoordinatorMutations(refresh: () => void) {
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

  const assignClub = useCallback(
    (coordinatorId: string, clubId: string) =>
      run(async () => {
        await apiAssignClub(coordinatorId, clubId);
      }, "Erro ao vincular o clubinho"),
    [run],
  );

  const unassignClub = useCallback(
    (coordinatorId: string, clubId: string) =>
      run(async () => {
        await apiUnassignClub(coordinatorId, clubId);
      }, "Erro ao desvincular o clubinho"),
    [run],
  );

  return {
    actionLoading,
    actionError,
    setActionError,
    assignClub,
    unassignClub,
  };
}

/**
 * Clubinhos disponíveis para o vínculo.
 *
 * Antes o número do clubinho era digitado à mão e um número inexistente só
 * falhava na hora de salvar.
 */
export function useClubOptions() {
  const [clubs, setClubs] = useState<ClubSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setClubs(await apiFetchClubOptions());
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Erro ao carregar os clubinhos"));
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { clubs, loading, error, refresh };
}

/**
 * Um coordenador recarregado da API.
 *
 * A tela mantém o diálogo de clubinhos aberto durante as escritas, e adivinhar
 * o novo estado dava números errados — um clubinho recém-vinculado aparecia com
 * zero professores mesmo tendo turma.
 */
export function useCoordinatorDetails() {
  const [loading, setLoading] = useState(false);

  const fetchOne = useCallback(
    async (coordinatorId: string): Promise<CoordinatorResponse | null> => {
      setLoading(true);
      try {
        return await apiFetchCoordinator(coordinatorId);
      } catch {
        // A recarga é acessória: a listagem já foi atualizada pela mutação.
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, fetchOne };
}
