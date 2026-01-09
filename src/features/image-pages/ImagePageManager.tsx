import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, CircularProgress, Alert, Container } from '@mui/material';
import { AppDispatch } from '@/store/slices';
import { setImageData, ImagePageData } from 'store/slices/image/imageSlice';

import { useImagePages } from './hooks';
import ImagePageToolbar from './components/ImagePageToolbar';
import ImagePageCard from './components/ImagePageCard';
import ImagePageDetailsModal from './components/ImagePageDetailsModal';
import BackHeader from '@/components/common/header/BackHeader';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

export default function ImagePageManager() {
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
  } = useImagePages();

  const [pageToDelete, setPageToDelete] = React.useState<ImagePageData | null>(null);
  const [selectedPage, setSelectedPage] = React.useState<ImagePageData | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleEdit = React.useCallback(
    (page: ImagePageData) => {
      dispatch(setImageData(page));
      navigate('/adm/editar-pagina-imagens');
    },
    [dispatch, navigate]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!pageToDelete) return;
    const id = pageToDelete.id;
    setPageToDelete(null);
    try {
      await removePage(id || '');
    } catch (err) {
      console.error('Erro ao deletar página de imagens:', err);
      setError('Erro ao deletar página de imagens');
      await fetchPages();
    }
  }, [pageToDelete, removePage, setError, fetchPages]);

  const isBusy = loading || isFiltering;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container
        sx={{
          maxWidth: { xs: '100%', md: '100%' },
          px: { xs: 2, md: 3 },
          pt: { xs: 0, md: 4 },
          pb: 4,
        }}
      >
        <BackHeader title="Páginas de Imagens" />

        <ImagePageToolbar search={search} onSearchChange={setSearch} loading={isFiltering} />

        {isBusy ? (
          <Box textAlign="center" mt={10}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" mt={10}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" mt={10}>
            <Alert severity="info">Nenhuma página de imagens encontrada.</Alert>
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {filtered.map((page) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={page.id} sx={{ display: 'flex' }}>
                <ImagePageCard
                  page={page}
                  onDelete={setPageToDelete}
                  onEdit={handleEdit}
                  onViewDetails={setSelectedPage}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <DeleteConfirmDialog
          open={!!pageToDelete}
          title={pageToDelete?.title || pageToDelete?.title || 'Página de imagens'}
          onClose={() => setPageToDelete(null)}
          onConfirm={handleConfirmDelete}
        />

        <ImagePageDetailsModal
          page={selectedPage}
          open={!!selectedPage}
          onClose={() => setSelectedPage(null)}
        />
      </Container>
    </Box>
  );
}
