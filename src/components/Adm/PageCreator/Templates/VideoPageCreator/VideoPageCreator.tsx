import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import api from '../../../../../config/axiosConfig';
import { AppDispatch, RootState } from '../../../../../store/slices';
import { fetchRoutes } from '../../../../../store/slices/route/routeSlice';
import { clearVideoData } from '../../../../../store/slices/video/videoSlice';
import { validateMediaURL } from '../../../../../utils/validateMediaURL';
import VideoForm from './VideoForm';
import VideoList from './VideoList';
import { MediaItem, MediaType, MediaUploadType, MediaPlatform } from 'store/slices/types';

interface VideoProps {
  fromTemplatePage?: boolean;
}

function videoToEditable(video: MediaItem): MediaItem {
  return { ...video, file: undefined };
}

export default function VideoPageCreator({ fromTemplatePage = false }: VideoProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const videoData = useSelector((state: RootState) => state.video.videoData);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [newVideo, setNewVideo] = useState<MediaItem>({
    title: '',
    description: '',
    uploadType: MediaUploadType.LINK,
    platformType: MediaPlatform.YOUTUBE,
    url: '',
    isLocalFile: false,
    mediaType: MediaType.VIDEO,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({
    pageTitle: false,
    pageDescription: false,
    newVideoTitle: false,
    newVideoDescription: false,
    newVideoSrc: false,
    newVideoURL: false,
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDeleteIndex, setVideoToDeleteIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!videoData && !fromTemplatePage) {
      navigate('/feed-clubinho');
      return;
    }

    if (fromTemplatePage) {
      dispatch(clearVideoData());
      setTitle('');
      setDescription('');
      setVideos([]);
      setIsPublic(true);
    } else if (videoData) {
      setTitle(videoData.title ?? '');
      setDescription(videoData.description ?? '');
      setIsPublic(videoData.public ?? true);
      setVideos(videoData.videos.map(videoToEditable));
    }
  }, [fromTemplatePage, videoData, dispatch, navigate]);

  const areUploadsComplete = () => Object.values(uploadProgress).every((v) => v !== false);

  const validate = (): boolean => {
    if (!title.trim()) return showError('O título da galeria é obrigatório.', 'pageTitle');
    if (!description.trim())
      return showError('A descrição da galeria é obrigatória.', 'pageDescription');
    if (videos.length === 0) return showError('Adicione pelo menos um vídeo.');
    if (!fromTemplatePage && !videoData?.id)
      return showError('ID da página é obrigatório no modo de edição.');
    if (!areUploadsComplete())
      return showError('Aguarde o upload de todos os vídeos antes de salvar.');
    return true;
  };

  const showError = (msg: string, field?: keyof typeof errors) => {
    if (field) setErrors((prev) => ({ ...prev, [field]: true }));
    setSnackbarMessage(msg);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return false;
  };

  const handleSavePage = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();

      const videosPayload = videos.map((video, index) => {
        const fieldKey = `video-${index}`;
        if (video.uploadType === MediaUploadType.UPLOAD && video.file && !video.id) {
          formData.append(fieldKey, video.file);
        }

        return {
          id: !fromTemplatePage && video.id ? video.id : undefined,
          title: video.title,
          description: video.description,
          uploadType: video.uploadType,
          isLocalFile: video.uploadType === MediaUploadType.UPLOAD,
          url:
            video.uploadType === MediaUploadType.LINK ||
            (video.uploadType === MediaUploadType.UPLOAD && video.id)
              ? video.url
              : undefined,
          platformType: video.uploadType === MediaUploadType.LINK ? video.platformType : undefined,
          originalName: video.file?.name,
          mediaType: MediaType.VIDEO,
          fieldKey: video.uploadType === MediaUploadType.UPLOAD && !video.id ? fieldKey : undefined,
        };
      });

      const payload = {
        ...(fromTemplatePage ? {} : { id: videoData?.id }),
        public: isPublic,
        title,
        description,
        videos: videosPayload,
      };

      formData.append('videosPageData', JSON.stringify(payload));

      const response = fromTemplatePage
        ? await api.post('/video-pages', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.patch(`/video-pages/${videoData!.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

      await dispatch(fetchRoutes());
      navigate(`/${response.data.route.path}`);
      setSnackbarMessage(
        fromTemplatePage ? 'Página criada com sucesso!' : 'Página atualizada com sucesso!'
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao salvar página', error);
      showError('Erro ao salvar a página. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = () => {
    const hasError =
      !newVideo.title ||
      !newVideo.description ||
      (newVideo.uploadType === MediaUploadType.LINK && !newVideo.url) ||
      (newVideo.uploadType === MediaUploadType.UPLOAD && !newVideo.file && editingIndex === null);

    const isValidURL =
      newVideo.uploadType === MediaUploadType.LINK && newVideo.platformType
        ? validateMediaURL(newVideo.url, newVideo.platformType)
        : true;

    setErrors((prev) => ({
      ...prev,
      newVideoTitle: !newVideo.title,
      newVideoDescription: !newVideo.description,
      newVideoSrc:
        newVideo.uploadType === MediaUploadType.LINK
          ? !newVideo.url
          : !newVideo.file && editingIndex === null,
      newVideoURL: newVideo.uploadType === MediaUploadType.LINK && !isValidURL,
    }));

    if (hasError || !isValidURL) {
      if (!isValidURL) showError('URL inválida para a plataforma selecionada.');
      return;
    }

    const updatedVideo: MediaItem = {
      ...newVideo,
      id: editingIndex !== null ? videos[editingIndex].id : undefined,
      isLocalFile: newVideo.uploadType === MediaUploadType.UPLOAD,
      mediaType: MediaType.VIDEO,
    };

    if (editingIndex !== null) {
      setVideos((prev) => prev.map((v, i) => (i === editingIndex ? updatedVideo : v)));
      setEditingIndex(null);
    } else {
      setVideos((prev) => [...prev, updatedVideo]);
    }

    if (newVideo.uploadType === MediaUploadType.UPLOAD && newVideo.file) {
      setUploadProgress((prev) => ({ ...prev, [newVideo.file!.name]: true }));
    }

    setNewVideo({
      title: '',
      description: '',
      uploadType: MediaUploadType.LINK,
      platformType: MediaPlatform.YOUTUBE,
      url: '',
      isLocalFile: false,
      mediaType: MediaType.VIDEO,
    });
  };

  const handleOpenDeleteDialog = (index: number) => {
    setVideoToDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (videoToDeleteIndex !== null) {
      setVideos((prev) => prev.filter((_, i) => i !== videoToDeleteIndex));
      if (editingIndex === videoToDeleteIndex) {
        setEditingIndex(null);
        setNewVideo({
          title: '',
          description: '',
          uploadType: MediaUploadType.LINK,
          platformType: MediaPlatform.YOUTUBE,
          url: '',
          isLocalFile: false,
          mediaType: MediaType.VIDEO,
        });
      }
      setSnackbarMessage('Vídeo removido com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    setDeleteDialogOpen(false);
    setVideoToDeleteIndex(null);
  };

  const handleEditVideo = (index: number) => {
    const videoToEdit = videos[index];
    setNewVideo({ ...videoToEdit, file: undefined });
    setEditingIndex(index);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setUploadProgress((prev) => ({ ...prev, [file.name]: false }));
    setNewVideo((prev) => ({
      ...prev,
      file,
      url: previewUrl,
      isLocalFile: true,
      uploadType: MediaUploadType.UPLOAD,
      platformType: undefined,
    }));

    setTimeout(() => {
      setUploadProgress((prev) => ({ ...prev, [file.name]: true }));
    }, 1000);
  };

  return (
    <Container maxWidth={false} sx={{ mt: { xs: 0, md: 6 } }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={{ xs: 2, md: 3 }}
        textAlign="center"
        sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
      >
        {fromTemplatePage ? 'Criar Galeria de Vídeos' : 'Editar Galeria de Vídeos'}
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          label="Título da Galeria"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          error={errors.pageTitle}
          helperText={errors.pageTitle ? 'Campo obrigatório' : ''}
        />
        <TextField
          fullWidth
          label="Descrição da Galeria"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          error={errors.pageDescription}
          helperText={errors.pageDescription ? 'Campo obrigatório' : ''}
        />
        <FormControlLabel
          control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
          label="Página pública"
          sx={{ mt: 1 }}
        />
      </Box>

      <VideoForm
        newVideo={newVideo}
        errors={errors}
        setNewVideo={setNewVideo}
        handleUploadFile={handleUploadFile}
        handleAddVideo={handleAddVideo}
        isEditing={editingIndex !== null}
        uploadProgress={uploadProgress}
      />

      <VideoList
        videos={videos}
        handleRemoveVideo={handleOpenDeleteDialog}
        handleEditVideo={handleEditVideo}
      />

      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="success"
          onClick={handleSavePage}
          disabled={loading || !areUploadsComplete()}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar Página'}
        </Button>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
