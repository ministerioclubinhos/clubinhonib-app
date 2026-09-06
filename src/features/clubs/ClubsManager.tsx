import React, { useCallback, useMemo, useState } from "react";
import { Button, Grid2 } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import ToggleActiveConfirmDialog from "@/components/common/modal/ToggleActiveConfirmDialog";
import type { RootState } from "@/store/slices";
import { clubLinkPermissionsOf } from "@/utils/clubLinkPermissions";

import ClubCard from "./components/ClubCard";
import ClubCoordinatorDialog from "./components/ClubCoordinatorDialog";
import ClubFormDialog from "./components/ClubFormDialog";
import ClubTeachersDialog from "./components/ClubTeachersDialog";
import ClubViewDialog from "./components/ClubViewDialog";
import {
  useClubDetails,
  useClubFormOptions,
  useClubMutations,
  useClubs,
} from "./hooks";
import {
  ANY_FILTER,
  DEFAULT_CLUB_SORT,
  DEFAULT_PAGE_SIZE,
  EMPTY_CLUB_FORM,
  PAGE_SIZE_OPTIONS,
} from "./constants";
import {
  buildCreateClubRequest,
  buildUpdateClubRequest,
  toClubFormValues,
} from "./utils";
import type { ClubFilters, ClubFormValues, ClubResponse } from "./types";

/**
 * A tela de clubinhos, sobre a casca compartilhada.
 *
 * Era a última listagem do painel com casca própria: `ClubsCards`,
 * `ClubsTable` e `ClubsToolbar` somavam 1.051 linhas repetindo vazio, erro,
 * esqueleto, busca com atraso e paginação que as outras 18 telas já resolvem
 * uma vez só em `ListingLayout`.
 */
export default function ClubsManager() {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const permissoes = clubLinkPermissionsOf(role);

  const [filters, setFilters] = useState<ClubFilters>({ searchString: "" });
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(0);

  const { rows, total, loading, error, setError, fetchPage } = useClubs(
    pageIndex,
    pageSize,
    DEFAULT_CLUB_SORT,
    filters,
  );

  const {
    viewing,
    setViewing,
    loading: viewingLoading,
    fetchClub,
  } = useClubDetails();
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
  const [confirmToggleActive, setConfirmToggleActive] =
    useState<ClubResponse | null>(null);
  const [managingTeachers, setManagingTeachers] =
    useState<ClubResponse | null>(null);
  const [managingCoordinator, setManagingCoordinator] =
    useState<ClubResponse | null>(null);

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "isActive",
        label: "Situação",
        value:
          filters.isActive === undefined ? ANY_FILTER : String(filters.isActive),
        options: [
          { value: ANY_FILTER, label: "Ativos e inativos" },
          { value: "true", label: "Ativos" },
          { value: "false", label: "Inativos" },
        ],
        onChange: (value) => {
          setFilters((atual) => ({
            ...atual,
            isActive: value === ANY_FILTER ? undefined : value === "true",
          }));
          setPageIndex(0);
        },
      },
    ],
    [filters],
  );

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
    const ok = await updateClub(
      editing.id,
      buildUpdateClubRequest(editing.values),
    );
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

  /**
   * Vínculo alterado pelo card.
   *
   * Reaproveita `updateClub`: a API grava clubinho e vínculos numa requisição
   * só, então mandar o clubinho inteiro com a lista nova evita uma segunda
   * rota que faria a mesma coisa pela metade.
   */
  const salvarVinculos = async (
    club: ClubResponse,
    mudanca: Partial<ClubFormValues>,
  ) => {
    const values = { ...toClubFormValues(club), ...mudanca };
    return updateClub(club.id, buildUpdateClubRequest(values));
  };

  const vincularProfessor = async (teacherProfileId: string) => {
    if (!managingTeachers) return;

    const atuais = managingTeachers.teachers.map((teacher) => teacher.id);
    const ok = await salvarVinculos(managingTeachers, {
      teacherProfileIds: [...atuais, teacherProfileId],
    });
    if (ok) setManagingTeachers(null);
  };

  const desvincularProfessor = async (teacher: { id: string }) => {
    if (!managingTeachers) return;

    const restantes = managingTeachers.teachers
      .map((atual) => atual.id)
      .filter((id) => id !== teacher.id);
    const ok = await salvarVinculos(managingTeachers, {
      teacherProfileIds: restantes,
    });
    if (ok) setManagingTeachers(null);
  };

  const vincularCoordenador = async (coordinatorProfileId: string) => {
    if (!managingCoordinator) return;

    const ok = await salvarVinculos(managingCoordinator, {
      coordinatorProfileId,
    });
    if (ok) setManagingCoordinator(null);
  };

  const desvincularCoordenador = async () => {
    if (!managingCoordinator) return;

    const ok = await salvarVinculos(managingCoordinator, {
      coordinatorProfileId: null,
    });
    if (ok) setManagingCoordinator(null);
  };

  return (
    <ListingLayout data-testid="clubs-clubs-manager"
      title="Clubinhos"
      summary={
        total > 0
          ? `${total} clubinho(s) encontrado(s)`
          : "Nenhum clubinho para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={filters.searchString ?? ""}
          searchPlaceholder="Buscar por número, cidade ou bairro…"
          onSearchChange={(value) => {
            setFilters((atual) => ({ ...atual, searchString: value }));
            setPageIndex(0);
          }}
          filters={toolbarFilters}
          onClearFilters={() => {
            setFilters({ searchString: "" });
            setPageIndex(0);
          }}
          onRefresh={() => void fetchPage()}
          action={
            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={openCreate}
            >
              Novo clubinho
            </Button>
          }
        />
      }
      loading={loading}
      error={error || dialogError}
      onDismissError={() => {
        setError("");
        setDialogError("");
      }}
      itemCount={rows.length}
      emptyTitle="Nenhum clubinho encontrado"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page: pageIndex + 1,
        pageSize,
        total,
        onPageChange: (page) => setPageIndex(page - 1),
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPageIndex(0);
        },
      }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      overlays={
        <>
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
              setEditing((atual) => (atual ? { ...atual, values } : atual))
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
            initialCoordinatorProfileId={
              editing?.initialCoordinatorProfileId ?? null
            }
          />

          <ClubTeachersDialog
            open={!!managingTeachers}
            club={managingTeachers}
            teachers={teachers}
            teachersLoading={false}
            loading={dialogLoading}
            error={dialogError}
            canManage={permissoes.canManageTeacherLinks}
            onLink={(id) => void vincularProfessor(id)}
            onUnlink={(teacher) => void desvincularProfessor(teacher)}
            onClose={() => {
              setManagingTeachers(null);
              setDialogError("");
            }}
          />

          <ClubCoordinatorDialog
            open={!!managingCoordinator}
            club={managingCoordinator}
            coordinators={coordinators}
            coordinatorsLoading={false}
            loading={dialogLoading}
            error={dialogError}
            canManage={permissoes.canManageCoordinatorLinks}
            onLink={(id) => void vincularCoordenador(id)}
            onUnlink={() => void desvincularCoordenador()}
            onClose={() => {
              setManagingCoordinator(null);
              setDialogError("");
            }}
          />

          <DeleteConfirmDialog
            open={!!confirmDelete}
            title={confirmDelete ? `Clubinho ${confirmDelete.number}` : ""}
            loading={dialogLoading}
            onClose={() => setConfirmDelete(null)}
            onConfirm={submitDelete}
          />

          <ToggleActiveConfirmDialog
            open={!!confirmToggleActive}
            title={
              confirmToggleActive ? `Clubinho ${confirmToggleActive.number}` : ""
            }
            isActive={confirmToggleActive?.isActive ?? false}
            loading={dialogLoading}
            onClose={() => setConfirmToggleActive(null)}
            onConfirm={submitToggleActive}
          />
        </>
      }
    >
      {rows.map((club) => (
        <Grid2 key={club.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <ClubCard
            club={club}
            disabled={dialogLoading}
            canManageCoordinator={permissoes.canManageCoordinatorLinks}
            onView={() => {
              setViewing(club);
              void fetchClub(club.id);
            }}
            onEdit={() => startEdit(club)}
            onToggleActive={() => setConfirmToggleActive(club)}
            onDelete={() => setConfirmDelete(club)}
            onManageTeachers={() => {
              setDialogError("");
              setManagingTeachers(club);
            }}
            onManageCoordinator={() => {
              setDialogError("");
              setManagingCoordinator(club);
            }}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
