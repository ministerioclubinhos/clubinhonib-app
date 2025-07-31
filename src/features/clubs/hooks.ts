import { useCallback, useEffect, useState } from "react";
import {
  apiCreateClub,
  apiDeleteClub,
  apiFetchClub,
  apiFetchClubs,
  apiListCoordinatorsSimple,
  apiListTeachersSimple,
  apiUpdateClub,
} from "./api";
import {
  ClubResponseDto,
  CreateClubForm,
  EditClubForm,
  TeacherOption,
  ClubFilters,
  ClubSort,
  CoordinatorOption,
} from "./types";

export function useClubs(
  pageIndex: number,
  pageSize: number,
  sorting: ClubSort,
  filters: ClubFilters
) {
  const [rows, setRows] = useState<ClubResponseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchClubs({
        page: pageIndex + 1,
        limit: pageSize,
        filters,
        sort: sorting,
      });
      setRows(Array.isArray(data?.data) ? data.data : []);
      setTotal(Number(data?.total ?? 0));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao listar clubes");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, filters, sorting]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { rows, total, loading, error, setRows, setTotal, fetchPage, setError };
}

export function useClubDetails() {
  const [viewing, setViewing] = useState<ClubResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchClub = useCallback(async (id: string) => {
    setLoading(true);
    try {
      setViewing(await apiFetchClub(id));
    } finally {
      setLoading(false);
    }
  }, []);

  return { viewing, setViewing, loading, fetchClub };
}

export function useClubMutations(
  fetchClubs: (page: number, limit: number, filters?: ClubFilters, sort?: ClubSort) => Promise<void> | void
) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const createClub = useCallback(
    async (payload: CreateClubForm, page: number, limit: number, filters?: ClubFilters, sort?: ClubSort) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiCreateClub(payload);
        await fetchClubs(page, limit, filters, sort);
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao criar clubinho");
      } finally {
        setDialogLoading(false);
      }
    },
    [fetchClubs]
  );

  const updateClub = useCallback(
    async (
      id: string,
      payload: Omit<EditClubForm, "id">,
      page: number,
      limit: number,
      filters?: ClubFilters,
      sort?: ClubSort
    ) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiUpdateClub(id, payload);
        await fetchClubs(page, limit, filters, sort);
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao atualizar clubinho");
      } finally {
        setDialogLoading(false);
      }
    },
    [fetchClubs]
  );

  const deleteClub = useCallback(
    async (id: string, page: number, limit: number, filters?: ClubFilters, sort?: ClubSort) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiDeleteClub(id);
        await fetchClubs(page, limit, filters, sort);
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao remover clubinho");
      } finally {
        setDialogLoading(false);
      }
    },
    [fetchClubs]
  );

  return { dialogLoading, dialogError, setDialogError, createClub, updateClub, deleteClub };
}

/**
 * Opções de Coordenadores/Professores:
 * - Coordenadores: todos (vinculados ou não).
 * - Professores: retornamos todos; o componente TeachersSelect filtra exibindo apenas os não vinculados,
 *   mantendo visíveis os já selecionados em modo de edição.
 */
export function useOptions() {
  const [coordinators, setCoordinators] = useState<CoordinatorOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  const loadRefs = useCallback(async () => {
    const [coordsApi, teachersApi] = await Promise.all([
      apiListCoordinatorsSimple(),
      apiListTeachersSimple(),
    ]);

    const mappedCoords: CoordinatorOption[] = (coordsApi ?? []).map((c) => ({
      coordinatorProfileId: c.coordinatorProfileId,
      name: c.name,
    }));

    const mappedTeachers: TeacherOption[] = (teachersApi ?? []).map((t) => ({
      teacherProfileId: t.teacherProfileId,
      name: t.name,
      vinculado: !!t.vinculado,
    }));

    setCoordinators(mappedCoords);
    setTeachers(mappedTeachers);
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  return { coordinators, teachers, reloadOptions: loadRefs };
}
