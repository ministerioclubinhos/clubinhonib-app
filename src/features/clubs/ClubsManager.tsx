// src/modules/clubs/ClubsManager.tsx
import React, { useCallback, useState } from "react";
import { Alert, Box, CircularProgress, Typography, IconButton, Tooltip } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import ClubsToolbar from "./components/ClubsToolbar";
import ClubsTable from "./components/ClubsTable";
import ClubViewDialog from "./components/ClubViewDialog";
import ClubFormDialog from "./components/ClubFormDialog";
import ClubDeleteDialog from "./components/ClubDeleteDialog";
import { useClubDetails, useClubMutations, useClubs, useOptions } from "./hooks";
import { ClubResponseDto, CreateClubForm, EditClubForm, Weekday, ClubFilters, ClubSort } from "./types";
import { apiFetchClubs } from "./api";
import BackHeader from "@/components/common/header/BackHeader";

export default function ClubsManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ClubFilters>({
    addressSearchString: "",
    userSearchString: "",
    clubSearchString: "",
  });

  const [pageSize, setPageSize] = useState<number>(12);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [sorting, setSorting] = useState<ClubSort>({ id: "updatedAt", desc: true });

  const { rows, total, loading, error, setError, fetchPage } =
    useClubs(pageIndex, pageSize, sorting, filters);

  const doRefresh = useCallback(() => { fetchPage(); }, [fetchPage]);

  // detalhes
  const { viewing, setViewing, loading: viewingLoading, fetchClub } = useClubDetails();
  const handleOpenView = (club: ClubResponseDto) => { setViewing(club); fetchClub(club.id); };

  // combos (inclui reloadOptions)
  const { coordinators, teachers, reloadOptions } = useOptions();

  // mutations
  const { dialogLoading, dialogError, setDialogError, createClub, updateClub, deleteClub } =
    useClubMutations(async (page, limit) => {
      // sempre refetch mantendo o contexto atual
      await apiFetchClubs({ page, limit, filters, sort: sorting });
      await fetchPage(); // garante estado sincronizado
    });

  // util: sanitiza arrays de ids (remove null/undefined/"" e duplicados)
  const sanitizeIds = (arr?: Array<string | null | undefined>) =>
    Array.from(
      new Set(
        (arr ?? []).filter((v): v is string => typeof v === "string" && v.trim() !== "")
      )
    );

  // criar
  const [creating, setCreating] = useState<CreateClubForm | null>(null);
  const openCreate = () => setCreating({
    number: 0,
    weekday: "saturday" as Weekday,
    address: { street: "", district: "", city: "", state: "", postalCode: "" } as any,
    coordinatorProfileId: null,
    teacherProfileIds: [],
  });
  const submitCreate = async () => {
    if (!creating) return;
    const payload: CreateClubForm = {
      ...creating,
      teacherProfileIds: sanitizeIds(creating.teacherProfileIds),
    };
    if (!payload.teacherProfileIds?.length) delete (payload as any).teacherProfileIds;
    if (payload.coordinatorProfileId === undefined || payload.coordinatorProfileId === null) {
      delete (payload as any).coordinatorProfileId;
    }
    await reloadOptions(); // atualiza listas antes de criar (garante consistência)
    await createClub(payload, pageIndex + 1, pageSize, filters, sorting);
    setCreating(null);
  };

  // editar
  const [editing, setEditing] = useState<EditClubForm | null>(null);
  const startEdit = (c: ClubResponseDto) => {
    setEditing({
      id: c.id,
      number: c.number,
      weekday: c.weekday,
      address: c.address,
      coordinatorProfileId: c.coordinator?.id ?? null,
      teacherProfileIds: (c.teachers ?? []).map((t) => t.id),
    });
  };
  const submitEdit = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    const payload = {
      ...rest,
      teacherProfileIds: sanitizeIds(rest.teacherProfileIds),
    } as Omit<EditClubForm, "id">;
    if (Array.isArray(payload.teacherProfileIds) && !payload.teacherProfileIds.length) {
      delete (payload as any).teacherProfileIds;
    }
    await updateClub(id, payload, pageIndex + 1, pageSize, filters, sorting);
    setEditing(null);
  };

  // excluir
  const [confirmDelete, setConfirmDelete] = useState<ClubResponseDto | null>(null);
  const askDelete = (c: ClubResponseDto) => setConfirmDelete(c);
  const submitDelete = async () => {
    if (!confirmDelete) return;
    await deleteClub(confirmDelete.id, pageIndex + 1, pageSize, filters, sorting);
    setConfirmDelete(null);
  };

  React.useEffect(() => { doRefresh(); }, [doRefresh]);

  return (
    <Box sx={{
      px: { xs: 2, sm: 2, md: 4 },
      py: { xs: 0, md: 4 }, minHeight: "100vh", bgcolor: "#f9fafb"
    }}>
      <BackHeader title="Gerenciar Clubinhos" />

      <ClubsToolbar
        filters={filters}
        onChange={(updater) => { setFilters(updater); setPageIndex(0); }}
        onCreateClick={openCreate}
        onRefreshClick={doRefresh}
        isXs={isXs}
      />

      {loading && !rows.length && (
        <Box textAlign="center" my={6}><CircularProgress /></Box>
      )}
      {error && !loading && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <ClubsTable
        rows={rows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        sorting={sorting ? [sorting] as any : []}
        setSorting={(s) => setSorting(Array.isArray(s) ? (s[0] ?? null) : (s as any))}
        onOpenView={handleOpenView}
        onStartEdit={startEdit}
        onAskDelete={askDelete}
      />

      {/* View */}
      <ClubViewDialog
        open={!!viewing}
        loading={viewingLoading}
        club={viewing}
        onClose={() => setViewing(null)}
      />

      {/* Create */}
      <ClubFormDialog
        mode="create"
        open={!!creating}
        value={creating}
        onChange={(v) => setCreating(v as CreateClubForm)}
        onCancel={() => { setCreating(null); setDialogError(""); }}
        onSubmit={submitCreate}
        error={dialogError}
        loading={dialogLoading}
        coordinatorOptions={coordinators}
        teacherOptions={teachers}
      />

      {/* Edit */}
      <ClubFormDialog
        mode="edit"
        open={!!editing}
        value={editing}
        onChange={(v) => setEditing(v as EditClubForm)}
        onCancel={() => { setEditing(null); setDialogError(""); }}
        onSubmit={submitEdit}
        error={dialogError}
        loading={dialogLoading}
        coordinatorOptions={coordinators}
        teacherOptions={teachers}
      />

      {/* Delete */}
      <ClubDeleteDialog
        open={!!confirmDelete}
        clubNumber={confirmDelete?.number}
        loading={dialogLoading}
        error={dialogError}
        onCancel={() => { setConfirmDelete(null); setDialogError(""); }}
        onConfirm={submitDelete}
      />
    </Box>
  );
}
