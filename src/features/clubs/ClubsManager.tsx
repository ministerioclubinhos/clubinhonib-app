import React, { useCallback, useState } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import ClubsToolbar from './components/ClubsToolbar';
import ClubsTable from './components/ClubsTable';
import ClubViewDialog from './components/ClubViewDialog';
import ClubFormDialog from './components/ClubFormDialog';
import { useClubDetails, useClubMutations, useClubs, useOptions } from './hooks';
import {
  ClubResponseDto,
  CreateClubForm,
  EditClubForm,
  Weekday,
  ClubFilters,
  ClubSort,
} from './types';
import { apiFetchClubs } from './api';
import BackHeader from '@/components/common/header/BackHeader';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import ToggleActiveConfirmDialog from '@/components/common/modal/ToggleActiveConfirmDialog';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '@/store/selectors/routeSelectors';

export default function ClubsManager() {
  const isAdmin = useSelector(selectIsAdmin);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = useState<ClubFilters>({
    searchString: '',
  });

  const [pageSize, setPageSize] = useState<number>(12);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [sorting, setSorting] = useState<ClubSort>({ id: 'updatedAt', desc: true });

  const { rows, total, loading, error, setError, fetchPage } = useClubs(
    pageIndex,
    pageSize,
    sorting,
    filters
  );

  const doRefresh = useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const { viewing, setViewing, loading: viewingLoading, fetchClub } = useClubDetails();
  const handleOpenView = (club: ClubResponseDto) => {
    setViewing(club);
    fetchClub(club.id);
  };

  const { coordinators, teachers, reloadOptions } = useOptions();

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createClub,
    updateClub,
    deleteClub,
    toggleActive,
  } = useClubMutations(async (page, limit) => {
    await apiFetchClubs({ page, limit, filters, sort: sorting });
    await fetchPage();
  });

  const sanitizeIds = (arr?: Array<string | null | undefined>) =>
    Array.from(
      new Set((arr ?? []).filter((v): v is string => typeof v === 'string' && v.trim() !== ''))
    );

  const [creating, setCreating] = useState<CreateClubForm | null>(null);
  const openCreate = () =>
    setCreating({
      number: 0,
      weekday: 'saturday' as Weekday,
      time: null,
      isActive: true,
      address: {
        street: '',
        district: '',
        city: '',
        state: '',
        postalCode: '',
      } as any,
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

    if (payload.time === '') delete (payload as any).time;

    await createClub(payload, pageIndex + 1, pageSize, filters, sorting);
    await reloadOptions();
    setCreating(null);
  };

  const [editing, setEditing] = useState<EditClubForm | null>(null);

  const startEdit = (c: ClubResponseDto) => {
    setEditing({
      id: c.id,
      number: c.number,
      weekday: c.weekday,
      time: c.time ?? null,
      isActive: c.isActive,
      address: c.address,
      coordinatorProfileId: c.coordinator?.id ?? null,
      teacherProfileIds: (c.teachers ?? []).map((t) => t.id),
    });
  };

  const submitEdit = async () => {
    if (!editing) return;

    const { id, ...rest } = editing;
    const teacherIds = sanitizeIds(rest.teacherProfileIds) ?? [];

    const payload: Omit<EditClubForm, 'id'> & { teacherProfileIds: string[] } = {
      ...rest,
      teacherProfileIds: teacherIds,
    };

    if ((payload as any).time === '') {
      (payload as any).time = null;
    }

    if (rest.coordinatorProfileId === undefined) {
      delete (payload as any).coordinatorProfileId;
    }

    await updateClub(id, payload, pageIndex + 1, pageSize, filters, sorting);
    await reloadOptions();
    setEditing(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<ClubResponseDto | null>(null);
  const askDelete = (c: ClubResponseDto) => setConfirmDelete(c);

  const submitDelete = async () => {
    if (!confirmDelete) return;
    await deleteClub(confirmDelete.id, pageIndex + 1, pageSize, filters, sorting);
    await reloadOptions();
    setConfirmDelete(null);
  };

  const [confirmToggleActive, setConfirmToggleActive] = useState<ClubResponseDto | null>(null);
  const askToggleActive = (club: ClubResponseDto) => setConfirmToggleActive(club);
  const submitToggleActive = async () => {
    if (!confirmToggleActive) return;
    await toggleActive(confirmToggleActive.id, pageIndex + 1, pageSize, filters, sorting);
    await reloadOptions();
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
      <BackHeader title="Gerenciar Clubinhos" />

      <ClubsToolbar
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

      <ClubsTable
        isAdmin={isAdmin}
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
        onChange={(v) => setCreating(v as CreateClubForm)}
        onCancel={() => {
          setCreating(null);
          setDialogError('');
        }}
        onSubmit={submitCreate}
        error={dialogError}
        loading={dialogLoading}
        coordinatorOptions={coordinators}
        teacherOptions={teachers}
      />

      <ClubFormDialog
        mode="edit"
        open={!!editing}
        value={editing}
        onChange={(v) => setEditing(v as EditClubForm)}
        onCancel={() => {
          setEditing(null);
          setDialogError('');
        }}
        onSubmit={submitEdit}
        error={dialogError}
        loading={dialogLoading}
        coordinatorOptions={coordinators}
        teacherOptions={teachers}
      />

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete ? `#${confirmDelete.number}` : ''}
        onClose={() => {
          setConfirmDelete(null);
          setDialogError('');
        }}
        onConfirm={submitDelete}
      />

      <ToggleActiveConfirmDialog
        open={!!confirmToggleActive}
        title={confirmToggleActive ? `Clubinho #${confirmToggleActive.number}` : ''}
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
