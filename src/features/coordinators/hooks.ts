import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiAssignClub,
  apiGetCoordinator,
  apiListClubsSimple,
  apiListCoordinators,
  apiUnassignClub,
  type ListCoordinatorsParams,
} from "./api";
import type {
  ClubSimple,
  CoordinatorFilters,
  CoordinatorProfile,
} from "./types";
import type { SortingState } from "@tanstack/react-table";

function mapSortingToServer(sorting: SortingState) {
  const first = sorting?.[0];
  const sortId =
    first?.id === "user" ? "name"
      : first?.id === "createdAt" ? "createdAt"
        : "updatedAt";
  const order: "asc" | "desc" = first?.desc ? "desc" : "asc";
  return { sort: sortId as ListCoordinatorsParams["sort"], order };
}

function mapFiltersToServer(filters: CoordinatorFilters) {
  const active =
    filters.active === "all" ? undefined
      : filters.active === "active" ? true
        : false;
  const hasClubs =
    filters.hasClubs === "all" ? undefined
      : filters.hasClubs === "yes" ? true
        : false;

  return {
    searchString: filters.searchString?.trim() || undefined,
    active,
    hasClubs,
    clubNumber:
      filters.clubNumber !== "" && filters.clubNumber != null
        ? Number(filters.clubNumber)
        : undefined,
  } as Omit<ListCoordinatorsParams, "page" | "limit" | "sort" | "order">;
}

export function useCoordinatorProfiles(
  pageIndex: number,
  pageSize: number,
  sorting: SortingState,
  filters: CoordinatorFilters
) {
  const [rows, setRows] = useState<CoordinatorProfile[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { sort, order } = mapSortingToServer(sorting);
      const qFilters = mapFiltersToServer(filters);
      const data = await apiListCoordinators({
        page: pageIndex + 1,
        limit: pageSize,
        sort,
        order,
        ...qFilters,
      });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Erro ao listar coordenadores"
      );
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, sorting, filters]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const refreshOne = useCallback(async (coordinatorId: string) => {
    try {
      const updated = await apiGetCoordinator(coordinatorId);
      setRows((prev) => {
        const i = prev.findIndex((p) => p.id === coordinatorId);
        if (i === -1) return prev;
        const next = [...prev];
        next[i] = updated;
        return next;
      });
    } catch {
      setRows((prev) => prev.filter((p) => p.id !== coordinatorId));
    }
  }, []);

  return { rows, total, loading, error, setError, fetchPage, refreshOne };
}

export function useCoordinatorMutations(
  refreshPage: () => Promise<void> | void,
  refreshOne: (coordinatorId: string) => Promise<void> | void
) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");


  const assignClub = useCallback(
    async (coordinatorId: string, clubId: string): Promise<string> => {
      setDialogLoading(true); setDialogError("");
      try {
        const res: any = await apiAssignClub(coordinatorId, clubId);
        await refreshOne(coordinatorId);
        await refreshPage();
        return res?.message || "Club atribuído ao coordenador com sucesso";
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || err.message || "Erro ao vincular clubinho";
        setDialogError(msg);
        throw err;
      } finally {
        setDialogLoading(false);
      }
    },
    [refreshOne, refreshPage]
  );

  const unassignClub = useCallback(
    async (coordinatorId: string, clubId: string): Promise<string> => {
      setDialogLoading(true); setDialogError("");
      try {
        const res: any = await apiUnassignClub(coordinatorId, clubId);
        await refreshOne(coordinatorId);
        await refreshPage();
        return res?.message || "Club removido do coordenador com sucesso";
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || err.message || "Erro ao desvincular clubinho";
        setDialogError(msg);
        throw err;
      } finally {
        setDialogLoading(false);
      }
    },
    [refreshOne, refreshPage]
  );

  return { dialogLoading, dialogError, setDialogError, assignClub, unassignClub };
}

export function useClubsIndex() {
  const [clubs, setClubs] = useState<ClubSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const list = await apiListClubsSimple();
      setClubs(list || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao listar clubinhos");
    } finally {
      setLoading(false);
    }
  }, []);

  const byNumber = useMemo(() => {
    const map = new Map<number, ClubSimple>();
    for (const c of clubs) if (typeof c.number === "number") map.set(c.number, c);
    return map;
  }, [clubs]);

  return { clubs, byNumber, loading, error, refresh };
}
