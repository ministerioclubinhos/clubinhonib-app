import { useCallback, useEffect, useMemo, useState } from "react";

import { extractErrorMessage } from "@/utils/apiError";

import { SEARCH_DEBOUNCE_MS } from "./constants";
import { apiListCoordinatorsSimple } from "@/features/coordinators/api";
import { apiListTeachersSimple } from "@/features/teachers/api";

import {
  apiCreateClub,
  apiDeleteClub,
  apiFetchClub,
  apiFetchClubs,
  apiToggleClubActive,
  apiUpdateClub,
} from "./api";
import type {
  ClubFilters,
  ClubResponse,
  ClubSort,
  CoordinatorOption,
  CreateClubRequest,
  TeacherOption,
  UpdateClubRequest,
} from "./types";

/**
 * Segura o valor por um tempo antes de deixá-lo passar.
 *
 * A busca por texto é digitada; sem a espera, cada tecla dispara um GET.
 */
export function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/** Página atual da listagem, recarregada sempre que filtro ou ordem mudam. */
export function useClubs(
  pageIndex: number,
  pageSize: number,
  sorting: ClubSort,
  filters: ClubFilters,
) {
  const [rows, setRows] = useState<ClubResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Só o texto espera: mudar status ou ordem tem de responder na hora.
  const { isActive } = filters;
  const searchString = useDebouncedValue(filters.searchString ?? "");
  const appliedFilters = useMemo<ClubFilters>(
    () => ({ isActive, searchString }),
    [isActive, searchString],
  );

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchClubs({
        page: pageIndex + 1,
        limit: pageSize,
        filters: appliedFilters,
        sort: sorting,
      });
      setRows(Array.isArray(data?.data) ? data.data : []);
      setTotal(Number(data?.total ?? 0));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Erro ao listar clubinhos"));
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, appliedFilters, sorting]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  return { rows, total, loading, error, setError, fetchPage };
}

/** Detalhe de um clubinho, buscado ao abrir a visualização. */
export function useClubDetails() {
  const [viewing, setViewing] = useState<ClubResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchClub = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      setViewing(await apiFetchClub(id));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Erro ao carregar o clubinho"));
    } finally {
      setLoading(false);
    }
  }, []);

  return { viewing, setViewing, loading, error, fetchClub };
}

/**
 * Escritas da tela.
 *
 * Cada operação devolve se deu certo: sem isso a tela fechava o formulário
 * mesmo quando a API recusava, e a mensagem de erro nunca chegava a aparecer.
 */
export function useClubMutations(refresh: () => Promise<void> | void) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const run = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await action();
        await refresh();
        return true;
      } catch (err: unknown) {
        setDialogError(extractErrorMessage(err, fallbackMessage));
        return false;
      } finally {
        setDialogLoading(false);
      }
    },
    [refresh],
  );

  const createClub = useCallback(
    (payload: CreateClubRequest) =>
      run(async () => {
        await apiCreateClub(payload);
      }, "Erro ao criar clubinho"),
    [run],
  );

  const updateClub = useCallback(
    (id: string, payload: UpdateClubRequest) =>
      run(async () => {
        await apiUpdateClub(id, payload);
      }, "Erro ao atualizar clubinho"),
    [run],
  );

  const deleteClub = useCallback(
    (id: string) =>
      run(async () => {
        await apiDeleteClub(id);
      }, "Erro ao remover clubinho"),
    [run],
  );

  const toggleActive = useCallback(
    (id: string) =>
      run(async () => {
        await apiToggleClubActive(id);
      }, "Erro ao alterar status do clubinho"),
    [run],
  );

  return {
    dialogLoading,
    dialogError,
    setDialogError,
    createClub,
    updateClub,
    deleteClub,
    toggleActive,
  };
}

/** Coordenadores e professores disponíveis para vincular no formulário. */
export function useClubFormOptions() {
  const [coordinators, setCoordinators] = useState<CoordinatorOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [error, setError] = useState("");

  const loadOptions = useCallback(async () => {
    try {
      const [coordinatorList, teacherList] = await Promise.all([
        apiListCoordinatorsSimple(),
        apiListTeachersSimple(),
      ]);

      setCoordinators(
        (coordinatorList ?? []).map((item) => ({
          coordinatorProfileId: item.coordinatorProfileId,
          name: item.name,
        })),
      );
      setTeachers(
        (teacherList ?? []).map((item) => ({
          teacherProfileId: item.teacherProfileId,
          name: item.name,
          vinculado: Boolean(item.vinculado),
        })),
      );
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Erro ao carregar as opções do formulário"));
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  return { coordinators, teachers, error, reloadOptions: loadOptions };
}
