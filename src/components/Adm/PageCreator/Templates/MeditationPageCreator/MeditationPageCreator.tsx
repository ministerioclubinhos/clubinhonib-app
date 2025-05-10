import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Stack,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import {
  clearMeditationData,
  clearMedia,
  DayItem,
} from '@/store/slices/meditation/meditationSlice';
import MeditationForm from './MeditationForm';
import { AxiosError } from 'axios';
import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from 'store/slices/types';
import MediaManager from './MediaManager';

interface Props {
  fromTemplatePage?: boolean;
}

function isMonday(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').getDay() === 1;
}

function isFriday(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').getDay() === 5;
}

export default function MeditationPageCreator({ fromTemplatePage }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const meditationData = useSelector((state: RootState) => state.meditation.meditationData);

  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<MediaUploadType>(MediaUploadType.LINK);
  const [url, setUrl] = useState('');
  const [platformType, setPlatformType] = useState<MediaPlatform>(MediaPlatform.ANY);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState<DayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (fromTemplatePage) {
      dispatch(clearMeditationData());
      dispatch(clearMedia());
      setTopic('');
      setFile(null);
      setUploadType(MediaUploadType.LINK);
      setUrl('');
      setPlatformType(MediaPlatform.ANY);
      setStartDate('');
      setEndDate('');
      setDays([]);
    }
  }, [fromTemplatePage, dispatch]);

  useEffect(() => {
    if (!fromTemplatePage && meditationData) {
      setTopic(meditationData.topic);
      setStartDate(meditationData.startDate);
      setEndDate(meditationData.endDate);
      setDays(meditationData.days);

      if (meditationData.media) {
        setUploadType(meditationData.media.uploadType);
        setUrl(meditationData.media.url ?? '');
        setPlatformType(meditationData.media.platformType ?? MediaPlatform.ANY);
      }
    }
  }, [fromTemplatePage, meditationData]);

  const handleSave = async () => {
    if (!topic || !startDate || !endDate) {
      setSnackbar({
        open: true,
        message: 'Informe tema, data de início e fim.',
        severity: 'error',
      });
      return;
    }

    if (!isMonday(startDate)) {
      setSnackbar({
        open: true,
        message: 'A data de início deve ser uma segunda-feira.',
        severity: 'error',
      });
      return;
    }

    if (!isFriday(endDate)) {
      setSnackbar({
        open: true,
        message: 'A data de término deve ser uma sexta-feira.',
        severity: 'error',
      });
      return;
    }

    if (days.length !== 5) {
      setSnackbar({
        open: true,
        message: 'Adicione exatamente 5 dias de meditação.',
        severity: 'error',
      });
      return;
    }

    if (
      (uploadType === MediaUploadType.LINK && !url.trim()) ||
      (uploadType === MediaUploadType.UPLOAD && !file)
    ) {
      setSnackbar({
        open: true,
        message: 'Informe um link válido ou envie um arquivo.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (uploadType === MediaUploadType.UPLOAD && file) {
        formData.append('file', file);
      }

      const media: MediaItem = {
        title: topic.trim(),
        description: `Meditação da semana de ${startDate} a ${endDate}`,
        mediaType: MediaType.DOCUMENT,
        uploadType,
        url: uploadType === MediaUploadType.LINK ? url.trim() : '',
        isLocalFile: uploadType === MediaUploadType.UPLOAD,
        ...(file ? { originalName: file.name, size: file.size } : {}),
        ...(uploadType === MediaUploadType.LINK ? { platformType } : {}),
      };

      const meditationDataPayload = {
        ...(fromTemplatePage ? {} : { id: meditationData?.id }),
        topic: topic.trim(),
        startDate,
        endDate,
        media,
        days: days.map((day) => ({
          day: day.day,
          verse: day.verse.trim(),
          topic: day.topic.trim(),
        })),
      };

      formData.append('meditationData', JSON.stringify(meditationDataPayload));

      fromTemplatePage
        ? await api.post('/meditations', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.patch(`/meditations/${meditationData?.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

      await dispatch(fetchRoutes());
      setSnackbar({ open: true, message: 'Meditação salva com sucesso!', severity: 'success' });
      navigate('/adm/meditacoes');
    } catch (error) {
      const errMessage =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'Erro ao salvar meditação.';
      setSnackbar({ open: true, message: errMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '95%',
        mt: { xs: 0, md: 4 },
        mb: { xs: 0, md: 0 },
        pt: { xs: 2, md: 0 },
        pb: { xs: 0, md: 2 },
        px: 0,
      }}
    >
      <Typography variant="h4" mb={3} fontWeight="bold" textAlign="center">
        {fromTemplatePage ? 'Criar Meditação da Semana' : 'Editar Meditação'}
      </Typography>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 5 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Tema da Meditação"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Data de Início"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              fullWidth
              type="date"
              label="Data de Término"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Stack>

          <MediaManager
            uploadType={uploadType}
            setUploadType={setUploadType}
            file={file}
            setFile={setFile}
            url={url}
            setUrl={setUrl}
            platformType={platformType}
            setPlatformType={setPlatformType}
          />
        </Stack>
      </Paper>

      <MeditationForm days={days} onDaysChange={setDays} />

      <Box textAlign="center" mt={6}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar Meditação'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
