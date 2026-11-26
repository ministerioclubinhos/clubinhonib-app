import React, { Fragment, useEffect, useRef, useState } from 'react';
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
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/config/axiosConfig';

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
    audience?: string;
    media?: { url: string; originalName?: string; size?: number };
  };
}

/** Públicos aceitos por um evento. */
type EventAudience = 'all' | 'teachers' | 'coordinators';

const EVENT_AUDIENCES: EventAudience[] = ['all', 'teachers', 'coordinators'];

/** Público do evento; valor desconhecido cai em "todos". */
const toEventAudience = (value?: string): EventAudience =>
  EVENT_AUDIENCES.includes(value as EventAudience)
    ? (value as EventAudience)
    : 'all';

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
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [audience, setAudience] = useState<EventAudience>('all');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (initialData && open) {
      setTitle(initialData.title || '');

      if (initialData.date) {
        const isoString = initialData.date;
        const dateMatch = isoString.match(/^(\d{4}-\d{2}-\d{2})/);
        const timeMatch = isoString.match(/T(\d{2}:\d{2})/);

        if (dateMatch) setDate(dateMatch[1]);
        if (timeMatch) setTime(timeMatch[1]);
      } else {
        setDate('');
        setTime('');
      }
      setLocation(initialData.location || '');
      setDescription(initialData.description || '');
      setAudience(toEventAudience(initialData.audience));
      setImageFile(null);
      setExistingImageUrl(initialData.media?.url || null);
      setRemoveImage(false);
    } else {
      setTitle('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setTime('19:00');
      setLocation('');
      setDescription('');
      setAudience('all');
      setImageFile(null);
      setExistingImageUrl(null);
      setRemoveImage(false);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title || !date || !time || !location || !description || !audience) {
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

      const dateTimeLocal = `${date}T${time}:00`;
      const dateObj = new Date(dateTimeLocal);
      const isoDateTimeUtc = dateObj.toISOString();

      const eventData = {
        ...(mode === 'edit' && initialData?.id ? { id: initialData.id } : {}),
        title: title.trim(),
        date: isoDateTimeUtc,
        audience,
        location: location.trim(),
        description: description.trim(),
        media: {
          title: title.trim(),
          description: `Imagem do evento: ${title.trim()}`,
          mediaType: 'image',
          uploadType: 'upload',
          isLocalFile: !!imageFile,
          ...(imageFile ? { originalName: imageFile.name, size: imageFile.size } : {}),
          ...(mode === 'edit' && initialData?.media && !imageFile && !removeImage
            ? { url: initialData.media.url }
            : {}),
          ...(removeImage ? { url: null } : {}),
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
    <Fragment>
      <Dialog data-testid="event-event-form-modal" open={open} onClose={onClose} fullWidth maxWidth="sm">
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
            <Box display="flex" gap={2}>
              <TextField
                label="Data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  placeholder: 'DD/MM/YYYY',
                }}
              />
              <TextField
                label="Hora (24h)"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: 60,
                  pattern: '[0-23]:[0-59]',
                }}
              />
            </Box>
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
            <TextField
              label="Público"
              select
              value={audience}
              onChange={(e) => setAudience(e.target.value as 'all' | 'teachers' | 'coordinators')}
              fullWidth
              required
            >
              <MenuItem value="all">Público em Geral</MenuItem>
              <MenuItem value="teachers">Professores</MenuItem>
              <MenuItem value="coordinators">Coordenadores</MenuItem>
            </TextField>

            <Box>
              {existingImageUrl && !removeImage && !imagePreview && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Imagem Atual:</span>
                    <IconButton
                      size="small"
                      onClick={() => setRemoveImage(true)}
                      sx={{ color: 'error.main' }}
                     aria-label="Excluir">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <img
                    src={existingImageUrl}
                    alt="Imagem do evento"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}

              {imagePreview && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nova Imagem (Preview):</span>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      sx={{ color: 'error.main' }}
                     aria-label="Excluir">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <img
                    src={imagePreview}
                    alt="Preview da nova imagem"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}

              {removeImage && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => {
                    setRemoveImage(false);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  sx={{ mb: 2 }}
                >
                  Cancelar Remoção
                </Button>
              )}

              {!imagePreview && (
                <Button variant="outlined" component="label" fullWidth>
                  {imageFile?.name || 'Selecionar Imagem'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </Button>
              )}
            </Box>
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
      <Snackbar data-testid="event-event-form-modal"
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};

export default EventFormModal;