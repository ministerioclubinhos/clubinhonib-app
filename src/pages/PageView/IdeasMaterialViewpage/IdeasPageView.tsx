import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Card,
  CardContent,
  Grid,
  Collapse,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '@/config/axiosConfig';
import { fetchRoutes } from 'store/slices/route/routeSlice';
import { RootState, AppDispatch } from 'store/slices';
import { setIdeasData, IdeasPageData } from 'store/slices/ideas/ideasSlice';
import IdeasDocumentViewer from './IdeasDocumentViewer';
import IdeasImageGalleryView from './IdeasImageGalleryView';
import IdeasVideoPlayerView from './IdeasVideoPlayerView';
import { UserRole } from '@/store/slices/auth/authSlice';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

interface IdeasPageViewProps {
  idToFetch: string;
}

interface MediaSectionProps {
  sectionId: string;
  sectionIndex: number;
  title: string;
  description: string;
  videos: any[];
  documents: any[];
  images: any[];
  expandedMediaTypes: { [key: string]: boolean };
  onToggleMediaType: (sectionId: string, mediaType: string) => void;
}

function MediaSection({
  sectionId,
  sectionIndex,
  title,
  description,
  videos,
  documents,
  images,
  expandedMediaTypes,
  onToggleMediaType,
}: MediaSectionProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const MediaTypeCard = ({
    type,
    icon,
    items,
    color,
    emoji,
  }: {
    type: string;
    icon: React.ReactNode;
    items: any[];
    color: string;
    emoji: string;
  }) => {
    if (items.length === 0) return null;

    const isExpanded = expandedMediaTypes[`${sectionId}-${type}`];
    const key = `${sectionId}-${type}`;

    return (
      <Card
        sx={{
          mb: { xs: '5px', sm: 2 },
          borderRadius: { xs: 1, sm: 2 },
          boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: '5px', sm: 2, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              py: { xs: '5px', sm: 1 },
            }}
            onClick={() => onToggleMediaType(sectionId, type)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 0.25, sm: 1 },
                  color: color,
                }}
              >
                {icon}
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
                    color: color,
                  }}
                >
                  {emoji}{' '}
                  {type === 'videos' ? 'Vídeos' : type === 'documents' ? 'Documentos' : 'Imagens'} (
                  {items.length})
                </Typography>
              </Box>
              <Chip
                label={items.length}
                size="small"
                sx={{
                  backgroundColor: `${color}20`,
                  color: color,
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 },
                }}
              />
            </Box>
            <IconButton
              size="small"
              sx={{
                color: color,
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                p: { xs: '5px', sm: 1 },
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Box>

          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: { xs: '5px', sm: 2 } }} />
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: { xs: '5px', sm: 1 } }}>
              {items.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        borderRadius: { xs: 1.5, sm: 2 },
                        overflow: 'hidden',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      {type === 'videos' && <IdeasVideoPlayerView video={item} />}
                      {type === 'documents' && <IdeasDocumentViewer document={item} />}
                      {type === 'images' && <IdeasImageGalleryView image={item} />}
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          backgroundColor: 'white',
          borderRadius: { xs: 1.5, sm: 3 },
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          mb: { xs: '5px', sm: 4 },
          overflow: 'hidden',
          mx: { xs: 0, sm: 2 },
        }}
      >
        <CardContent sx={{ p: { xs: '5px', sm: 3, md: 4 } }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary.main"
            mb={{ xs: 1, sm: 2 }}
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.8rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            mb={{ xs: 1.5, sm: 3 }}
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>

          <Box sx={{ mt: { xs: 2, sm: 3 } }}>
            <MediaTypeCard
              type="videos"
              icon={<VideoLibraryIcon />}
              items={videos}
              color={theme.palette.error.main}
              emoji="🎬"
            />
            <MediaTypeCard
              type="documents"
              icon={<PictureAsPdfIcon />}
              items={documents}
              color={theme.palette.success.main}
              emoji="📄"
            />
            <MediaTypeCard
              type="images"
              icon={<ImageIcon />}
              items={images}
              color={theme.palette.warning.main}
              emoji="🖼️"
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function IdeasPageView({ idToFetch }: IdeasPageViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ideasPage, setIdeasPage] = useState<IdeasPageData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedMediaTypes, setExpandedMediaTypes] = useState<{ [key: string]: boolean }>({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;

  const handleBack = () => {
    console.log('handleBack called in IdeasPageView');
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/ideas-pages/${idToFetch}`);
        setIdeasPage(response.data);
        dispatch(setIdeasData(response.data));
      } catch (err) {
        setError('Erro ao carregar a página de ideias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idToFetch, dispatch]);

  const handleDeletePage = async () => {
    try {
      if (!ideasPage?.id) return;
      setIsDeleting(true);
      await api.delete(`/ideas-pages/${ideasPage.id}`);
      await dispatch(fetchRoutes());
      navigate('/');
    } catch (err) {
      setError('Erro ao excluir a página. Tente novamente mais tarde.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleEdit = () => {
    navigate('/adm/editar-pagina-ideias', { state: { fromTemplatePage: false } });
  };

  const toggleMediaType = (sectionId: string, mediaType: string) => {
    const key = `${sectionId}-${mediaType}`;
    setExpandedMediaTypes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)',
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" mt={2} color="text.secondary">
            Carregando página de ideias...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)',
          p: 3,
        }}
      >
        <Alert
          severity="error"
          sx={{
            maxWidth: 500,
            width: '100%',
            fontSize: '1.1rem',
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!ideasPage) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)',
        }}
      >
        <Typography variant="h5" align="center" color="text.secondary" sx={{ maxWidth: 400 }}>
          Nenhuma página de ideias encontrada.
        </Typography>
      </Box>
    );
  }

  const { title, subtitle, description, sections } = ideasPage;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 0,
        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
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
            boxShadow: '0 12px 40px rgba(33, 150, 243, 0.2)',
            transition: { duration: 0.3 },
          }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
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
                },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 2,
                position: 'relative',
                zIndex: 10,
              }}
            >
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

              <motion.div
                className="pulse-circle"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
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
                  ease: 'easeInOut',
                  delay: 1,
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
                    'linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  ],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
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
                    💡 {title}
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
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
                    {description}
                  </Typography>
                </motion.div>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </motion.div>

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          bgcolor: 'background.default',
          borderRadius: '24px 24px 0 0',
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 200px)',
        }}
      >
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
          <Box sx={{ mb: { xs: 2, sm: 4 } }}>
            <AnimatePresence>
              {sections.map((section, sectionIndex) => {
                const videos = section.medias.filter((media) => media.mediaType === 'video');
                const documents = section.medias.filter((media) => media.mediaType === 'document');
                const images = section.medias.filter((media) => media.mediaType === 'image');

                return (
                  <MediaSection
                    key={section.id || sectionIndex}
                    sectionId={section.id || sectionIndex.toString()}
                    sectionIndex={sectionIndex}
                    title={section.title}
                    description={section.description}
                    videos={videos}
                    documents={documents}
                    images={images}
                    expandedMediaTypes={expandedMediaTypes}
                    onToggleMediaType={toggleMediaType}
                  />
                );
              })}
            </AnimatePresence>
          </Box>
        </Container>
      </Box>

      {isAdmin && (
        <Zoom in={true}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1300,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Fab
              color="warning"
              onClick={handleEdit}
              disabled={isDeleting}
              aria-label="Editar página"
              sx={{
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                transition: 'transform 0.3s ease',
              }}
            >
              <EditIcon fontSize="large" />
            </Fab>
            <Fab
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isDeleting}
              aria-label="Excluir página"
              sx={{
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                transition: 'transform 0.3s ease',
              }}
            >
              <DeleteIcon fontSize="large" />
            </Fab>
          </Box>
        </Zoom>
      )}

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        title={ideasPage.title}
        onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          if (isDeleting) return;
          await handleDeletePage();
        }}
        loading={isDeleting}
      />
    </Box>
  );
}
