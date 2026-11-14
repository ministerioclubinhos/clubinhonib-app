import { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Grid2 } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';

import ImagePageListCard from './components/ImagePageListCard';
import {
  IMAGE_PAGES_PAGE_SIZE_OPTIONS,
  IMAGE_PAGE_SORT_OPTIONS,
  IMAGE_PAGE_VISIBILITY_OPTIONS,
  imagePageEditPath,
} from './constants';
import { useImagePageMutations, useImagePages } from './hooks';
import type { ImagePageSummary } from './types';
import { parseSortOption } from './utils';

/** Listagem administrativa das galerias de fotos. */
export default function ImagePagesManager() {
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
  } = useImagePages();

  const { saving, actionError, setActionError, remove } =
    useImagePageMutations(refresh);

  const [toDelete, setToDelete] = useState<ImagePageSummary | null>(null);

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
      options: [...IMAGE_PAGE_VISIBILITY_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, visibility: value })),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: `${filters.sort}:${filters.order}`,
      options: [...IMAGE_PAGE_SORT_OPTIONS],
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
      Nova galeria
    </Button>
  );

  return (
    <ListingLayout data-testid="image-pages-image-pages-manager"
      title="Páginas de fotos"
      summary={`${total} ${total === 1 ? 'galeria' : 'galerias'}`}
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
      emptyTitle="Nenhuma galeria encontrada"
      emptySubtitle="Ajuste a busca e os filtros ou crie uma nova galeria de fotos."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={IMAGE_PAGES_PAGE_SIZE_OPTIONS}
      overlays={
        <DeleteConfirmDialog
          open={Boolean(toDelete)}
          title={toDelete?.title}
          onClose={() => setToDelete(null)}
          onConfirm={handleDelete}
          // A exclusão apaga os arquivos no S3 antes de responder e leva segundos:
          // sem travar o botão, o segundo clique dispara um DELETE que responde
          // 404 e mostra erro de uma operação que deu certo.
          loading={saving}
        />
      }
    >
      {items.map((item) => (
        <Grid2 key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <ImagePageListCard
            page={item}
            onOpen={(target) => {
              if (target.routePath) navigate(`/${target.routePath}`);
            }}
            onEdit={(target) => navigate(imagePageEditPath(target.id))}
            onDelete={setToDelete}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
