import { Fragment, useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { validateMediaURL } from 'utils/validateMediaURL';
import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from 'store/slices/types';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

interface VideosProps {
  videos: MediaItem[];
  setVideos: (videos: MediaItem[]) => void;
  ideaTitle?: string;
}

export function IdeasMaterialVideos({ videos, setVideos, ideaTitle }: VideosProps) {
  const [tempVideo, setTempVideo] = useState<MediaItem>({
    title: '',
    description: '',
    mediaType: MediaType.VIDEO,
    uploadType: MediaUploadType.LINK,
    url: '',
    platformType: MediaPlatform.YOUTUBE,
  });
  const [fileName, setFileName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({ title: false, description: false, url: false });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (editingIndex === null) {
      const count = videos.length + 1;
      const autoTitle = ideaTitle
        ? `Vídeo ${count} da ideia "${ideaTitle}"`
        : `Vídeo ${count} da ideia`;
      const autoDesc = ideaTitle
        ? `Vídeo ${count} para auxiliar na ideia "${ideaTitle}"`
        : `Vídeo ${count} para auxiliar na ideia`;

      setTempVideo((prev) => ({
        ...prev,
        title: autoTitle,
        description: autoDesc,
      }));
    }
  }, [ideaTitle, videos.length, editingIndex]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const objectURL = URL.createObjectURL(file);
    setTempVideo((prev) => ({ ...prev, url: objectURL, file }));
  };

  const resetForm = () => {
    setTempVideo({
      title: '',
      description: '',
      mediaType: MediaType.VIDEO,
      uploadType: MediaUploadType.LINK,
      url: '',
      platformType: MediaPlatform.YOUTUBE,
    });
    setFileName('');
    setEditingIndex(null);
    setErrors({ title: false, description: false, url: false });
  };

  const handleAddOrUpdate = () => {
    const isValid =
      tempVideo.uploadType === MediaUploadType.UPLOAD ||
      validateMediaURL(tempVideo.url, tempVideo.platformType);
    const hasError =
      !tempVideo.title ||
      !tempVideo.description ||
      !tempVideo.url ||
      (tempVideo.uploadType === MediaUploadType.LINK && !isValid);

    setErrors({
      title: !tempVideo.title,
      description: !tempVideo.description,
      url: !tempVideo.url || (tempVideo.uploadType === MediaUploadType.LINK && !isValid),
    });

    if (hasError) return;

    const updated =
      editingIndex !== null
        ? videos.map((vid, i) => (i === editingIndex ? tempVideo : vid))
        : [...videos, tempVideo];

    setVideos(updated);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setTempVideo(videos[index]);
    setFileName(videos[index].file?.name || '');
    setEditingIndex(index);
  };

  const handleRemoveClick = (index: number) => {
    setItemToDelete(index);
    setOpenDeleteDialog(true);
  };

  const confirmRemove = () => {
    if (itemToDelete !== null) {
      setVideos(videos.filter((_, i) => i !== itemToDelete));
      setItemToDelete(null);
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert
            severity="info"
            variant="outlined"
            sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' }, py: 0.5 }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, md: 4 } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
                  Título Automático
                </Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.2, mt: 0.5 }}>
                  {tempVideo.title}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
                  Descrição Automática
                </Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.2, mt: 0.5 }}>
                  {tempVideo.description}
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tempVideo.uploadType}
              label="Tipo"
              onChange={(e) =>
                setTempVideo({
                  ...tempVideo,
                  uploadType: e.target.value as MediaUploadType.LINK | MediaUploadType.UPLOAD,
                  platformType: MediaPlatform.YOUTUBE,
                  url: '',
                  file: undefined,
                })
              }
            >
              <MenuItem value="link">Link (YouTube)</MenuItem>
              <MenuItem value="upload">Upload</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {tempVideo.uploadType === MediaUploadType.LINK && (
          <Fragment>
            <Grid item xs={12}>
              <TextField
                label="URL do Vídeo (YouTube)"
                fullWidth
                value={tempVideo.url}
                onChange={(e) => setTempVideo({ ...tempVideo, url: e.target.value })}
                error={errors.url}
                helperText={errors.url ? FORM_VALIDATION_MESSAGES.INVALID_URL : ''}
              />
            </Grid>
          </Fragment>
        )}
        {tempVideo.uploadType === MediaUploadType.UPLOAD && (
          <Grid item xs={12}>
            <Button variant="outlined" component="label">
              Upload de Vídeo
              <input type="file" hidden accept="video/*" onChange={handleUpload} />
            </Button>
            {fileName && (
              <Typography variant="body2" mt={1}>
                Arquivo: <strong>{fileName}</strong>
              </Typography>
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={handleAddOrUpdate} sx={{ mt: 2 }}>
            {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar Vídeo'}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        {videos.map((video, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <Typography fontWeight="bold">{video.title}</Typography>
              <Typography variant="body2">{video.description}</Typography>
              {video.uploadType === MediaUploadType.LINK ? (
                <Box sx={{ aspectRatio: '16/9', mt: 1 }}>
                  <iframe
                    src={video.platformType === MediaPlatform.YOUTUBE ?
                      video.url.includes('embed') ?
                        `${video.url}&autoplay=0&mute=0` :
                        video.url.replace(/watch\?v=/, 'embed/') + '?autoplay=0&mute=0' :
                      video.url
                    }
                    title={video.title}
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 0 }}
                  />
                </Box>
              ) : (
                <video controls style={{ width: '100%', marginTop: 8 }}>
                  <source src={video.url} />
                </video>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Tooltip title="Editar">
                  <IconButton onClick={() => handleEdit(index)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover">
                  <IconButton color="error" onClick={() => handleRemoveClick(index)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmRemove} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
