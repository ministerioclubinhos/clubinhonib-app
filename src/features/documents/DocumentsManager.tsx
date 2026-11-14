import { useCallback, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Button, Grid2 } from '@mui/material';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import type { ListingFilter } from '@/components/common/listing';
import MediaDocumentPreviewModal from '@/utils/MediaDocumentPreviewModal';

import DocumentDetailsModal from './components/DocumentDetailsModal';
import DocumentFormDialog from './components/DocumentFormDialog';
import DocumentListCard from './components/DocumentListCard';
import {
  DOCUMENTS_PAGE_SIZE_OPTIONS,
  DOCUMENT_MEDIA_FILTER_OPTIONS,
  DOCUMENT_SORT_OPTIONS,
} from './constants';
import { useDocumentMutations, useDocuments } from './hooks';
import type { DocumentFormValues, DocumentResponse } from './types';
import { parseSortOption, toMediaItem } from './utils';

/** Listagem administrativa de documentos. */
export default function DocumentsManager() {
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
  } = useDocuments();

  const { saving, actionError, setActionError, save, remove } =
    useDocumentMutations(refresh);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentResponse | null>(null);
  const [details, setDetails] = useState<DocumentResponse | null>(null);
  const [preview, setPreview] = useState<DocumentResponse | null>(null);
  const [toDelete, setToDelete] = useState<DocumentResponse | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((document: DocumentResponse) => {
    setEditing(document);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (values: DocumentFormValues) => save(values, editing?.id),
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
      id: 'hasMedia',
      label: 'Anexo',
      value: filters.hasMedia,
      options: [...DOCUMENT_MEDIA_FILTER_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, hasMedia: value })),
    },
    {
      id: 'sort',
      label: 'Ordenar por',
      value: `${filters.sort}:${filters.order}`,
      options: [...DOCUMENT_SORT_OPTIONS],
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
      Novo documento
    </Button>
  );

  return (
    <ListingLayout data-testid="documents-documents-manager"
      title="Documentos"
      summary={`${total} ${total === 1 ? 'documento' : 'documentos'}`}
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por nome ou descrição..."
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
      emptyTitle="Nenhum documento encontrado"
      emptySubtitle="Ajuste a busca e os filtros ou cadastre um novo documento."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={DOCUMENTS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <DocumentFormDialog
            open={formOpen}
            document={editing}
            saving={saving}
            error={actionError}
            onDismissError={() => setActionError('')}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />

          <DocumentDetailsModal
            open={Boolean(details)}
            document={details}
            onClose={() => setDetails(null)}
          />

          <MediaDocumentPreviewModal
            open={Boolean(preview)}
            media={toMediaItem(preview?.media ?? null)}
            title={preview?.name}
            onClose={() => setPreview(null)}
          />

          <DeleteConfirmDialog
            open={Boolean(toDelete)}
            title={toDelete?.name}
            onClose={() => setToDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((document) => (
        <Grid2 key={document.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <DocumentListCard
            document={document}
            onOpenDetails={setDetails}
            onPreview={setPreview}
            onEdit={openEdit}
            onDelete={setToDelete}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
