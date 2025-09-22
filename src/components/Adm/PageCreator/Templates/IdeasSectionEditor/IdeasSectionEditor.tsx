import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { IdeasMaterialSection } from '../IdeasMaterialPageCreator/IdeasMaterialSection';
import { IdeasSection, clearIdeasSectionData } from 'store/slices/ideas/ideasSlice';
import { RootState } from 'store/slices';
import api from '@/config/axiosConfig';
import { MediaUploadType } from 'store/slices/types';
import { useIdeasPages } from '@/features/ideas-sections/hooks';

interface IdeasSectionEditorProps {
  fromTemplatePage?: boolean;
}

export default function IdeasSectionEditor({ fromTemplatePage }: IdeasSectionEditorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const existingSection = useSelector((state: RootState) => state.ideas.ideasSectionData);

  const {
    pages,
    loading: pagesLoading,
    error: pagesError,
    fetchPages,
  } = useIdeasPages();

  const [sectionData, setSectionData] = useState<IdeasSection>({
    title: '',
    description: '',
    medias: [],
  });

  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (existingSection && !fromTemplatePage) {
      setSectionData({
        id: existingSection.id,
        title: existingSection.title,
        description: existingSection.description,
        medias: existingSection.medias || [],
        public: existingSection.public,
        createdAt: existingSection.createdAt,
        updatedAt: existingSection.updatedAt,
      });
      setIsPublic(existingSection.public || true);
    }
    fetchPages();
  }, [existingSection, fromTemplatePage, fetchPages]);

  const handleSectionUpdate = (updatedSection: IdeasSection) => {
    setSectionData(updatedSection);
  };

  const handleSaveSection = async () => {
    if (!sectionData.title.trim() || !sectionData.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Preencha todos os campos obrigatórios.',
        severity: 'error',
      });
      return;
    }

    if (!fromTemplatePage && !selectedPage) {
      setSnackbar({
        open: true,
        message: 'Selecione uma página de destino para vincular a seção.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      const processedMedias = sectionData.medias.map((media, mediaIndex) => {
        const baseItem: any = {
          ...(fromTemplatePage ? {} : media.id ? { id: media.id } : {}),
          title: media.title,
          description: media.description,
          mediaType: media.mediaType,
          uploadType: media.uploadType,
          platformType: media.platformType,
          isLocalFile: media.uploadType === MediaUploadType.UPLOAD,
        };

        if (media.uploadType === MediaUploadType.UPLOAD && media.file) {
          const extension = media.file.name.split('.').pop() || 'bin';
          const fieldKey = `${media.mediaType}_${mediaIndex}.${extension}`;
          formData.append(fieldKey, media.file, fieldKey);
          return { ...baseItem, fieldKey };
        }

        return { ...baseItem, url: media.url };
      });

      const sectionPayload = {
        title: sectionData.title,
        description: sectionData.description,
        public: isPublic,
        medias: processedMedias,
      };

      formData.append('sectionData', JSON.stringify(sectionPayload));

      if (fromTemplatePage) {
        const res = await api.post('/ideas-sections', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (!res?.data) throw new Error('Erro ao criar seção');
        
        setSnackbar({
          open: true,
          message: 'Seção criada com sucesso!',
          severity: 'success',
        });
        
        dispatch(clearIdeasSectionData());
        
        const currentPath = window.location.pathname;
        if (currentPath === '/compartilhar-ideia') {
          navigate('/area-do-professor');
        } else {
          navigate('/adm/ideias-compartilhadas');
        }
      } else if (existingSection?.id) {
        const res = await api.patch(
          `/ideas-sections/${existingSection.id}/attach/${selectedPage.id}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        
        if (!res?.data) throw new Error('Erro ao salvar seção');
        
        setSnackbar({
          open: true,
          message: 'Seção salva e publicada com sucesso!',
          severity: 'success',
        });
        
        dispatch(clearIdeasSectionData());
        navigate('/adm/ideias-compartilhadas');
      } else {
        throw new Error('Seção não encontrada para edição');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar a seção.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
        p: { xs: 3, md: 4 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderRadius: '0 0 16px 16px',
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', md: '2rem' },
            mb: 2,
            color: 'primary.main',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {fromTemplatePage ? 'Criar e compartilhar ideia incrível' : 'Editar Seção de Ideias'}
        </Typography>
        
        {fromTemplatePage && (
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '1rem', md: '1.1rem' },
              mb: 3,
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              px: 2,
            }}
          >
            Compartilhe uma ideia incrível que você teve nessa semana no seu Clubinho
          </Typography>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          alignItems: 'center',
          flexWrap: 'wrap',
          mt: 2,
          justifyContent: 'center',
          maxWidth: '800px',
          mx: 'auto',
        }}>
          {!fromTemplatePage && (
            <FormControl sx={{ minWidth: 200 }} required error={!selectedPage}>
              <InputLabel>Página de Destino *</InputLabel>
              <Select
                value={selectedPage?.id || ''}
                label="Página de Destino *"
                size="small"
                onChange={(e) => {
                  const pageId = e.target.value;
                  const page = pages.find(p => p.id === pageId);
                  setSelectedPage(page || null);
                }}
                disabled={pagesLoading}
                error={!selectedPage}
              >
                <MenuItem value="" disabled>
                  <em>Selecione uma página...</em>
                </MenuItem>
                {pages.map((page) => (
                  <MenuItem key={page.id} value={page.id}>
                    {page.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {!fromTemplatePage && (
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Visibilidade</InputLabel>
              <Select
                value={isPublic.toString()}
                label="Visibilidade"
                size="small"
                onChange={(e) => setIsPublic(e.target.value === 'true')}
              >
                <MenuItem value="true">Público</MenuItem>
                <MenuItem value="false">Privado</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            onClick={handleSaveSection}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{ 
              ml: fromTemplatePage ? 0 : 'auto',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              background: fromTemplatePage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
              '&:hover': {
                background: fromTemplatePage ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' : undefined,
              },
            }}
          >
            {loading ? 'Salvando...' : fromTemplatePage ? 'Compartilhar Ideia' : 'Salvar e Publicar'}
          </Button>
        </Box>

        {selectedPage && !fromTemplatePage && (
          <Box sx={{ 
            mt: 1, 
            p: 1.5, 
            bgcolor: 'primary.light', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
            <Typography variant="body2" color="primary.contrastText">
              📄 Publicando em: <strong>{selectedPage.title}</strong>
            </Typography>
          </Box>
        )}

        {!selectedPage && !fromTemplatePage && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            ⚠️ Este campo é obrigatório para vincular a seção
          </Typography>
        )}
      </Box>

      <Box sx={{ 
        flex: 1, 
        p: { xs: 3, md: 4 },
        bgcolor: 'background.default',
        minHeight: 'calc(100vh - 200px)',
      }}>
        <Box sx={{
          maxWidth: '1000px',
          mx: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '16px',
          p: { xs: 3, md: 4 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
        }}>
          <IdeasMaterialSection
            section={sectionData}
            onUpdate={handleSectionUpdate}
            isCreationMode={fromTemplatePage}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
