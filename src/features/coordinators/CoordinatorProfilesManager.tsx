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

import CoordinatorCard from "./components/CoordinatorCard";
import CoordinatorClubsDialog from "./components/CoordinatorClubsDialog";
import CoordinatorViewDialog from "./components/CoordinatorViewDialog";
import {
  useClubOptions,
  useCoordinatorDetails,
  useCoordinatorMutations,
  useCoordinators,
} from "./hooks";
import { ANY_FILTER, COORDINATORS_PAGE_SIZE_OPTIONS } from "./constants";
import { clubLabel, coordinatorName } from "./utils";
import type { CoordinatorClub, CoordinatorResponse } from "./types";

export default function CoordinatorProfilesManager() {
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
  } = useCoordinators();

  const {
    clubs,
    loading: clubsLoading,
    error: clubsError,
    refresh: refreshClubs,
  } = useClubOptions();

  const {
    actionLoading,
    actionError,
    setActionError,
    assignClub,
    unassignClub,
  } = useCoordinatorMutations(refresh);

  const { fetchOne } = useCoordinatorDetails();

  const [viewing, setViewing] = useState<CoordinatorResponse | null>(null);
  const [managing, setManaging] = useState<CoordinatorResponse | null>(null);
  const [confirmUnassign, setConfirmUnassign] = useState<CoordinatorClub | null>(
    null,
  );

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
        id: "hasClubs",
        label: "Vínculo",
        value:
          filters.hasClubs === undefined ? ANY_FILTER : String(filters.hasClubs),
        options: [
          { value: ANY_FILTER, label: "Com e sem clubinho" },
          { value: "true", label: "Com clubinho" },
          { value: "false", label: "Sem clubinho" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            hasClubs: value === ANY_FILTER ? undefined : value === "true",
          })),
      },
    ],
    [filters, setFilters],
  );

  const reloadAll = () => {
    refresh();
    void refreshClubs();
  };

  /**
   * O diálogo fica aberto durante as escritas, então o coordenador em edição é
   * recarregado da API. Remontá-lo aqui dava números errados: um clubinho
   * recém-vinculado aparecia com zero professores mesmo tendo turma.
   */
  const syncManaging = async (coordinatorId: string) => {
    const fresh = await fetchOne(coordinatorId);
    if (fresh) setManaging(fresh);

    setViewing(null);
    void refreshClubs();
  };

  const handleAssign = async (clubId: string) => {
    if (!managing) return;

    const ok = await assignClub(managing.id, clubId);
    if (ok) await syncManaging(managing.id);
  };

  const handleUnassign = async () => {
    if (!managing || !confirmUnassign) return;

    const ok = await unassignClub(managing.id, confirmUnassign.id);
    if (ok) {
      setConfirmUnassign(null);
      await syncManaging(managing.id);
    }
  };

  return (
    <ListingLayout
      title="Coordenadores"
      summary={
        total > 0
          ? `${total} coordenador(es) encontrado(s)`
          : "Nenhum coordenador para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por coordenador, e-mail, telefone ou professor…"
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
      emptyTitle="Nenhum coordenador encontrado"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={COORDINATORS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <CoordinatorViewDialog
            coordinator={viewing}
            onClose={() => setViewing(null)}
            onManageClubs={() => {
              if (viewing) setManaging(viewing);
            }}
          />

          <CoordinatorClubsDialog
            open={!!managing}
            coordinator={managing}
            clubs={clubs}
            clubsLoading={clubsLoading}
            loading={actionLoading}
            error={actionError}
            canManage={permissions.canManageCoordinatorLinks}
            onAssign={(clubId) => void handleAssign(clubId)}
            onUnassign={setConfirmUnassign}
            onClose={() => {
              setManaging(null);
              setActionError("");
            }}
          />

          {/* Desvincular tira do coordenador o acesso às crianças da turma, e
              a operação não se desfaz sozinha. */}
          <ConfirmDialog
            open={!!confirmUnassign}
            title="Desvincular clubinho"
            content={
              confirmUnassign && managing
                ? `Remover ${clubLabel(confirmUnassign)} de ${coordinatorName(
                    managing,
                  )}?`
                : ""
            }
            confirmText="Desvincular"
            confirmColor="warning"
            loading={actionLoading}
            onClose={() => setConfirmUnassign(null)}
            onConfirm={handleUnassign}
          />
        </>
      }
    >
      {items.map((coordinator) => (
        <Grid2 key={coordinator.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <CoordinatorCard
            coordinator={coordinator}
            disabled={actionLoading}
            onView={() => setViewing(coordinator)}
            canManage={permissions.canManageCoordinatorLinks}
            onManageClubs={() => setManaging(coordinator)}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
