import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';

import { MediaType, type MediaItem } from '@/store/slices/types';
import VideoPlayer from '@/pages/PageView/VideoViewPage/VideoPlayer';
import { extractErrorMessage } from '@/utils/apiError';
import {
  apiApprovePlaySubmission,
  apiListPlayGalleries,
  apiListPlaySubmissionsAdmin,
  apiRejectPlaySubmission,
} from './api';
import { PLAY_SUBMISSION_REASON_MAX_LENGTH } from './constants';
import SubmissionCard from './components/SubmissionCard';
import type {
  PlayGalleryOption,
  PlaySubmission,
  PlaySubmissionStatus,
  PlaySubmissionsPage,
} from './types';

const TABS: { value: PlaySubmissionStatus; label: string }[] = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Publicados' },
  { value: 'rejected', label: 'Reprovados' },
];

const toMediaItem = (submission: PlaySubmission): MediaItem => ({
  id: submission.id,
  title: submission.title,
  description: submission.description,
  mediaType: MediaType.VIDEO,
  uploadType: submission.uploadType,
  platformType: submission.platformType ?? undefined,
  url: submission.url,
  isLocalFile: submission.uploadType === 'upload',
});

/** Fila de aprovação: o admin vê o vídeo, escolhe a galeria e publica, ou reprova com motivo. */
export default function PlaySubmissionsAdminPage() {
  const [status, setStatus] = useState<PlaySubmissionStatus>('pending');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PlaySubmissionsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [previewing, setPreviewing] = useState<PlaySubmission | null>(null);
  const [approving, setApproving] = useState<PlaySubmission | null>(null);
  const [rejecting, setRejecting] = useState<PlaySubmission | null>(null);
  const [galleries, setGalleries] = useState<PlayGalleryOption[] | null>(null);
  const [galleryId, setGalleryId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await apiListPlaySubmissionsAdmin(status, page));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Não foi possível carregar os envios.'));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const openApprove = async (submission: PlaySubmission) => {
    setApproving(submission);
    setFeatured(false);
    setError('');
    try {
      const options = await apiListPlayGalleries();
      setGalleries(options);
      setGalleryId((current) =>
        options.some((o) => o.id === current) ? current : (options[0]?.id ?? '')
      );
    } catch (err: unknown) {
      setGalleries([]);
      setError(extractErrorMessage(err, 'Não foi possível carregar as galerias.'));
    }
  };

  const decide = async (action: () => Promise<unknown>, onDone: () => void) => {
    setBusy(true);
    setError('');
    try {
      await action();
      onDone();
      await load();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Não foi possível concluir a ação.'));
      // Outro admin pode ter decidido antes: recarrega para refletir.
      await load();
    } finally {
      setBusy(false);
    }
  };

  const counts = data?.counts;
  const countOf = (value: PlaySubmissionStatus) => counts?.[value];

  return (
    <Box data-testid="play-submissions-admin" sx={{ p: { xs: 1, md: 3 }, maxWidth: 1000 }}>
      <Typography component="h1" variant="h5" fontWeight={800}>
        Aprovação de vídeos do Clubinho Play
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Vídeos enviados por professores, coordenação e administração. Aprovar publica o vídeo na
        galeria escolhida.
      </Typography>

      <Tabs
        value={status}
        onChange={(_, value: PlaySubmissionStatus) => {
          setStatus(value);
          setPage(1);
        }}
        variant="scrollable"
        sx={{ mb: 2 }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            data-testid={`tab-${tab.value}`}
            label={`${tab.label}${countOf(tab.value) !== undefined ? ` (${countOf(tab.value)})` : ''}`}
          />
        ))}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {loading && !data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}
      {data && data.data.length === 0 && (
        <Typography
          color="text.secondary"
          sx={{ py: 5, textAlign: 'center' }}
          data-testid="submissions-empty"
        >
          {status === 'pending' ? 'Nenhum vídeo aguardando aprovação.' : 'Nada por aqui ainda.'}
        </Typography>
      )}

      <Stack spacing={1.5}>
        {data?.data.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            showSubmitter
            onPreview={setPreviewing}
            actions={
              submission.status === 'pending' ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => void openApprove(submission)}
                    data-testid="approve-open"
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => {
                      setReason('');
                      setRejecting(submission);
                    }}
                    data-testid="reject-open"
                  >
                    Reprovar
                  </Button>
                </Stack>
              ) : undefined
            }
          />
        ))}
      </Stack>

      {data && data.pageCount > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={data.pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={Boolean(previewing)}
        onClose={() => setPreviewing(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{previewing?.title}</DialogTitle>
        <DialogContent>
          {previewing && <VideoPlayer video={toMediaItem(previewing)} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewing(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(approving)}
        onClose={() => !busy && setApproving(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Aprovar e publicar</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            &quot;{approving?.title}&quot; será publicado no Clubinho Play, na galeria escolhida.
          </Typography>
          {galleries === null && <CircularProgress size={22} />}
          {galleries?.length === 0 && (
            <Alert severity="warning">
              Nenhuma galeria está no Clubinho Play. Em{' '}
              <Link to="/adm/paginas-videos">Páginas de vídeos</Link>, abra uma galeria e escolha
              &quot;Galeria inteira&quot; ou &quot;Só alguns vídeos&quot; em Clubinho Play.
            </Alert>
          )}
          {galleries && galleries.length > 0 && (
            <Stack spacing={1.5}>
              <TextField
                select
                label="Galeria"
                value={galleryId}
                onChange={(event) => setGalleryId(event.target.value)}
                inputProps={{ 'data-testid': 'approve-gallery' }}
                fullWidth
              >
                {galleries.map((gallery) => (
                  <MenuItem key={gallery.id} value={gallery.id}>
                    {gallery.title}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={featured}
                    onChange={(event) => setFeatured(event.target.checked)}
                  />
                }
                label="Marcar como destaque"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setApproving(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={busy || !galleryId || !galleries?.length}
            onClick={() =>
              approving &&
              void decide(
                () => apiApprovePlaySubmission(approving.id, galleryId, featured),
                () => setApproving(null)
              )
            }
            data-testid="approve-confirm"
          >
            Aprovar e publicar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(rejecting)}
        onClose={() => !busy && setRejecting(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reprovar vídeo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            O motivo aparece para quem enviou &quot;{rejecting?.title}&quot;. Se for um arquivo, ele
            é apagado.
          </Typography>
          <TextField
            label="Motivo (opcional)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            inputProps={{
              maxLength: PLAY_SUBMISSION_REASON_MAX_LENGTH,
              'data-testid': 'reject-reason',
            }}
            multiline
            minRows={2}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setRejecting(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={busy}
            onClick={() =>
              rejecting &&
              void decide(
                () => apiRejectPlaySubmission(rejecting.id, reason),
                () => setRejecting(null)
              )
            }
            data-testid="reject-confirm"
          >
            Reprovar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
