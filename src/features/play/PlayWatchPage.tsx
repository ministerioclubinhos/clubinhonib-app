import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { apiRecordPlayView, apiSavePlayProgress, apiSetPlayFavorite } from './api';
import { PLAY_RESUME_MARGIN_SECONDS, PLAY_ROUTE, playWatchPath } from './constants';
import { usePlayVideo, useRelatedPlayVideos } from './hooks';
import PlayPlayer from './components/PlayPlayer';
import PlayVideoCard from './components/PlayVideoCard';
import {
  loadQueue,
  nextInQueue,
  previousInQueue,
  queueIndex,
  saveQueue,
  upcoming,
  withShuffle,
  type PlayQueue,
} from './queue';
import { formatViews, resumeAt, timeAgo } from './utils';

/** Página do vídeo: player grande, ações, descrição e "Próximos vídeos". */
export default function PlayWatchPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const video = usePlayVideo(id);
  const related = useRelatedPlayVideos(id);

  const [autoplayNext, setAutoplayNext] = useState(true);
  const [queue, setQueue] = useState<PlayQueue | null>(() => loadQueue());
  // Abrir um vídeo que não é da fila (por um card, por exemplo) encerra a fila.
  const inQueue = queue !== null && queueIndex(queue, id) >= 0;
  useEffect(() => {
    if (queue && queueIndex(queue, id) < 0) {
      saveQueue(null);
      setQueue(null);
    }
  }, [queue, id]);

  const updateQueue = (next: PlayQueue | null) => {
    saveQueue(next);
    setQueue(next);
  };
  const [toast, setToast] = useState('');
  // O ponto de retomada é lido uma vez por vídeo: o progresso que o próprio
  // player grava não pode reiniciar a reprodução.
  const startAt = useRef(0);
  const startFor = useRef('');
  if (video.data && startFor.current !== video.data.id) {
    startFor.current = video.data.id;
    startAt.current = resumeAt(video.data, PLAY_RESUME_MARGIN_SECONDS);
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  const handleStart = useCallback(() => {
    apiRecordPlayView(id).catch(() => undefined);
  }, [id]);

  const handleProgress = useCallback(
    (position: number, duration: number) => {
      apiSavePlayProgress(id, position, duration).catch(() => undefined);
    },
    [id]
  );

  const nextVideo = related.data?.[0];
  const queuedNext = inQueue && queue ? nextInQueue(queue, id) : null;
  const queuedPrevious = inQueue && queue ? previousInQueue(queue, id) : null;
  const handleEnded = useCallback(() => {
    if (!autoplayNext) return;
    // Na fila, o próximo é o da fila; fora dela, o primeiro relacionado.
    if (inQueue) {
      if (queuedNext) navigate(playWatchPath(queuedNext));
      return;
    }
    if (nextVideo) navigate(playWatchPath(nextVideo.id));
  }, [autoplayNext, inQueue, queuedNext, nextVideo, navigate]);

  const toggleFavorite = () => {
    if (!video.data) return;
    const next = !video.data.favorite;
    video.setData((current) => current && { ...current, favorite: next });
    apiSetPlayFavorite(id, next)
      .then(() => setToast(next ? 'Salvo em Assistir depois' : 'Removido de Assistir depois'))
      .catch(() => video.setData((current) => current && { ...current, favorite: !next }));
  };

  const share = async () => {
    const url = `${window.location.origin}${playWatchPath(id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.data?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast('Link copiado');
      }
    } catch {
      // Compartilhamento cancelado pelo usuário: nada a fazer.
    }
  };

  if (video.loading && !video.data) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (video.error || !video.data) {
    return (
      <Box data-testid="play-watch-error" sx={{ py: 2 }}>
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" component={Link} to={PLAY_ROUTE}>
              Voltar ao Play
            </Button>
          }
        >
          {video.error ?? 'Vídeo não encontrado no Clubinho Play.'}
        </Alert>
      </Box>
    );
  }

  const current = video.data;

  return (
    <Box data-testid="play-watch-page" sx={{ pb: 4 }}>
      <Button
        component={Link}
        to={PLAY_ROUTE}
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 1, ml: { xs: 1, sm: 0 } }}
      >
        Clubinho Play
      </Button>

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2, lg: 3 },
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 380px' },
          alignItems: 'start',
        }}
      >
        <Box sx={{ mx: { xs: -1.5, sm: 0 }, minWidth: 0 }}>
          <PlayPlayer
            video={current}
            startAt={startAt.current}
            onStart={handleStart}
            onProgress={handleProgress}
            onEnded={handleEnded}
          />

          <Box sx={{ px: { xs: 1.5, sm: 0 }, pt: 1.5 }}>
            <Typography component="h1" variant="h6" fontWeight={800} sx={{ lineHeight: 1.25 }}>
              {current.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {[formatViews(current.viewCount), timeAgo(current.createdAt)]
                .filter(Boolean)
                .join(' • ')}
            </Typography>

            <Paper
              data-testid="play-actions"
              elevation={0}
              sx={{
                mt: 2,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                bgcolor: '#eef2ff',
                border: '1px solid #c7d2fe',
                display: 'grid',
                gap: 1.25,
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<SkipPreviousIcon />}
                disabled={!queuedPrevious}
                onClick={() => queuedPrevious && navigate(playWatchPath(queuedPrevious))}
                sx={{ py: 1.4, fontWeight: 800, display: inQueue ? 'inline-flex' : 'none' }}
              >
                Anterior
              </Button>
              <Button
                variant="contained"
                size="large"
                endIcon={<SkipNextIcon />}
                disabled={inQueue ? !queuedNext : !nextVideo}
                onClick={() => {
                  const target = inQueue ? queuedNext : nextVideo?.id;
                  if (target) navigate(playWatchPath(target));
                }}
                sx={{ py: 1.4, fontWeight: 800 }}
              >
                Próximo
              </Button>
              {inQueue && queue && (
                <Button
                  variant={queue.shuffle ? 'contained' : 'outlined'}
                  color="secondary"
                  size="large"
                  startIcon={<ShuffleIcon />}
                  aria-pressed={queue.shuffle}
                  onClick={() => updateQueue(withShuffle(queue, !queue.shuffle, id))}
                  sx={{ py: 1.4, fontWeight: 800, bgcolor: queue.shuffle ? undefined : '#fff' }}
                >
                  Aleatório
                </Button>
              )}
              <Button
                variant={current.favorite ? 'contained' : 'outlined'}
                color={current.favorite ? 'error' : 'primary'}
                size="large"
                startIcon={current.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                onClick={toggleFavorite}
                aria-pressed={current.favorite}
                sx={{ py: 1.4, fontWeight: 800, bgcolor: current.favorite ? undefined : '#fff' }}
              >
                {current.favorite ? 'Salvo' : 'Assistir depois'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShareIcon />}
                onClick={share}
                sx={{ py: 1.4, fontWeight: 800, bgcolor: '#fff' }}
              >
                Compartilhar
              </Button>
            </Paper>

            <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
                <Chip size="small" label={current.galleryTitle} />
                {current.categoryName && (
                  <Chip size="small" color="primary" label={current.categoryName} />
                )}
              </Stack>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {current.description || 'Sem descrição.'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box component="aside" sx={{ minWidth: 0 }}>
          {inQueue && queue && (
            <Paper
              data-testid="play-queue-bar"
              variant="outlined"
              sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fila • {queue.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {queueIndex(queue, id) + 1} de {queue.order.length}
                    {queue.shuffle ? ' • aleatório' : ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton aria-label="Encerrar fila" onClick={() => updateQueue(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          )}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography component="h2" variant="subtitle1" fontWeight={800}>
              {inQueue ? 'Próximos da fila' : 'Próximos vídeos'}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={autoplayNext}
                  onChange={(event) => setAutoplayNext(event.target.checked)}
                />
              }
              label={<Typography variant="caption">Reprodução automática</Typography>}
              sx={{ mr: 0 }}
            />
          </Stack>
          {!inQueue && related.loading && !related.data && <CircularProgress size={24} />}
          {(inQueue ? upcoming(queue as PlayQueue, id) : (related.data ?? [])).length === 0 &&
            !(related.loading && !inQueue) && (
              <Typography variant="body2" color="text.secondary">
                {inQueue ? 'Este é o último vídeo da fila.' : 'Não há outros vídeos por enquanto.'}
              </Typography>
            )}
          <Stack spacing={0.5}>
            {(inQueue ? upcoming(queue as PlayQueue, id) : (related.data ?? [])).map((item) => (
              <PlayVideoCard key={item.id} video={item} variant="compact" />
            ))}
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast('')}
        message={toast}
      />
    </Box>
  );
}
