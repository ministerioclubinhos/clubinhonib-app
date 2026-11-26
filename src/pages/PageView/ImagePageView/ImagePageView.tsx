import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PUBLIC_MEDIA_BASE_PATH, PUBLIC_MEDIA_PAGE_WIDTH } from '@/features/public-media/constants';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Skeleton,
  Paper,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/config/axiosConfig';
import { RootState, AppDispatch } from '@/store/slices';
import SectionImagePageView from './SectionImagePageView';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { FofinhoButton } from './../../TeacherArea/components';
import { isCancelledRequest } from '@/utils/apiError';
import {
  setSectionData,
  appendSections,
  updatePagination,
  PaginatedSectionResponse,
} from '@/store/slices/image-section-pagination/imageSectionPaginationSlice';

interface PageSectionProps {
  idToFetch?: string;
  feed?: boolean;
  /** `public` abre fora da Área do Professor, com volta para a galeria. */
  variant?: 'teacher' | 'public';
}

function SectionSkeleton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <motion.div data-testid="page-view-image-page-view-section-skeleton"
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

export default function PageSectionView({ idToFetch, feed, variant = 'teacher' }: PageSectionProps) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const section = useSelector((state: RootState) => state.imageSectionPagination.section);

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
      } catch (err: unknown) {
        if (!isCancelledRequest(err)) {
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
      <Container data-testid="page-view-image-page-view-page-section-view" maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
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
      <Container data-testid="page-view-image-page-view-page-section-view" maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
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
      <Container data-testid="page-view-image-page-view-page-section-view" maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
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

  const totalPhotos = sectionsList.reduce((sum, item) => sum + (item.mediaItems?.length ?? 0), 0);
  const totalSections = section.total ?? sectionsList.length;
  const isPublic = variant === 'public';
  const backProps = isPublic
    ? { component: RouterLink, to: PUBLIC_MEDIA_BASE_PATH }
    : { onClick: handleBack };

  return (
    <Box data-testid="page-view-image-sections" sx={{ bgcolor: isPublic ? '#f4f6f9' : 'transparent', minHeight: isPublic ? '70vh' : undefined }}>
    <Container
      data-testid="page-view-image-page-view-page-section-view"
      maxWidth={isPublic ? false : 'xl'}
      disableGutters={isPublic}
      sx={{ py: { xs: 2, md: 4 }, ...(isPublic ? { width: PUBLIC_MEDIA_PAGE_WIDTH } : { px: { xs: 1.5, sm: 3 } }) }}
    >

      <Box
        component="header"
        sx={{
          mb: { xs: 2, md: 3 },
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 3, md: 4 },
          color: '#fff',
          background: 'linear-gradient(135deg, #81d742 0%, #3f8f1b 100%)',
          boxShadow: '0 10px 30px rgba(63,143,27,0.25)',
        }}
      >
        <IconButton
          {...backProps}
          aria-label={isPublic ? 'Voltar para Fotos e Vídeos' : 'Voltar'}
          data-testid="image-page-back"
          sx={{ width: 44, height: 44, mb: 1, ml: -0.5, color: '#fff', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography component="h1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.15, fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.6rem' } }}>
          {section.title}
        </Typography>
        {section.subtitle && (
          <Typography sx={{ mt: 0.5, fontWeight: 600, opacity: 0.95, fontSize: { xs: '1rem', md: '1.25rem' } }}>{section.subtitle}</Typography>
        )}
        {section.description && (
          <Typography sx={{ mt: 1, opacity: 0.92, lineHeight: 1.6, maxWidth: 760, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            {section.description}
          </Typography>
        )}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<PhotoLibraryIcon sx={{ color: '#fff !important' }} />}
            label={`${totalSections} ${totalSections === 1 ? 'seção' : 'seções'}`}
            sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700 }}
          />
          {totalPhotos > 0 && (
            <Chip label={`${totalPhotos} ${totalPhotos === 1 ? 'foto' : 'fotos'}${hasMore ? '+' : ''}`} sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700 }} />
          )}
        </Box>
      </Box>

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
    </Box>
  );
}