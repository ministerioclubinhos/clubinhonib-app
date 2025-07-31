import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store/slices';
import { setData, SectionData } from '@/store/slices/image-section/imageSectionSlice';

import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import ImagePageCard from '../components/ImagePageCard';
import ImagePageDetailsModal from '../components/ImagePageDetailsModal';
import { deleteImageSection } from '../api';
import { useImageSections } from '../hooks';
import BackHeader from '@/components/common/header/BackHeader';

export default function ImageSectionListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    filteredSections, loading, isFiltering, error, setError,
    searchTerm, setSearchTerm, fetchSections,
  } = useImageSections();

  const [sectionToDelete, setSectionToDelete] = useState<SectionData | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const handleEdit = (section: SectionData) => {
    dispatch(setData(section));
    navigate('/adm/editar-imagens-clubinho');
  };

  const handleDelete = async () => {
    if (!sectionToDelete) return;
    const id = sectionToDelete.id;
    setSectionToDelete(null);
    try {
      await deleteImageSection(id || '');
      await fetchSections();
    } catch (e) {
      console.error('Erro ao deletar seção de imagens:', e);
      setError('Erro ao deletar seção de imagens');
    }
  };

  const isBusy = loading || isFiltering;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 0, md: 4 },
        mt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <BackHeader title="Imagens dos Clubinhos" />

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

      {isBusy ? (
        <Box textAlign="center" mt={10}><CircularProgress /></Box>
      ) : error ? (
        <Box textAlign="center" mt={10}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Box>
      ) : filteredSections.length === 0 ? (
        <Box textAlign="center" mt={10}><Alert severity="info">Sem imagens dos clubinhos para mostrar.</Alert></Box>
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
