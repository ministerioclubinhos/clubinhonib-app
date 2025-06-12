import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';

import api from '@/config/axiosConfig';
import { setData, clearData, SectionData } from '@/store/slices/image-section/imageSectionSlice';
import { MediaType, MediaUploadType, MediaPlatform } from '@/store/slices/types';
import { RootState } from '@/store/slices';

import { LoadingSpinner } from './LoadingSpinner';
import { NotificationModal } from './NotificationModal';
import ImageSectionEditor from './ImageSectionEditor';

interface ImageSectionPageProps {
  isEditMode: boolean;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function ImageSectionPage({ isEditMode }: ImageSectionPageProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sectionData = useSelector((state: RootState) => state.imageSection.data) as SectionData | null;

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!isEditMode) {
      dispatch(clearData());
    }
  }, [isEditMode, dispatch]);

  const showError = (message: string) => {
    setNotification({ open: true, message, severity: 'error' });
  };

  const validate = useCallback((): boolean => {
    if (!sectionData?.caption?.trim()) {
      showError('A legenda da galeria é obrigatória.');
      return false;
    }
    if (!sectionData?.description?.trim()) {
      showError('A descrição da galeria é obrigatória.');
      return false;
    }
    if (!sectionData?.mediaItems?.length) {
      showError('Adicione pelo menos uma imagem.');
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
    const isEdit = isEditMode;
    const url = isEdit ? `/image-sections/${sectionData!.id}` : '/image-sections';
    const request = isEdit ? api.patch : api.post;

    await request(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setNotification({
      open: true,
      message: isEdit ? 'Seção atualizada com sucesso!' : 'Seção criada com sucesso!',
      severity: 'success',
    });

    dispatch(clearData());
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    const formData = prepareFormData();

    try {
      if (isEditMode && !sectionData?.id) {
        showError('ID da seção não encontrado.');
        return;
      }

      await saveSection(formData);

      navigate(isEditMode ? '/adm/paginas-fotos-clubinhos' : '/area-do-professor');
    } catch (error) {
      console.error('Erro ao salvar a seção:', error);
      showError('Falha ao salvar a seção. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (updatedData: Partial<SectionData>) => {
    dispatch(setData({ ...(sectionData || {}), ...updatedData } as SectionData));
  };

  return (
    <Container sx={{ mt: 10, mb: 10, minWidth: '90%' }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
        textAlign="center"
        sx={{
          fontSize: {
            xs: '1.2rem',
            sm: '2rem',
            md: '2.4rem',
          },
          lineHeight: 1.3,
        }}
      >
        {isEditMode
          ? 'Editar imagens e publicar'
          : 'Envie imagens do seu Clubinho'}
      </Typography>

      <LoadingSpinner open={isSaving} aria-label="Salvando a seção" />

      <NotificationModal
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />

      <ImageSectionEditor
        isEditMode={isEditMode}
        initialCaption={sectionData?.caption || ''}
        initialDescription={sectionData?.description || ''}
        initialIsPublic={sectionData?.public ?? true}
        initialMediaItems={sectionData?.mediaItems || []}
        onChange={handleChange}
        captionPlaceholder="EX: Clubinho 90: Gincana de Páscoa"
        descriptionPlaceholder="EX: Descreva o que aconteceu nesta na semana do seu CLubinho, como: Clubinho especial temátio, dinâmica com as crianças ou entrega de super estrelas."
      />

      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={isSaving}
          aria-label={isEditMode ? 'Salvar e publicar imagens' : 'Enviar imagens'}
        >
          {isSaving ? 'Salvando...' : isEditMode ? 'Salvar e publicar imagens' : 'Enviar imagens'}
        </Button>
      </Box>
    </Container>
  );
}
