import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { MediaItem, MediaPlatform, MediaUploadType } from 'store/slices/types';

interface VideoFormProps {
  newVideo: MediaItem;
  errors: {
    pageTitle: boolean;
    pageDescription: boolean;
    newVideoTitle: boolean;
    newVideoDescription: boolean;
    newVideoSrc: boolean;
    newVideoURL: boolean;
  };
  setNewVideo: Dispatch<SetStateAction<MediaItem>>;
  handleUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddVideo: () => void;
  isEditing: boolean;
  uploadProgress: Record<string, boolean>;
}

export default function VideoForm({
  newVideo,
  errors,
  setNewVideo,
  handleUploadFile,
  handleAddVideo,
  isEditing,
  uploadProgress,
}: VideoFormProps) {
  return (
    <>
      <Typography variant="h6" mb={2} fontWeight="medium">
        {isEditing ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Título do Vídeo"
            fullWidth
            value={newVideo.title}
            onChange={(e) => setNewVideo((prev) => ({ ...prev, title: e.target.value }))}
            error={errors.newVideoTitle}
            helperText={errors.newVideoTitle ? 'Campo obrigatório' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Descrição do Vídeo"
            fullWidth
            value={newVideo.description}
            onChange={(e) => setNewVideo((prev) => ({ ...prev, description: e.target.value }))}
            error={errors.newVideoDescription}
            helperText={errors.newVideoDescription ? 'Campo obrigatório' : ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newVideo.uploadType}
              label="Tipo"
              onChange={(e) =>
                setNewVideo((prev) => ({
                  ...prev,
                  uploadType: e.target.value as MediaUploadType,
                  platformType:
                    e.target.value === MediaUploadType.LINK ? MediaPlatform.YOUTUBE : undefined,
                  url: '',
                  file: undefined,
                  isLocalFile: e.target.value === MediaUploadType.UPLOAD,
                }))
              }
            >
              <MenuItem value={MediaUploadType.LINK}>Link</MenuItem>
              <MenuItem value={MediaUploadType.UPLOAD}>Upload</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {newVideo.uploadType === MediaUploadType.LINK && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Plataforma</InputLabel>
              <Select
                value={newVideo.platformType || ''}
                label="Plataforma"
                onChange={(e) =>
                  setNewVideo((prev) => ({
                    ...prev,
                    platformType: e.target.value as MediaPlatform,
                  }))
                }
              >
                <MenuItem value={MediaPlatform.YOUTUBE}>YouTube</MenuItem>
                <MenuItem value={MediaPlatform.GOOGLE_DRIVE}>Google Drive</MenuItem>
                <MenuItem value={MediaPlatform.ONEDRIVE}>OneDrive</MenuItem>
                <MenuItem value={MediaPlatform.DROPBOX}>Dropbox</MenuItem>
                <MenuItem value={MediaPlatform.ANY}>Outro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {newVideo.uploadType === MediaUploadType.LINK && (
          <Grid item xs={12}>
            <TextField
              label="URL do Vídeo (embed)"
              fullWidth
              value={newVideo.url || ''}
              onChange={(e) => setNewVideo((prev) => ({ ...prev, url: e.target.value }))}
              error={errors.newVideoSrc || errors.newVideoURL}
              helperText={
                errors.newVideoSrc
                  ? 'Campo obrigatório'
                  : errors.newVideoURL
                    ? 'URL inválida para a plataforma selecionada'
                    : ''
              }
            />
          </Grid>
        )}

        {newVideo.uploadType === MediaUploadType.UPLOAD && (
          <Grid item xs={12}>
            <Button variant="outlined" component="label" sx={{ mr: 2 }}>
              Escolher Vídeo
              <input type="file" hidden accept="video/*" onChange={handleUploadFile} />
            </Button>
            {newVideo.file && (
              <Typography variant="body2" display="inline">
                {newVideo.file.name}{' '}
                {uploadProgress[newVideo.file.name] === false ? (
                  <CircularProgress size={16} sx={{ ml: 1 }} />
                ) : (
                  '✔'
                )}
              </Typography>
            )}
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleAddVideo}
            disabled={
              newVideo.uploadType === MediaUploadType.UPLOAD &&
              newVideo.file &&
              uploadProgress[newVideo.file.name] === false
            }
          >
            {isEditing ? 'Atualizar Vídeo' : 'Adicionar Vídeo'}
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
