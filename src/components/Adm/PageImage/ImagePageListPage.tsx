import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/config/axiosConfig';
import { AppDispatch } from '@/store/slices';
import { setImageData, ImagePageData } from 'store/slices/image/imageSlice';

import ImagePageCard from './ImagePageCard';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ImagePageDetailsModal from './ImagePageDetailsModal';

export default function ImagePageListPage() {
  const [imagePages, setImagePages] = useState<ImagePageData[]>([]);
  const [filteredPages, setFilteredPages] = useState<ImagePageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [pageToDelete, setPageToDelete] = useState<ImagePageData | null>(null);
  const [selectedPage, setSelectedPage] = useState<ImagePageData | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchImagePages();
  }, []);

  const fetchImagePages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/image-pages');
      setImagePages(response.data);
      setFilteredPages(response.data);
    } catch (err) {
      console.error('Erro ao buscar páginas de imagens:', err);
      setError('Erro ao buscar páginas de imagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const filtered = imagePages.filter((page) => page.title?.toLowerCase().includes(term));
      setFilteredPages(filtered);
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, imagePages]);

  const handleEdit = (page: ImagePageData) => {
    dispatch(setImageData(page));
    navigate('/adm/editar-pagina-imagens');
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    setPageToDelete(null);
    setLoading(true);
    try {
      await api.delete(`/image-pages/${pageToDelete.id}`);
      await fetchImagePages();
    } catch (error) {
      console.error('Erro ao deletar página de imagens:', error);
      setError('Erro ao deletar página de imagens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 0, md: 1 },
        py: { xs: 0, md: 1 },
        mt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        sx={{ mt: 0, mb: { xs: 6, md: 3 }, fontSize: { xs: '1.5rem', md: '2.4rem' } }}
      >
        Páginas de Imagens
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
          <Alert severity="info">Nenhuma página de imagens encontrada.</Alert>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filteredPages.map((page) => (
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
        page={pageToDelete}
        onCancel={() => setPageToDelete(null)}
        onConfirm={handleDelete}
      />

      <ImagePageDetailsModal
        page={selectedPage}
        open={!!selectedPage}
        onClose={() => setSelectedPage(null)}
      />
    </Box>
  );
}
