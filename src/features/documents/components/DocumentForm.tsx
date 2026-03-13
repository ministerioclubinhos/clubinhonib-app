import React, { Fragment, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Paper,
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { useDispatch, useSelector } from 'react-redux';
import { setDocumentData, setMedia, clearDocumentData, clearMedia } from 'store/slices/documents/documentSlice';
import { RootState } from 'store/slices';
import { MediaItem, MediaType, MediaUploadType, MediaPlatform } from '../types';
import DocumentMediaForm from './DocumentMediaForm';
import { createDocument, updateDocument } from '../api';
import { GENERIC_ERROR_MESSAGES, FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

interface Props {
  isEditing: boolean;
  onSuccess: () => void;
}

const DocumentForm: React.FC<Props> = ({ isEditing, onSuccess }) => {
  const dispatch = useDispatch();
  const documentData = useSelector((s: RootState) => s.document.documentData);
  const mediaData = useSelector((s: RootState) => s.document.media);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadType, setUploadType] = useState<MediaUploadType>(MediaUploadType.LINK);
  const [url, setUrl] = useState('');
  const [platformType, setPlatformType] = useState<MediaPlatform>(MediaPlatform.ANY);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMediaForm, setShowMediaForm] = useState(isEditing);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (isEditing && documentData) {
      setName(documentData.name);
      setDescription(documentData.description || '');
      if (mediaData) {
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
    setUploadType(MediaUploadType.LINK);
    setUrl('');
    setPlatformType(MediaPlatform.ANY);
    setFile(null);
    setShowMediaForm(false);
  };

  const clearMediaFields = () => {
    setUploadType(MediaUploadType.LINK);
    setUrl('');
    setPlatformType(MediaPlatform.ANY);
    setFile(null);
    dispatch(clearMedia());
  };

  const handleSubmit = async () => {
    if (!name.trim()) return setSnackbar({ open: true, message: FORM_VALIDATION_MESSAGES.REQUIRED_FIELD, severity: 'error' });
    if (!description.trim()) return setSnackbar({ open: true, message: FORM_VALIDATION_MESSAGES.REQUIRED_FIELD, severity: 'error' });
    if (!uploadType) return setSnackbar({ open: true, message: FORM_VALIDATION_MESSAGES.REQUIRED_FIELD, severity: 'error' });
    if (uploadType === MediaUploadType.LINK && !url.trim()) return setSnackbar({ open: true, message: FORM_VALIDATION_MESSAGES.REQUIRED_FIELD, severity: 'error' });
    if (uploadType === MediaUploadType.UPLOAD && !file && (!isEditing || !mediaData?.isLocalFile))
      return setSnackbar({ open: true, message: FORM_VALIDATION_MESSAGES.REQUIRED_FIELD, severity: 'error' });

    setLoading(true);
    try {
      const formData = new FormData();

      const mediaDto: MediaItem = {
        id: isEditing && mediaData?.id ? mediaData.id : undefined,
        title: name,
        description: description || '',
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
        description,
        media: mediaDto,
      };

      if (uploadType === MediaUploadType.UPLOAD && file) {
        formData.append('file', file);
      }
      formData.append('documentData', JSON.stringify(documentDto));

      if (isEditing && documentData?.id) {
        await updateDocument(documentData.id, formData);
      } else {
        await createDocument(formData);
      }

      dispatch(setDocumentData(documentDto));
      dispatch(setMedia(mediaDto));
      onSuccess();

      if (!isEditing) resetForm();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      setSnackbar({ open: true, message: GENERIC_ERROR_MESSAGES.TRY_AGAIN, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 2 }}>
        Informações do documento
      </Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome do documento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Grid>
      </Grid>

      {!showMediaForm && !isEditing && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddLinkIcon />}
            onClick={() => setShowMediaForm(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Adicionar arquivo ou link
          </Button>
        </Box>
      )}

      {showMediaForm && (
        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Mídia do documento
            </Typography>
            <Button variant="text" color="error" size="small" onClick={clearMediaFields} sx={{ textTransform: 'none' }}>
              Remover mídia
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            O título e a descrição da mídia são os mesmos do documento (informações acima).
          </Typography>
          <Grid container spacing={2.5}>
            <DocumentMediaForm
              uploadType={uploadType}
              setUploadType={setUploadType}
              url={url}
              setUrl={setUrl}
              platformType={platformType}
              setPlatformType={setPlatformType}
              file={file}
              setFile={setFile}
              existingMedia={
                isEditing && mediaData
                  ? mediaData.isLocalFile
                    ? { type: 'upload', fileName: mediaData.originalName || 'Arquivo enviado' }
                    : mediaData.url
                      ? { type: 'link', url: mediaData.url }
                      : null
                  : null
              }
            />
          </Grid>
        </Paper>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon />}
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.25,
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: '#81d742',
            '&:hover': { bgcolor: '#6bb83a' },
          }}
        >
          {loading ? 'Salvando...' : isEditing ? 'Atualizar documento' : 'Criar documento'}
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentForm;
