import React, { useMemo, useState } from "react";
import { Button, Grid2 } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { UserRole } from "@/types/shared";

import UserCard from "./components/UserCard";
import UserFormDialog from "./components/UserFormDialog";
import UserViewDialog from "./components/UserViewDialog";
import { useUserMutations, useUsers } from "./hooks";
import {
  ANY_FILTER,
  USERS_PAGE_SIZE_OPTIONS,
  USER_ASSIGNABLE_ROLES,
  USER_ROLE_LABELS,
} from "./constants";
import { emptyUserForm, userToForm } from "./utils";
import type { UserFormValues, UserResponse } from "./types";

export default function UsersManager() {
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
  } = useUsers();

  const {
    actionLoading,
    actionError,
    setActionError,
    createUser,
    updateUser,
    deleteUser,
  } = useUserMutations(refresh);

  const [viewing, setViewing] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserFormValues | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserResponse | null>(null);

  const formMode = form?.id ? "edit" : "create";

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "role",
        label: "Papel",
        value: filters.role ?? ANY_FILTER,
        options: [
          { value: ANY_FILTER, label: "Todos os papéis" },
          ...USER_ASSIGNABLE_ROLES.map((role) => ({
            value: role,
            label: USER_ROLE_LABELS[role],
          })),
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            role: value === ANY_FILTER ? undefined : (value as UserRole),
          })),
      },
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
        id: "completed",
        label: "Cadastro",
        value:
          filters.completed === undefined ? ANY_FILTER : String(filters.completed),
        options: [
          { value: ANY_FILTER, label: "Qualquer cadastro" },
          { value: "true", label: "Completos" },
          { value: "false", label: "Incompletos" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            completed: value === ANY_FILTER ? undefined : value === "true",
          })),
      },
    ],
    [filters, setFilters],
  );

  const closeForm = () => {
    setForm(null);
    setActionError("");
  };

  const handleSubmit = async () => {
    if (!form) return;

    const ok = form.id
      ? await updateUser(form.id, form)
      : await createUser(form);

    if (ok) {
      closeForm();
      setViewing(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    const ok = await deleteUser(confirmDelete.id);
    if (ok) {
      setConfirmDelete(null);
      setViewing(null);
    }
  };

  return (
    <ListingLayout data-testid="users-users-manager"
      title="Usuários"
      summary={
        total > 0
          ? `${total} usuário(s) encontrado(s)`
          : "Nenhum usuário para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por nome, e-mail, telefone ou papel…"
          onSearchChange={setSearch}
          filters={toolbarFilters}
          onRefresh={refresh}
          action={
            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={() => setForm(emptyUserForm())}
            >
              Novo usuário
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
      emptyTitle="Nenhum usuário encontrado"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={USERS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <UserViewDialog
            user={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => {
              if (viewing) setForm(userToForm(viewing));
            }}
          />

          <UserFormDialog
            mode={formMode}
            open={!!form}
            value={form}
            onChange={setForm}
            onCancel={closeForm}
            onSubmit={() => void handleSubmit()}
            loading={actionLoading}
            error={actionError}
          />

          <DeleteConfirmDialog
            open={!!confirmDelete}
            title={confirmDelete?.name ?? ""}
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((user) => (
        <Grid2 key={user.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <UserCard
            user={user}
            disabled={actionLoading}
            onView={() => setViewing(user)}
            onEdit={() => setForm(userToForm(user))}
            onDelete={() => setConfirmDelete(user)}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
