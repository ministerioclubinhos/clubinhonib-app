import { useCallback, useEffect, useState } from "react";

import { apiFetchClubOptions } from "@/features/clubs/api";
import type { ClubSelectOption } from "@/features/clubs/types";
import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import {
  apiAssignTeacherToClub,
  apiFetchTeachers,
  apiUnassignTeacherFromClub,
} from "./api";
import { TEACHERS_DEFAULT_LIMIT } from "./constants";
import type { TeacherFilters, TeacherResponse } from "./types";

/** Página de professores, com busca e filtros resolvidos pela API. */
export function useTeachers() {
  const [items, setItems] = useState<TeacherResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(TEACHERS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Omit<TeacherFilters, "searchString">>(
    {},
  );
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
        const data = await apiFetchTeachers(
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
        setError(extractErrorMessage(err, "Erro ao carregar os professores"));
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

/** Vínculo entre professor e clubinho. Cada operação devolve se deu certo. */
export function useTeacherMutations(refresh: () => void) {
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
    (teacherId: string, clubId: string) =>
      run(async () => {
        await apiAssignTeacherToClub(teacherId, clubId);
      }, "Erro ao vincular o clubinho"),
    [run],
  );

  const unassignClub = useCallback(
    (teacherId: string, clubId?: string) =>
      run(async () => {
        await apiUnassignTeacherFromClub(teacherId, clubId);
      }, "Erro ao desvincular o clubinho"),
    [run],
  );

  return { actionLoading, actionError, setActionError, assignClub, unassignClub };
}

/**
 * Clubinhos disponíveis para o vínculo.
 *
 * A lista é carregada uma vez e alimenta o seletor do diálogo: antes o número
 * do clubinho era digitado à mão e um número inexistente só falhava na hora de
 * salvar.
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
