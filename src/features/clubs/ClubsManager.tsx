import React, { useCallback, useState } from "react";
import { Alert, Box, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import type { SortingState } from "@tanstack/react-table";

import BackHeader from "@/components/common/header/BackHeader";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import ToggleActiveConfirmDialog from "@/components/common/modal/ToggleActiveConfirmDialog";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

import ClubsToolbar from "./components/ClubsToolbar";
import ClubsTable from "./components/ClubsTable";
import ClubViewDialog from "./components/ClubViewDialog";
import ClubFormDialog from "./components/ClubFormDialog";
import {
  useClubDetails,
  useClubFormOptions,
  useClubMutations,
  useClubs,
} from "./hooks";
import {
  DEFAULT_CLUB_SORT,
  DEFAULT_PAGE_SIZE,
  EMPTY_CLUB_FORM,
} from "./constants";
import {
  buildCreateClubRequest,
  buildUpdateClubRequest,
  toClubFormValues,
} from "./utils";
import type {
  ClubFilters,
  ClubFormValues,
  ClubResponse,
  ClubSort,
  ClubSortField,
} from "./types";

export default function ClubsManager() {
  const isAdmin = useSelector(selectIsAdmin);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [filters, setFilters] = useState<ClubFilters>({ searchString: "" });
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [sorting, setSorting] = useState<ClubSort>(DEFAULT_CLUB_SORT);

  const { rows, total, loading, error, setError, fetchPage } = useClubs(
    pageIndex,
    pageSize,
    sorting,
    filters,
  );

  const { viewing, setViewing, loading: viewingLoading, fetchClub } = useClubDetails();
  const { coordinators, teachers, reachableClubIds, reloadOptions } =
    useClubFormOptions();

  const refresh = useCallback(async () => {
    await fetchPage();
    await reloadOptions();
  }, [fetchPage, reloadOptions]);

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createClub,
    updateClub,
    deleteClub,
    toggleActive,
  } = useClubMutations(refresh);

  const [creating, setCreating] = useState<ClubFormValues | null>(null);
  const [editing, setEditing] = useState<{
    id: string;
    values: ClubFormValues;
    /** Coordenador que o clubinho tinha ao abrir o formulário. */
    initialCoordinatorProfileId: string | null;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ClubResponse | null>(null);
  const [confirmToggleActive, setConfirmToggleActive] = useState<ClubResponse | null>(
    null,
  );

  const handleOpenView = (club: ClubResponse) => {
    setViewing(club);
    void fetchClub(club.id);
  };

  const openCreate = () => {
    setDialogError("");
    setCreating({ ...EMPTY_CLUB_FORM, address: { ...EMPTY_CLUB_FORM.address } });
  };

  const startEdit = (club: ClubResponse) => {
    setDialogError("");
    const values = toClubFormValues(club);
    setEditing({
      id: club.id,
      values,
      initialCoordinatorProfileId: values.coordinatorProfileId,
    });
  };

  // O formulário só fecha quando a API aceita: se fechasse antes, o erro
  // devolvido não teria onde aparecer.
  const submitCreate = async () => {
    if (!creating) return;
    const ok = await createClub(buildCreateClubRequest(creating));
    if (ok) setCreating(null);
  };

  const submitEdit = async () => {
    if (!editing) return;
    const ok = await updateClub(editing.id, buildUpdateClubRequest(editing.values));
    if (ok) setEditing(null);
  };

  const submitDelete = async () => {
    if (!confirmDelete) return;
    const ok = await deleteClub(confirmDelete.id);
    if (ok) setConfirmDelete(null);
  };

  const submitToggleActive = async () => {
    if (!confirmToggleActive) return;
    const ok = await toggleActive(confirmToggleActive.id);
    if (ok) setConfirmToggleActive(null);
  };

  const tableSorting: SortingState = sorting ? [sorting] : [];
  const handleSortingChange = (next: SortingState) => {
    const first = next[0];
    setSorting(first ? { id: first.id as ClubSortField, desc: first.desc } : null);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 0 },
        // `dvh` acompanha a barra do navegador no celular; `vh` fica de reserva
        // para quem não suporta.
        minHeight: "100vh",
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        bgcolor: "#f9fafb",
      }}
    >
      <BackHeader title="Gerenciar Clubinhos" />

      <ClubsToolbar
        filters={filters}
        onChange={(applyFilters) => {
          setFilters(applyFilters);
          setPageIndex(0);
        }}
        onCreateClick={openCreate}
        onRefreshClick={() => void fetchPage()}
        isXs={isXs}
      />

      {loading && !rows.length && (
        <Box textAlign="center" my={6}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <ClubsTable
        isAdmin={isAdmin}
        rows={rows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        sorting={tableSorting}
        setSorting={handleSortingChange}
        onOpenView={handleOpenView}
        onStartEdit={startEdit}
        onAskDelete={setConfirmDelete}
        onToggleActive={setConfirmToggleActive}
      />

      <ClubViewDialog
        open={!!viewing}
        loading={viewingLoading}
        club={viewing}
        onClose={() => setViewing(null)}
      />

      <ClubFormDialog
        mode="create"
        open={!!creating}
        value={creating}
        onChange={setCreating}
        onCancel={() => {
          setCreating(null);
          setDialogError("");
        }}
        onSubmit={submitCreate}
        error={dialogError}
        loading={dialogLoading}
        coordinatorOptions={coordinators}
        teacherOptions={teachers}
        reachableClubIds={reachableClubIds}
      />

      <ClubFormDialog
        mode="edit"
        open={!!editing}
        value={editing?.values ?? null}
        onChange={(values) =>
          setEditing((current) => (current ? { ...current, values } : current))
        }
        onCancel={() => {
          setEditing(null);
          setDialogError("");
        }}
        onSubmit={submitEdit}
        error={dialogError}
        loading={dialogLoading}
        coordinatorOptions={coordinators}
        teacherOptions={teachers}
        reachableClubIds={reachableClubIds}
        clubId={editing?.id ?? null}
        initialCoordinatorProfileId={editing?.initialCoordinatorProfileId ?? null}
      />

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete ? `#${confirmDelete.number}` : ""}
        onClose={() => {
          setConfirmDelete(null);
          setDialogError("");
        }}
        onConfirm={submitDelete}
      />

      <ToggleActiveConfirmDialog
        open={!!confirmToggleActive}
        title={confirmToggleActive ? `Clubinho #${confirmToggleActive.number}` : ""}
        isActive={confirmToggleActive?.isActive ?? false}
        onClose={() => {
          setConfirmToggleActive(null);
          setDialogError("");
        }}
        onConfirm={submitToggleActive}
        loading={dialogLoading}
      />
    </Box>
  );
}
