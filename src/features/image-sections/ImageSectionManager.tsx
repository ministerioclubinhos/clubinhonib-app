import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Container,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store/slices';
import { setData, SectionData } from '@/store/slices/image-section/imageSectionSlice';
import { setIdeasSectionData } from '@/store/slices/ideas/ideasSlice';
import { IdeasSection } from '@/store/slices/ideas/ideasSlice';
import { MediaType, MediaUploadType, MediaPlatform } from '@/store/slices/types';
import ImagePageCard from './components/ImagePageCard';
import ImagePageDetailsModal from './components/ImagePageDetailsModal';
import { deleteImageSection } from './api';
import { useImageSections } from './hooks';
import BackHeader from '@/components/common/header/BackHeader';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

export default function ImageSectionManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    filteredSections,
    loading,
    isFiltering,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    fetchSections,
  } = useImageSections();

  const [sectionToDelete, setSectionToDelete] = useState<SectionData | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleEdit = (section: SectionData) => {
    // Define os dados da seção no Redux para o modo de edição
    dispatch(setData(section));
    // Redireciona para a página de edição de imagens
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
  const hasQuery = Boolean(searchTerm);

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
        <BackHeader title="Imagens dos Clubinhos" />
        <Box sx={{ maxWidth: 560, mx: 'auto', mt: 2, mb: 4, position: 'relative' }}>
          <TextField
            fullWidth
            placeholder="Buscar por legenda ou descrição..."
            label="Buscar por legenda ou descrição"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputProps={{ 'aria-label': 'Buscar seções de imagens' }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isFiltering && <CircularProgress size={18} sx={{ mr: hasQuery ? 1 : 0 }} />}
                  {hasQuery && (
                    <Tooltip title="Limpar">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>

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
        ) : filteredSections.length === 0 ? (
          <Box textAlign="center" mt={10}>
            <Alert severity="info">Sem imagens dos clubinhos para mostrar.</Alert>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
            {filteredSections.map((section) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={section.id} sx={{ display: 'flex' }}>
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
          open={!!sectionToDelete}
          title={sectionToDelete?.caption || 'Seção'}
          onClose={() => setSectionToDelete(null)}
          onConfirm={handleDelete}
        />

        <ImagePageDetailsModal
          section={selectedSection}
          open={!!selectedSection}
          onClose={() => setSelectedSection(null)}
        />
      </Container>
    </Box>
  );
}
