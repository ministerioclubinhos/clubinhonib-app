import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid2,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { apiDeleteIdeasPage, apiGetIdeasPage } from '@/features/ideas-pages';
import { IDEAS_PAGE_ROUTES, ideasPageEditPath } from '@/features/ideas-pages/constants';
import { UserRole } from '@/types/shared';
import { extractErrorMessage } from '@/utils/apiError';
import type { MediaItem } from 'store/slices/types';
import { AppDispatch, RootState } from 'store/slices';
import { IdeasPageData, setIdeasData } from 'store/slices/ideas/ideasSlice';
import { fetchRoutes } from 'store/slices/route/routeSlice';

import IdeasGalleryDialog from './IdeasGalleryDialog';
import MediaSection from './MediaSection';
import { PAGE_WIDTH, TOUCH_TARGET, type IdeasMediaKind } from './constants';
import { countMedias, pageSummaryLabel } from './utils';

interface IdeasPageViewProps {
  idToFetch: string;
}

/** A galeria aberta no momento: o tipo de mídia e de qual seção ela veio. */
interface OpenGallery {
  sectionTitle: string;
  kind: IdeasMediaKind;
  items: MediaItem[];
}

/**
 * Página pública de uma coleção de ideias.
 *
 * O conteúdo é o que importa: as seções entram como cartões e cada tipo de
 * mídia abre a galeria daquele tipo. A versão anterior gastava a primeira tela
 * inteira do celular com um banner animado, aninhava quatro camadas de cartão
 * antes do primeiro texto e deixava dois botões flutuantes — um deles o de
 * excluir a página — sobre o conteúdo.
 */
export default function IdeasPageView({ idToFetch }: IdeasPageViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ideasPage, setIdeasPage] = useState<IdeasPageData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [gallery, setGallery] = useState<OpenGallery | null>(null);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const page = await apiGetIdeasPage(idToFetch);
        if (!active) return;
        setIdeasPage(page);
        // O formulário de edição lê a página do store, que não é persistido.
        dispatch(setIdeasData(page));
      } catch (fetchError: unknown) {
        if (active) setError(extractErrorMessage(fetchError, 'Não foi possível carregar esta página de ideias.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      active = false;
    };
  }, [idToFetch, dispatch]);

  const handleDeletePage = useCallback(async () => {
    if (!ideasPage?.id || isDeleting) return;

    try {
      setIsDeleting(true);
      await apiDeleteIdeasPage(ideasPage.id);
      await dispatch(fetchRoutes());
      navigate(IDEAS_PAGE_ROUTES.MANAGE);
    } catch (deleteError: unknown) {
      setError(extractErrorMessage(deleteError, 'Não foi possível excluir esta página.'));
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }, [ideasPage?.id, isDeleting, dispatch, navigate]);

  // O id vai na rota: sem ele a edição abria uma tela que não existe.
  const handleEdit = () => ideasPage && navigate(ideasPageEditPath(ideasPage.id));

  const sections = ideasPage?.sections ?? [];
  const totalMedia = countMedias(sections);

  return (
    <Box data-testid="page-view-ideas-material-viewpage-ideas-page-view" sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 2, sm: 3 },
        }}
      >
        {/* A faixa colorida vai de ponta a ponta; o conteúdo dela segue a
            mesma largura dos cartões, para o título nascer alinhado com eles. */}
        <Container maxWidth="xl" disableGutters sx={{ width: PAGE_WIDTH }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <IconButton
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              sx={{
                color: 'inherit',
                width: TOUCH_TARGET,
                height: TOUCH_TARGET,
                bgcolor: 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            {isAdmin && ideasPage && (
              <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                <Button
                  type="button"
                  size="small"
                  onClick={handleEdit}
                  disabled={isDeleting}
                  startIcon={<EditOutlinedIcon />}
                  sx={{ color: 'inherit', minHeight: TOUCH_TARGET, textTransform: 'none' }}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  size="small"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isDeleting}
                  startIcon={<DeleteOutlineIcon />}
                  sx={{ color: 'inherit', minHeight: TOUCH_TARGET, textTransform: 'none' }}
                >
                  Excluir
                </Button>
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <LightbulbOutlinedIcon sx={{ fontSize: 32, mt: 0.5, flexShrink: 0 }} />

            <Box sx={{ minWidth: 0 }}>
              {loading ? (
                <Skeleton variant="text" width={220} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                <Typography
                  variant="h1"
                  sx={{
                    // O título é o elemento mais importante da tela: no celular
                    // ele vinha menor que o corpo do texto.
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.15,
                    // `Global.css` pinta todo `h1` com a cor secundária, que
                    // aqui ficaria azul sobre azul.
                    color: 'inherit',
                  }}
                >
                  {ideasPage?.title}
                </Typography>
              )}

              {ideasPage?.description && (
                <Typography
                  sx={{
                    mt: 1,
                    maxWidth: 760,
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    opacity: 0.92,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {ideasPage.description}
                </Typography>
              )}

              {!loading && ideasPage && (
                <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.85 }}>
                  {pageSummaryLabel(sections.length, totalMedia)}
                </Typography>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container data-testid="page-view-ideas-material-viewpage-content"
        maxWidth="xl"
        disableGutters
        sx={{ width: PAGE_WIDTH, py: { xs: 2, sm: 3 } }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate(-1)}>
                Voltar
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading && (
          <Grid2 container spacing={{ xs: 1.5, md: 2 }} data-testid="page-view-ideas-material-viewpage-loading">
            {[0, 1, 2, 3].map((slot) => (
              <Grid2 key={slot} size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={180} />
              </Grid2>
            ))}
          </Grid2>
        )}

        {!loading && !error && sections.length === 0 && (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, textAlign: 'center', borderStyle: 'dashed' }}
          >
            <Typography variant="body1" color="text.secondary">
              Esta página ainda não tem seções publicadas.
            </Typography>
          </Paper>
        )}

        {!loading && sections.length > 0 && (
          <Grid2 container spacing={{ xs: 1.5, md: 2 }} alignItems="stretch">
            {sections.map((section) => (
              <Grid2 key={section.id} size={{ xs: 12, md: 6 }}>
                <MediaSection
                  title={section.title}
                  description={section.description}
                  medias={section.medias as MediaItem[]}
                  onOpenGallery={(kind, items) =>
                    setGallery({ sectionTitle: section.title, kind, items })
                  }
                />
              </Grid2>
            ))}
          </Grid2>
        )}
      </Container>

      <IdeasGalleryDialog
        open={Boolean(gallery)}
        sectionTitle={gallery?.sectionTitle ?? ''}
        kind={gallery?.kind ?? null}
        items={gallery?.items ?? []}
        onClose={() => setGallery(null)}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        title={ideasPage?.title}
        onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        onConfirm={handleDeletePage}
        loading={isDeleting}
      />

      {/* O rodapé do site fica logo abaixo; no celular a folga evita que o
          último cartão encoste nele. */}
      {isMobile && <Box sx={{ height: 16 }} />}
    </Box>
  );
}
