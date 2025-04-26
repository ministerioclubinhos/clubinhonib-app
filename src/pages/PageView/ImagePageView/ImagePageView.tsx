import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../config/axiosConfig';
import { setImageData } from '../../../store/slices/image/imageSlice';
import { RootState, AppDispatch } from '../../../store/slices';
import { fetchRoutes } from '../../../store/slices/route/routeSlice';
import { RoleUser } from 'store/slices/auth/authSlice';
import type { ImagePageData } from '../../../store/slices/image/imageSlice';
import SectionImagePageView from './SectionImagePageView';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface PageGalleryProps {
  idToFetch?: string;
}

export default function PageGalleryView({ idToFetch }: PageGalleryProps) {
  const [localData, setLocalData] = useState<ImagePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isAdmin = isAuthenticated && user?.role === RoleUser.ADMIN;
  const isUserLogged =
    isAuthenticated && (user?.role === RoleUser.ADMIN || user?.role === RoleUser.USER);

  const defaultGalleryId = process.env.REACT_APP_FEED_MINISTERIO_ID;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const galleryId = idToFetch ?? defaultGalleryId;

        if (!galleryId) throw new Error('Nenhum ID de galeria fornecido.');

        const { data } = await api.get<ImagePageData>(`/image-pages/${galleryId}`);
        setLocalData(data);
        dispatch(setImageData(data));
      } catch (err) {
        console.error('Erro ao buscar a galeria:', err);
        setError('Erro ao carregar a galeria. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [idToFetch, defaultGalleryId, dispatch]);

  const handleDelete = async () => {
    if (!localData?.id) return;

    try {
      setIsDeleting(true);
      await api.delete(`/image-pages/${localData.id}`);
      await dispatch(fetchRoutes());
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir a galeria:', err);
      setError('Erro ao excluir a galeria. Tente novamente mais tarde.');
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

  if (error || !localData) {
    return (
      <Container sx={{ mt: 10, maxWidth: '95% !important', p: 0 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error ?? 'Dados não encontrados.'}
        </Alert>
      </Container>
    );
  }

  if (!localData.public && !isUserLogged) {
    return (
      <Container sx={{ mt: 10, maxWidth: '95% !important', p: 0 }}>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Esta galeria não está disponível publicamente.
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        mt: 10,
        p: 0,
        maxWidth: '95% !important',
        overflowX: 'hidden',
      }}
    >
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
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            fontSize: { xs: '1.5rem', md: '2.125rem' },
          }}
        >
          {localData.title}
        </Typography>

        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{
            mt: 1,
            textAlign: 'justify',
            maxWidth: '1000px',
          }}
        >
          {localData.description}
        </Typography>

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
            <Tooltip title="Editar Página" placement="left">
              <Fab
                color="warning"
                size="medium"
                onClick={() => navigate('/adm/editar-pagina-imagens')}
                disabled={isDeleting}
              >
                <EditIcon />
              </Fab>
            </Tooltip>

            <Tooltip title="Excluir Página" placement="left">
              <Fab
                color="error"
                size="medium"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isDeleting}
              >
                <DeleteIcon />
              </Fab>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Box display="flex" flexDirection="column" gap={4}>
        {localData.sections
          .filter((section) => section.public || isUserLogged)
          .map((section) => (
            <SectionImagePageView
              key={section.id}
              public={section.public}
              mediaItems={section.mediaItems}
              caption={section.caption}
              description={section.description}
              createdAt={section.createdAt || ''}
              updatedAt={section.updatedAt || ''}
            />
          ))}
      </Box>

      <Dialog open={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta página de galeria? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            autoFocus
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={20} />}
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
