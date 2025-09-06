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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/config/axiosConfig';
import { fetchRoutes } from 'store/slices/route/routeSlice';
import { RootState, AppDispatch } from 'store/slices';
import { setIdeasData, IdeasPageData } from 'store/slices/ideas/ideasSlice';
import IdeasDocumentViewer from './IdeasDocumentViewer';
import IdeasImageGalleryView from './IdeasImageGalleryView';
import IdeasVideoPlayerView from './IdeasVideoPlayerView';
import { RoleUser } from '@/store/slices/auth/authSlice';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

interface IdeasPageViewProps {
  idToFetch: string;
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
  const isAdmin = isAuthenticated && user?.role === RoleUser.ADMIN;

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
      <Container
        sx={{
          mt: { xs: 8, md: 10 },
          width: '95%',
          maxWidth: 'none',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 0 },
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        sx={{
          mt: { xs: 8, md: 10 },
          width: '95%',
          maxWidth: 'none',
          mx: { xs: 0, md: 0 },
          px: { xs: 0, md: 0 },
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!ideasPage) {
    return (
      <Container
        sx={{
          mt: { xs: 8, md: 10 },
          width: '95%',
          maxWidth: 'none',
          mx: 'auto',
          px: { xs: 2, md: 0 },
        }}
      >
        <Typography align="center">Nenhuma página de ideias encontrada.</Typography>
      </Container>
    );
  }

  const { title, subtitle, description, sections } = ideasPage;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)',
        pt: { xs: 8, md: 10 },
        pb: 4,
        mx: { xs: 0, md: 0 },
        my: { xs: 0, md: 0 },

        position: 'relative',
        overflow: 'hidden',
      }}
    >

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="primary.main"
            sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' } }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            mt={2}
            color="text.secondary"
            maxWidth={{ xs: '100%', sm: '90%', md: '800px' }}
            mx="auto"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' } }}
          >
            {description}
          </Typography>
        </Box>
      </motion.div>

      {sections.map((section, sectionIndex) => {
        const videos = section.medias.filter((media) => media.mediaType === 'video');
        const documents = section.medias.filter((media) => media.mediaType === 'document');
        const images = section.medias.filter((media) => media.mediaType === 'image');

        return (
          <Box
            key={section.id || sectionIndex}
            sx={{
              backgroundColor: 'white',
              borderRadius: { xs: 2, md: 3 },
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              mb: { xs: 4, md: 6 },
              mx: { xs: 1, md: 6 },

              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: { xs: 0.5, sm: 3, md: 4 } }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="primary.main"
                mb={2}
                sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                mb={{ xs: 3, md: 4 }}
                sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' } }}
              >
                {section.description}
              </Typography>

              {videos.length > 0 && (
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(245, 245, 245, 0.5)',
                      borderRadius: { xs: 1, md: 2 },
                      p: { xs: 1.5, md: 2 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="secondary.main"
                      sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' } }}
                    >
                      🎬 Vídeos ({videos.length})
                    </Typography>
                    <IconButton
                      onClick={() =>
                        toggleMediaType(section.id || sectionIndex.toString(), 'videos')
                      }
                      aria-label={
                        expandedMediaTypes[`${section.id || sectionIndex}-videos`]
                          ? 'Comprimir vídeos'
                          : 'Expandir vídeos'
                      }
                      sx={{
                        color: 'primary.main',
                        fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                      }}
                    >
                      {expandedMediaTypes[`${section.id || sectionIndex}-videos`] ? (
                        <ExpandLessIcon fontSize="inherit" />
                      ) : (
                        <ExpandMoreIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  </Box>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedMediaTypes[`${section.id || sectionIndex}-videos`]
                        ? 'auto'
                        : 0,
                      opacity: expandedMediaTypes[`${section.id || sectionIndex}-videos`] ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                        },
                        gap: { xs: 2, md: 3 },
                        py: { xs: 2, md: 3 },
                        px: { xs: 0, md: 3 },
                      }}
                    >
                      {videos.map((video) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            sx={{
                              borderRadius: { xs: 1, md: 2 },
                              px: { xs: 0, md: 3 },
                              overflow: 'hidden',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <IdeasVideoPlayerView video={video} />
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  </motion.div>
                </Box>
              )}

              {documents.length > 0 && (
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(245, 245, 245, 0.5)',
                      borderRadius: { xs: 1, md: 2 },
                      p: { xs: 1.5, md: 2 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="secondary.main"
                      sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' } }}
                    >
                      📄 Documentos ({documents.length})
                    </Typography>
                    <IconButton
                      onClick={() =>
                        toggleMediaType(section.id || sectionIndex.toString(), 'documents')
                      }
                      aria-label={
                        expandedMediaTypes[`${section.id || sectionIndex}-documents`]
                          ? 'Comprimir documentos'
                          : 'Expandir documentos'
                      }
                      sx={{
                        color: 'primary.main',
                        fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                      }}
                    >
                      {expandedMediaTypes[`${section.id || sectionIndex}-documents`] ? (
                        <ExpandLessIcon fontSize="inherit" />
                      ) : (
                        <ExpandMoreIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  </Box>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedMediaTypes[`${section.id || sectionIndex}-documents`]
                        ? 'auto'
                        : 0,
                      opacity: expandedMediaTypes[`${section.id || sectionIndex}-documents`]
                        ? 1
                        : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                        },
                        gap: { xs: 2, md: 3 },
                        p: { xs: 2, md: 3 },
                      }}
                    >
                      {documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            sx={{
                              borderRadius: { xs: 1, md: 2 },
                              overflow: 'hidden',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <IdeasDocumentViewer document={doc} />
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  </motion.div>
                </Box>
              )}

              {images.length > 0 && (
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(245, 245, 245, 0.5)',
                      borderRadius: { xs: 1, md: 2 },
                      p: { xs: 1.5, md: 2 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="secondary.main"
                      sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' } }}
                    >
                      🖼️ Imagens ({images.length})
                    </Typography>
                    <IconButton
                      onClick={() =>
                        toggleMediaType(section.id || sectionIndex.toString(), 'images')
                      }
                      aria-label={
                        expandedMediaTypes[`${section.id || sectionIndex}-images`]
                          ? 'Comprimir imagens'
                          : 'Expandir imagens'
                      }
                      sx={{
                        color: 'primary.main',
                        fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                      }}
                    >
                      {expandedMediaTypes[`${section.id || sectionIndex}-images`] ? (
                        <ExpandLessIcon fontSize="inherit" />
                      ) : (
                        <ExpandMoreIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  </Box>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedMediaTypes[`${section.id || sectionIndex}-images`]
                        ? 'auto'
                        : 0,
                      opacity: expandedMediaTypes[`${section.id || sectionIndex}-images`] ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                        },
                        gap: { xs: 2, md: 3 },
                        p: { xs: 2, md: 3 },
                      }}
                    >
                      {images.map((img) => (
                        <motion.div
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Box
                            sx={{
                              borderRadius: { xs: 1, md: 2 },
                              overflow: 'hidden',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <IdeasImageGalleryView image={img} />
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  </motion.div>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}

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
              gap: 1,
            }}
          >
            <Fab
              color="warning"
              onClick={handleEdit}
              disabled={isDeleting}
              aria-label="Editar página"
              sx={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
              }}
            >
              <EditIcon fontSize={isMobile ? 'medium' : 'large'} />
            </Fab>
            <Fab
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isDeleting}
              aria-label="Excluir página"
              sx={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
              }}
            >
              <DeleteIcon fontSize={isMobile ? 'medium' : 'large'} />
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
