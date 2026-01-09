import { Fragment, useState } from 'react';
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
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { validateMediaURL } from 'utils/validateMediaURL';
import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from 'store/slices/types';

interface VideosProps {
  videos: MediaItem[];
  setVideos: (videos: MediaItem[]) => void;
}

export function IdeasMaterialVideos({ videos, setVideos }: VideosProps) {
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
        <Grid item xs={12} sm={6}>
          <TextField
            label="Título do Vídeo"
            fullWidth
            value={tempVideo.title}
            onChange={(e) => setTempVideo({ ...tempVideo, title: e.target.value })}
            error={errors.title}
            helperText={errors.title ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Descrição do Vídeo"
            fullWidth
            value={tempVideo.description}
            onChange={(e) => setTempVideo({ ...tempVideo, description: e.target.value })}
            error={errors.description}
            helperText={errors.description ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tempVideo.uploadType}
              label="Tipo"
              onChange={(e) =>
                setTempVideo({
                  ...tempVideo,
                  uploadType: e.target.value as MediaUploadType.LINK | MediaUploadType.UPLOAD,
                  platformType:
                    e.target.value === MediaUploadType.LINK ? MediaPlatform.YOUTUBE : undefined,
                  url: '',
                  file: undefined,
                })
              }
            >
              <MenuItem value="link">Link</MenuItem>
              <MenuItem value="upload">Upload</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {tempVideo.uploadType === MediaUploadType.LINK && (
          <Fragment>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Plataforma</InputLabel>
                <Select
                  value={tempVideo.platformType || ''}
                  label="Plataforma"
                  onChange={(e) =>
                    setTempVideo({
                      ...tempVideo,
                      platformType: e.target.value as MediaItem['platformType'],
                    })
                  }
                >
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="googledrive">Google Drive</MenuItem>
                  <MenuItem value="onedrive">OneDrive</MenuItem>
                  <MenuItem value="dropbox">Dropbox</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL do Vídeo"
                fullWidth
                value={tempVideo.url}
                onChange={(e) => setTempVideo({ ...tempVideo, url: e.target.value })}
                error={errors.url}
                helperText={errors.url ? 'URL inválida ou obrigatória' : ''}
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
                    src={
                      video.platformType === MediaPlatform.YOUTUBE
                        ? video.url.includes('embed')
                          ? `${video.url}&autoplay=0&mute=0`
                          : video.url.replace(/watch\?v=/, 'embed/') + '?autoplay=0&mute=0'
                        : video.url
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
