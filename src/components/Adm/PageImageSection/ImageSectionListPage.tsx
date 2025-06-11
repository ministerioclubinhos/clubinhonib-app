import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/config/axiosConfig';
import { AppDispatch } from '@/store/slices';
import { setData, SectionData } from '@/store/slices/image-section/imageSectionSlice';

import ImagePageCard from './ImagePageCard';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ImagePageDetailsModal from './ImagePageDetailsModal';

export default function ImageSectionListPage() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [filteredSections, setFilteredSections] = useState<SectionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [sectionToDelete, setSectionToDelete] = useState<SectionData | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await api.get('/image-sections');
      setSections(response.data);
      setFilteredSections(response.data);
    } catch (err) {
      console.error('Erro ao buscar seções de imagens:', err);
      setError('Erro ao buscar seções de imagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const filtered = sections.filter(
        (section) =>
          section.caption.toLowerCase().includes(term) ||
          section.description.toLowerCase().includes(term)
      );
      setFilteredSections(filtered);
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, sections]);

  const handleEdit = (section: SectionData) => {
    dispatch(setData(section));
    navigate('/adm/editar-imagens-clubinho');
  };


  const handleDelete = async () => {
    if (!sectionToDelete) return;
    setSectionToDelete(null);
    setLoading(true);
    try {
      await api.delete(`/image-sections/${sectionToDelete.id}`);
      await fetchSections();
    } catch (error) {
      console.error('Erro ao deletar seção de imagens:', error);
      setError('Erro ao deletar seção de imagens');
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
        Imagens dos Clubinhos
      </Typography>

      <Box maxWidth={500} mx="auto" mb={5}>
        <TextField
          fullWidth
          label="Buscar por legenda ou descrição"
          placeholder="Buscar por legenda ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          inputProps={{ 'aria-label': 'Buscar seções de imagens' }}
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
      ) : filteredSections.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="info">Sem imagens dos clubinhos para mostrar.</Alert>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filteredSections.map((section) => (
            <Grid
              item
              key={section.id}
              sx={{
                flexBasis: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
                maxWidth: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
                minWidth: 280,
                display: 'flex',
              }}
            >
              <ImagePageCard
                section={section}
                onDelete={setSectionToDelete}
                onEdit={handleEdit}
                onViewDetails={setSelectedSection}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <DeleteConfirmDialog
        section={sectionToDelete}
        onCancel={() => setSectionToDelete(null)}
        onConfirm={handleDelete}
      />

      <ImagePageDetailsModal
        section={selectedSection}
        open={!!selectedSection}
        onClose={() => setSelectedSection(null)}
      />
    </Box>
  );
}