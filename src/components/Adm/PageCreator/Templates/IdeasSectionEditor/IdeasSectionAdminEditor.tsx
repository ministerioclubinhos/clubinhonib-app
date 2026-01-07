import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/slices';
import { IdeasSection } from '@/store/slices/ideas/ideasSlice';
import { setIdeasSectionData, clearIdeasSectionData } from '@/store/slices/ideas/ideasSlice';
import { IdeasMaterialSection } from '../IdeasMaterialPageCreator/IdeasMaterialSection';
import api from '@/config/axiosConfig';

interface IdeasSectionAdminEditorProps {
  existingSection?: IdeasSection;
}

export function IdeasSectionAdminEditor({ existingSection }: IdeasSectionAdminEditorProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ideasSectionData } = useSelector((state: RootState) => state.ideas);

  const [sectionData, setSectionData] = useState<IdeasSection>(
    existingSection || ideasSectionData || {
      title: '',
      description: '',
      medias: [],
      public: true,
    }
  );
  const [selectedPage, setSelectedPage] = useState<{ id: string; title: string } | null>(null);
  const [pages, setPages] = useState<{ id: string; title: string }[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const loadPages = async () => {
      setPagesLoading(true);
      try {
        const res = await api.get('/ideas-pages');
        setPages(res.data || []);
      } catch (error) {
        console.error('Erro ao carregar páginas:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar páginas disponíveis',
          severity: 'error',
        });
      } finally {
        setPagesLoading(false);
      }
    };
    loadPages();
  }, []);

  const handleSectionUpdate = (updatedSection: IdeasSection) => {
    setSectionData(updatedSection);
  };

  const handleBack = () => {
    dispatch(clearIdeasSectionData());
    navigate('/adm/ideias-compartilhadas');
  };

  const handleSaveSection = async () => {
    if (!selectedPage) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecione uma página de destino',
        severity: 'error',
      });
      return;
    }

    if (!existingSection?.id) {
      setSnackbar({
        open: true,
        message: 'ID da seção não encontrado',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      const mediaTypeCounters = { video: 0, document: 0, image: 0 };

      const mediasPayload = sectionData.medias.map((media, index) => {
        console.log(`🔍 Processando mídia ${index}:`, {
          title: media.title,
          mediaType: media.mediaType,
          uploadType: media.uploadType,
          hasFile: !!media.file,
          hasUrl: !!media.url
        });

        const baseItem = {
          title: media.title,
          description: media.description,
          mediaType: media.mediaType,
          uploadType: media.uploadType,
          isLocalFile: media.uploadType === 'upload',
        };

        if (media.uploadType === 'upload' && media.mediaType !== 'audio') {
          if (media.id && !media.file) {
            console.log(`📋 Mídia existente mantida: ${media.title}`, {
              id: media.id,
              url: media.url,
              originalName: media.originalName
            });

            return {
              ...baseItem,
              id: media.id,
              url: media.url,
              originalName: media.originalName,
              size: media.size
            };
          }

          if (!media.file) {
            console.error(`❌ Mídia de upload "${media.title}" não tem arquivo!`);
            throw new Error(`Mídia de upload "${media.title}" não tem arquivo associado`);
          }

          mediaTypeCounters[media.mediaType as keyof typeof mediaTypeCounters]++;
          const count = mediaTypeCounters[media.mediaType as keyof typeof mediaTypeCounters];
          const fieldKey = count === 1 ? `${media.mediaType}_upload` : `${media.mediaType}${count}_upload`;

          console.log(`📁 Adicionando arquivo: ${fieldKey}`, media.file.name);
          formData.append(fieldKey, media.file);

          if (media.id) {
            return {
              ...baseItem,
              id: media.id,
              fieldKey,
              originalName: media.file.name
            };
          }

          return { ...baseItem, fieldKey, originalName: media.file.name };
        }

        if (media.uploadType === 'link' && media.url) {
          console.log(`🔗 Link externo: ${media.title}`, media.url);

          if (media.id) {
            return {
              ...baseItem,
              id: media.id,
              url: media.url,
              platformType: media.platformType
            };
          }

          return {
            ...baseItem,
            url: media.url,
            platformType: media.platformType
          };
        }

        console.warn(`⚠️ Mídia ignorada: ${media.title}`, {
          uploadType: media.uploadType,
          hasFile: !!media.file,
          hasUrl: !!media.url,
          mediaType: media.mediaType
        });

        return baseItem;
      });

      const payloadData = {
        title: sectionData.title,
        description: sectionData.description,
        public: sectionData.public,
        medias: mediasPayload,
      };

      console.log('📦 Payload final:', JSON.stringify(payloadData, null, 2));
      console.log('📋 Medias payload:', mediasPayload.map(m => ({
        title: m.title,
        uploadType: m.uploadType,
        hasFieldKey: !!(m as any).fieldKey,
        fieldKey: (m as any).fieldKey,
        hasUrl: !!(m as any).url
      })));

      formData.append('sectionData', JSON.stringify(payloadData));

      await api.patch(`/ideas-sections/${existingSection.id}/attach/${selectedPage.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(clearIdeasSectionData());
      setSnackbar({
        open: true,
        message: 'Seção editada e vinculada com sucesso! 🎉',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/adm/ideias-compartilhadas');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar seção:', error);
      setSnackbar({
        open: true,
        message: 'Ops! Algo deu errado ao salvar a seção. Tente novamente.',
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
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{
        py: { xs: 1, md: 4 },
        px: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderRadius: '0 0 16px 16px',
        width: { xs: '98%', md: 'auto' },
        mx: { xs: 'auto', md: 0 },
        position: 'relative',
      }}>
        <Box sx={{
          position: 'absolute',
          top: { xs: 12, md: 16 },
          left: { xs: 12, md: 16 },
          zIndex: 2,
        }}>
          <IconButton
            onClick={handleBack}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
              width: { xs: '36px', md: '40px' },
              height: { xs: '36px', md: '40px' },
              fontSize: { xs: '1.1rem', md: '1.3rem' },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
            mb: 2,
            color: 'primary.main',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mt: { xs: 5, md: 6 },
            px: 0,
            maxWidth: '100%',
            mx: 0,
          }}
        >
          🔧 Editar Seção de Ideias
        </Typography>

        <Box sx={{
          display: 'flex',
          gap: { xs: 2, md: 3 },
          alignItems: 'center',
          flexWrap: 'wrap',
          mt: 2,
          justifyContent: 'center',
          maxWidth: '800px',
          mx: 'auto',
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          <FormControl sx={{ minWidth: { xs: '100%', sm: 250 } }} required error={!selectedPage}>
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

          <FormControl sx={{ minWidth: { xs: '100%', sm: 140 } }}>
            <InputLabel>Visibilidade</InputLabel>
            <Select
              value={sectionData.public ? 'true' : 'false'}
              label="Visibilidade"
              size="small"
              onChange={(e) => {
                const isPublic = e.target.value === 'true';
                setSectionData({ ...sectionData, public: isPublic });
              }}
            >
              <MenuItem value="true">Público</MenuItem>
              <MenuItem value="false">Privado</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSaveSection}
            disabled={loading || !selectedPage}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{
              px: { xs: 2, md: 4 },
              py: { xs: 1.2, md: 1.5 },
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              fontWeight: 'bold',
              borderRadius: '12px',
              ml: { xs: 0, sm: 'auto' },
              mt: { xs: 2, sm: 0 },
              width: { xs: '98%', sm: 'auto' },
            }}
          >
            {loading ? 'Salvando...' : 'Salvar e Publicar'}
          </Button>
        </Box>

        {selectedPage && (
          <Box sx={{
            mt: 2,
            p: 2,
            bgcolor: 'success.light',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '400px',
            mx: 'auto',
          }}>
            <Typography variant="body2" color="success.contrastText">
              📄 Publicando em: <strong>{selectedPage.title}</strong>
            </Typography>
          </Box>
        )}

        {!selectedPage && (
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            ⚠️ Este campo é obrigatório para vincular a seção
          </Typography>
        )}
      </Box>

      <Box sx={{
        flex: 1,
        p: { xs: 2, md: 4 },
        bgcolor: 'background.default',
        minHeight: 'calc(100vh - 200px)',
      }}>
        <Box sx={{
          maxWidth: '1200px',
          mx: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '16px',
          p: { xs: 2, md: 4 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          width: { xs: '98%', md: 'auto' },
        }}>
          <IdeasMaterialSection
            section={sectionData}
            onUpdate={handleSectionUpdate}
            isCreationMode={false}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
