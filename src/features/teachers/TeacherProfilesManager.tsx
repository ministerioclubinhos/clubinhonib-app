import React, { useMemo, useState } from "react";
import { Grid2 } from "@mui/material";

import { useSelector } from "react-redux";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import ConfirmDialog from "@/components/common/modal/ConfirmDialog";
import type { RootState } from "@/store/slices";
import { clubLinkPermissionsOf } from "@/utils/clubLinkPermissions";

import TeacherCard from "./components/TeacherCard";
import TeacherClubDialog from "./components/TeacherClubDialog";
import TeacherViewDialog from "./components/TeacherViewDialog";
import { useClubOptions, useTeacherMutations, useTeachers } from "./hooks";
import { ANY_FILTER, TEACHERS_PAGE_SIZE_OPTIONS } from "./constants";
import { clubLabel, teacherName } from "./utils";
import type { TeacherResponse } from "./types";

export default function TeacherProfilesManager() {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const permissions = clubLinkPermissionsOf(role);

  const {
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
  } = useTeachers();

  const {
    clubs,
    loading: clubsLoading,
    error: clubsError,
    refresh: refreshClubs,
  } = useClubOptions();

  const { actionLoading, actionError, setActionError, assignClub, unassignClub } =
    useTeacherMutations(refresh);

  const [viewing, setViewing] = useState<TeacherResponse | null>(null);
  const [editing, setEditing] = useState<TeacherResponse | null>(null);
  const [confirmUnassign, setConfirmUnassign] =
    useState<TeacherResponse | null>(null);

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "active",
        label: "Situação",
        value: filters.active === undefined ? ANY_FILTER : String(filters.active),
        options: [
          { value: ANY_FILTER, label: "Ativos e inativos" },
          { value: "true", label: "Ativos" },
          { value: "false", label: "Inativos" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            active: value === ANY_FILTER ? undefined : value === "true",
          })),
      },
      {
        id: "hasClub",
        label: "Vínculo",
        value:
          filters.hasClub === undefined ? ANY_FILTER : String(filters.hasClub),
        options: [
          { value: ANY_FILTER, label: "Com e sem clubinho" },
          { value: "true", label: "Com clubinho" },
          { value: "false", label: "Sem clubinho" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            hasClub: value === ANY_FILTER ? undefined : value === "true",
          })),
      },
    ],
    [filters, setFilters],
  );

  const reloadAll = () => {
    refresh();
    void refreshClubs();
  };

  const handleAssign = async (clubId: string) => {
    if (!editing) return;

    const ok = await assignClub(editing.id, clubId);
    if (ok) {
      setEditing(null);
      setViewing(null);
      void refreshClubs();
    }
  };

  /**
   * Desvincular sempre passa pela confirmação — inclusive quando o pedido vem
   * de dentro do diálogo de vínculo. Sem isso, o mesmo gesto perguntava no card
   * e não perguntava no diálogo, e o professor perdia o acesso às crianças da
   * turma sem aviso.
   */
  const handleUnassign = async () => {
    if (!confirmUnassign) return;

    const ok = await unassignClub(confirmUnassign.id, confirmUnassign.club?.id);
    if (ok) {
      setConfirmUnassign(null);
      setEditing(null);
      setViewing(null);
      void refreshClubs();
    }
  };

  return (
    <ListingLayout
      title="Professores"
      summary={
        total > 0
          ? `${total} professor(es) encontrado(s)`
          : "Nenhum professor para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por professor, e-mail, telefone ou coordenador…"
          onSearchChange={setSearch}
          filters={toolbarFilters}
          onRefresh={reloadAll}
        />
      }
      loading={loading}
      error={error || clubsError || actionError}
      onDismissError={() => {
        setError("");
        setActionError("");
      }}
      itemCount={items.length}
      emptyTitle="Nenhum professor encontrado"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={TEACHERS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <TeacherViewDialog
            teacher={viewing}
            onClose={() => setViewing(null)}
            onEditClub={() => {
              if (viewing) setEditing(viewing);
            }}
          />

          <TeacherClubDialog
            open={!!editing}
            teacher={editing}
            clubs={clubs}
            clubsLoading={clubsLoading}
            loading={actionLoading}
            error={actionError}
            canManage={permissions.canManageTeacherLinks}
            onAssign={(clubId) => void handleAssign(clubId)}
            onUnassign={() => setConfirmUnassign(editing)}
            onClose={() => {
              setEditing(null);
              setActionError("");
            }}
          />

          <ConfirmDialog
            open={!!confirmUnassign}
            title="Desvincular clubinho"
            content={
              confirmUnassign
                ? `Remover ${teacherName(confirmUnassign)} de ${clubLabel(
                    confirmUnassign.club,
                  )}?`
                : ""
            }
            confirmText="Desvincular"
            confirmColor="warning"
            loading={actionLoading}
            onClose={() => setConfirmUnassign(null)}
            onConfirm={() => void handleUnassign()}
          />
        </>
      }
    >
      {items.map((teacher) => (
        <Grid2 key={teacher.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <TeacherCard
            teacher={teacher}
            disabled={actionLoading}
            onView={() => setViewing(teacher)}
            onEditClub={() => setEditing(teacher)}
            canManage={permissions.canManageTeacherLinks}
            onUnassignClub={() => setConfirmUnassign(teacher)}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
