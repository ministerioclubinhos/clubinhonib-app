import { useCallback, useEffect, useState } from "react";
import {
  apiCreateUser,
  apiDeleteUser,
  apiListUsers,
  apiUpdateUser,
} from "./api";
import {
  CreateUserForm,
  SortParam,
  UserFilters,
  UserRow,
  UpdateUserForm,
} from "./types";
import { extractErrorMessage } from "@/utils/apiError";

export function useUsers(
  pageIndex: number,
  pageSize: number,
  sorting: SortParam,
  filters: UserFilters
) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const sort = sorting?.id ?? "updatedAt";
      const order = sorting?.desc ? "DESC" : "ASC";

      const page = await apiListUsers({
        page: pageIndex + 1,
        limit: pageSize,
        q: filters.q || undefined,
        role: filters.role,
        active: filters.active,
        completed: filters.completed,
        sort,
        order,
      });

      setRows(Array.isArray(page?.items) ? page.items : []);
      setTotal(Number(page?.meta?.total ?? 0));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Erro ao buscar usuários"));
    } finally {
      setLoading(false);
    }
  }, [
    filters.active,
    filters.completed,
    filters.q,
    filters.role,
    pageIndex,
    pageSize,
    sorting,
  ]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    rows,
    total,
    loading,
    error,
    setError,
    fetchPage,
    setRows,
    setTotal,
  };
}

export function useUserMutations(refreshPage: () => Promise<void> | void) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const createUser = useCallback(async (form: CreateUserForm) => {
    setDialogLoading(true);
    setDialogError("");

    try {
      const { confirmPassword, ...payload } = form;
      await apiCreateUser(payload);
      await refreshPage();
    } catch (err: unknown) {
      setDialogError(extractErrorMessage(err, "Erro ao criar usuário"));
      throw err;
    } finally {
      setDialogLoading(false);
    }
  }, [refreshPage]);

  const updateUser = useCallback(
    async (id: string, form: UpdateUserForm & { confirmPassword?: string }) => {
      setDialogLoading(true);
      setDialogError("");

      try {
        const { confirmPassword: _, ...payload } = form;
        await apiUpdateUser(id, payload);
        await refreshPage();
      } catch (err: unknown) {
        setDialogError(extractErrorMessage(err, "Erro ao atualizar usuário"));
        throw err;
      } finally {
        setDialogLoading(false);
      }
    },
    [refreshPage]
  );

  const deleteUser = useCallback(async (id: string) => {
    setDialogLoading(true);
    setDialogError("");

    try {
      await apiDeleteUser(id);
      await refreshPage();
    } catch (err: unknown) {
      setDialogError(extractErrorMessage(err, "Erro ao excluir usuário"));
      throw err;
    } finally {
      setDialogLoading(false);
    }
  }, [refreshPage]);

  return {
    dialogLoading,
    dialogError,
    setDialogError,
    createUser,
    updateUser,
    deleteUser,
  };
}
