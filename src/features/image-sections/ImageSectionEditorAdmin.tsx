import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
import PublicIcon from '@mui/icons-material/Public';
import SaveIcon from '@mui/icons-material/Save';

import BackHeader from '@/components/common/header/BackHeader';
import { RootState } from '@/store/slices';
import { clearData, setData, SectionData } from '@/store/slices/image-section/imageSectionSlice';
import type { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
import { extractErrorMessage } from '@/utils/apiError';
import { FORM_VALIDATION_MESSAGES, GENERIC_ERROR_MESSAGES } from '@/constants/errorMessages';

import { LoadingSpinner } from '@/pages/TeacherArea/components/Modals';
import { NotificationModal } from '@/pages/TeacherArea/components/Modals';
import ImageSectionEditor from '@/pages/TeacherArea/ImageSection/ImageSectionEditor';

import { apiFetchImageSection, apiUpdateImageSection } from './api';
import { validateClubinhoPublication } from './media-utils';
import { buildSectionFormData, buildSectionUpload } from './utils';
import type { ImageSectionResponse } from './types';

/** Para onde a revisão volta quando termina. */
const LIST_ROUTE = '/adm/fotos-clubinhos';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

/** A publicação vinda da API, no formato que o editor entende. */
function toSectionData(section: ImageSectionResponse): SectionData {
  return {
    id: section.id,
    caption: section.caption,
    description: section.description,
    public: section.public,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
    mediaItems: section.mediaItems.map((media) => ({
      id: media.id,
      title: media.title ?? '',
      description: media.description ?? '',
      uploadType: media.uploadType as MediaUploadType,
      mediaType: media.mediaType as MediaType,
      isLocalFile: media.isLocalFile,
      url: media.url,
      platformType: (media.platformType as MediaPlatform) || undefined,
      originalName: media.originalName || undefined,
      size: media.size || undefined,
    })),
  };
}

/**
 * Revisão de uma publicação de fotos.
 *
 * A tela funciona pelo id da rota. Antes ela dependia só do que a listagem
 * deixava no Redux: recarregar a página ou abrir o link direto devolvia o
 * revisor para a lista, com o trabalho perdido.
 */
export default function ImageSectionEditorAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();

  const sectionData = useSelector(
    (state: RootState) => state.imageSection.data
  ) as SectionData | null;

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const sectionId = routeId ?? sectionData?.id;

  const showError = (message: string) =>
    setNotification({ open: true, message, severity: 'error' });

  // Sem nada em memória, a publicação vem da API pelo id da rota.
  useEffect(() => {
    if (sectionData?.id && (!routeId || sectionData.id === routeId)) return;

    if (!routeId) {
      navigate(LIST_ROUTE, { replace: true });
      return;
    }

    let cancelado = false;

    const carregar = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const section = await apiFetchImageSection(routeId);
        if (!cancelado) dispatch(setData(toSectionData(section)));
      } catch (error: unknown) {
        if (!cancelado) {
          setLoadError(extractErrorMessage(error, 'Erro ao carregar a publicação'));
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    void carregar();

    return () => {
      cancelado = true;
    };
  }, [routeId, sectionData?.id, dispatch, navigate]);

  const validate = useCallback((): boolean => {
    if (!sectionData?.caption?.trim()) {
      showError(FORM_VALIDATION_MESSAGES.SHARED_GALLERY_TITLE_REQUIRED);
      return false;
    }
    if (!sectionData?.description?.trim()) {
      showError(FORM_VALIDATION_MESSAGES.SHARED_GALLERY_DESCRIPTION_REQUIRED);
      return false;
    }
    const mediaError = validateClubinhoPublication(sectionData.mediaItems, true);
    if (mediaError) {
      showError(mediaError);
      return false;
    }
    return true;
  }, [sectionData]);

  /**
   * Grava a revisão.
   *
   * `publicar` decide o destino: aprovada vai ao ar, guardada continua na fila
   * com o texto e as fotos já ajustados.
   */
  const salvar = async (publicar: boolean) => {
    if (!validate()) return;
    if (!sectionId) {
      showError(FORM_VALIDATION_MESSAGES.SECTION_ID_NOT_FOUND);
      return;
    }

    setIsSaving(true);
    try {
      const { payload, uploads } = buildSectionUpload({
        caption: sectionData!.caption,
        description: sectionData!.description,
        public: publicar,
        mediaItems: sectionData!.mediaItems,
      });

      await apiUpdateImageSection(sectionId, buildSectionFormData(payload, uploads));

      dispatch(clearData());
      navigate(LIST_ROUTE);
    } catch (error: unknown) {
      showError(extractErrorMessage(error, GENERIC_ERROR_MESSAGES.SAVE_ERROR));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (updatedData: Partial<SectionData>) => {
    dispatch(setData({ ...(sectionData || {}), ...updatedData } as SectionData));
  };

  if (loading) {
    return (
      <Box
        data-testid="image-sections-image-section-editor-admin"
        sx={{ display: 'flex', justifyContent: 'center', py: 8 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Container
        data-testid="image-sections-image-section-editor-admin"
        maxWidth="lg"
        sx={{ py: 4 }}
      >
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => navigate(LIST_ROUTE)}>
              Voltar
            </Button>
          }
        >
          {loadError}
        </Alert>
      </Container>
    );
  }

  if (!sectionData) return null;

  const noAr = sectionData.public;

  return (
    <Box
      data-testid="image-sections-image-section-editor-admin"
      sx={{
        minHeight: '100vh',
        '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
        bgcolor: '#f9fafb',
        px: { xs: 2, md: 0 },
        pb: 4,
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <BackHeader title="Revisar fotos e vídeos" />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            mb: 2,
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1.5, md: 2 }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                color={noAr ? 'success' : 'warning'}
                label={noAr ? 'No feed' : 'Aguardando aprovação'}
              />
              <Chip
                size="small"
                variant="outlined"
                icon={<CollectionsIcon />}
                label={
                  sectionData.mediaItems.length === 1
                    ? '1 mídia'
                    : `${sectionData.mediaItems.length} mídias`
                }
              />
            </Stack>

            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={1}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <Button
                variant="outlined"
                onClick={() => void salvar(false)}
                disabled={isSaving}
                startIcon={<SaveIcon />}
                fullWidth={false}
                sx={{ minHeight: { xs: 44, sm: 'auto' } }}
              >
                Salvar sem publicar
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={() => void salvar(true)}
                disabled={isSaving}
                startIcon={<PublicIcon />}
                sx={{ minHeight: { xs: 44, sm: 'auto' } }}
              >
                {noAr ? 'Salvar e manter no feed' : 'Aprovar e publicar'}
              </Button>
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Confira o título, a descrição e as fotos ou o vídeo antes de decidir. Publicar leva o
            registro para o feed do clubinho.
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <LoadingSpinner open={isSaving} aria-label="Salvando a publicação" />

          <NotificationModal
            open={notification.open}
            message={notification.message}
            severity={notification.severity}
            onClose={() => setNotification({ ...notification, open: false })}
          />

          <ImageSectionEditor
            isEditMode
            disabled={isSaving}
            initialCaption={sectionData.caption || ''}
            initialDescription={sectionData.description || ''}
            // Fora do ar por padrão: publicar é escolha explícita nos botões.
            initialIsPublic={sectionData.public ?? false}
            initialMediaItems={sectionData.mediaItems || []}
            onChange={handleChange}
            captionPlaceholder="EX: Clubinho 90: Gincana de Páscoa"
            descriptionPlaceholder="EX: dinâmicas, brincadeiras e momentos especiais registrados."
          />
        </Paper>
      </Container>
    </Box>
  );
}
