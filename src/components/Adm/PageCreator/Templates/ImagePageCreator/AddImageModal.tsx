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
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { MediaItem, MediaPlatform, MediaUploadType, MediaType } from 'store/slices/types';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medias: MediaItem[]) => void;
}

export function AddImageModal({ isOpen, onClose, onSubmit }: AddImageModalProps) {
  const [mode, setMode] = useState<MediaUploadType>(MediaUploadType.UPLOAD);
  const [files, setFiles] = useState<File[]>([]);
  const [tempUrls, setTempUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [platformType, setPlatformType] = useState<MediaPlatform>(MediaPlatform.ANY);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map((file) => URL.createObjectURL(file));
      setTempUrls(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setTempUrls([]);
    }
  }, [files]);

  const reset = () => {
    setFiles([]);
    setTempUrls([]);
    setUrlInput('');
    setTitle('');
    setDescription('');
    setPlatformType(MediaPlatform.ANY);
    setMode(MediaUploadType.UPLOAD);
  };

  const handleRemoveImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setTempUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const base: Partial<MediaItem> = {
      title: title.trim(),
      description: description.trim(),
      uploadType: mode,
      mediaType: MediaType.IMAGE,
      isLocalFile: mode === MediaUploadType.UPLOAD,
    };

    let medias: MediaItem[] = [];

    if (mode === MediaUploadType.UPLOAD && files.length > 0) {
      medias = files.map((file) => ({
        ...base,
        file,
        url: '',
        originalName: file.name,
        size: file.size,
      } as MediaItem));
    }

    if (mode === MediaUploadType.LINK && urlInput.trim()) {
      const urls = urlInput.split(',').map((url) => url.trim());
      medias = urls.map((url) => ({
        ...base,
        url,
        platformType: platformType,
        file: undefined,
      } as MediaItem));
    }

    if (medias.length > 0) {
      onSubmit(medias);
    }

    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Adicionar Nova(s) Imagem(ns)</DialogTitle>

      <DialogContent>
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
              Upload de imagens
              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  setFiles((prev) => [...prev, ...selectedFiles]);
                }}
              />
            </Button>

            {tempUrls.length > 0 && (
              <Box mt={2} textAlign="center">
                {tempUrls.map((url, index) => (
                  <Box key={index} sx={{ position: 'relative', mb: 2 }}>
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                      }}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                ))}
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
              label="URLs das imagens (separadas por vírgula)"
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
          disabled={
            mode === MediaUploadType.UPLOAD
              ? files.length === 0
              : !urlInput.trim()
          }
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
