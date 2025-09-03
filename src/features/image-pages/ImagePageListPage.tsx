import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { AppDispatch } from '@/store/slices';
import { setImageData, ImagePageData } from 'store/slices/image/imageSlice';

import { useImagePages } from './hooks';
import ImagePageToolbar from './components/ImagePageToolbar';
import ImagePageCard from './components/ImagePageCard';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import ImagePageDetailsModal from './components/ImagePageDetailsModal';
import BackHeader from '@/components/common/header/BackHeader';

export default function ImagePageListPage() {
  const { filtered, loading, isFiltering, error, search, setSearch, setError, fetchPages, removePage } = useImagePages();
  const [pageToDelete, setPageToDelete] = React.useState<ImagePageData | null>(null);
  const [selectedPage, setSelectedPage] = React.useState<ImagePageData | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const handleEdit = React.useCallback((page: ImagePageData) => {
    dispatch(setImageData(page));
    navigate('/adm/editar-pagina-imagens');
  }, [dispatch, navigate]);

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

  return (
    <Box sx={{
      px: { xs: 2, md: 4 },
      pt: { xs: 0, md: 4 },
      mt: { xs: 0, md: 4 },
      bgcolor: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <BackHeader title="Páginas de Imagens" />

      <ImagePageToolbar search={search} onSearchChange={setSearch} />

      {loading || isFiltering ? (
        <Box textAlign="center" mt={10}><CircularProgress /></Box>
      ) : error ? (
        <Box textAlign="center" mt={10}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" mt={10}><Alert severity="info">Nenhuma página de imagens encontrada.</Alert></Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filtered.map((page) => (
            <Grid
              item
              key={page.id}
              sx={{
                flexBasis: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
                maxWidth: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
                minWidth: 280,
                display: 'flex',
              }}
            >
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
        page={pageToDelete}
        onCancel={() => setPageToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ImagePageDetailsModal
        page={selectedPage}
        open={!!selectedPage}
        onClose={() => setSelectedPage(null)}
      />
    </Box>
  );
}
