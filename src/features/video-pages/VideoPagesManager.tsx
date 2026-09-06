import { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Grid2 } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';

import VideoPageListCard from './components/VideoPageListCard';
import {
  VIDEO_PAGES_PAGE_SIZE_OPTIONS,
  VIDEO_PAGE_SORT_OPTIONS,
  VIDEO_PAGE_VISIBILITY_OPTIONS,
  videoPageEditPath,
} from './constants';
import { useVideoPageMutations, useVideoPages } from './hooks';
import type { VideoPageSummary } from './types';
import { parseSortOption } from './utils';

/** Listagem administrativa das páginas de vídeos. */
export default function VideoPagesManager() {
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
  } = useVideoPages();

  const { actionError, setActionError, remove } =
    useVideoPageMutations(refresh);

  const [toDelete, setToDelete] = useState<VideoPageSummary | null>(null);

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
      options: [...VIDEO_PAGE_VISIBILITY_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, visibility: value })),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: `${filters.sort}:${filters.order}`,
      options: [...VIDEO_PAGE_SORT_OPTIONS],
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
      Nova página de vídeos
    </Button>
  );

  return (
    <ListingLayout data-testid="video-pages-video-pages-manager"
      title="Páginas de vídeos"
      summary={`${total} ${total === 1 ? 'página' : 'páginas'}`}
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
      emptyTitle="Nenhuma página de vídeos encontrada"
      emptySubtitle="Ajuste a busca e os filtros ou crie uma nova página de vídeos."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={VIDEO_PAGES_PAGE_SIZE_OPTIONS}
      overlays={
        <DeleteConfirmDialog
          open={Boolean(toDelete)}
          title={toDelete?.title}
          onClose={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      }
    >
      {items.map((item) => (
        <Grid2 key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <VideoPageListCard
            page={item}
            onOpen={(target) => {
              if (target.routePath) navigate(`/${target.routePath}`);
            }}
            onEdit={(target) => navigate(videoPageEditPath(target.id))}
            onDelete={setToDelete}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
