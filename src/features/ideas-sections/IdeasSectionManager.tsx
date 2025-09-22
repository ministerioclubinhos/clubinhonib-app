import React, { useEffect, useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import { Search, Clear, Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import IdeasSectionCard from './components/IdeasSectionCard';
import IdeasSectionDetailsModal from './components/IdeasSectionDetailsModal';
import { deleteIdeasSection } from './api';
import { useIdeasSections } from './hooks';
import { IdeasSection as IdeasSectionType } from './types';
import { setIdeasSectionData } from '@/store/slices/ideas/ideasSlice';
import { IdeasSection } from '@/store/slices/ideas/ideasSlice';
import { MediaType, MediaUploadType, MediaPlatform } from '@/store/slices/types';
import BackHeader from '@/components/common/header/BackHeader';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

export default function IdeasSectionManager() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    filteredSections,
    loading,
    isFiltering,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    fetchSections,
  } = useIdeasSections();


  const [sectionToDelete, setSectionToDelete] = useState<IdeasSectionType | null>(null);
  const [selectedSection, setSelectedSection] = useState<IdeasSectionType | null>(null);

  useEffect(() => { 
    fetchSections();
  }, [fetchSections]);

  const handleEdit = (section: IdeasSectionType) => {
    const ideasSection: IdeasSection = {
      id: section.id,
      title: section.title,
      description: section.description,
      public: section.public,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      medias: (section.medias || []).map(media => ({
        id: media.id,
        title: media.title,
        description: media.description,
        uploadType: media.uploadType as MediaUploadType,
        mediaType: media.mediaType as MediaType,
        isLocalFile: media.isLocalFile,
        url: media.url,
        platformType: media.platformType as MediaPlatform || undefined,
        originalName: media.originalName || undefined,
        size: media.size || undefined,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
      })),
    };
    
    dispatch(setIdeasSectionData(ideasSection));
    
    navigate('/adm/editar-ideias-compartilhadas');
  };

  const handleDelete = async () => {
    if (!sectionToDelete || !sectionToDelete.id) return;
    const id = sectionToDelete.id;
    setSectionToDelete(null);
    try {
      await deleteIdeasSection(id);
      await fetchSections();
    } catch (e) {
      console.error('Erro ao deletar seção de ideias:', e);
      setError('Erro ao deletar seção de ideias');
    }
  };

  const isBusy = loading || isFiltering;
  const hasQuery = Boolean(searchTerm);

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container sx={{ maxWidth: { xs: '100%', md: '100%' }, px: { xs: 2, md: 3 }, pt: { xs: 0, md: 4 }, pb: 4 }}>
        <BackHeader title="Ideias compartilhadas" />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ maxWidth: 560, flex: 1, mr: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por título ou descrição..."
              label="Buscar seções"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputProps={{ 'aria-label': 'Buscar Ideias compartilhadas' }}
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
        </Box>

        {isBusy ? (
          <Box textAlign="center" mt={10}><CircularProgress /></Box>
        ) : error ? (
          <Box textAlign="center" mt={10}>
            <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
          </Box>
        ) : filteredSections.length === 0 ? (
          <Box textAlign="center" mt={10}>
            <Alert severity="info">
              {hasQuery ? 'Nenhuma seção encontrada com os filtros aplicados.' : 'Nenhuma seção de ideias cadastrada.'}
            </Alert>
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {filteredSections.map((section) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={section.id} sx={{ display: 'flex' }}>
                <IdeasSectionCard
                  section={section}
                  onDelete={(section) => setSectionToDelete(section)}
                  onEdit={handleEdit}
                  onViewDetails={(section) => setSelectedSection(section)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <DeleteConfirmDialog
          open={!!sectionToDelete}
          title={sectionToDelete?.title || 'Seção'}
          onClose={() => setSectionToDelete(null)}
          onConfirm={handleDelete}
        />

        <IdeasSectionDetailsModal
          section={selectedSection}
          open={!!selectedSection}
          onClose={() => setSelectedSection(null)}
        />

      </Container>
    </Box>
  );
}
