import { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Grid2 } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';

import SetCurrentWeekConfirmDialog from './components/SetCurrentWeekConfirmDialog';
import WeekMaterialDetailsModal from './components/WeekMaterialDetailsModal';
import WeekMaterialListCard from './components/WeekMaterialListCard';
import {
  WEEK_MATERIALS_PAGE_SIZE_OPTIONS,
  WEEK_MATERIAL_CURRENT_OPTIONS,
  WEEK_MATERIAL_SORT_OPTIONS,
  weekMaterialEditPath,
} from './constants';
import {
  useWeekMaterialById,
  useWeekMaterialMutations,
  useWeekMaterials,
} from './hooks';
import type { WeekMaterialSummary } from './types';
import { parseSortOption } from './utils';

/** Listagem administrativa das páginas de materiais semanais. */
export default function WeekMaterialsManager() {
  const navigate = useNavigate();

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
  } = useWeekMaterials();

  const { actionError, setActionError, remove, markAsCurrent } =
    useWeekMaterialMutations(refresh);

  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<WeekMaterialSummary | null>(null);
  const [toPublish, setToPublish] = useState<WeekMaterialSummary | null>(null);

  // O detalhe mostra as mídias, que a listagem não carrega: a página inteira
  // só é buscada quando o administrador abre o card.
  const { material: details, loading: loadingDetails } =
    useWeekMaterialById(detailsId ?? undefined);

  const handleDelete = useCallback(async () => {
    if (!toDelete) return;
    await remove(toDelete.id);
    setToDelete(null);
  }, [toDelete, remove]);

  const handlePublish = useCallback(async () => {
    if (!toPublish) return;
    await markAsCurrent(toPublish.id);
    setToPublish(null);
  }, [toPublish, markAsCurrent]);

  const dismissError = useCallback(() => {
    setError('');
    setActionError('');
  }, [setError, setActionError]);

  const listingFilters: ListingFilter[] = [
    {
      id: 'currentWeek',
      label: 'Publicação',
      value: filters.currentWeek,
      options: [...WEEK_MATERIAL_CURRENT_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, currentWeek: value })),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: `${filters.sort}:${filters.order}`,
      options: [...WEEK_MATERIAL_SORT_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, ...parseSortOption(value) })),
    },
  ];

  const createButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate('/adm/criar-pagina')}
      fullWidth
      sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
    >
      Nova página semanal
    </Button>
  );

  return (
    <ListingLayout
      title="Materiais semanais"
      summary={`${total} ${total === 1 ? 'página' : 'páginas'}`}
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por título, subtítulo ou descrição..."
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
      emptyTitle="Nenhuma página encontrada"
      emptySubtitle="Ajuste a busca e os filtros ou crie uma nova página semanal."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={WEEK_MATERIALS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <WeekMaterialDetailsModal
            material={details}
            open={Boolean(detailsId) && !loadingDetails}
            onClose={() => setDetailsId(null)}
          />

          <SetCurrentWeekConfirmDialog
            open={Boolean(toPublish)}
            materialTitle={toPublish?.title ?? ''}
            onClose={() => setToPublish(null)}
            onConfirm={handlePublish}
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
      {items.map((material) => (
        <Grid2 key={material.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <WeekMaterialListCard
            material={material}
            onOpenDetails={(target) => setDetailsId(target.id)}
            onEdit={(target) => navigate(weekMaterialEditPath(target.id))}
            onSetAsCurrent={setToPublish}
            onDelete={setToDelete}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
