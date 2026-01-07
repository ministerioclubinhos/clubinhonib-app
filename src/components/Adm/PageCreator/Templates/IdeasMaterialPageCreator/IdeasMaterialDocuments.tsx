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
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { validateMediaURL } from 'utils/validateMediaURL';
import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from 'store/slices/types';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';

interface DocumentsProps {
  documents: MediaItem[];
  setDocuments: (docs: MediaItem[]) => void;
}

export function IdeasMaterialDocuments({ documents, setDocuments }: DocumentsProps) {
  const [tempDoc, setTempDoc] = useState<MediaItem>({
    title: '',
    description: '',
    mediaType: MediaType.DOCUMENT,
    uploadType: MediaUploadType.LINK,
    url: '',
    platformType: MediaPlatform.GOOGLE_DRIVE,
  });
  const [fileName, setFileName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({ title: false, description: false, url: false });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<MediaItem | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const objectURL = URL.createObjectURL(file);
    setTempDoc((prev) => ({ ...prev, url: objectURL, file }));
  };

  const resetForm = () => {
    setTempDoc({
      title: '',
      description: '',
      mediaType: MediaType.DOCUMENT,
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
      tempDoc.uploadType === MediaUploadType.UPLOAD ||
      validateMediaURL(tempDoc.url, tempDoc.platformType);
    const hasError =
      !tempDoc.title ||
      !tempDoc.description ||
      !tempDoc.url ||
      (tempDoc.uploadType === MediaUploadType.LINK && !isValid);

    setErrors({
      title: !tempDoc.title,
      description: !tempDoc.description,
      url: !tempDoc.url || (tempDoc.uploadType === MediaUploadType.LINK && !isValid),
    });

    if (hasError) return;

    const updated =
      editingIndex !== null
        ? documents.map((doc, i) => (i === editingIndex ? tempDoc : doc))
        : [...documents, tempDoc];

    setDocuments(updated);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setTempDoc(documents[index]);
    setFileName(documents[index].file?.name || '');
    setEditingIndex(index);
  };

  const handleRemoveClick = (index: number) => {
    setItemToDelete(index);
    setOpenDeleteDialog(true);
  };

  const confirmRemove = () => {
    if (itemToDelete !== null) {
      setDocuments(documents.filter((_, i) => i !== itemToDelete));
      setItemToDelete(null);
    }
    setOpenDeleteDialog(false);
  };

  const handlePreview = (document: MediaItem) => {
    setPreviewDocument(document);
    setOpenPreviewModal(true);
  };

  const canPreview = (document: MediaItem): boolean => {
    if (document.uploadType === MediaUploadType.UPLOAD || document.isLocalFile) {
      return true;
    }
    if (document.uploadType === MediaUploadType.LINK) {
      return document.platformType === MediaPlatform.GOOGLE_DRIVE;
    }
    return false;
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Título"
            fullWidth
            value={tempDoc.title}
            onChange={(e) => setTempDoc({ ...tempDoc, title: e.target.value })}
            error={errors.title}
            helperText={errors.title ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Descrição"
            fullWidth
            value={tempDoc.description}
            onChange={(e) => setTempDoc({ ...tempDoc, description: e.target.value })}
            error={errors.description}
            helperText={errors.description ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tempDoc.uploadType}
              label="Tipo"
              onChange={(e) =>
                setTempDoc({
                  ...tempDoc,
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
        {tempDoc.uploadType === MediaUploadType.LINK && (
          <Fragment>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Plataforma</InputLabel>
                <Select
                  value={tempDoc.platformType || ''}
                  label="Plataforma"
                  onChange={(e) =>
                    setTempDoc({
                      ...tempDoc,
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
                label="URL do Documento"
                fullWidth
                value={tempDoc.url}
                onChange={(e) => setTempDoc({ ...tempDoc, url: e.target.value })}
                error={errors.url}
                helperText={errors.url ? 'URL inválida ou obrigatória' : ''}
              />
            </Grid>
          </Fragment>
        )}
        {tempDoc.uploadType === MediaUploadType.UPLOAD && (
          <Grid item xs={12}>
            <Button variant="outlined" component="label">
              Upload de Documento
              <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleUpload} />
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
            {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar Documento'}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {documents.map((doc, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Box
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'primary.light',
                    borderRadius: '12px',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '48px',
                    height: '48px',
                  }}
                >
                  <Typography sx={{ fontSize: '1.2rem' }}>📄</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight="bold" sx={{ mb: 1, fontSize: '1.1rem' }}>
                    {doc.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {doc.description}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {canPreview(doc) && (
                  <Tooltip title="Visualizar">
                    <IconButton onClick={() => handlePreview(doc)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                )}
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
            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmRemove} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <MediaDocumentPreviewModal
        open={openPreviewModal}
        onClose={() => {
          setOpenPreviewModal(false);
          setPreviewDocument(null);
        }}
        media={previewDocument}
        title={previewDocument?.title}
      />
    </Box>
  );
}
