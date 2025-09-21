import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Tooltip,
  Skeleton,
  Paper,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Button,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/config/axiosConfig';
import { RootState, AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { UserRole } from 'store/slices/auth/authSlice';
import ClubinhoSectionImageView from './ClubinhoSectionImageView/ClubinhoSectionImageView';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FofinhoButton } from './../../TeacherArea/components';
import {
  setSectionData,
  appendSections,
  updatePagination,
  PaginatedSectionResponse,
} from '@/store/slices/image-section-pagination/imageSectionPaginationSlice';

interface ClubinhoFeedViewProps {
  feed?: boolean;
}

// Skeleton component baseado no SectionImagePageView
function SectionSkeleton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 4 },
          mt: { xs: 1, sm: 1 },
          mb: { xs: 2, sm: 6 },
          borderRadius: 4,
          background: 'linear-gradient(145deg, #fafafa, #f0f0f0)',
        }}
      >
        <Box textAlign="center" mb={3}>
          <Skeleton 
            variant="text" 
            width={220} 
            height={32} 
            sx={{ mx: 'auto', borderRadius: 2 }} 
          />
          <Skeleton 
            variant="text" 
            width="60%" 
            sx={{ mx: 'auto', mt: 1, borderRadius: 1 }} 
          />
          <Skeleton 
            variant="text" 
            width="50%" 
            sx={{ mx: 'auto', mt: 1, borderRadius: 1 }} 
          />
          <Box 
            mt={2} 
            display="flex" 
            flexDirection="column" 
            alignItems={{ xs: 'center', md: 'flex-end' }}
          >
            <Skeleton variant="text" width={180} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={220} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        <Skeleton
          variant="rectangular"
          sx={{ 
            width: '100%', 
            height: { xs: 200, sm: 400, md: 600 }, 
            borderRadius: 2,
            mb: 2,
          }}
        />
        <Grid container spacing={1} justifyContent="center">
          {[...Array(6)].map((_, i) => (
            <Grid item xs={4} sm={2} md={2} key={i}>
              <Skeleton 
                variant="rectangular" 
                height={80} 
                sx={{ borderRadius: 1 }} 
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </motion.div>
  );
}

export default function ClubinhoFeedView({ feed = true }: ClubinhoFeedViewProps) {
  // Estados baseados no SectionImagePageView
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const section = useSelector((state: RootState) => state.imageSectionPagination.section);

  // ID fixo do feed baseado na lógica do SectionImagePageView
  const feedSectionId = import.meta.env.VITE_FEED_MINISTERIO_ID;

  // Intersection Observer baseado no SectionImagePageView
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  const sectionsList = useMemo(() => section?.sections ?? [], [section?.sections]);

  // Fetch data baseado na lógica do SectionImagePageView
  useEffect(() => {
    const controller = new AbortController();

    const fetchSectionData = async () => {
      try {
        setError(null);
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        if (!feedSectionId) throw new Error('ID do feed não configurado.');

        const { data } = await api.get<PaginatedSectionResponse>(
          `/image-pages/${feedSectionId}/sections?page=${page}&limit=2`,
          { signal: controller.signal }
        );

        if (page === 1) {
          dispatch(setSectionData(data));
        } else {
          dispatch(appendSections(data.sections));
          dispatch(updatePagination({ page: data.page, total: data.total }));
        }

        setHasMore(data.page * data.limit < data.total);
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Erro ao carregar o feed:', err);
          setError('Erro ao carregar o feed. Tente novamente mais tarde.');
        }
      } finally {
        if (page === 1) setLoading(false);
        else setLoadingMore(false);
      }
    };

    fetchSectionData();

    return () => controller.abort();
  }, [page, feedSectionId, dispatch]);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    dispatch(setSectionData({} as PaginatedSectionResponse));
  };

  const handleHome = () => {
    navigate('/');
  };

  // Loading state baseado no SectionImagePageView
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {[...Array(2)].map((_, i) => (
            <SectionSkeleton key={i} />
          ))}
        </motion.div>
      </Container>
    );
  }

  // Error state baseado no SectionImagePageView
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
              boxShadow: 2,
              fontSize: { xs: '0.9rem', md: '1rem' },
              p: { xs: 2, md: 3 },
            }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Tentar Novamente
              </Button>
            }
          >
            {error}
          </Alert>
        </motion.div>
      </Container>
    );
  }

  // Empty state baseado no SectionImagePageView
  if (!section) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: { xs: 3, md: 4 },
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
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
              📰 Feed de Notícias
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              O feed de notícias do Clubinho ainda não possui conteúdo.
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Atualizar Feed
            </Button>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header baseado no design do SectionImagePageView */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 4 },
            mb: { xs: 2, sm: 6 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0,
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton
                  onClick={handleHome}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  <HomeIcon />
                </IconButton>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  📰 Feed Clubinho
                </Typography>
              </Box>

              <Box display="flex" gap={1} alignItems="center">
                {isAuthenticated && (
                  <Box sx={{ mr: 1 }}>
                    <FofinhoButton references={['photos']} />
                  </Box>
                )}
                <Tooltip title="Atualizar Feed">
                  <IconButton
                    onClick={handleRefresh}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {section.description && (
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                  opacity: 0.95,
                  lineHeight: 1.6,
                  maxWidth: '800px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                {section.description}
              </Typography>
            )}

          </Box>
        </Paper>
      </motion.div>

      {/* Seções do Feed baseadas no SectionImagePageView */}
      <AnimatePresence>
        {sectionsList.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {sectionsList.map((sectionItem, index) => (
              <motion.div
                key={sectionItem.id}
                ref={index === sectionsList.length - 1 ? lastSectionRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ 
                  marginBottom: index < sectionsList.length - 1 ? theme.spacing(2) : 0 
                }}
              >
                <ClubinhoSectionImageView 
                  caption={sectionItem.caption}
                  description={sectionItem.description}
                  mediaItems={sectionItem.mediaItems}
                  createdAt={sectionItem.createdAt ? new Date(sectionItem.createdAt) : undefined}
                  updatedAt={sectionItem.updatedAt ? new Date(sectionItem.updatedAt) : undefined}
                />
              </motion.div>
            ))}

            {loadingMore && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={4}
              >
                <CircularProgress size={40} />
              </Box>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: { xs: 3, md: 4 },
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                📰 Nenhuma publicação disponível
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                O feed de notícias ainda não possui publicações.
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Atualizar Feed
              </Button>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}