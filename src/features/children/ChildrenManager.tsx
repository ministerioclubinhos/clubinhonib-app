import React, { useCallback, useState } from 'react';
import { Alert, Box, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import ChildrenToolbar from './components/ChildrenToolbar';
import ChildrenTable from './components/ChildrenTable';
import ChildViewDialog from './components/ChildViewDialog';
import ChildFormDialog from './components/ChildFormDialog';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import ToggleActiveConfirmDialog from '@/components/common/modal/ToggleActiveConfirmDialog';
import { useChildDetails, useChildMutations, useChildren } from './hooks';
import { ChildFilters, ChildResponseDto, ChildSort, CreateChildForm, EditChildForm } from './types';
import BackHeader from '@/components/common/header/BackHeader';

export default function ChildrenManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = useState<ChildFilters>({
    searchString: '',
    clubNumber: undefined,
    birthDateFrom: '',
    birthDateTo: '',
    joinedFrom: '',
    joinedTo: '',
  });

  const [pageSize, setPageSize] = useState<number>(12);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [sorting, setSorting] = useState<ChildSort>({
    id: 'updatedAt',
    desc: true,
  });

  const { rows, total, loading, error, setError, fetchPage } = useChildren(
    pageIndex,
    pageSize,
    sorting,
    filters
  );
  const doRefresh = useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const { viewing, setViewing, loading: viewingLoading, fetchChild } = useChildDetails();
  const handleOpenView = (row: ChildResponseDto) => {
    setViewing(row);
    fetchChild(row.id);
  };

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createChild,
    updateChild,
    deleteChild,
    toggleActive,
  } = useChildMutations(async () => {
    await fetchPage();
  });

  const [creating, setCreating] = useState<CreateChildForm | null>(null);
  const openCreate = () =>
    setCreating({
      name: '',
      gender: 'M',
      guardianName: '',
      guardianPhone: '',
      birthDate: '',
      joinedAt: null,
      clubId: null,
      address: {
        street: '',
        district: '',
        city: '',
        state: '',
        postalCode: '',
      } as any,
    });
  const submitCreate = async () => {
    if (!creating) return;
    const payload = { ...creating };
    if (!payload.joinedAt) payload.joinedAt = null;
    if (!payload.clubId) payload.clubId = null as any;
    await createChild(payload, pageIndex + 1, pageSize, filters, sorting);
    setCreating(null);
  };

  const [editing, setEditing] = useState<EditChildForm | null>(null);
  const startEdit = (c: ChildResponseDto) => {
    setEditing({
      id: c.id,
      name: c.name,
      gender: c.gender,
      guardianName: c.guardianName,
      guardianPhone: c.guardianPhone,
      birthDate: c.birthDate,
      joinedAt: c.joinedAt,
      clubId: c.club?.id ?? null,
      address: c.address ? ({ ...c.address } as any) : undefined,
    });
  };
  const submitEdit = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    await updateChild(id, rest, pageIndex + 1, pageSize, filters, sorting);
    setEditing(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<ChildResponseDto | null>(null);
  const askDelete = (row: ChildResponseDto) => setConfirmDelete(row);
  const submitDelete = async () => {
    if (!confirmDelete) return;
    await deleteChild(confirmDelete.id, pageIndex + 1, pageSize, filters, sorting);
    setConfirmDelete(null);
  };

  const [confirmToggleActive, setConfirmToggleActive] = useState<ChildResponseDto | null>(null);
  const askToggleActive = (row: ChildResponseDto) => setConfirmToggleActive(row);
  const submitToggleActive = async () => {
    if (!confirmToggleActive) return;
    await toggleActive(confirmToggleActive.id, pageIndex + 1, pageSize, filters, sorting);
    setConfirmToggleActive(null);
  };

  React.useEffect(() => {
    doRefresh();
  }, [doRefresh]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 0 },
        py: { xs: 0, md: 0 },
        minHeight: '100vh',
        bgcolor: '#f9fafb',
      }}
    >
      <BackHeader title="Gerenciar Crianças" />

      <ChildrenToolbar
        filters={filters}
        onChange={(updater) => {
          setFilters(updater);
          setPageIndex(0);
        }}
        onCreateClick={openCreate}
        onRefreshClick={doRefresh}
        isXs={isXs}
      />

      {loading && !rows.length && (
        <Box textAlign="center" my={6}>
          <CircularProgress />
        </Box>
      )}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <ChildrenTable
        rows={rows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        sorting={sorting ? ([sorting] as any) : []}
        setSorting={(s) => setSorting(Array.isArray(s) ? (s[0] ?? null) : (s as any))}
        onOpenView={handleOpenView}
        onStartEdit={startEdit}
        onAskDelete={askDelete}
        onToggleActive={askToggleActive}
      />

      <ChildViewDialog
        open={!!viewing}
        loading={viewingLoading}
        child={viewing}
        onClose={() => setViewing(null)}
        onEdit={(id) => {
          const child = rows.find((c) => c.id === id);
          if (child) {
            setViewing(null);
            startEdit(child);
          }
        }}
        onToggleActive={(child) => {
          setViewing(null);
          askToggleActive(child);
        }}
      />

      <ChildFormDialog
        mode="create"
        open={!!creating}
        value={creating}
        onChange={(v) => setCreating(v as CreateChildForm)}
        onCancel={() => {
          setCreating(null);
          setDialogError('');
        }}
        onSubmit={submitCreate}
        error={dialogError}
        loading={dialogLoading}
      />

      <ChildFormDialog
        mode="edit"
        open={!!editing}
        value={editing}
        onChange={(v) => setEditing(v as EditChildForm)}
        onCancel={() => {
          setEditing(null);
          setDialogError('');
        }}
        onSubmit={submitEdit}
        error={dialogError}
        loading={dialogLoading}
      />

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.name || ''}
        onClose={() => {
          setConfirmDelete(null);
          setDialogError('');
        }}
        onConfirm={submitDelete}
      />

      <ToggleActiveConfirmDialog
        open={!!confirmToggleActive}
        title={confirmToggleActive?.name || ''}
        isActive={confirmToggleActive?.isActive ?? false}
        onClose={() => {
          setConfirmToggleActive(null);
          setDialogError('');
        }}
        onConfirm={submitToggleActive}
        loading={dialogLoading}
      />
    </Box>
  );
}
