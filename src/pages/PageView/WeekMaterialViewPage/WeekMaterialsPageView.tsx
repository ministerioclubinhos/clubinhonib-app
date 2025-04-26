import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../config/axiosConfig';
import { fetchRoutes } from 'store/slices/route/routeSlice';
import { RootState, AppDispatch } from 'store/slices';
import {
  setWeekMaterialData,
  WeekMaterialPageData,
} from 'store/slices/week-material/weekMaterialSlice';
import WeekDocumentViewer from './WeekDocumentViewer';
import WeekImageGalleryView from './WeekImageGalleryView';
import WeekAudioPlayerView from './WeekAudioPlayerView';
import WeekVideoPlayerView from './WeekVideoPlayerView';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { MediaItem } from 'store/slices/types';

interface WeekMaterialsPageViewProps {
  idToFetch: string;
}
interface VideoProps {
  video: MediaItem;
}
interface DocumentProps {
  document: MediaItem;
}

interface ImageProps {
  image: MediaItem;
}

interface AudioProps {
  audio: MediaItem;
}

interface MediaType {
  label: string;
  items: MediaItem[];
  component:
    | React.ComponentType<VideoProps>
    | React.ComponentType<DocumentProps>
    | React.ComponentType<ImageProps>
    | React.ComponentType<AudioProps>;
  propName: 'video' | 'document' | 'image' | 'audio';
}

export default function WeekMaterialsPageView({ idToFetch }: WeekMaterialsPageViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyMaterials, setWeekMaterials] = useState<WeekMaterialPageData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      console.log('📡 Buscando materiais de estudo por ID:', idToFetch);
      try {
        const response = await api.get(`/week-material-pages/${idToFetch}`);
        setWeekMaterials(response.data);
        dispatch(setWeekMaterialData(response.data));
        console.log('✅ Dados recebidos da API:', response.data);
      } catch (err) {
        console.error('❌ Erro ao buscar materiais de estudo:', err);
        setError('Erro ao carregar os materiais de estudo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idToFetch, dispatch]);

  const handleDeletePage = async () => {
    try {
      if (!studyMaterials?.id) return;
      setIsDeleting(true);
      await api.delete(`/week-material-pages/${studyMaterials.id}`);
      await dispatch(fetchRoutes());
      navigate('/');
    } catch (err) {
      console.error('❌ Erro ao excluir a página:', err);
      setError('Erro ao excluir a página. Tente novamente mais tarde.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleEdit = () => {
    navigate('/adm/editar-pagina-semana', { state: { fromTemplatePage: false } });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 10 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!studyMaterials) {
    return (
      <Container sx={{ mt: 10 }}>
        <Typography align="center">Nenhum material de estudo encontrado.</Typography>
      </Container>
    );
  }

  const { title, subtitle, description, videos, documents, images, audios } = studyMaterials;
  const hasContent = videos?.length || documents?.length || images?.length || audios?.length;

  if (!hasContent) {
    return (
      <Container sx={{ mt: 10 }}>
        <Typography align="center">Nenhum material de estudo disponível.</Typography>
      </Container>
    );
  }

  const mediaTypes = [
    {
      label: isMobile ? '🎬' : '🎬 Vídeos',
      items: videos || [],
      component: WeekVideoPlayerView,
      propName: 'video' as const,
    },
    {
      label: isMobile ? '📄' : '📄 Documentos',
      items: documents || [],
      component: WeekDocumentViewer,
      propName: 'document' as const,
    },
    {
      label: isMobile ? '🖼️' : '🖼️ Imagens',
      items: images || [],
      component: WeekImageGalleryView,
      propName: 'image' as const,
    },
    {
      label: isMobile ? '🎧' : '🎧 Áudios',
      items: audios || [],
      component: WeekAudioPlayerView,
      propName: 'audio' as const,
    },
  ];

  const filteredMediaTypes: MediaType[] = mediaTypes.filter((type) => type.items.length > 0);

  const renderMediaComponent = (type: MediaType, item: MediaItem) => {
    switch (type.propName) {
      case 'video':
        return <WeekVideoPlayerView video={item} />;
      case 'document':
        return <WeekDocumentViewer document={item} />;
      case 'image':
        return <WeekImageGalleryView image={item} />;
      case 'audio':
        return <WeekAudioPlayerView audio={item} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)',
        pt: 10,
        pb: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h3"
              fontWeight="bold"
              color="primary"
              sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="h6"
                mt={1}
                color="text.secondary"
                sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
              >
                {subtitle}
              </Typography>
            )}
            <Typography
              variant="body1"
              mt={2}
              color="text.secondary"
              textAlign="center"
              maxWidth="800px"
              mx="auto"
              sx={{ px: { xs: 2, md: 0 } }}
            >
              {description}
            </Typography>
          </Box>
        </motion.div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            aria-label="Tipos de mídia"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: { xs: '0.9rem', md: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 2,
                },
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          >
            {filteredMediaTypes.map((type, index) => (
              <Tab key={index} label={type.label} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {filteredMediaTypes.map((type, index) => (
            <Box key={index} hidden={activeTab !== index} role="tabpanel">
              {activeTab === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: type.label.includes('Imagens') ? 'repeat(2, 1fr)' : '1fr',
                        md: type.label.includes('Imagens') ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                      },
                      gap: 3,
                      minHeight: '50vh',
                    }}
                  >
                    {type.items.map((item: MediaItem) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            transition: 'box-shadow 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                        >
                          {renderMediaComponent(type, item)}
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              )}
            </Box>
          ))}
        </Box>

        {isAdmin && (
          <Zoom in={true}>
            <Box
              sx={{
                position: 'fixed',
                bottom: 80,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 1000,
              }}
            >
              <Fab
                color="warning"
                onClick={handleEdit}
                disabled={isDeleting}
                aria-label="Editar página"
                sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
              >
                <EditIcon />
              </Fab>
              <Fab
                color="error"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isDeleting}
                aria-label="Excluir página"
                sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
              >
                <DeleteIcon />
              </Fab>
            </Box>
          </Zoom>
        )}

        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeletePage}
          isDeleting={isDeleting}
        />
      </Container>
    </Box>
  );
}
