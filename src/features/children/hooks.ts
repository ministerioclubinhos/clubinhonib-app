import { useCallback, useEffect, useState } from "react";
import {
  apiCreateChild, apiDeleteChild, apiFetchChild, apiFetchChildren, apiUpdateChild, apiToggleChildActive
} from "./api";
import { ChildFilters, ChildResponseDto, ChildSort, CreateChildForm, EditChildForm } from "./types";

export function useChildren(pageIndex: number, pageSize: number, sorting: ChildSort, filters: ChildFilters) {
  const [rows, setRows] = useState<ChildResponseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchChildren({
        page: pageIndex + 1,
        limit: pageSize,
        filters,
        sort: sorting,
      });
      const meta = (data as any)?.meta;
      setRows(Array.isArray((data as any)?.data) ? (data as any).data : []);
      setTotal(Number(meta?.totalItems ?? (data as any)?.total ?? 0));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao listar crianças");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, filters, sorting]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  return { rows, total, loading, error, setError, fetchPage };
}

export function useChildDetails() {
  const [viewing, setViewing] = useState<ChildResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchChild = useCallback(async (id: string) => {
    setLoading(true);
    try {
      setViewing(await apiFetchChild(id));
    } finally {
      setLoading(false);
    }
  }, []);

  return { viewing, setViewing, loading, fetchChild };
}

export function useChildMutations(refetch: (page: number, limit: number, filters?: ChildFilters, sort?: ChildSort) => Promise<void> | void) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const createChild = useCallback(async (payload: CreateChildForm, page: number, limit: number, filters?: ChildFilters, sort?: ChildSort) => {
    setDialogLoading(true);
    setDialogError("");
    try {
      await apiCreateChild(payload);
      await refetch(page, limit, filters, sort);
    } catch (err: any) {
      setDialogError(err?.response?.data?.message || err.message || "Erro ao criar criança");
    } finally {
      setDialogLoading(false);
    }
  }, [refetch]);

  const updateChild = useCallback(async (id: string, payload: Omit<EditChildForm, "id">, page: number, limit: number, filters?: ChildFilters, sort?: ChildSort) => {
    setDialogLoading(true);
    setDialogError("");
    try {
      await apiUpdateChild(id, payload);
      await refetch(page, limit, filters, sort);
    } catch (err: any) {
      setDialogError(err?.response?.data?.message || err.message || "Erro ao atualizar criança");
    } finally {
      setDialogLoading(false);
    }
  }, [refetch]);

  const deleteChild = useCallback(async (id: string, page: number, limit: number, filters?: ChildFilters, sort?: ChildSort) => {
    setDialogLoading(true);
    setDialogError("");
    try {
      await apiDeleteChild(id);
      await refetch(page, limit, filters, sort);
    } catch (err: any) {
      setDialogError(err?.response?.data?.message || err.message || "Erro ao remover criança");
    } finally {
      setDialogLoading(false);
    }
  }, [refetch]);

  const toggleActive = useCallback(async (id: string, page: number, limit: number, filters?: ChildFilters, sort?: ChildSort) => {
    setDialogLoading(true);
    setDialogError("");
    try {
      await apiToggleChildActive(id);
      await refetch(page, limit, filters, sort);
    } catch (err: any) {
      setDialogError(err?.response?.data?.message || err.message || "Erro ao alterar status da criança");
    } finally {
      setDialogLoading(false);
    }
  }, [refetch]);

  return { dialogLoading, dialogError, setDialogError, createChild, updateChild, deleteChild, toggleActive };
}
