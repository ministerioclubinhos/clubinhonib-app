import { useCallback, useEffect, useState } from "react";

import { useAbortController, useDebouncedValue } from "@/hooks";
import { extractErrorMessage, isCancelledRequest } from "@/utils/apiError";

import {
  apiCreateUser,
  apiDeleteUser,
  apiFetchUsers,
  apiUpdateUser,
} from "./api";
import { USERS_DEFAULT_LIMIT } from "./constants";
import type { UserFilters, UserResponse } from "./types";
import { toCreateUserRequest, toUpdateUserRequest } from "./utils";
import type { UserFormValues } from "./types";

/** Página de usuários, com busca e filtros resolvidos pela API. */
export function useUsers() {
  const [items, setItems] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(USERS_DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Omit<UserFilters, "searchString">>({});
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
        const data = await apiFetchUsers(
          {
            page,
            limit: pageSize,
            filters: { ...filters, searchString: debouncedSearch || undefined },
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.meta?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, "Erro ao carregar os usuários"));
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
export function useUserMutations(refresh: () => void) {
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

  const createUser = useCallback(
    (values: UserFormValues) =>
      run(async () => {
        await apiCreateUser(toCreateUserRequest(values));
      }, "Erro ao criar o usuário"),
    [run],
  );

  const updateUser = useCallback(
    (id: string, values: UserFormValues) =>
      run(async () => {
        await apiUpdateUser(id, toUpdateUserRequest(values));
      }, "Erro ao atualizar o usuário"),
    [run],
  );

  const deleteUser = useCallback(
    (id: string) =>
      run(async () => {
        await apiDeleteUser(id);
      }, "Erro ao excluir o usuário"),
    [run],
  );

  return {
    actionLoading,
    actionError,
    setActionError,
    createUser,
    updateUser,
    deleteUser,
  };
}
