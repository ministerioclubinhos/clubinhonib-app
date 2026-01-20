import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IdeasSection } from '@/store/slices/ideas/ideasSlice';
import { clearIdeasSectionData } from '@/store/slices/ideas/ideasSlice';
import { IdeasMaterialSection } from '../IdeasMaterialPageCreator/IdeasMaterialSection';
import api from '@/config/axiosConfig';
import { GENERIC_ERROR_MESSAGES, FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { FEATURE_SUCCESS_MESSAGES } from '@/constants/successMessages';

export function IdeasSectionUserCreator() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sectionData, setSectionData] = useState<IdeasSection>({
    title: '',
    description: '',
    medias: [],
    public: true,
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleSectionUpdate = (updatedSection: IdeasSection) => {
    setSectionData(updatedSection);
  };

  const handleBack = () => {
    dispatch(clearIdeasSectionData());
    navigate('/area-do-professor');
  };

  const handleShareIdea = async () => {
    if (!sectionData.title.trim()) {
      setSnackbar({
        open: true,
        message: FORM_VALIDATION_MESSAGES.TITLE_REQUIRED,
        severity: 'error',
      });
      return;
    }

    if (!sectionData.description.trim()) {
      setSnackbar({
        open: true,
        message: FORM_VALIDATION_MESSAGES.DESCRIPTION_REQUIRED,
        severity: 'error',
      });
      return;
    }

    const validMedias = sectionData.medias.filter(media => {
      if (media.uploadType === 'upload') {
        return media.file && media.title.trim();
      }
      if (media.uploadType === 'link') {
        return media.url && media.title.trim();
      }
      return false;
    });

    if (validMedias.length === 0) {
      setSnackbar({
        open: true,
        message: FORM_VALIDATION_MESSAGES.SECTION_MEDIA_REQUIRED,
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
          if (!media.file) {
            console.error(`❌ Mídia de upload "${media.title}" não tem arquivo!`);
            throw new Error(`Mídia de upload "${media.title}" não tem arquivo associado`);
          }

          mediaTypeCounters[media.mediaType as keyof typeof mediaTypeCounters]++;
          const count = mediaTypeCounters[media.mediaType as keyof typeof mediaTypeCounters];
          const fieldKey = count === 1 ? `${media.mediaType}_upload` : `${media.mediaType}${count}_upload`;

          console.log(`📁 Adicionando arquivo: ${fieldKey}`, media.file.name);
          formData.append(fieldKey, media.file);

          return { ...baseItem, fieldKey, originalName: media.file.name };
        }

        if (media.uploadType === 'link' && media.url) {
          console.log(`🔗 Link externo: ${media.title}`, media.url);
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

      formData.append('sectionData', JSON.stringify({
        title: sectionData.title,
        description: sectionData.description,
        public: true,
        medias: mediasPayload,
      }));

      await api.post('/ideas-sections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch(clearIdeasSectionData());

      setSectionData({
        title: '',
        description: '',
        medias: [],
        public: true,
      });

      setSnackbar({
        open: true,
        message: FEATURE_SUCCESS_MESSAGES.SECTION_SHARED,
        severity: 'success',
      });

      setTimeout(() => {
        navigate('/area-do-professor');
      }, 2000);
    } catch (error) {
      console.error('Erro ao compartilhar ideia:', error);
      setSnackbar({
        open: true,
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Box sx={{
        py: { xs: 2, md: 3 },
        px: 0,
        flexShrink: 0,
        textAlign: 'center',
        position: 'relative',
      }}>
        <Box sx={{
          position: 'absolute',
          top: { xs: 8, md: 24 },
          left: { xs: 8, md: 24 },
          zIndex: 2,
        }}>
          <IconButton
            onClick={handleBack}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              width: { xs: '40px', md: '48px' },
              height: { xs: '40px', md: '48px' },
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.5rem' },
            mb: { xs: 3, md: 2 },
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            mt: { xs: 4, md: 5 },
            px: 0,
            maxWidth: '100%',
            mx: 0,
          }}
        >
          ✨ Criar e compartilhar ideia incrível
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
            mb: { xs: 4, md: 2 },
            maxWidth: '700px',
            mx: 'auto',
            lineHeight: 1.5,
            fontWeight: 400,
            textAlign: 'center',
          }}
        >
          Jesus colocou no seu coração uma ideia brilhante?<br />
          Pode ser uma brincadeira, um versículo, uma forma especial de contar<br />
          uma história ou qualquer outra atividade para o seu Clubinho!<br /><br />
          Agora você também pode enviar <strong>vídeos, imagens e documentos</strong><br />
          para mostrar como fez e ajudar outros professores a colocarem em prática. 📹📸📄
        </Typography>

      </Box>

      <Box sx={{
        flex: 1,
        p: { xs: 2, md: 4 },
        bgcolor: 'background.default',
        borderRadius: '24px 24px 0 0',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{
          maxWidth: '1200px',
          mx: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '20px',
          p: { xs: 2, md: 4 },
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          width: { xs: '98%', md: '95%' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '6px',
            bgcolor: 'divider',
            borderRadius: '3px',
          },
        }}>
          <IdeasMaterialSection
            section={sectionData}
            onUpdate={handleSectionUpdate}
            isCreationMode={true}
          />

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: sectionData.medias.length > 0 ? 'success.50' : 'warning.50',
              border: `1px solid ${sectionData.medias.length > 0 ? 'success.main' : 'warning.main'}`,
              width: '100%',
              maxWidth: 400,
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: sectionData.medias.length > 0 ? 'success.main' : 'warning.main',
                  fontWeight: 600,
                  textAlign: 'center',
                  flex: 1,
                }}
              >
                {sectionData.medias.length > 0
                  ? `✅ ${sectionData.medias.length} mídia(s) adicionada(s)`
                  : '⚠️ Adicione pelo menos uma mídia (vídeo, imagem ou documento)'
                }
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={handleShareIdea}
              disabled={loading || !sectionData.title.trim() || !sectionData.description.trim() || sectionData.medias.length === 0}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                px: { xs: 4, md: 6 },
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '0.85rem', sm: '1.05rem', md: '1.2rem' },
                fontWeight: 'bold',
                borderRadius: '16px',
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.26)',
                },
                transition: 'all 0.3s ease',
                width: { xs: '95%', md: 'auto' },
                maxWidth: { xs: '300px', md: 'none' },
                opacity: sectionData.medias.length === 0 ? 0.6 : 1,
              }}
            >
              {loading ? 'Compartilhando...' : '🚀 Compartilhar Ideia'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontSize: '1rem',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
