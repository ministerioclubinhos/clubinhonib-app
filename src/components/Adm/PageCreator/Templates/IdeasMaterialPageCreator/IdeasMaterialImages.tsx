import { useState } from 'react';
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

interface ImagesProps {
  images: MediaItem[];
  setImages: (imgs: MediaItem[]) => void;
}

export function IdeasMaterialImages({ images, setImages }: ImagesProps) {
  const [tempImg, setTempImg] = useState<MediaItem>({
    title: '',
    description: '',
    mediaType: MediaType.IMAGE,
    uploadType: MediaUploadType.LINK,
    url: '',
    platformType: MediaPlatform.GOOGLE_DRIVE,
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
    setTempImg((prev) => ({ ...prev, url: objectURL, file }));
  };

  const resetForm = () => {
    setTempImg({
      title: '',
      description: '',
      mediaType: MediaType.IMAGE,
      uploadType: MediaUploadType.LINK,
      url: '',
      platformType: MediaPlatform.GOOGLE_DRIVE,
    });
    setFileName('');
    setEditingIndex(null);
    setErrors({ title: false, description: false, url: false });
  };

  const handleAddOrUpdate = () => {
    const isValid =
      tempImg.uploadType === MediaUploadType.UPLOAD ||
      validateMediaURL(tempImg.url, tempImg.platformType);
    const hasError =
      !tempImg.title ||
      !tempImg.description ||
      !tempImg.url ||
      (tempImg.uploadType === MediaUploadType.LINK && !isValid);

    setErrors({
      title: !tempImg.title,
      description: !tempImg.description,
      url: !tempImg.url || (tempImg.uploadType === MediaUploadType.LINK && !isValid),
    });

    if (hasError) return;

    const updated =
      editingIndex !== null
        ? images.map((img, i) => (i === editingIndex ? tempImg : img))
        : [...images, tempImg];

    setImages(updated);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setTempImg(images[index]);
    setFileName(images[index].file?.name || '');
    setEditingIndex(index);
  };

  const handleRemoveClick = (index: number) => {
    setItemToDelete(index);
    setOpenDeleteDialog(true);
  };

  const confirmRemove = () => {
    if (itemToDelete !== null) {
      setImages(images.filter((_, i) => i !== itemToDelete));
      setItemToDelete(null);
    }
    setOpenDeleteDialog(false);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Título da Imagem"
            fullWidth
            value={tempImg.title}
            onChange={(e) => setTempImg({ ...tempImg, title: e.target.value })}
            error={errors.title}
            helperText={errors.title ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Descrição da Imagem"
            fullWidth
            value={tempImg.description}
            onChange={(e) => setTempImg({ ...tempImg, description: e.target.value })}
            error={errors.description}
            helperText={errors.description ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tempImg.uploadType}
              label="Tipo"
              onChange={(e) =>
                setTempImg({
                  ...tempImg,
                  uploadType: e.target.value as MediaUploadType.LINK | MediaUploadType.UPLOAD,
                  platformType:
                    e.target.value === MediaUploadType.LINK
                      ? MediaPlatform.GOOGLE_DRIVE
                      : undefined,
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
        {tempImg.uploadType === 'link' && (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Plataforma</InputLabel>
                <Select
                  value={tempImg.platformType || ''}
                  label="Plataforma"
                  onChange={(e) =>
                    setTempImg({
                      ...tempImg,
                      platformType: e.target.value as MediaItem['platformType'],
                    })
                  }
                >
                  <MenuItem value="googledrive">Google Drive</MenuItem>
                  <MenuItem value="onedrive">OneDrive</MenuItem>
                  <MenuItem value="dropbox">Dropbox</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL da Imagem"
                fullWidth
                value={tempImg.url}
                onChange={(e) => setTempImg({ ...tempImg, url: e.target.value })}
                error={errors.url}
                helperText={errors.url ? 'URL inválida ou obrigatória' : ''}
              />
            </Grid>
          </>
        )}
        {tempImg.uploadType === MediaUploadType.UPLOAD && (
          <Grid item xs={12}>
            <Button variant="outlined" component="label">
              Upload de Imagem
              <input type="file" hidden accept="image/*" onChange={handleUpload} />
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
            {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar Imagem'}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        {images.map((img, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <Typography fontWeight="bold">{img.title}</Typography>
              <Typography variant="body2">{img.description}</Typography>
              {img.url && (
                <img
                  src={img.url}
                  alt={img.title}
                  style={{ width: '100%', marginTop: 8, borderRadius: 4 }}
                />
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
            Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.
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
