import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Tooltip,
  Fab,
  Skeleton,
  Paper,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/config/axiosConfig';
import { RootState, AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { UserRole } from 'store/slices/auth/authSlice';
import SectionImagePageView from './SectionImagePageView';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { FofinhoButton } from './../../TeacherArea/components';
import {
  setSectionData,
  appendSections,
  updatePagination,
  PaginatedSectionResponse,
} from '@/store/slices/image-section-pagination/imageSectionPaginationSlice';

interface PageSectionProps {
  idToFetch?: string;
  feed?: boolean;
}

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
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          mt: { xs: 2, md: 3 },
          mb: { xs: 3, md: 4 },
          borderRadius: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          border: `2px solid ${theme.palette.success.main}20`,
        }}
      >
        <Box textAlign="center" mb={3}>
          <Skeleton 
            variant="text" 
            width={220} 
            height={isMobile ? 24 : 32} 
            sx={{ 
              mx: 'auto', 
              borderRadius: 2,
            }} 
          />
          <Skeleton 
            variant="text" 
            width="60%" 
            sx={{ 
              mx: 'auto', 
              mt: 1,
              borderRadius: 1,
            }} 
          />
          <Skeleton 
            variant="text" 
            width="50%" 
            sx={{ 
              mx: 'auto', 
              mt: 1,
              borderRadius: 1,
            }} 
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
            height: isMobile ? 200 : 400, 
            borderRadius: { xs: 2, md: 3 },
            mb: 2,
          }}
        />
        <Grid container spacing={1} justifyContent="center">
          {[...Array(6)].map((_, i) => (
            <Grid item xs={4} sm={2} md={2} key={i}>
              <Skeleton 
                variant="rectangular" 
                height={isMobile ? 60 : 80} 
                sx={{ 
                  borderRadius: { xs: 2, md: 3 },
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </motion.div>
  );
}

export default function PageSectionView({ idToFetch, feed }: PageSectionProps) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const section = useSelector((state: RootState) => state.imageSectionPagination.section);

  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;
  const defaultSectionId = import.meta.env.VITE_FEED_MINISTERIO_ID;

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

  useEffect(() => {
    const controller = new AbortController();

    const fetchSectionData = async () => {
      try {
        setError(null);
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const sectionId = feed ? defaultSectionId : idToFetch;
        if (!sectionId) throw new Error('Nenhum ID de seção fornecido.');

        const { data } = await api.get<PaginatedSectionResponse>(
          `/image-pages/${sectionId}/sections?page=${page}&limit=2`,
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
          console.error('Erro ao carregar a seção:', err);
          setError('Erro ao carregar a seção. Tente novamente mais tarde.');
        }
      } finally {
        if (page === 1) setLoading(false);
        else setLoadingMore(false);
      }
    };

    fetchSectionData();

    return () => controller.abort();
  }, [page, idToFetch, defaultSectionId, dispatch, feed]);


  const handleBack = () => {
    navigate(-1);
  };

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

  if (!section) {
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
              📸 Nenhuma página de imagens encontrada
            </Typography>
            <Typography color="text.secondary">
              A página de imagens solicitada não existe ou foi removida.
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header da Galeria */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
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
                  onClick={handleBack}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <PhotoLibraryIcon sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} />
              </Box>

            </Box>

            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              📸 {section.title}
            </Typography>

            {(section as any).subtitle && (
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                  mb: 2,
                  opacity: 0.95,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                {(section as any).subtitle}
              </Typography>
            )}

            {section.description && (
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  opacity: 0.9,
                  lineHeight: 1.6,
                  maxWidth: '800px',
                }}
              >
                {section.description}
              </Typography>
            )}

            <Box
              display="flex"
              alignItems="center"
              gap={2}
              mt={3}
              flexWrap="wrap"
            >
              <Chip
                label={`${sectionsList.length} ${sectionsList.length === 1 ? 'Seção' : 'Seções'}`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Seções da Galeria */}
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
                <SectionImagePageView 
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

            {feed && isAuthenticated && (
              <Box mt={4}>
                <FofinhoButton references={['photos']} />
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
                📸 Nenhuma seção disponível
              </Typography>
              <Typography color="text.secondary">
                As seções de imagens ainda não foram publicadas.
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

    </Container>
  );
}