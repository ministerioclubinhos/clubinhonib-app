import { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Grid2 } from '@mui/material';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';

import InformativeFormDialog from './components/InformativeFormDialog';
import InformativeListCard from './components/InformativeListCard';
import {
  INFORMATIVES_PAGE_SIZE_OPTIONS,
  INFORMATIVE_SORT_OPTIONS,
  INFORMATIVE_VISIBILITY_OPTIONS,
} from './constants';
import { useInformativeMutations, useInformatives } from './hooks';
import type { InformativeFormValues, InformativeResponse } from './types';
import { parseSortOption } from './utils';

/** Listagem administrativa de informativos. */
export default function InformativesManager() {
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
  } = useInformatives();

  const { saving, actionError, setActionError, save, remove } =
    useInformativeMutations(refresh);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InformativeResponse | null>(null);
  const [toDelete, setToDelete] = useState<InformativeResponse | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((informative: InformativeResponse) => {
    setEditing(informative);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (values: InformativeFormValues) => save(values, editing?.id),
    [save, editing],
  );

  const handleDelete = useCallback(async () => {
    if (!toDelete) return;
    await remove(toDelete.id);
    setToDelete(null);
  }, [toDelete, remove]);

  const dismissError = useCallback(() => {
    setError('');
    setActionError('');
  }, [setError, setActionError]);

  const listingFilters: ListingFilter[] = [
    {
      id: 'visibility',
      label: 'Situação',
      value: filters.visibility,
      options: [...INFORMATIVE_VISIBILITY_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, visibility: value })),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: `${filters.sort}:${filters.order}`,
      options: [...INFORMATIVE_SORT_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, ...parseSortOption(value) })),
    },
  ];

  const createButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={openCreate}
      fullWidth
      sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
    >
      Novo informativo
    </Button>
  );

  return (
    <ListingLayout data-testid="informatives-informatives-manager"
      title="Informativos"
      summary={`${total} ${total === 1 ? 'informativo' : 'informativos'}`}
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por título ou descrição..."
          onSearchChange={setSearch}
          filters={listingFilters}
          onRefresh={refresh}
          action={createButton}
        />
      }
      loading={loading}
      error={error || actionError}
      onDismissError={dismissError}
      itemCount={items.length}
      emptyTitle="Nenhum informativo encontrado"
      emptySubtitle="Ajuste a busca e os filtros ou cadastre um novo informativo."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={INFORMATIVES_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <InformativeFormDialog
            open={formOpen}
            informative={editing}
            saving={saving}
            error={actionError}
            onDismissError={() => setActionError('')}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />

          <DeleteConfirmDialog
            open={Boolean(toDelete)}
            title={toDelete?.title}
            onClose={() => setToDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((informative) => (
        <Grid2 key={informative.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <InformativeListCard
            informative={informative}
            onEdit={openEdit}
            onDelete={setToDelete}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
