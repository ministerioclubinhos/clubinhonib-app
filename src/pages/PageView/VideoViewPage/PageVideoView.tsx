import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container,
  Alert,
  Paper,
  Skeleton,
  Tooltip,
  Fab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/config/axiosConfig';
import { RootState, AppDispatch } from '@/store/slices';
import { setVideoData } from '@/store/slices/video/videoSlice';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import VideoCard from './VideoCard';

interface VideoPageViewProps {
  idToFetch: string;
}

export default function PageVideoView({ idToFetch }: VideoPageViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const videoData = useSelector((state: RootState) => state.video.videoData);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/video-pages/${idToFetch}`);
        dispatch(setVideoData(response.data));
      } catch (error) {
        console.error('Erro ao buscar dados da página de vídeos', error);
        setError('Erro ao carregar a página de vídeos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idToFetch, dispatch]);

  const handleDeletePage = async () => {
    try {
      if (!videoData?.id) return;
      setIsDeleting(true);
      await api.delete(`/video-pages/${videoData.id}`);
      await dispatch(fetchRoutes());
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir a página de vídeos:', err);
      setError('Erro ao excluir a página. Tente novamente mais tarde.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 3, mb: 4 }} />
        <Grid container spacing={4}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!videoData) {
    return (
      <Container sx={{ mt: 10 }}>
        <Typography align="center" variant="h5" color="textSecondary">
          Nenhuma página de vídeos encontrada.
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        pt: { xs: 4, md: 8 },
        pb: { xs: 4, md: 0 },
        mt: { xs: 4, md: 4 },
        mb: { xs: 2, md: 0 },
      }}
    >
      <Container maxWidth={false}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
            position: 'relative',
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            color="primary"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              mb: { xs: 2, md: 3 },
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {videoData.title}
          </Typography>

          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{ maxWidth: '600px', mx: 'auto' }}
          >
            {videoData.description}
          </Typography>

          {isAdmin && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 1300,
              }}
            >
              <Tooltip title="Editar página de vídeos">
                <Fab
                  color="warning"
                  onClick={() =>
                    navigate('/adm/editar-pagina-videos', {
                      state: { fromTemplatePage: false },
                    })
                  }
                  disabled={isDeleting}
                >
                  <EditIcon />
                </Fab>
              </Tooltip>

              <Tooltip title="Excluir página de vídeos">
                <Fab color="error" onClick={() => setDeleteConfirmOpen(true)} disabled={isDeleting}>
                  <DeleteIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}
        </Paper>

        <Grid container spacing={4}>
          {videoData.videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <VideoCard video={video} />
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir esta página de vídeos? Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button onClick={handleDeletePage} color="error" autoFocus disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
