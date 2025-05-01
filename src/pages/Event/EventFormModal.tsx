import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../config/axiosConfig';

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  mode: 'add' | 'edit';
  initialData?: {
    id?: string;
    title: string;
    date: string;
    location: string;
    description: string;
    media?: { url: string; originalName?: string; size?: number };
  };
}

const EventFormModal: React.FC<EventFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  mode,
  initialData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (initialData && open) {
      setTitle(initialData.title || '');
      setDate(initialData.date || '');
      setLocation(initialData.location || '');
      setDescription(initialData.description || '');
      setImageFile(null);
    } else {
      setTitle('');
      setDate('');
      setLocation('');
      setDescription('');
      setImageFile(null);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!title || !date || !location || !description) {
      setSnackbar({
        open: true,
        message: 'Preencha todos os campos obrigatórios.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append('file', imageFile);
      }

      const eventData = {
        ...(mode === 'edit' && initialData?.id ? { id: initialData.id } : {}),
        title: title.trim(),
        date,
        location: location.trim(),
        description: description.trim(),
        media: {
          title: title.trim(),
          description: `Imagem do evento: ${title.trim()}`,
          mediaType: 'image',
          uploadType: 'upload',
          isLocalFile: !!imageFile,
          ...(imageFile ? { originalName: imageFile.name, size: imageFile.size } : {}),
          ...(mode === 'edit' && initialData?.media && !imageFile
            ? { url: initialData.media.url }
            : {}),
        },
      };

      formData.append('eventData', JSON.stringify(eventData));

      if (mode === 'add') {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (mode === 'edit' && initialData?.id) {
        await api.patch(`/events/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await onSuccess();
      setSnackbar({
        open: true,
        message: `Evento ${mode === 'add' ? 'criado' : 'atualizado'} com sucesso!`,
        severity: 'success',
      });
      onClose();
    } catch (error) {
      const errMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Erro ao salvar evento.';
      setSnackbar({ open: true, message: errMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif' }}>
          {mode === 'add' ? 'Adicionar Evento' : 'Editar Evento'}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Local"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Button variant="outlined" component="label">
              {imageFile?.name || 'Selecionar Imagem'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {mode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventFormModal;