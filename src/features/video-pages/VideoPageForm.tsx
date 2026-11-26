import { useState } from 'react';
import { getRoutePagePath } from '@/pages/TeacherArea/pagePaths';
import { MediaTargetType } from '@/store/slices/types';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircleOutline,
  OpenInNew,
  Save,
  VideoLibraryOutlined,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import { useGuardedExit } from '@/hooks';
import { MediaUploadType } from '@/store/slices/types';

import VideoEditor from './components/VideoEditor';
import PlaySettings from './components/PlaySettings';
import { VIDEO_PAGE_ROUTES, VIDEO_TITLE_MAX_LENGTH } from './constants';
import { useUnsavedChangesGuard, useVideoPageById, useVideoPageForm } from './hooks';
import type { VideoPageFormProps } from './types';

/** Formulário usado para criar e para editar uma galeria de vídeos. */
export default function VideoPageForm({ fromTemplatePage = false }: VideoPageFormProps) {
  const navigate = useNavigate();

  // A página vem do id na URL. Antes ela vinha do store, que não é
  // persistido: um F5 direto nesta rota abria o formulário vazio.
  const { id } = useParams<{ id: string }>();
  const {
    page: loadedPage,
    loading: loadingPage,
    error: loadError,
    retry,
  } = useVideoPageById(fromTemplatePage ? undefined : id);

  const [hasVideoDraft, setHasVideoDraft] = useState(false);

  const {
    values,
    setValue,
    videos,
    setVideos,
    errors,
    videoApiErrors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  } = useVideoPageForm({ isCreation: fromTemplatePage, page: loadedPage });

  useUnsavedChangesGuard(isDirty || hasVideoDraft || saving);
  // Sair pelo botão da própria tela passa pela mesma confirmação do menu.
  const exit = useGuardedExit(isDirty || hasVideoDraft || saving, VIDEO_PAGE_ROUTES.MANAGE);

  if (loadingPage) {
    return (
      <Stack
        data-testid="video-pages-video-page-form"
        spacing={2}
        aria-busy="true"
        aria-label="Carregando galeria"
      >
        <Skeleton variant="rounded" height={100} />
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (!fromTemplatePage && !loadedPage) {
    return (
      <Paper
        data-testid="video-pages-video-page-form"
        variant="outlined"
        sx={{ p: 3, borderRadius: 3 }}
      >
        <Alert data-testid="video-page-load-error" severity="error">
          <AlertTitle>Página não encontrada</AlertTitle>
          {loadError || 'Abra a página que você quer editar pela lista.'}
        </Alert>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="button" onClick={retry} sx={{ minHeight: 44 }}>
            Tentar novamente
          </Button>
          <Button
            type="button"
            onClick={() => navigate(VIDEO_PAGE_ROUTES.MANAGE)}
            sx={{ minHeight: 44 }}
          >
            Ver galerias
          </Button>
        </Stack>
      </Paper>
    );
  }

  const uploads = videos.filter((video) => video.uploadType === MediaUploadType.UPLOAD).length;

  return (
    <Box data-testid="video-pages-video-page-form" component="section" sx={{ minWidth: 0, pb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <VideoLibraryOutlined />
          </Box>
          <Box>
            <Typography component="h1" variant="h5" fontWeight={800}>
              {fromTemplatePage ? 'Criar galeria de vídeos' : 'Editar galeria de vídeos'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Reúna vídeos por link ou envie arquivos para os visitantes.
            </Typography>
          </Box>
        </Stack>
        {loadedPage?.route?.path && (
          <Button
            type="button"
            component="a"
            href={getRoutePagePath({ entityType: MediaTargetType.VideosPage, path: loadedPage.route.path, idToFetch: loadedPage.route.idToFetch })}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNew />}
            variant="outlined"
            sx={{ minHeight: 44, flexShrink: 0 }}
          >
            Ver galeria salva
          </Button>
        )}
      </Stack>

      <Box component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 280px' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Typography component="h2" variant="h6" fontWeight={700}>
                Informações da página
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Aparecem no topo da galeria que os visitantes abrem.
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  label="Título da galeria"
                  required
                  fullWidth
                  value={values.title}
                  onChange={(event) => setValue('title', event.target.value)}
                  error={errors.title}
                  inputProps={{ maxLength: VIDEO_TITLE_MAX_LENGTH }}
                  helperText={
                    errors.title
                      ? 'Informe um título com até 255 caracteres.'
                      : `${values.title.length}/${VIDEO_TITLE_MAX_LENGTH}`
                  }
                />
                <TextField
                  label="Descrição"
                  required
                  fullWidth
                  multiline
                  minRows={3}
                  value={values.description}
                  onChange={(event) => setValue('description', event.target.value)}
                  error={errors.description}
                  helperText={
                    errors.description
                      ? 'Preencha a descrição da galeria.'
                      : 'Um resumo curto do que a galeria reúne'
                  }
                />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Typography component="h2" variant="h6" fontWeight={700}>
                Vídeos da galeria{' '}
                <Typography component="span" color="text.secondary">
                  ({videos.length})
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Adicione links de plataformas ou envie arquivos de vídeo.
              </Typography>
              <VideoEditor
                videos={videos}
                onChange={setVideos}
                onDraftChange={setHasVideoDraft}
                apiErrors={videoApiErrors}
                playScope={values.playScope}
              />
            </Paper>

            <PlaySettings
              value={values.playScope}
              onChange={(scope) => setValue('playScope', scope)}
              categoryId={values.playCategoryId}
              onCategoryChange={(categoryId) => setValue('playCategoryId', categoryId)}
            />
          </Stack>

          <Paper
            data-testid="video-page-summary"
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, position: { lg: 'sticky' }, top: 24 }}
          >
            <Typography component="h2" variant="subtitle1" fontWeight={700}>
              Resumo da galeria
            </Typography>
            <Stack spacing={1.5} sx={{ my: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Vídeos</Typography>
                <Typography fontWeight={700}>{videos.length}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Por link</Typography>
                <Typography fontWeight={700}>{videos.length - uploads}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Arquivos enviados</Typography>
                <Typography fontWeight={700}>{uploads}</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={values.public}
                  onChange={(event) => setValue('public', event.target.checked)}
                />
              }
              label={
                values.public ? 'Página pública' : 'Página visível apenas para quem está logado'
              }
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              As alterações entram em vigor ao salvar a galeria.
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Paper
        data-testid="video-page-save-bar"
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: 3,
          p: 2,
          pb: 'max(16px, env(safe-area-inset-bottom))',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Stack spacing={1.5}>
          {hasVideoDraft && (
            <Alert data-testid="video-page-draft-warning" severity="warning">
              <AlertTitle>Conclua o vídeo em edição</AlertTitle>
              Adicione, salve ou descarte o vídeo antes de salvar a galeria.
            </Alert>
          )}
          {feedback && (
            <Alert
              data-testid="video-page-feedback"
              severity={feedback.severity}
              onClose={dismissFeedback}
            >
              {feedback.message}
            </Alert>
          )}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
          >
            <Chip
              size="small"
              icon={<CheckCircleOutline />}
              label={
                saving
                  ? 'Salvando alterações…'
                  : isDirty || hasVideoDraft
                    ? 'Alterações não salvas'
                    : 'Nenhuma alteração pendente'
              }
              color={isDirty || hasVideoDraft ? 'warning' : 'default'}
              variant="outlined"
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
            />
            <Stack direction="row" spacing={1}>
              {!fromTemplatePage && (
                <Button
                  type="button"
                  onClick={exit.requestExit}
                  disabled={saving}
                  startIcon={<ArrowBack />}
                  sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' } }}
                >
                  Voltar para a lista
                </Button>
              )}
              <Button
                data-testid="video-page-save"
                type="button"
                variant="contained"
                disabled={saving || hasVideoDraft}
                onClick={() => void save()}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
              >
                {saving ? 'Salvando...' : 'Salvar Galeria'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <UnsavedChangesDialog
        open={exit.confirming}
        onStay={exit.cancelExit}
        onLeave={exit.confirmExit}
      />
    </Box>
  );
}
