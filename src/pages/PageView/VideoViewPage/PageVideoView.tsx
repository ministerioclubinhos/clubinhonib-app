import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Alert,
  Skeleton,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoCard from './VideoCard';
import { useAuthRole } from '@/utils/useAuthRole';
import { useVideoPage } from './hooks';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

interface VideoPageViewProps {
  idToFetch: string;
}

export default function PageVideoView({ idToFetch }: VideoPageViewProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuthRole();
  const { videoData, loading, error, isDeleting, deletePage } = useVideoPage(idToFetch);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleEditPage = () => {
    navigate('/adm/editar-pagina-videos', { state: { fromTemplatePage: false } });
  };

  const handleBack = () => {
    console.log('handleBack called in PageVideoView');
    navigate(-1);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    await deletePage(() => navigate('/'));
    setConfirmOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height={isMobile ? 200 : 300}
            sx={{ borderRadius: { xs: 3, md: 4 }, mb: 4 }}
          />
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={isMobile ? 200 : 250}
                    sx={{ borderRadius: { xs: 3, md: 4 } }}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: { xs: 3, md: 4 },
              boxShadow: 3,
              fontSize: { xs: '0.9rem', md: '1rem' },
              p: { xs: 2, md: 3 },
            }}
          >
            {error}
          </Alert>
        </motion.div>
      </Container>
    );
  }

  if (!videoData) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              variant="h5"
              color="text.secondary"
              sx={{
                fontSize: { xs: '1.3rem', md: '1.5rem' },
                mb: 2,
              }}
            >
              📹 Nenhuma página de vídeos encontrada
            </Typography>
            <Typography color="text.secondary">
              A página de vídeos solicitada não existe ou foi removida.
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  const totalVideos = videoData.videos?.length || 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 0,
        background: 'linear-gradient(135deg, #ff5722 0%, #d32f2f 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Section - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          whileHover={{
            scale: 1.02,
            boxShadow: '0 12px 40px rgba(255, 87, 34, 0.2)',
            transition: { duration: 0.3 },
          }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #ff5722 0%, #d32f2f 100%)',
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
                    📹 {videoData.title}
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {videoData.description && (
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
                      {videoData.description}
                    </Typography>
                  )}
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
          <AnimatePresence>
            {totalVideos > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {videoData.videos.map((video: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <VideoCard video={video} />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            ) : (
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
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    📹 Nenhum vídeo disponível
                  </Typography>
                  <Typography color="text.secondary">
                    Os vídeos para esta página ainda não foram publicados.
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          <DeleteConfirmDialog
            open={confirmOpen}
            onClose={() => !isDeleting && setConfirmOpen(false)}
            onConfirm={handleDelete}
            title="Excluir Página de Vídeos"
            loading={isDeleting}
          />
        </Container>
      </Box>
    </Box>
  );
}
