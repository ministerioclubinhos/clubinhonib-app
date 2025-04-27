import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store/slices';
import { fetchRoutes } from '../../../../../store/slices/route/routeSlice';
import { clearWeekMaterialData } from '../../../../../store/slices/week-material/weekMaterialSlice';
import WeekVideos from './WeekVideos';
import WeekDocuments from './WeekDocuments';
import WeekAudios from './WeekAudios';
import WeekImages from './WeekImages';
import api from '../../../../../config/axiosConfig';
import { MediaItem, MediaType, MediaUploadType } from 'store/slices/types';
import { url } from 'inspector';

interface WeekMaterialPageCreatorProps {
  fromTemplatePage?: boolean;
}

interface FileItem {
  uploadType: MediaUploadType;
  url?: string;
  file?: File;
  [key: string]: any;
}

function buildFileItem<T extends FileItem>(
  item: T,
  index: number,
  prefix: string,
  formData: FormData
): T & { fileField?: string } {
  if (item.uploadType === MediaUploadType.UPLOAD && item.file instanceof File) {
    const extension = item.file.name.split('.').pop() || 'bin';
    const filename = `${prefix}_${index}.${extension}`;
    formData.append(filename, item.file, filename);

    return {
      ...item,
      url: undefined,
      fileField: filename,
    };
  }

  return {
    ...item,
    fileField: undefined,
  };
}

export default function WeekMaterialPageCreator({
  fromTemplatePage,
}: WeekMaterialPageCreatorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const weekMaterialSData = useSelector((state: RootState) => state.weekMaterial.weekMaterialSData);

  const [pageTitle, setPageTitle] = useState('');
  const [pageSubtitle, setPageSubtitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [tab, setTab] = useState(0);

  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);

  const [errors, setErrors] = useState({
    title: false,
    subtitle: false,
    description: false,
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (fromTemplatePage) {
      dispatch(clearWeekMaterialData());
      setPageTitle('');
      setPageSubtitle('');
      setPageDescription('');
      setVideos([]);
      setDocuments([]);
      setImages([]);
      setAudios([]);
    }
  }, [fromTemplatePage, dispatch]);

  useEffect(() => {
    if (!fromTemplatePage && weekMaterialSData) {
      setPageTitle(weekMaterialSData.title);
      setPageSubtitle(weekMaterialSData.subtitle);
      setPageDescription(weekMaterialSData.description);
      setVideos(weekMaterialSData.videos);
      setDocuments(weekMaterialSData.documents);
      setImages(weekMaterialSData.images);
      setAudios(weekMaterialSData.audios);
    }
  }, [fromTemplatePage, weekMaterialSData]);

  const handleSavePage = async () => {
    const hasError = !pageTitle || !pageSubtitle || !pageDescription;

    setErrors({
      title: !pageTitle,
      subtitle: !pageSubtitle,
      description: !pageDescription,
    });

    if (hasError) {
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

      const processedVideos = videos.map((v, i) => buildFileItem(v, i, 'video', formData));
      const processedDocs = documents.map((d, i) => buildFileItem(d, i, 'document', formData));
      const processedImgs = images.map((i, n) => buildFileItem(i, n, 'image', formData));
      const processedAudios = audios.map((a, x) => buildFileItem(a, x, 'audio', formData));
      console.log("processedVideos: ", processedVideos);


      const mapItem = (item: MediaItem & { fileField?: string }, type: MediaType) => ({
        ...(item.id && { id: item.id }),
        title: item.title,
        description: item.description,
        mediaType: type,
        uploadType: item.uploadType,
        isLocalFile: item.uploadType === MediaUploadType.UPLOAD,
        url: item.url,
        platformType:
          item.uploadType === MediaUploadType.UPLOAD ? null : (item.platformType ?? null),
        ...(item.uploadType === MediaUploadType.LINK && item.url && { url: item.url }),
        ...(item.uploadType === MediaUploadType.UPLOAD &&
          item.fileField && {
          fieldKey: item.fileField,
        }),
        ...(item.uploadType === MediaUploadType.UPLOAD &&
          item.size && {
          size: item.size,
        }),
      });

      const payload = {
        ...(fromTemplatePage ? {} : { id: weekMaterialSData?.id }),
        pageTitle,
        pageSubtitle,
        pageDescription,
        videos: processedVideos.map((v) => mapItem(v, MediaType.VIDEO)),
        documents: processedDocs.map((d) => mapItem(d, MediaType.DOCUMENT)),
        images: processedImgs.map((i) => mapItem(i, MediaType.IMAGE)),
        audios: processedAudios.map((a) => mapItem(a, MediaType.AUDIO)),
      };

      formData.append('weekMaterialsPageData', JSON.stringify(payload));

      const res = fromTemplatePage
        ? await api.post('/week-material-pages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        : await api.patch(`/week-material-pages/${weekMaterialSData?.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

      if (!res?.data) throw new Error('Erro ao salvar');

      await dispatch(fetchRoutes());

      setSnackbar({
        open: true,
        message: 'Página salva com sucesso!',
        severity: 'success',
      });

      navigate(`/${res.data.route.path}`);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar a página.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ p: 0, m: 0, mt: fromTemplatePage ? 0 : 10, width: '98%', maxWidth: 1000, mx: 'auto' }}
    >
      <Typography
        variant="h3"
        mb={3}
        fontWeight="bold"
        textAlign="center"
        sx={{ mt: { xs: 0, md: 0 }, mb: { xs: 1, md: 3 }, fontSize: { xs: '1.5rem', md: '2rem' } }}
      >
        {fromTemplatePage ? 'Adicionar Semana' : 'Editar Semana'}
      </Typography>

      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
        <TextField
          label="Semana"
          fullWidth
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          error={errors.title}
          helperText={errors.title ? 'Campo obrigatório' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tema da Semana"
          fullWidth
          value={pageSubtitle}
          onChange={(e) => setPageSubtitle(e.target.value)}
          error={errors.subtitle}
          helperText={errors.subtitle ? 'Campo obrigatório' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descrição do Tema da Semana"
          fullWidth
          multiline
          rows={3}
          value={pageDescription}
          onChange={(e) => setPageDescription(e.target.value)}
          error={errors.description}
          helperText={errors.description ? 'Campo obrigatório' : ''}
        />
      </Box>
      <Typography variant="h5" mb={3} fontWeight="bold" textAlign="center">
        {fromTemplatePage ? 'Materiais da Semana' : 'Materiais da Semana'}
      </Typography>

      <Tabs value={tab} onChange={(_, val) => setTab(val)} centered>
        <Tab label="Vídeos" />
        <Tab label="Doc" />
        <Tab label="Img" />
        <Tab label="Áudio" />
      </Tabs>
      <Divider sx={{ my: 3 }} />

      {tab === 0 && <WeekVideos videos={videos} setVideos={setVideos} />}
      {tab === 1 && <WeekDocuments documents={documents} setDocuments={setDocuments} />}
      {tab === 2 && <WeekImages images={images} setImages={setImages} />}
      {tab === 3 && <WeekAudios audios={audios} setAudios={setAudios} />}

      <Box textAlign="center" mt={6}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSavePage}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar Página'}
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
