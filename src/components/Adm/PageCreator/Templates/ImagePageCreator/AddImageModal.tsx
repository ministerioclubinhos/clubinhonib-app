import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { MediaItem, MediaPlatform, MediaUploadType, MediaType } from 'store/slices/types';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (media: MediaItem) => void;
}

export function AddImageModal({ isOpen, onClose, onSubmit }: AddImageModalProps) {
  const [mode, setMode] = useState<MediaUploadType>(MediaUploadType.UPLOAD);
  const [file, setFile] = useState<File | null>(null);
  const [tempUrl, setTempUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [platformType, setPlatformType] = useState<MediaPlatform>(MediaPlatform.ANY);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setTempUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const reset = () => {
    setFile(null);
    setTempUrl('');
    setUrlInput('');
    setTitle('');
    setDescription('');
    setPlatformType(MediaPlatform.ANY);
    setMode(MediaUploadType.UPLOAD);
  };

  const handleSubmit = () => {
    const base: Partial<MediaItem> = {
      title: title.trim(),
      description: description.trim(),
      uploadType: mode,
      mediaType: MediaType.IMAGE,
      isLocalFile: mode === MediaUploadType.UPLOAD,
    };

    if (mode === MediaUploadType.UPLOAD && file) {
      onSubmit({
        ...base,
        file,
        url: '',
        originalName: file.name,
        size: file.size,
      } as MediaItem);
    }

    if (mode === MediaUploadType.LINK && urlInput.trim()) {
      onSubmit({
        ...base,
        url: urlInput.trim(),
        platformType: platformType,
        file: undefined,
      } as MediaItem);
    }

    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Adicionar Nova Imagem</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Título da imagem (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Descrição da imagem (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Modo de envio</InputLabel>
          <Select
            value={mode}
            label="Modo de envio"
            onChange={(e) => setMode(e.target.value as MediaUploadType)}
          >
            <MenuItem value={MediaUploadType.UPLOAD}>Upload</MenuItem>
            <MenuItem value={MediaUploadType.LINK}>Link</MenuItem>
          </Select>
        </FormControl>

        {mode === MediaUploadType.UPLOAD && (
          <>
            <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
              Upload da imagem
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) setFile(selected);
                }}
              />
            </Button>

            {tempUrl && (
              <Box mt={2} textAlign="center">
                <img src={tempUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
              </Box>
            )}
          </>
        )}

        {mode === MediaUploadType.LINK && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Plataforma</InputLabel>
              <Select
                value={platformType}
                label="Plataforma"
                onChange={(e) => setPlatformType(e.target.value as MediaPlatform)}
              >
                <MenuItem value={MediaPlatform.ANY}>Outro</MenuItem>
                <MenuItem value={MediaPlatform.GOOGLE_DRIVE}>Google Drive</MenuItem>
                <MenuItem value={MediaPlatform.ONEDRIVE}>OneDrive</MenuItem>
                <MenuItem value={MediaPlatform.DROPBOX}>Dropbox</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="URL da imagem"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              margin="normal"
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={mode === MediaUploadType.UPLOAD ? !file : !urlInput.trim()}
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
