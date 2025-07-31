import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Fab,
  Skeleton,
  Paper,
  Grid,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/config/axiosConfig';
import { RootState, AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { RoleUser } from 'store/slices/auth/authSlice';
import SectionImagePageView from './SectionImagePageView';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ButtonSection from './../../TeacherArea/FofinhoButton';
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
  return (
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
        <Skeleton variant="text" width={220} height={32} sx={{ mx: 'auto' }} />
        <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
        <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} />
        <Box mt={2} display="flex" flexDirection="column" alignItems={{ xs: 'center', md: 'flex-end' }}>
          <Skeleton variant="text" width={180} />
          <Skeleton variant="text" width={220} />
        </Box>
      </Box>
      <Skeleton variant="rectangular" sx={{ width: '100%', height: { xs: 200, sm: 400, md: 600 }, borderRadius: 2 }} />
      <Grid container spacing={1} mt={1} justifyContent="center">
        {[...Array(6)].map((_, i) => (
          <Grid item xs={4} sm={2} md={2} key={i}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default function PageSectionView({ idToFetch, feed }: PageSectionProps) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const section = useSelector((state: RootState) => state.imageSectionPagination.section);

  const isAdmin = isAuthenticated && user?.role === RoleUser.ADMIN;
  const isUserLogged = isAuthenticated;
  const defaultSectionId = import.meta.env.VITE_FEED_MINISTERIO_ID as string | undefined;

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

  // ✅ NENHUM hook depois dos returns:
  const visibleSections = useMemo(
    () => (section?.sections ?? []).filter((s) => s.public || isUserLogged),
    [section?.sections, isUserLogged]
  );

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const sectionId = feed ? defaultSectionId : idToFetch;
        if (!sectionId) throw new Error('Nenhum ID de seção fornecido.');

        const { data } = await api.get<PaginatedSectionResponse>(
          `/image-pages/${sectionId}/sections?page=${page}&limit=2`
        );

        if (page === 1) {
          dispatch(setSectionData(data));
        } else {
          dispatch(appendSections(data.sections));
          dispatch(updatePagination({ page: data.page, total: data.total }));
        }

        setHasMore(data.page * data.limit < data.total);
      } catch (err) {
        console.error('Erro ao carregar a seção:', err);
        setError('Erro ao carregar a seção. Tente novamente mais tarde.');
      } finally {
        if (page === 1) setLoading(false);
        else setLoadingMore(false);
      }
    };

    fetchSectionData();
  }, [page, idToFetch, defaultSectionId, dispatch, feed]);

  const handleDelete = async () => {
    if (!section?.id) return;
    try {
      setIsDeleting(true);
      await api.delete(`/image-pages/${section.id}`);
      await dispatch(fetchRoutes());
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir a seção:', err);
      setError('Erro ao excluir a seção. Tente novamente mais tarde.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 10, maxWidth: '95% !important', p: 0 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
          <CircularProgress />
          <Typography mt={2}>Carregando...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !section) {
    return (
      <Container sx={{ mt: 10, maxWidth: '95% !important', p: 0 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error ?? 'Dados não encontrados.'}
        </Alert>
      </Container>
    );
  }

  if (!section.public && !isUserLogged) {
    return (
      <Container sx={{ mt: 10, maxWidth: '95% !important', p: 0 }}>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Esta página não está disponível publicamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 10, p: 0, maxWidth: '95% !important', overflowX: 'hidden' }}>
      <Box
        sx={{
          textAlign: 'center',
          mb: 5,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
          {section.title}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, textAlign: 'justify', maxWidth: '1000px' }}>
          {section.description}
        </Typography>

        {feed && isUserLogged && <ButtonSection references={['photos']} />}

        {isAdmin && (
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
            <Tooltip title="Editar Página" placement="right">
              <Fab color="warning" size="medium" onClick={() => navigate('/adm/editar-pagina-imagens')} disabled={isDeleting}>
                <EditIcon />
              </Fab>
            </Tooltip>

            {!feed && (
              <Tooltip title="Excluir Página" placement="right">
                <Fab color="error" size="medium" onClick={() => setDeleteConfirmOpen(true)} disabled={isDeleting}>
                  <DeleteIcon />
                </Fab>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <Box display="flex" flexDirection="column" gap={4}>
        {visibleSections.length === 0 ? (
          <>
            <SectionSkeleton />
            {hasMore && (
              <Box
                ref={lastSectionRef}
                sx={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}
              >
                {loadingMore ? <CircularProgress size={30} /> : <Typography variant="body2" color="text.secondary">Carregue mais</Typography>}
              </Box>
            )}
          </>
        ) : (
          <>
            {visibleSections.map((sectionItem) => (
              <SectionImagePageView
                key={sectionItem.id}
                public={sectionItem.public}
                mediaItems={sectionItem.mediaItems}
                caption={sectionItem.caption}
                description={sectionItem.description}
                createdAt={sectionItem.createdAt || ''}
                updatedAt={sectionItem.updatedAt || ''}
              />
            ))}
            {hasMore && (
              <Box
                ref={lastSectionRef}
                sx={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}
              >
                {loadingMore ? <CircularProgress size={30} /> : <Typography variant="body2" color="text.secondary">Carregue mais</Typography>}
              </Box>
            )}
          </>
        )}
      </Box>

      <Dialog open={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja excluir esta página de seção? Esta ação não pode ser desfeita.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus disabled={isDeleting} startIcon={isDeleting && <CircularProgress size={20} />}>
            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
