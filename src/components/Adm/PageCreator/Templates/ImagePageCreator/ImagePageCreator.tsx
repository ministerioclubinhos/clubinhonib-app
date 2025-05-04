import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store/slices';
import api from '../../../../../config/axiosConfig';
import { fetchRoutes } from '../../../../../store/slices/route/routeSlice';
import { AddImageModal } from './AddImageModal';
import { ConfirmDialog } from './ConfirmModal';
import { Notification } from './NotificationModal';
import { LoadingSpinner } from './LoadingSpinner';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ImagePageData, SectionData } from '../../../../../store/slices/image/imageSlice';
import ImageSection from './ImageSection';
import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from 'store/slices/types';

interface ImageProps {
  fromTemplatePage?: boolean;
}

function sectionToEditable(section: SectionData): SectionData {
  return {
    ...section,
    public: section.public ?? true,
    mediaItems: section.mediaItems.map((media) => ({
      ...media,
      file: undefined,
    })),
  };
}

export default function ImagePageCreator({ fromTemplatePage }: ImageProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const imageData = useSelector((state: RootState) => state.image.imageData);

  const [sections, setSections] = useState<SectionData[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => { });
  const [isSaving, setIsSaving] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!imageData && !fromTemplatePage) {
      navigate('/feed-clubinho');
      return;
    }

    if (imageData) {
      setTitle(imageData.title ?? '');
      setDescription(imageData.description);
      setIsPublic(imageData.public ?? true);
      setSections(imageData.sections.map(sectionToEditable));
    }
  }, [imageData, navigate, fromTemplatePage]);

  const setError = (message: string): false => {
    setErrorMessage(message);
    setErrorSnackbarOpen(true);
    return false;
  };

  const validate = (): boolean => {
    if (!title.trim()) return setError('O título da galeria é obrigatório.');
    if (!description.trim()) return setError('A descrição da galeria é obrigatória.');
    if (sections.length === 0) return setError('Adicione pelo menos uma seção.');

    for (let i = 0; i < sections.length; i++) {
      const { caption, description, mediaItems } = sections[i];
      if (!caption.trim()) return setError(`A seção ${i + 1} precisa de um título.`);
      if (!description.trim()) return setError(`A seção ${i + 1} precisa de uma descrição.`);
      if (mediaItems.length === 0)
        return setError(`A seção ${i + 1} precisa conter pelo menos uma mídia.`);
    }

    return true;
  };

  const handleSaveAll = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      const formData = new FormData();

      const sectionsPayload: SectionData[] = sections.map((section, sectionIndex) => {
        const mediaItems: MediaItem[] = section.mediaItems.map((media, mediaIndex) => {
          const fieldKey = `file_sec${sectionIndex}_mid${mediaIndex}`;

          if (media.isLocalFile && media.file) {
            formData.append(fieldKey, media.file);
          }

          const baseMedia: MediaItem = {
            isLocalFile: media.isLocalFile,
            url: media.url || '',
            uploadType: media.uploadType || MediaUploadType.UPLOAD,
            mediaType: MediaType.IMAGE,
            title: media.title || '',
            description: media.description || '',
            platformType: media.platformType || MediaPlatform.ANY,
            originalName: media.originalName,
            size: media.size,
            fieldKey,
          };

          return fromTemplatePage && !media.id ? baseMedia : { ...baseMedia, id: media.id };
        });

        const baseSection = {
          public: section.public,
          caption: section.caption,
          description: section.description,
          mediaItems,
        };

        return fromTemplatePage && !section.id ? baseSection : { ...baseSection, id: section.id };
      });

      const payload: ImagePageData = {
        ...((fromTemplatePage === false || fromTemplatePage === undefined) &&
          imageData?.id && { id: imageData.id }),
        public: isPublic,
        title,
        description,
        sections: sectionsPayload,
      };

      formData.append('imageData', JSON.stringify(payload));

      const response = fromTemplatePage
        ? await api.post('/image-pages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        : await api.patch(`/image-pages/${imageData?.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

      await dispatch(fetchRoutes());
      navigate(`/${response.data.route.path}`);
      setSuccessSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setError('Erro ao enviar dados. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (index: number) => {
    setCurrentEditingIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleModalSubmit = (medias: MediaItem[]) => {
    if (currentEditingIndex !== null) {
      setSections((prev) =>
        prev.map((section, i) =>
          i === currentEditingIndex
            ? { ...section, mediaItems: [...section.mediaItems, ...medias] }
            : section
        )
      );
    }
    closeModal();
  };

  const addSection = () =>
    setSections((prev) => [
      ...prev,
      { caption: '', description: '', public: true, mediaItems: [] },
    ]);

  const removeSection = (index: number) => {
    setConfirmMessage('Tem certeza que deseja excluir esta seção?');
    setOnConfirmAction(() => () => setSections((prev) => prev.filter((_, i) => i !== index)));
    setConfirmModalOpen(true);
  };

  const removeMediaFromSection = (sectionIndex: number, mediaIndex: number) => {
    setConfirmMessage('Tem certeza que deseja excluir esta mídia?');
    setOnConfirmAction(
      () => () =>
        setSections((prev) =>
          prev.map((section, i) =>
            i === sectionIndex
              ? {
                ...section,
                mediaItems: section.mediaItems.filter((_, j) => j !== mediaIndex),
              }
              : section
          )
        )
    );
    setConfirmModalOpen(true);
  };

  const updateCaption = (index: number, caption: string) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, caption } : section))
    );
  };

  const updateDescription = (index: number, description: string) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, description } : section))
    );
  };

  const updatePublicFlag = (index: number, value: boolean) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, public: value } : section))
    );
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        mt: { xs: 0, md: 4 },
        pb: { xs: 0, md: 2 },
        pt: 0,
        px: 0,
        mb: 0,
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
        textAlign="center"
        sx={{ fontSize: { xs: '1.2rem', md: '2.5rem' } }}
      >

        {fromTemplatePage ? 'Criar Galeria de Fotos' : 'Editar Galeria de Fotos'}
      </Typography>

      <LoadingSpinner open={isSaving} />

      <ConfirmDialog
        open={confirmModalOpen}
        title="Confirmação"
        message={confirmMessage}
        onConfirm={() => {
          onConfirmAction();
          setConfirmModalOpen(false);
        }}
        onCancel={() => setConfirmModalOpen(false)}
      />

      <Notification
        open={successSnackbarOpen}
        message="Página salva com sucesso!"
        severity="success"
        onClose={() => setSuccessSnackbarOpen(false)}
      />

      <Notification
        open={errorSnackbarOpen}
        message={errorMessage}
        severity="error"
        onClose={() => setErrorSnackbarOpen(false)}
      />

      <Box mb={2}>
        <TextField
          fullWidth
          label="Título da Galeria"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Descrição da Galeria"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
        />
        <FormControlLabel
          control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
          label="Página pública"
          sx={{ mt: 1 }}
        />
      </Box>

      {sections.map((section, index) => (
        <ImageSection
          key={index}
          mediaItems={section.mediaItems}
          caption={section.caption}
          description={section.description}
          isPublic={section.public}
          onCaptionChange={(val) => updateCaption(index, val)}
          onDescriptionChange={(val) => updateDescription(index, val)}
          onPublicChange={(val) => updatePublicFlag(index, val)}
          onRemoveMedia={(mediaIndex) => removeMediaFromSection(index, mediaIndex)}
          onOpenModal={() => openModal(index)}
          onRemoveSection={() => removeSection(index)}
        />
      ))}

      <Box mt={3} display="flex" gap={2} flexWrap="wrap">
        <Button variant="contained" onClick={addSection}>
          + Nova Seção
        </Button>
        <Button variant="contained" color="success" onClick={handleSaveAll}>
          Salvar
        </Button>
      </Box>

      <AddImageModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleModalSubmit} />
    </Container>
  );
}
