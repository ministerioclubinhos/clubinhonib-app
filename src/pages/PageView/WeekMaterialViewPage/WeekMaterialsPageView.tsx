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
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookIcon from '@mui/icons-material/Book';
import api from '@/config/axiosConfig';
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
import { MediaItem } from 'store/slices/types';
import { UserRole } from '@/store/slices/auth/authSlice';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

interface WeekMaterialsPageViewProps {
  idToFetch: string;
}

interface MediaType {
  label: string;
  items: MediaItem[];
  component: React.ComponentType<any>;
  propName: 'video' | 'document' | 'image' | 'audio';
  icon: () => React.ReactElement;
  color: string;
}

export default function WeekMaterialsPageView({ idToFetch }: WeekMaterialsPageViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyMaterials, setWeekMaterials] = useState<WeekMaterialPageData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/week-material-pages/${idToFetch}`);
        setWeekMaterials(response.data);
        dispatch(setWeekMaterialData(response.data));
      } catch (err) {
        console.error('Erro ao buscar materiais de estudo:', err);
        setError('Erro ao carregar os materiais de estudo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idToFetch, dispatch]);

  const handleDeletePage = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/week-material-pages/${idToFetch}`);
      dispatch(fetchRoutes());
      navigate('/adm/gerenciar-materiais-semana');
    } catch (error) {
      console.error('Erro ao deletar página:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleEditPage = () => {
    navigate('/adm/editar-pagina-semana');
  };

  const handleBack = () => {
    console.log('handleBack called in WeekMaterialsPageView');
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!studyMaterials) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert severity="info">
          Nenhum material encontrado.
        </Alert>
      </Container>
    );
  }

  const mediaTypes: MediaType[] = [
    {
      label: 'Vídeos',
      items: studyMaterials.videos || [],
      component: WeekVideoPlayerView,
      propName: 'video' as const,
      icon: () => <Typography>🎥</Typography>,
      color: '#ff5722',
    },
    {
      label: 'Documentos',
      items: studyMaterials.documents || [],
      component: WeekDocumentViewer,
      propName: 'document' as const,
      icon: () => <Typography>📄</Typography>,
      color: '#2196f3',
    },
    {
      label: 'Imagens',
      items: studyMaterials.images || [],
      component: WeekImageGalleryView,
      propName: 'image' as const,
      icon: () => <Typography>🖼️</Typography>,
      color: '#4caf50',
    },
    {
      label: 'Áudios',
      items: studyMaterials.audios || [],
      component: WeekAudioPlayerView,
      propName: 'audio' as const,
      icon: () => <Typography>🎵</Typography>,
      color: '#9c27b0',
    },
  ].filter(type => type.items.length > 0);

  const totalItems = mediaTypes.reduce((sum, type) => sum + type.items.length, 0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          whileHover={{
            scale: 1.02,
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
            transition: { duration: 0.3 }
          }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 0,
              p: { xs: 3, sm: 4, md: 5 },
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              mx: 0,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                '& .pulse-circle': {
                  transform: 'scale(1.2)',
                  opacity: 0.8,
                }
              },
            }}
          >

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, position: 'relative', zIndex: 10 }}>
              <IconButton
                onClick={handleBack}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  zIndex: 10,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>

            <Box textAlign="center">
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 20,
                  height: 20,
                  zIndex: 2,
                  opacity: 0.3,
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    backgroundColor: 'white',
                  },
                  '&::before': {
                    width: '100%',
                    height: '2px',
                    top: '50%',
                    left: 0,
                    transform: 'translateY(-50%)',
                  },
                  '&::after': {
                    width: '2px',
                    height: '100%',
                    left: '50%',
                    top: 0,
                    transform: 'translateX(-50%)',
                  },
                }}
              />

              {/* Decorative elements with animations */}
              <motion.div
                className="pulse-circle"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  zIndex: 0,
                }}
              />

              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.05, 0.15, 0.05],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                style={{
                  position: 'absolute',
                  bottom: -15,
                  left: -15,
                  width: 60,
                  height: 60,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '50%',
                  zIndex: 0,
                }}
              />

              <motion.div
                animate={{
                  background: [
                    'linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    'linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    'linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%)'
                  ]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 0,
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '2.2rem', md: '2.8rem' },
                      mb: { xs: 1.5, sm: 2 },
                      lineHeight: 1.1,
                      px: { xs: 0, sm: 0 },
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    📚 {studyMaterials.title}
                  </Typography>
                </motion.div>

                {studyMaterials.subtitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      sx={{
                        fontSize: { xs: '0.95rem', sm: '1.4rem', md: '1.6rem' },
                        mb: { xs: 1.5, sm: 2 },
                        color: 'rgba(255, 255, 255, 0.95)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {studyMaterials.subtitle}
                    </Typography>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {studyMaterials.description && (
                    <Typography
                      variant="body1"
                      maxWidth={{ xs: '100%', sm: '90%', md: '800px' }}
                      mx="auto"
                      sx={{
                        fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
                        lineHeight: { xs: 1.5, md: 1.6 },
                        px: { xs: 1, sm: 2 },
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {studyMaterials.description}
                    </Typography>
                  )}
                </motion.div>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </motion.div>

      <Box sx={{
        flex: 1,
        p: { xs: 2, md: 4 },
        bgcolor: 'background.default',
        borderRadius: '24px 24px 0 0',
        position: 'relative',
        zIndex: 1,
        minHeight: 'calc(100vh - 200px)',
      }}>
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            bgcolor: 'background.paper',
            borderRadius: '20px',
            p: { xs: 2, md: 4 },
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            width: { xs: '98%', md: '95%' },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '6px',
              bgcolor: 'divider',
              borderRadius: '3px',
            },
          }}
        >
          {mediaTypes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper
                elevation={2}
                sx={{
                  mb: 3,
                  borderRadius: { xs: 3, md: 4 },
                  overflow: 'hidden',
                  mx: { xs: -1, md: 0 },
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  variant={isMobile ? "fullWidth" : "scrollable"}
                  scrollButtons={isMobile ? false : 'auto'}
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: { xs: '0.75rem', md: '1rem' },
                      fontWeight: 'bold',
                      textTransform: 'none',
                      minHeight: { xs: 48, md: 56 },
                      px: { xs: 0.5, md: 4 },
                      minWidth: { xs: 'auto', md: 'auto' },
                      flex: isMobile ? 1 : 'none',
                      maxWidth: isMobile ? 'none' : 'auto',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: { xs: 'rgba(25, 118, 210, 0.04)', md: 'rgba(25, 118, 210, 0.04)' },
                        borderRadius: { xs: 1, md: 0 },
                      },
                    },
                    '& .Mui-selected': {
                      color: 'primary.main',
                      backgroundColor: { xs: 'rgba(25, 118, 210, 0.08)', md: 'transparent' },
                      borderRadius: { xs: 1, md: 0 },
                    },
                    '& .MuiTabs-indicator': {
                      height: { xs: 3, md: 3 },
                      backgroundColor: 'primary.main',
                      borderRadius: { xs: '3px 3px 0 0', md: 0 },
                    },
                    '& .MuiTabs-flexContainer': {
                      gap: { xs: 0, md: 2 },
                      justifyContent: { xs: 'stretch', md: 'center' },
                    },
                    '& .MuiTabs-root': {
                      backgroundColor: { xs: 'background.paper', md: 'transparent' },
                    },
                  }}
                >
                  {mediaTypes.map((type, index) => (
                    <Tab
                      key={index}
                      label={
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          gap={isMobile ? 0.5 : 1}
                          sx={{ width: '100%' }}
                        >
                          {type.icon()}
                          {!isMobile && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 'inherit',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {type.label}
                            </Typography>
                          )}
                          <Chip
                            label={type.items.length}
                            size="small"
                            sx={{
                              bgcolor: type.color,
                              color: 'white',
                              fontSize: { xs: '0.6rem', md: '0.75rem' },
                              height: { xs: 18, md: 20 },
                              minWidth: { xs: 18, md: 20 },
                              fontWeight: 'bold',
                              '& .MuiChip-label': {
                                px: { xs: 0.5, md: 1 },
                                lineHeight: 1,
                              },
                            }}
                          />
                        </Box>
                      }
                    />
                  ))}
                </Tabs>
              </Paper>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {mediaTypes.length > 0 && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(auto-fit, minmax(400px, 1fr))',
                    },
                    gap: { xs: 3, md: 4 },
                  }}
                >
                  {mediaTypes[activeTab].items.map((item, index) => {
                    const Component = mediaTypes[activeTab].component as any;
                    const props = { [mediaTypes[activeTab].propName]: item };

                    return (
                      <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Component {...props} />
                      </motion.div>
                    );
                  })}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {mediaTypes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: { xs: 3, md: 4 },
                }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  📚 Nenhum material disponível
                </Typography>
                <Typography color="text.secondary">
                  Os materiais para esta semana ainda não foram publicados.
                </Typography>
              </Paper>
            </motion.div>
          )}

          <DeleteConfirmDialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={handleDeletePage}
            title="Excluir Material"
            loading={isDeleting}
          />
        </Container>
      </Box>
    </Box>
  );
}