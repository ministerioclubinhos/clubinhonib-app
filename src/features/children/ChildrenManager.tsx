import React, { useMemo, useState } from "react";
import { Button, Grid2 } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { useAuthRole } from "@/utils/useAuthRole";
import ToggleActiveConfirmDialog from "@/components/common/modal/ToggleActiveConfirmDialog";
import { ToggleActiveSubject } from "@/components/common/modal/types";

import ChildCard from "./components/ChildCard";
import ChildFormDialog from "./components/ChildFormDialog";
import ChildrenDateFilters from "./components/ChildrenDateFilters";
import ChildViewDialog from "./components/ChildViewDialog";
import { useChildMutations, useChildren } from "./hooks";
import { ANY_FILTER, CHILDREN_PAGE_SIZE_OPTIONS } from "./constants";
import { childToForm, emptyChildForm } from "./utils";
import type { ChildFormValues, ChildResponse } from "./types";

export default function ChildrenManager() {
  // Excluir criança é só do administrador; a API recusa os outros papéis.
  const { isAdmin } = useAuthRole();

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
  } = useChildren();

  const {
    actionLoading,
    actionError,
    setActionError,
    createChild,
    updateChild,
    deleteChild,
    toggleActive,
  } = useChildMutations(refresh);

  const [viewing, setViewing] = useState<ChildResponse | null>(null);
  const [form, setForm] = useState<ChildFormValues | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ChildResponse | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<ChildResponse | null>(null);

  const formMode = form?.id ? "edit" : "create";

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "isActive",
        label: "Situação",
        value:
          filters.isActive === undefined ? ANY_FILTER : String(filters.isActive),
        options: [
          { value: ANY_FILTER, label: "Ativas e inativas" },
          { value: "true", label: "Ativas" },
          { value: "false", label: "Inativas" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            isActive: value === ANY_FILTER ? undefined : value === "true",
          })),
      },
    ],
    [filters, setFilters],
  );

  /** Quantos filtros da área expansível estão preenchidos. */
  const extraFilterCount = [
    filters.clubNumber,
    filters.birthDateFrom,
    filters.birthDateTo,
    filters.joinedFrom,
    filters.joinedTo,
  ].filter((value) => value !== undefined && value !== "").length;

  const closeForm = () => {
    setForm(null);
    setActionError("");
  };

  const handleSubmit = async () => {
    if (!form) return;

    const ok = form.id
      ? await updateChild(form.id, form)
      : await createChild(form);

    if (ok) {
      closeForm();
      setViewing(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    const ok = await deleteChild(confirmDelete.id);
    if (ok) {
      setConfirmDelete(null);
      setViewing(null);
    }
  };

  const handleToggleActive = async () => {
    if (!confirmToggle) return;

    const ok = await toggleActive(confirmToggle.id);
    if (ok) {
      setConfirmToggle(null);
      setViewing(null);
    }
  };

  return (
    <ListingLayout data-testid="children-children-manager"
      title="Crianças"
      summary={
        total > 0
          ? `${total} criança(s) encontrada(s)`
          : "Nenhuma criança para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por nome, responsável ou telefone…"
          onSearchChange={setSearch}
          filters={toolbarFilters}
          extraFilters={
            <ChildrenDateFilters filters={filters} onChange={setFilters} />
          }
          extraFilterCount={extraFilterCount}
          onClearFilters={() => setFilters({})}
          onRefresh={refresh}
          action={
            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={() => setForm(emptyChildForm())}
            >
              Nova criança
            </Button>
          }
        />
      }
      loading={loading}
      error={error || actionError}
      onDismissError={() => {
        setError("");
        setActionError("");
      }}
      itemCount={items.length}
      emptyTitle="Nenhuma criança encontrada"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={CHILDREN_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <ChildViewDialog
            child={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => {
              if (viewing) setForm(childToForm(viewing));
            }}
            onToggleActive={() => {
              if (viewing) setConfirmToggle(viewing);
            }}
          />

          <ChildFormDialog
            mode={formMode}
            open={!!form}
            value={form}
            onChange={setForm}
            onCancel={closeForm}
            onSubmit={() => void handleSubmit()}
            error={actionError}
            loading={actionLoading}
          />

          <DeleteConfirmDialog
            open={!!confirmDelete}
            title={confirmDelete?.name ?? ""}
            loading={actionLoading}
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDelete}
          />

          <ToggleActiveConfirmDialog
            subject={ToggleActiveSubject.Child}
            open={!!confirmToggle}
            title={confirmToggle?.name ?? ""}
            isActive={confirmToggle?.isActive ?? false}
            loading={actionLoading}
            onClose={() => setConfirmToggle(null)}
            onConfirm={handleToggleActive}
          />
        </>
      }
    >
      {items.map((child) => (
        <Grid2 key={child.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <ChildCard
            child={child}
            disabled={actionLoading}
            onView={() => setViewing(child)}
            onEdit={() => setForm(childToForm(child))}
            onToggleActive={() => setConfirmToggle(child)}
            onDelete={isAdmin ? () => setConfirmDelete(child) : undefined}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
