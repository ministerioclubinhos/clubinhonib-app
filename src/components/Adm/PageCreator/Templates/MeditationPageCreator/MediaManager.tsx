import {
  Box,
  Stack,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Fragment, useState } from 'react';
import { MediaPlatform, MediaUploadType } from 'store/slices/types';

interface MediaManagerProps {
  uploadType: MediaUploadType;
  setUploadType: (value: MediaUploadType) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  url: string;
  setUrl: (url: string) => void;
  platformType: MediaPlatform;
  setPlatformType: (value: MediaPlatform) => void;
}

export default function MediaManager({
  uploadType,
  setUploadType,
  file,
  setFile,
  url,
  setUrl,
  platformType,
  setPlatformType,
}: MediaManagerProps) {
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleRemoveMedia = () => {
    setFile(null);
    setUrl('');
    setShowMediaForm(false);
    setDeleteDialogOpen(false);
  };

  return (
    <Box>
      {!showMediaForm ? (
        <Box textAlign="left">
          <Button variant="outlined" onClick={() => setShowMediaForm(true)}>
            Adicionar Doc da meditação
          </Button>
        </Box>
      ) : (
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel id="upload-type-label">Tipo de conteúdo</InputLabel>
            <Select
              labelId="upload-type-label"
              value={uploadType}
              label="Tipo de conteúdo"
              onChange={(e: SelectChangeEvent<MediaUploadType>) =>
                setUploadType(e.target.value as MediaUploadType)
              }
            >
              <MenuItem value={MediaUploadType.LINK}>Link</MenuItem>
              <MenuItem value={MediaUploadType.UPLOAD}>Upload</MenuItem>
            </Select>
          </FormControl>

          {uploadType === MediaUploadType.LINK && (
            <Fragment>
              <TextField
                fullWidth
                label="Insira o link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel id="platform-label">Plataforma</InputLabel>
                <Select
                  labelId="platform-label"
                  value={platformType}
                  label="Plataforma"
                  onChange={(e: SelectChangeEvent<MediaPlatform>) =>
                    setPlatformType(e.target.value as MediaPlatform)
                  }
                >
                  <MenuItem value={MediaPlatform.ANY}>Qualquer</MenuItem>
                  <MenuItem value={MediaPlatform.GOOGLE_DRIVE}>Google Drive</MenuItem>
                  <MenuItem value={MediaPlatform.ONEDRIVE}>OneDrive</MenuItem>
                  <MenuItem value={MediaPlatform.DROPBOX}>Dropbox</MenuItem>
                </Select>
              </FormControl>
            </Fragment>
          )}

          {uploadType === MediaUploadType.UPLOAD && (
            <Button component="label" variant="outlined" size="small" fullWidth>
              {file ? file.name : 'Selecionar arquivo'}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) setFile(selected);
                }}
              />
            </Button>
          )}

          <Box textAlign="right">
            <Button color="error" onClick={() => setDeleteDialogOpen(true)}>
              Remover Doc da meditação
            </Button>
          </Box>
        </Stack>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle> Remover Doc da meditação</DialogTitle>
        <DialogContent>
          <Typography>Deseja realmente remover o Doc da meditação selecionada?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleRemoveMedia} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
