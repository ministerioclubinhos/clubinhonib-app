import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
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
import { MediaItem,MediaType, MediaUploadType } from 'store/slices/types';

interface ImagesProps {
  images: MediaItem[];
  setImages: (imgs: MediaItem[]) => void;
  ideaTitle?: string;
}

export function IdeasMaterialImages({ images, setImages, ideaTitle }: ImagesProps) {
  const [tempImg, setTempImg] = useState<MediaItem>({
    title: '',
    description: '',
    mediaType: MediaType.IMAGE,
    uploadType: MediaUploadType.UPLOAD,
    url: '',
    platformType: undefined,
  });
  const [fileName, setFileName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({ title: false, description: false, url: false });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (editingIndex === null) {
      const count = images.length + 1;
      const autoTitle = ideaTitle
        ? `Imagem ${count} da ideia "${ideaTitle}"`
        : `Imagem ${count} da ideia`;
      const autoDesc = ideaTitle
        ? `Imagem ${count} para auxiliar na ideia "${ideaTitle}"`
        : `Imagem ${count} para auxiliar na ideia`;

      setTempImg((prev) => ({
        ...prev,
        title: autoTitle,
        description: autoDesc,
      }));
    }
  }, [ideaTitle, images.length, editingIndex]);

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
      uploadType: MediaUploadType.UPLOAD,
      url: '',
      platformType: undefined,
    });
    setFileName('');
    setEditingIndex(null);
    setErrors({ title: false, description: false, url: false });
  };

  const handleAddOrUpdate = () => {
    const isValid = tempImg.uploadType === MediaUploadType.UPLOAD; // Only upload supported
    const hasError = !tempImg.title || !tempImg.description || !tempImg.url;

    setErrors({
      title: !tempImg.title,
      description: !tempImg.description,
      url: !tempImg.url,
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
                  {tempImg.title}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
                  Descrição Automática
                </Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.2, mt: 0.5 }}>
                  {tempImg.description}
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Button variant="outlined" component="label" fullWidth sx={{ height: '56px' }}>
            {fileName ? 'Trocar Imagem' : 'Upload de Imagem'}
            <input type="file" hidden accept="image/*" onChange={handleUpload} />
          </Button>
          {fileName && (
            <Typography variant="body2" mt={1} textAlign="center">
              Arquivo selecionado: <strong>{fileName}</strong>
            </Typography>
          )}
          {errors.url && (
            <Typography variant="caption" color="error" display="block" textAlign="center">
              Selecione um arquivo para continuar.
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={handleAddOrUpdate} sx={{ mt: 2 }}>
            {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar Imagem'}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        {images.map((img, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
