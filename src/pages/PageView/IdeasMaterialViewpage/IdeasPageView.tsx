import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid2,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { TEACHER_LIST_PATH } from '@/pages/TeacherArea/pagePaths';
import { MediaTargetType } from '@/store/slices/types';
import TeacherPageCard from '@/pages/TeacherArea/components/Layout/TeacherPageCard';
import { TOUCH_TARGET, type IdeasMediaKind } from './constants';
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

  const adminActions =
    isAdmin && ideasPage ? (
      <Stack direction="row" spacing={1}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={handleEdit}
          disabled={isDeleting}
          startIcon={<EditOutlinedIcon />}
          sx={{ minHeight: TOUCH_TARGET, textTransform: 'none', flex: { xs: 1, sm: 'none' } }}
        >
          Editar
        </Button>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="error"
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={isDeleting}
          startIcon={<DeleteOutlineIcon />}
          sx={{ minHeight: TOUCH_TARGET, textTransform: 'none', flex: { xs: 1, sm: 'none' } }}
        >
          Excluir
        </Button>
      </Stack>
    ) : undefined;

  return (
    <TeacherPageCard
      testId="page-view-ideas-material-viewpage-ideas-page-view"
      icon={<LightbulbOutlinedIcon sx={{ fontSize: 22 }} />}
      accent="#9333ea"
      backTo={TEACHER_LIST_PATH[MediaTargetType.IdeasPage]}
      backLabel="Voltar para Ideias"
      title={loading ? 'Carregando...' : ideasPage?.title ?? 'Ideias'}
      subtitle={!loading && ideasPage ? pageSummaryLabel(sections.length, totalMedia) : undefined}
      actions={adminActions}
    >
      {ideasPage?.description && (
        <Typography
          sx={{ mb: 2.5, maxWidth: 760, color: '#475569', fontSize: { xs: '0.95rem', md: '1rem' }, whiteSpace: 'pre-wrap' }}
        >
          {ideasPage.description}
        </Typography>
      )}

      <Box data-testid="page-view-ideas-material-viewpage-content">
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/area-do-professor/ideias')}>
                Ver ideias
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
      </Box>

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

    </TeacherPageCard>
  );
}
