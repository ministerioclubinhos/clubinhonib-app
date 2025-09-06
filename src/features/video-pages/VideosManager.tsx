import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Snackbar,
  Alert as MuiAlert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store/slices';
import { setVideoData, VideoPageData } from 'store/slices/video/videoSlice';

import { useVideoPages } from './hooks';
import VideoPageToolbar from './components/VideoPageToolbar';
import VideoPageCard from './components/VideoPageCard';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import VideoPageDetailsModal from './components/VideoPageDetailsModal';
import BackHeader from '@/components/common/header/BackHeader';

export default function VideosManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    pages,
    filtered,
    loading,
    error,
    search,
    setSearch,
    fetchPages,
    removePage,
    setError,
  } = useVideoPages();

  const [selectedPage, setSelectedPage] = useState<VideoPageData | null>(null);
  const [pageToDelete, setPageToDelete] = useState<VideoPageData | null>(null);
  const [snackbar, setSnackbar] = useState<{open:boolean; message:string; severity:'success'|'error'}>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    // hook já busca dados; mantido por compatibilidade
  }, []);

  const handleEdit = (page: VideoPageData) => {
    dispatch(setVideoData(page));
    navigate('/adm/editar-pagina-videos');
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await removePage(pageToDelete.id || '');
      setSnackbar({ open: true, message: 'Página excluída com sucesso.', severity: 'success' });
    } catch {
      setError('Erro ao deletar página');
      setSnackbar({ open: true, message: 'Erro ao excluir página.', severity: 'error' });
    } finally {
      setPageToDelete(null);
    }
  };

  const isFiltering = pages.length > 0 && pages.length !== filtered.length;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <BackHeader title="Páginas de Vídeos" />

      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <VideoPageToolbar search={search} onSearch={setSearch} onRefresh={fetchPages} />
      </Paper>

      {loading ? (
        <Box textAlign="center" mt={10}><CircularProgress /></Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity={isFiltering ? 'info' : 'warning'}>
            {isFiltering ? 'Nenhuma página corresponde ao filtro.' : 'Nenhuma página encontrada.'}
          </Alert>
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {filtered.map((page) => (
            <Grid
              item
              key={page.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{ display: 'flex' }}
            >
              <VideoPageCard
                page={page}
                onView={() => setSelectedPage(page)}
                onEdit={() => handleEdit(page)}
                onDelete={() => setPageToDelete(page)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <DeleteConfirmDialog
        open={!!pageToDelete}
        title={pageToDelete?.title}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDelete}
      />

      <VideoPageDetailsModal
        page={selectedPage}
        open={!!selectedPage}
        onClose={() => setSelectedPage(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
