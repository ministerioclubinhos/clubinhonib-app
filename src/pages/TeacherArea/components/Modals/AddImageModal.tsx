import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  IconButton, Grid, Typography, Tabs, Tab, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { MediaItem, MediaPlatform, MediaUploadType, MediaType } from 'store/slices/types';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medias: MediaItem[]) => void;
}

export function AddImageModal({ isOpen, onClose, onSubmit }: AddImageModalProps) {
  const [tab, setTab] = useState<MediaUploadType>(MediaUploadType.UPLOAD);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [platformType, setPlatformType] = useState<MediaPlatform>(MediaPlatform.ANY);

  useEffect(() => {
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setUrlInput('');
    setPlatformType(MediaPlatform.ANY);
    setTab(MediaUploadType.UPLOAD);
  };

  const handleSubmit = () => {
    let medias: MediaItem[] = [];

    if (tab === MediaUploadType.UPLOAD && files.length > 0) {
      medias = files.map(file => ({
        uploadType: MediaUploadType.UPLOAD,
        mediaType: MediaType.IMAGE,
        isLocalFile: true,
        url: '', 
        file, 
        originalName: file.name,
        size: file.size,
      } as MediaItem));
    }

    if (tab === MediaUploadType.LINK && urlInput.trim()) {
      medias = urlInput.split(',').map(url => ({
        uploadType: MediaUploadType.LINK,
        mediaType: MediaType.IMAGE,
        isLocalFile: false,
        url: url.trim(),
        platformType,
      } as MediaItem));
    }

    if (medias.length > 0) {
      onSubmit(medias);
    }

    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar Imagem</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered sx={{ mb: 2 }}>
          <Tab label="Upload" value={MediaUploadType.UPLOAD} />
          <Tab label="Link" value={MediaUploadType.LINK} />
        </Tabs>

        {tab === MediaUploadType.UPLOAD && (
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              Selecionar Imagens
              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  setFiles(prev => [...prev, ...selected]);
                }}
              />
            </Button>

            {files.length > 0 && (
              <Grid container spacing={2}>
                {previews.map((preview, index) => (
                  <Grid item xs={4} key={index} sx={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Pré-visualização ${index}`}
                      style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                    />
                    <IconButton
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Modo Link */}
        {tab === MediaUploadType.LINK && (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
              label="URLs (separadas por vírgula)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Ex.: https://link1.com, https://link2.com"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            (tab === MediaUploadType.UPLOAD && files.length === 0) ||
            (tab === MediaUploadType.LINK && !urlInput.trim())
          }
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}