import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDocumentData,
  setMedia,
  clearDocumentData,
  clearMedia,
} from 'store/slices/documents/documentSlice';
import { RootState } from 'store/slices';
import api from '@/config/axiosConfig';
import { MediaItem, MediaType, MediaUploadType, MediaPlatform } from 'store/slices/types';
import DocumentMediaForm from './DocumentMediaForm';

interface DocumentFormProps {
  isEditing: boolean;
  onSuccess: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ isEditing, onSuccess }) => {
  const dispatch = useDispatch();
  const documentData = useSelector((state: RootState) => state.document.documentData);
  const mediaData = useSelector((state: RootState) => state.document.media);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaDescription, setMediaDescription] = useState('');
  const [uploadType, setUploadType] = useState<MediaUploadType>(MediaUploadType.LINK);
  const [url, setUrl] = useState('');
  const [platformType, setPlatformType] = useState<MediaPlatform>(MediaPlatform.ANY);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMediaForm, setShowMediaForm] = useState(isEditing);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (isEditing && documentData) {
      setName(documentData.name);
      setDescription(documentData.description || '');
      if (mediaData) {
        setMediaTitle(mediaData.title);
        setMediaDescription(mediaData.description || '');
        setUploadType(mediaData.uploadType);
        setUrl(mediaData.url || '');
        setPlatformType(mediaData.platformType ?? MediaPlatform.ANY);
      }
    } else {
      dispatch(clearDocumentData());
      dispatch(clearMedia());
      resetForm();
    }
  }, [isEditing, documentData, mediaData, dispatch]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setMediaTitle('');
    setMediaDescription('');
    setUploadType(MediaUploadType.LINK);
    setUrl('');
    setPlatformType(MediaPlatform.ANY);
    setFile(null);
    setShowMediaForm(false);
  };

  const clearMediaFields = () => {
    setMediaTitle('');
    setMediaDescription('');
    setUploadType(MediaUploadType.LINK);
    setUrl('');
    setPlatformType(MediaPlatform.ANY);
    setFile(null);
    dispatch(clearMedia());
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setSnackbar({ open: true, message: 'O nome do documento é obrigatório.', severity: 'error' });
      return;
    }
    if (!description.trim()) {
      setSnackbar({
        open: true,
        message: 'A descrição do documento é obrigatória.',
        severity: 'error',
      });
      return;
    }
    if (!mediaTitle.trim()) {
      setSnackbar({ open: true, message: 'O título da mídia é obrigatório.', severity: 'error' });
      return;
    }
    if (!uploadType) {
      setSnackbar({ open: true, message: 'O tipo de upload é obrigatório.', severity: 'error' });
      return;
    }
    if (uploadType === MediaUploadType.LINK && !url.trim()) {
      setSnackbar({ open: true, message: 'A URL da mídia é obrigatória.', severity: 'error' });
      return;
    }
    if (uploadType === MediaUploadType.UPLOAD && !file && (!isEditing || !mediaData?.isLocalFile)) {
      setSnackbar({ open: true, message: 'O arquivo da mídia é obrigatório.', severity: 'error' });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      const mediaDto: MediaItem = {
        id: isEditing && mediaData?.id ? mediaData.id : undefined,
        title: mediaTitle,
        description: mediaDescription || '',
        uploadType,
        mediaType: MediaType.DOCUMENT,
        isLocalFile: uploadType === MediaUploadType.UPLOAD,
        url: uploadType === MediaUploadType.LINK ? url : '',
        platformType: uploadType === MediaUploadType.LINK ? platformType : undefined,
        originalName: uploadType === MediaUploadType.UPLOAD && file ? file.name : undefined,
        size: uploadType === MediaUploadType.UPLOAD && file ? file.size : undefined,
        fileField: uploadType === MediaUploadType.UPLOAD ? 'file' : undefined,
      };

      const documentDto = {
        ...(isEditing && documentData?.id ? { id: documentData.id } : {}),
        name,
        description: description,
        media: mediaDto,
      };

      if (uploadType === MediaUploadType.UPLOAD && file) {
        formData.append('file', file);
      }

      formData.append('documentData', JSON.stringify(documentDto));

      if (isEditing && documentData?.id) {
        await api.patch(`/documents/${documentData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      dispatch(setDocumentData(documentDto));
      dispatch(setMedia(mediaDto));
      onSuccess();

      if (!isEditing) resetForm();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      setSnackbar({ open: true, message: 'Erro ao salvar documento.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome do Documento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            required
          />
        </Grid>

        {!showMediaForm && !isEditing && (
          <Grid item xs={12}>
            <Button variant="outlined" onClick={() => setShowMediaForm(true)}>
              Adicionar Documento
            </Button>
          </Grid>
        )}

        {showMediaForm && (
          <>
            <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
              <Box component="h3" fontSize="1.25rem" fontWeight="bold">
                Mídia do Documento
              </Box>
              <Button variant="text" color="error" onClick={clearMediaFields}>
                Remover
              </Button>
            </Grid>

            <DocumentMediaForm
              mediaTitle={mediaTitle}
              setMediaTitle={setMediaTitle}
              mediaDescription={mediaDescription}
              setMediaDescription={setMediaDescription}
              uploadType={uploadType}
              setUploadType={setUploadType}
              url={url}
              setUrl={setUrl}
              platformType={platformType}
              setPlatformType={setPlatformType}
              file={file}
              setFile={setFile}
            />
          </>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentForm;
