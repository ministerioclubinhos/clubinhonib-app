import { useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store/slices';
import { setVideoData, VideoPageData } from 'store/slices/video/videoSlice';

import { useVideoPages } from './hooks';
import VideoPageToolbar from './components/VideoPageToolbar';
import VideoPageCard from './components/VideoPageCard';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import VideoPageDetailsModal from './components/VideoPageDetailsModal';
import BackHeader from '@/components/common/header/BackHeader';

export default function VideoPageListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

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

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // já carregado pelo hook; mantido por compatibilidade
  }, []);

  const handleEdit = (page: VideoPageData) => {
    dispatch(setVideoData(page));
    navigate('/adm/editar-pagina-videos');
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await removePage(pageToDelete.id || '');
      setPageToDelete(null);
    } catch {
      setError('Erro ao deletar página');
    }
  };

  const isFiltering = pages.length > 0 && pages.length !== filtered.length;

  return (
    <Box
      sx={{
        px: { xs: 1, md: 3 },
        pt: { xs: 2, md: 4 }, // padding top responsivo
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
<BackHeader title="Página de Vídeos" />


      <VideoPageToolbar search={search} onSearch={setSearch} onRefresh={fetchPages} />

      {loading ? (
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
          <Alert severity={isFiltering ? 'info' : 'warning'}>
            {isFiltering ? 'Nenhuma página corresponde ao filtro.' : 'Nenhuma página encontrada.'}
          </Alert>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filtered.map((page) => (
            <Grid item key={page.id} xs={12} sm={6} md={4} lg={3}>
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
    </Box>
  );
}
