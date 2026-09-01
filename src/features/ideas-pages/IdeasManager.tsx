import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid2,
  Typography,
} from '@mui/material';

import BackHeader from '@/components/common/header/BackHeader';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

import IdeasPageCard from './components/IdeasPageCard';
import IdeasPageDetailsModal from './components/IdeasPageDetailsModal';
import IdeasToolbar from './components/IdeasToolbar';
import { useIdeasPages } from './hooks';
import { IdeasPageResponse } from './types';

/** Listagem administrativa das páginas de ideias. */
export default function IdeasManager() {
  const {
    filtered,
    loading,
    isFiltering,
    error,
    search,
    setSearch,
    setError,
    fetchPages,
    removePage,
  } = useIdeasPages();

  const [pageToDelete, setPageToDelete] = useState<IdeasPageResponse | null>(
    null,
  );
  const [selectedPage, setSelectedPage] = useState<IdeasPageResponse | null>(
    null,
  );

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;

    try {
      await removePage(pageToDelete.id);
      setError('');
    } catch (deleteError) {
      console.error('Erro ao excluir página de ideias:', deleteError);
      setError('Erro ao excluir a página. Tente novamente.');
    } finally {
      setPageToDelete(null);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <BackHeader title="Páginas de Ideias" />

      <IdeasToolbar
        search={search}
        onSearch={setSearch}
        onRefresh={fetchPages}
        isFiltering={isFiltering}
      />

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress aria-label="Carregando páginas" />
          <Typography variant="body2" mt={2}>
            Carregando páginas de ideias...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchPages} sx={{ ml: 2 }}>
            Tentar novamente
          </Button>
        </Alert>
      ) : filtered.length === 0 ? (
        <Alert severity="info">
          Nenhuma página encontrada para o termo pesquisado.
        </Alert>
      ) : (
        <Grid2 container spacing={3}>
          {filtered.map((page) => (
            <IdeasPageCard
              key={page.id}
              page={page}
              onView={() => setSelectedPage(page)}
              onDelete={() => setPageToDelete(page)}
            />
          ))}
        </Grid2>
      )}

      <IdeasPageDetailsModal
        page={selectedPage}
        open={Boolean(selectedPage)}
        onClose={() => setSelectedPage(null)}
      />

      <DeleteConfirmDialog
        open={Boolean(pageToDelete)}
        title={pageToDelete?.title}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
