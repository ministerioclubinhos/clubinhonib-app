import { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Grid2 } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';
import MediaDocumentPreviewModal from '@/utils/MediaDocumentPreviewModal';

import DayDetailsDialog from './components/DayDetailsDialog';
import MeditationDaysDialog from './components/MeditationDaysDialog';
import MeditationListCard from './components/MeditationListCard';
import {
  MEDITATIONS_PAGE_SIZE_OPTIONS,
  MEDITATION_PERIOD_OPTIONS,
  MEDITATION_SORT_OPTIONS,
  meditationEditPath,
} from './constants';
import { useMeditationMutations, useMeditations } from './hooks';
import type { MeditationDayResponse, MeditationResponse } from './types';
import { parseSortOption } from './utils';

/** Listagem administrativa de meditações. */
export default function MeditationsManager() {
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
  } = useMeditations();

  const { actionError, setActionError, remove } =
    useMeditationMutations(refresh);

  const [daysOf, setDaysOf] = useState<MeditationResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState<MeditationDayResponse | null>(
    null,
  );
  const [preview, setPreview] = useState<MeditationResponse | null>(null);
  const [toDelete, setToDelete] = useState<MeditationResponse | null>(null);

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
      id: 'period',
      label: 'Período',
      value: filters.period,
      options: [...MEDITATION_PERIOD_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, period: value })),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: `${filters.sort}:${filters.order}`,
      options: [...MEDITATION_SORT_OPTIONS],
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
      Nova meditação
    </Button>
  );

  return (
    <ListingLayout
      title="Meditações"
      summary={`${total} ${total === 1 ? 'meditação' : 'meditações'}`}
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por tema ou versículo..."
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
      emptyTitle="Nenhuma meditação encontrada"
      emptySubtitle="Ajuste a busca e os filtros ou cadastre uma nova meditação."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={MEDITATIONS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <MeditationDaysDialog
            meditation={daysOf}
            onSelectDay={setSelectedDay}
            onClose={() => setDaysOf(null)}
          />

          <DayDetailsDialog
            day={selectedDay}
            onClose={() => setSelectedDay(null)}
          />

          <MediaDocumentPreviewModal
            open={Boolean(preview)}
            media={preview?.media ?? null}
            title={preview?.topic}
            onClose={() => setPreview(null)}
          />

          <DeleteConfirmDialog
            open={Boolean(toDelete)}
            title={toDelete?.topic}
            onClose={() => setToDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((meditation) => (
        <Grid2 key={meditation.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <MeditationListCard
            meditation={meditation}
            onOpenDays={setDaysOf}
            onPreviewMedia={setPreview}
            onEdit={(item) => navigate(meditationEditPath(item.id))}
            onDelete={setToDelete}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
