import React from "react";
import { Box, Alert, CircularProgress, } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";

import UsersToolbar from "./components/UsersToolbar";
import UsersTable from "./components/UsersTable";
import UserViewDialog from "./components/UserViewDialog";
import UserCreateDialog from "./components/UserCreateDialog";
import UserEditDialog from "./components/UserEditDialog";
import { CreateUserForm, SortParam, UserFilters, UserRow } from "./types";
import { useUserMutations, useUsers } from "./hooks";
import { RoleUser } from "@/store/slices/auth/authSlice";
import BackHeader from "@/components/common/header/BackHeader";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";

export default function UsersManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [pageSize, setPageSize] = React.useState<number>(12);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortParam>({
    id: "updatedAt",
    desc: true,
  });
  const [filters, setFilters] = React.useState<UserFilters>({
    q: "",
    role: "all",
    onlyActive: false,
    onlyCompleted: false,
  });

  const { rows, total, loading, error, setError, fetchPage } = useUsers(
    pageIndex,
    pageSize,
    sorting,
    filters
  );
  const doRefresh = React.useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createUser,
    updateUser,
    deleteUser,
  } = useUserMutations(fetchPage);

  const [viewing, setViewing] = React.useState<UserRow | null>(null);
  const [editing, setEditing] = React.useState<Partial<UserRow> | null>(null);
  const [creating, setCreating] = React.useState<CreateUserForm | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<UserRow | null>(null);
  const onCreateConfirm = async () => {
    if (!creating) return;
    if (creating.password !== (creating.confirmPassword || "")) {
      setDialogError("As senhas não coincidem.");
      return;
    }
    await createUser(creating);
    setCreating(null);
  };

  const onEditConfirm = async () => {
    if (!editing?.id) return;
    const payload: Partial<UserRow> = {
      name: editing.name,
      phone: editing.phone,
      role: editing.role,
      active: !!editing.active,
      completed: !!editing.completed,
      commonUser: !!editing.commonUser,
    };
    await updateUser(editing.id, payload);
    setEditing(null);
  };

  const onDeleteConfirm = async () => {
    if (!confirmDelete?.id) return;
    await deleteUser(confirmDelete.id);
    setConfirmDelete(null);
  };

  React.useEffect(() => {
    doRefresh();
  }, [doRefresh]);

  return (
    <Box sx={{
      px: { xs: 2, md: 4 },
      pt: { xs: 0, md: 4 },
      minHeight: "100vh", bgcolor: "#f9fafb"
    }}>
      <BackHeader title="Gerenciador de Usuários" />

      <UsersToolbar
        filters={filters}
        onChange={(updater) => {
          setFilters(updater);
          setPageIndex(0);
        }}
        onCreate={() =>
          setCreating({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            role: RoleUser.TEACHER,
          })
        }
        onRefresh={doRefresh}
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

      <UsersTable
        rows={rows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        sorting={sorting ? ([sorting] as any) : []}
        setSorting={(s) =>
          setSorting(Array.isArray(s) ? s[0] ?? null : (s as any))
        }
        onView={(u) => setViewing(u)}
        onEdit={(u) => setEditing(u)}
        onDelete={(u) => setConfirmDelete(u)}
      />

      <UserViewDialog
        open={!!viewing}
        user={viewing}
        onClose={() => setViewing(null)}
      />

      <UserCreateDialog
        open={!!creating}
        value={creating}
        onChange={(v) => setCreating(v)}
        loading={dialogLoading}
        error={dialogError}
        onCancel={() => {
          setCreating(null);
          setDialogError("");
        }}
        onConfirm={onCreateConfirm}
      />

      <UserEditDialog
        open={!!editing}
        value={editing}
        onChange={(v) => setEditing(v)}
        loading={dialogLoading}
        error={dialogError}
        onCancel={() => {
          setEditing(null);
          setDialogError("");
        }}
        onConfirm={onEditConfirm}
      />

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.name || "Usuário"}
        onClose={() => setConfirmDelete(null)}
        onConfirm={onDeleteConfirm}
      />
    </Box>
  );
}
