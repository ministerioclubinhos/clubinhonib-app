import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper, useTheme, useMediaQuery, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

import api from '@/config/axiosConfig';
import { setData, clearData, SectionData } from '@/store/slices/image-section/imageSectionSlice';
import { MediaType, MediaUploadType, MediaPlatform } from '@/store/slices/types';
import { RootState } from '@/store/slices';

import { LoadingSpinner } from '../components/Modals';
import { NotificationModal } from '../components/Modals';
import ImageSectionEditor from './ImageSectionEditor';


interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function ImageSectionPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sectionData = useSelector((state: RootState) => state.imageSection.data) as SectionData | null;

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    dispatch(clearData());
  }, [dispatch]);

  const showError = (message: string) => {
    setNotification({ open: true, message, severity: 'error' });
  };

  const validate = useCallback((): boolean => {
    if (!sectionData?.caption?.trim()) {
      showError('O título das atividades do seu Clubinho é obrigatório.');
      return false;
    }
    if (!sectionData?.description?.trim()) {
      showError('A descrição das atividades é obrigatória.');
      return false;
    }
    if (!sectionData?.mediaItems?.length) {
      showError('Adicione pelo menos uma imagem das atividades do seu Clubinho.');
      return false;
    }
    return true;
  }, [sectionData]);

  const prepareFormData = useCallback((): FormData => {
    const formData = new FormData();

    const mediaItems = sectionData!.mediaItems.map((media, index) => {
      const base = {
        isLocalFile: media.isLocalFile,
        url: media.url || '',
        uploadType: media.uploadType || MediaUploadType.UPLOAD,
        mediaType: MediaType.IMAGE,
        title: media.title || '',
        description: media.description || '',
        platformType: media.platformType || MediaPlatform.ANY,
        originalName: media.originalName,
        size: media.size,
      };

      if (media.isLocalFile && media.file) {
        const fieldKey = `file_${index}`;
        formData.append(fieldKey, media.file);
        return { ...base, fieldKey, id: media.id };
      }

      return { ...base, id: media.id };
    });

    const payload = {
      caption: sectionData!.caption,
      description: sectionData!.description,
      public: sectionData!.public,
      mediaItems,
    };

    formData.append('sectionData', JSON.stringify(payload));
    return formData;
  }, [sectionData]);

  const saveSection = async (formData: FormData) => {
    // Sempre cria nova seção (modo criação)
    await api.post('/image-sections', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setNotification({
      open: true,
      message: 'Imagens do seu Clubinho compartilhadas com sucesso!',
      severity: 'success',
    });

    dispatch(clearData());
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    const formData = prepareFormData();

    try {
      await saveSection(formData);

      navigate('/area-do-professor');
    } catch (error) {
      console.error('Erro ao salvar a seção:', error);
      showError('Falha ao compartilhar as imagens do seu Clubinho. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (updatedData: Partial<SectionData>) => {
    dispatch(setData({ ...(sectionData || {}), ...updatedData } as SectionData));
  };

  const handleBack = () => {
    navigate('/area-do-professor');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 0 },
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box
              sx={{
                display: { xs: 'flex', sm: 'none' },
                justifyContent: 'flex-start',
                mb: 2,
              }}
            >
              <IconButton
                onClick={handleBack}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  width: 40,
                  height: 40,
                }}
                aria-label="Voltar para área do professor"
              >
                <ArrowBackIcon fontSize="inherit" />
              </IconButton>
            </Box>

            <Box
              sx={{
                textAlign: 'center',
                mb: 4,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 10,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                <IconButton
                  onClick={handleBack}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    width: 44,
                    height: 44,
                  }}
                  aria-label="Voltar para área do professor"
                >
                  <ArrowBackIcon fontSize="inherit" />
                </IconButton>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(20px)',
                }}
              />

              <Box
                sx={{
                  width: { xs: '95%', sm: '100%' },
                  mx: 'auto',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1.2rem', sm: '2rem', md: '2.5rem' },
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  📸 Enviar Imagens do seu Clubinho
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    maxWidth: { xs: '100%', sm: 600 },
                    mx: 'auto',
                  }}
                >
                  Registre e compartilhe os momentos especiais das atividades do seu Clubinho para inspirar outros professores
                </Typography>
              </Box>
            </Box>

            <LoadingSpinner open={isSaving} aria-label="Salvando a seção" />

            <NotificationModal
              open={notification.open}
              message={notification.message}
              severity={notification.severity}
              onClose={() => setNotification({ ...notification, open: false })}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ImageSectionEditor
                isEditMode={false}
                initialCaption={sectionData?.caption || ''}
                initialDescription={sectionData?.description || ''}
                initialIsPublic={sectionData?.public ?? true}
                initialMediaItems={sectionData?.mediaItems || []}
                onChange={handleChange}
                captionPlaceholder="EX: Clubinho 90: Gincana de Páscoa - Crianças aprendendo sobre ressurreição"
                descriptionPlaceholder="EX: Descreva as atividades realizadas no seu Clubinho: dinâmicas, brincadeiras, ensinamentos bíblicos, momentos especiais com as crianças e como elas reagiram às atividades."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Box
                mt={4}
                display="flex"
                justifyContent="center"
                sx={{
                  px: { xs: 1, md: 0 },
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    minWidth: { xs: 200, md: 250 },
                    height: { xs: 44, md: 52 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      boxShadow: 'none',
                      transform: 'none',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  aria-label="Compartilhar imagens do Clubinho"
                >
                  {isSaving ? 'Enviando...' : '🚀 Compartilhar Imagens'}
                </Button>
              </Box>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
