import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/config/axiosConfig';
import { AppDispatch } from '@/store/slices';
import { setVideoData, VideoPageData } from 'store/slices/video/videoSlice';
import VideoPageDetailsModal from './VideoPageDetailsModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import VideoPageCard from './VideoPageCard';

export default function VideoPageListPage() {
  const [videoPages, setVideoPages] = useState<VideoPageData[]>([]);
  const [filteredPages, setFilteredPages] = useState<VideoPageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [selectedPage, setSelectedPage] = useState<VideoPageData | null>(null);
  const [pageToDelete, setPageToDelete] = useState<VideoPageData | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/video-pages');
      setVideoPages(response.data);
      setFilteredPages(response.data);
    } catch {
      setError('Erro ao buscar páginas de vídeos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const filtered = videoPages.filter((page) => page.title?.toLowerCase().includes(term));
      setFilteredPages(filtered);
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, videoPages]);

  const handleEdit = (page: VideoPageData) => {
    dispatch(setVideoData(page));
    navigate('/adm/editar-pagina-videos');
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    setPageToDelete(null);
    setLoading(true);
    try {
      await api.delete(`/video-pages/${pageToDelete.id}`);
      await fetchPages();
    } catch {
      setError('Erro ao deletar página');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 1, md: 3 }, py: 2, mt: 4, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
        Páginas de Vídeos
      </Typography>

      <Box maxWidth={500} mx="auto" mb={5}>
        <TextField
          fullWidth
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {loading || isFiltering ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : filteredPages.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="info">Nenhuma página encontrada.</Alert>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filteredPages.map((page) => (
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
