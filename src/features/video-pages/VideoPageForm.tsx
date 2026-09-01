import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid2,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { RootState } from '@/store/slices';

import VideoEditor from './components/VideoEditor';
import { VIDEO_PAGE_ROUTES } from './constants';
import { useUnsavedChangesGuard, useVideoPageForm } from './hooks';
import { VideoPageResponse } from './types';

interface VideoPageFormProps {
  /** True quando o admin cria a galeria a partir da galeria de modelos. */
  fromTemplatePage?: boolean;
}

/** Formulário usado para criar e para editar uma galeria de vídeos. */
export default function VideoPageForm({
  fromTemplatePage = false,
}: VideoPageFormProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const storedPage = useSelector(
    (state: RootState) => state.video.videoData,
  ) as VideoPageResponse | null;

  const [hasVideoDraft, setHasVideoDraft] = useState(false);

  // A edição depende da galeria carregada no store, que não é persistido: um F5
  // direto nesta rota deixaria o formulário vazio e só falharia ao salvar.
  const isMissingPage = !fromTemplatePage && !storedPage;

  const {
    values,
    setValue,
    videos,
    setVideos,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  } = useVideoPageForm({ isCreation: fromTemplatePage, page: storedPage });

  useUnsavedChangesGuard(isDirty || hasVideoDraft);

  if (isMissingPage) {
    return (
      <Box component="section" sx={{ py: { xs: 2, md: 3 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              type="button"
              onClick={() => navigate(VIDEO_PAGE_ROUTES.MANAGE)}
            >
              Ver galerias
            </Button>
          }
        >
          <AlertTitle>Nenhuma galeria selecionada</AlertTitle>
          Abra a galeria que você quer editar pela lista de páginas de vídeos.
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ pb: { xs: 2, md: 3 } }}>
      {!fromTemplatePage && (
        <Typography variant="h5" fontWeight={700} sx={{ mb: { xs: 2, md: 3 } }}>
          Editar Galeria de Vídeos
        </Typography>
      )}

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: { xs: 2, md: 3 } }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Informações da página
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Aparecem no topo da galeria que os visitantes abrem.
        </Typography>

        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <TextField
              label="Título da galeria"
              fullWidth
              required
              value={values.title}
              onChange={(event) => setValue('title', event.target.value)}
              error={errors.title}
              helperText={
                errors.title ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''
              }
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Descrição"
              fullWidth
              required
              multiline
              minRows={3}
              value={values.description}
              onChange={(event) => setValue('description', event.target.value)}
              error={errors.description}
              helperText={
                errors.description
                  ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
                  : 'Um resumo curto do que a galeria reúne'
              }
            />
          </Grid2>

          <Grid2 size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.public}
                  onChange={(event) => setValue('public', event.target.checked)}
                />
              }
              label={
                values.public
                  ? 'Página pública'
                  : 'Página visível apenas para quem está logado'
              }
            />
          </Grid2>
        </Grid2>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Vídeos da galeria
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Adicione links de plataformas ou envie arquivos de vídeo.
        </Typography>

        <VideoEditor
          videos={videos}
          onChange={setVideos}
          onDraftChange={setHasVideoDraft}
        />
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          pb: { xs: 'calc(12px + env(safe-area-inset-bottom))', md: 2 },
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.25, sm: 2 },
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="body2" color="text.secondary">
            {videos.length === 0
              ? 'Nenhum vídeo adicionado'
              : `${videos.length} ${videos.length === 1 ? 'vídeo' : 'vídeos'} nesta galeria`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          type="button"
          onClick={save}
          disabled={saving}
          fullWidth={isMobile}
          startIcon={
            saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
          }
          sx={{ minHeight: 44, textTransform: 'none', px: 3 }}
        >
          {saving ? 'Salvando...' : 'Salvar Galeria'}
        </Button>
      </Paper>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={dismissFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback?.severity ?? 'success'} variant="filled">
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
