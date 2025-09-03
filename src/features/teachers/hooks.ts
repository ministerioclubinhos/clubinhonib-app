// src/modules/teachers/hooks.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  apiAssignTeacherToClub,
  apiGetTeacher,
  apiListClubsSimple,
  apiListTeachers,
  apiUnassignTeacherFromClub,
} from "./api";
import { ClubSimple, TeacherProfile, TeacherQuery, Page } from "./types";
import type { SortingState } from "@tanstack/react-table";

/* =========================================================
 * useTeacherProfiles — paginação/ordenação/filtros SERVER-SIDE
 * (somente esta parte foi alterada; demais hooks permanecem)
 * ========================================================= */
export function useTeacherProfiles(
  pageIndex: number,   // 0-based (UI)
  pageSize: number,
  sorting: SortingState,
  filters: Pick<TeacherQuery, "searchString" | "q" | "active" | "hasClub" | "clubNumber">,
) {
  const [rows, setRows] = useState<TeacherProfile[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 🔒 chave estável para filtros (evita re-fetch em cada render)
  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        q: filters.q ?? undefined,
        searchString: filters.searchString ?? undefined,
        active: filters.active ?? undefined,
        hasClub: filters.hasClub ?? undefined,
        clubNumber: filters.clubNumber ?? undefined,
      }),
    [filters.q, filters.searchString, filters.active, filters.hasClub, filters.clubNumber]
  );

  // SortingState -> { sort, order } aceitos pelo backend
  const sortParam = useMemo<Pick<TeacherQuery, "sort" | "order">>(() => {
    const first = sorting?.[0];
    const map = {
      teacher: "name",
      updatedAt: "updatedAt",
      createdAt: "createdAt",
      club: "clubNumber",
      coord: "name",
    } as const;
    if (!first) return { sort: "updatedAt", order: "desc" };
    type SortKey = (typeof map)[keyof typeof map];
    const id = first.id as keyof typeof map | "name" | "updatedAt" | "createdAt" | "clubNumber";
    const sort: SortKey = map[id as keyof typeof map] ?? "updatedAt";
    const order: "asc" | "desc" = first.desc ? "desc" : "asc";
    return { sort, order };
  }, [sorting]);

  // 🔐 guarda para descartar respostas antigas
  const seqRef = useRef(0);

  const fetchPage = useCallback(async () => {
    const mySeq = ++seqRef.current;
    setLoading(true);
    setError("");
    try {
      const data: Page<TeacherProfile> = await apiListTeachers({
        ...(JSON.parse(filtersKey) as Pick<TeacherQuery, "searchString" | "q" | "active" | "hasClub" | "clubNumber">),
        page: pageIndex + 1, // backend é 1-based
        limit: pageSize,
        sort: sortParam.sort,
        order: sortParam.order,
      });

      // se chegou resposta antiga, ignore
      if (mySeq !== seqRef.current) return;

      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      if (mySeq !== seqRef.current) return;
      setError(err?.response?.data?.message || err.message || "Erro ao listar professores");
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  }, [filtersKey, pageIndex, pageSize, sortParam]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const refreshOne = useCallback(async (teacherId: string) => {
    try {
      const prof = await apiGetTeacher(teacherId);
      setRows(prev => {
        const i = prev.findIndex(p => p.id === teacherId);
        if (i === -1) return prev;
        const next = [...prev]; next[i] = prof; return next;
      });
    } catch {
      setRows(prev => prev.filter(p => p.id !== teacherId));
    }
  }, []);

  return { rows, total, loading, error, setError, fetchPage, refreshOne };
}

/* =======================================
 * useTeacherMutations — (sem alterações)
 * ======================================= */
export function useTeacherMutations(
  refreshPage: () => Promise<void> | void,
  refreshOne: (teacherId: string) => Promise<void> | void
) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const setClub = useCallback(async (teacherId: string, clubId: string) => {
    setDialogLoading(true); setDialogError("");
    try { await apiAssignTeacherToClub(teacherId, clubId); await refreshOne(teacherId); }
    catch (err: any) { setDialogError(err?.response?.data?.message || err.message || "Erro ao vincular clube"); throw err; }
    finally { setDialogLoading(false); }
  }, [refreshOne]);

  const clearClub = useCallback(async (teacherId: string) => {
    setDialogLoading(true); setDialogError("");
    try {
      // endpoint exige clubId: buscamos o atual
      const current = await apiGetTeacher(teacherId);
      const currentClubId = current?.club?.id;
      if (!currentClubId) return; // já está sem clube
      await apiUnassignTeacherFromClub(teacherId, currentClubId);
      await refreshOne(teacherId);
    } catch (err: any) {
      setDialogError(err?.response?.data?.message || err.message || "Erro ao desvincular clube");
      throw err;
    } finally { setDialogLoading(false); }
  }, [refreshOne]);

  return { dialogLoading, dialogError, setDialogError, setClub, clearClub };
}

/* =================================
 * useClubsIndex — (sem alterações)
 * ================================= */
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
