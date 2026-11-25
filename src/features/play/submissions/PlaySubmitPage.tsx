import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import { Link } from 'react-router-dom';

import { extractErrorMessage } from '@/utils/apiError';
import { getYouTubeId, getYouTubeThumb } from '@/utils/video';
import { PLAY_ROUTE } from '../constants';
import { extractVideoMetadata } from '../media';
import { formatDuration } from '../utils';
import {
  apiCreatePlaySubmission,
  apiListMyPlaySubmissions,
  apiWithdrawPlaySubmission,
} from './api';
import {
  PLAY_SUBMISSION_DESCRIPTION_MAX_LENGTH,
  PLAY_SUBMISSION_TITLE_MAX_LENGTH,
} from './constants';
import SubmissionCard from './components/SubmissionCard';
import type { PlaySubmission, PlaySubmissionDraft } from './types';
import {
  buildSubmissionFormData,
  formatFileSize,
  validateSubmission,
  type PlaySubmissionErrors,
} from './utils';

const EMPTY_DRAFT: PlaySubmissionDraft = {
  title: '',
  description: '',
  mode: 'link',
  url: '',
  file: null,
  thumbnail: null,
  durationSeconds: null,
};

/** Enviar um vídeo ao Clubinho Play (link do YouTube ou arquivo) e acompanhar os envios. */
export default function PlaySubmitPage() {
  const [draft, setDraft] = useState<PlaySubmissionDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<PlaySubmissionErrors>({});
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);
  const [mine, setMine] = useState<PlaySubmission[] | null>(null);
  const [withdrawing, setWithdrawing] = useState<PlaySubmission | null>(null);

  const reload = useCallback(async () => {
    try {
      setMine(await apiListMyPlaySubmissions());
    } catch {
      setMine([]);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(
    () => () => {
      if (thumbPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbPreview);
    },
    [thumbPreview]
  );

  const patch = (changes: Partial<PlaySubmissionDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setFeedback(null);
  };

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    patch({ file, thumbnail: null, durationSeconds: null });
    setErrors((current) => ({ ...current, file: undefined }));
    setThumbPreview(null);
    setReading(true);
    const metadata = await extractVideoMetadata(file);
    setReading(false);
    setDraft((current) =>
      current.file === file
        ? { ...current, thumbnail: metadata.thumbnail, durationSeconds: metadata.durationSeconds }
        : current
    );
    if (metadata.thumbnail) setThumbPreview(URL.createObjectURL(metadata.thumbnail));
  };

  const youtubeThumb =
    draft.mode === 'link' ? getYouTubeThumb(getYouTubeId(draft.url.trim()), 'hq') : undefined;
  const preview = draft.mode === 'link' ? youtubeThumb : thumbPreview;

  const submit = async () => {
    const found = validateSubmission(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    setProgress(0);
    setFeedback(null);
    try {
      await apiCreatePlaySubmission(buildSubmissionFormData(draft), setProgress);
      setDraft(EMPTY_DRAFT);
      setThumbPreview(null);
      setFeedback({
        severity: 'success',
        message:
          'Vídeo enviado! Ele vai aparecer no Clubinho Play assim que a administração aprovar.',
      });
      await reload();
    } catch (error: unknown) {
      setFeedback({
        severity: 'error',
        message: extractErrorMessage(error, 'Não foi possível enviar o vídeo. Tente novamente.'),
      });
    } finally {
      setSending(false);
    }
  };

  const withdraw = async () => {
    if (!withdrawing) return;
    const target = withdrawing;
    setWithdrawing(null);
    try {
      await apiWithdrawPlaySubmission(target.id);
      await reload();
    } catch (error: unknown) {
      setFeedback({
        severity: 'error',
        message: extractErrorMessage(error, 'Não foi possível retirar o envio.'),
      });
    }
  };

  return (
    <Box data-testid="play-submit-page" sx={{ pb: 4, maxWidth: 820, mx: 'auto' }}>
      <Button
        component={Link}
        to={PLAY_ROUTE}
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 1 }}
      >
        Clubinho Play
      </Button>
      <Typography component="h1" variant="h5" fontWeight={800}>
        Enviar vídeo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Compartilhe um vídeo com os outros professores. Ele passa pela aprovação da administração
        antes de aparecer.
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            color="primary"
            value={draft.mode}
            onChange={(_, mode: 'link' | 'upload' | null) => mode && patch({ mode })}
            aria-label="Como enviar"
          >
            <ToggleButton value="link" data-testid="submit-mode-link">
              Link do YouTube
            </ToggleButton>
            <ToggleButton value="upload" data-testid="submit-mode-upload">
              Enviar arquivo
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Título"
            value={draft.title}
            onChange={(event) => patch({ title: event.target.value })}
            error={Boolean(errors.title)}
            helperText={errors.title}
            inputProps={{
              maxLength: PLAY_SUBMISSION_TITLE_MAX_LENGTH,
              'data-testid': 'submit-title',
            }}
            fullWidth
          />
          <TextField
            label="Descrição (opcional)"
            value={draft.description}
            onChange={(event) => patch({ description: event.target.value })}
            inputProps={{ maxLength: PLAY_SUBMISSION_DESCRIPTION_MAX_LENGTH }}
            multiline
            minRows={2}
            fullWidth
          />

          {draft.mode === 'link' ? (
            <TextField
              label="Link do YouTube"
              placeholder="https://www.youtube.com/watch?v=..."
              value={draft.url}
              onChange={(event) => patch({ url: event.target.value })}
              error={Boolean(errors.url)}
              helperText={errors.url}
              inputProps={{ 'data-testid': 'submit-url' }}
              fullWidth
            />
          ) : (
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {draft.file ? 'Trocar arquivo' : 'Selecionar vídeo (até 100 MB)'}
                <input
                  hidden
                  type="file"
                  accept="video/*"
                  data-testid="submit-file"
                  onChange={(event) => {
                    void pickFile(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
              </Button>
              {draft.file && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {draft.file.name} • {formatFileSize(draft.file.size)}
                  {draft.durationSeconds ? ` • ${formatDuration(draft.durationSeconds)}` : ''}
                  {reading ? ' • lendo o vídeo…' : ''}
                </Typography>
              )}
              {errors.file && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                  {errors.file}
                </Typography>
              )}
            </Box>
          )}

          {preview && (
            <Box
              component="img"
              src={preview}
              alt="Pré-visualização do vídeo"
              sx={{
                width: '100%',
                maxWidth: 360,
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          )}

          {sending && draft.mode === 'upload' && (
            <Box>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary">
                Enviando… {progress}%
              </Typography>
            </Box>
          )}

          {feedback && (
            <Alert
              severity={feedback.severity}
              data-testid="submit-feedback"
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            disabled={sending || reading}
            onClick={() => void submit()}
            data-testid="submit-send"
            sx={{ py: 1.4, fontWeight: 800 }}
          >
            {sending ? 'Enviando…' : 'Enviar para aprovação'}
          </Button>
        </Stack>
      </Paper>

      <Typography component="h2" variant="h6" fontWeight={800} sx={{ mt: 4, mb: 1.5 }}>
        Meus envios
      </Typography>
      {mine === null && <CircularProgress size={24} />}
      {mine?.length === 0 && (
        <Typography variant="body2" color="text.secondary" data-testid="my-submissions-empty">
          Você ainda não enviou nenhum vídeo.
        </Typography>
      )}
      <Stack spacing={1.5}>
        {mine?.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            actions={
              submission.status === 'pending' ? (
                <Button size="small" color="error" onClick={() => setWithdrawing(submission)}>
                  Retirar envio
                </Button>
              ) : undefined
            }
          />
        ))}
      </Stack>

      <Dialog open={Boolean(withdrawing)} onClose={() => setWithdrawing(null)}>
        <DialogTitle>Retirar envio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Retirar &quot;{withdrawing?.title}&quot;? O vídeo deixa de aguardar aprovação e o
            arquivo enviado é apagado.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawing(null)}>Cancelar</Button>
          <Button color="error" onClick={() => void withdraw()}>
            Retirar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
