import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { Link, useNavigate } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/VideoCall';
import { useFeatureFlags } from '@/hooks';
import { FEATURE } from '@/features/feature-flags';
import { PLAY_SUBMIT_ROUTE } from './submissions/constants';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

import { apiGetPlayQueue, apiSetPlayFavorite } from './api';
import { createQueue, saveQueue } from './queue';
import { PLAY_SECTION, PLAY_SORT, PLAY_SORT_OPTIONS, playWatchPath } from './constants';
import { usePlayHome, usePlayVideos } from './hooks';
import PlayHero from './components/PlayHero';
import PlayRow from './components/PlayRow';
import PlayVideoCard from './components/PlayVideoCard';
import type { PlayHome, PlaySort, PlayVideo } from './types';

/** Troca o favorito de um vídeo em todas as fileiras onde ele aparece. */
const withFavorite = (home: PlayHome | null, id: string, favorite: boolean): PlayHome | null =>
  home && {
    sections: home.sections.map((section) => ({
      ...section,
      videos: section.videos.map((video) => (video.id === id ? { ...video, favorite } : video)),
    })),
  };

/** Clubinho Play: home em fileiras, ou resultados quando há busca, filtro ou ordem. */
export default function PlayHomePage() {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const [startingQueue, setStartingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<PlaySort>(PLAY_SORT.CURATED);
  const [page, setPage] = useState(1);

  // Espera o professor parar de digitar antes de consultar a API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [input]);

  // Sem busca, a home mostra as fileiras; com busca, os resultados.
  const browsing = !search;

  const home = usePlayHome();
  const results = usePlayVideos({
    page,
    search: search || undefined,
    sort,
  });

  const toggleFavorite = useCallback(
    (video: PlayVideo) => {
      const next = !video.favorite;
      home.setData((current) => withFavorite(current, video.id, next));
      results.setData((current) =>
        current
          ? {
              ...current,
              data: current.data.map((item) =>
                item.id === video.id ? { ...item, favorite: next } : item
              ),
            }
          : current
      );
      apiSetPlayFavorite(video.id, next).catch(() => {
        home.setData((current) => withFavorite(current, video.id, !next));
        results.setData((current) =>
          current
            ? {
                ...current,
                data: current.data.map((item) =>
                  item.id === video.id ? { ...item, favorite: !next } : item
                ),
              }
            : current
        );
      });
    },
    [home, results]
  );

  /** Monta a fila com a busca/filtro atual e abre o primeiro vídeo. */
  const startQueue = async (shuffle: boolean) => {
    setStartingQueue(true);
    setQueueError('');
    try {
      const videos = await apiGetPlayQueue({
        search: search || undefined,
        sort,
      });
      if (videos.length === 0) {
        setQueueError('Não há vídeos para tocar com este filtro.');
        return;
      }
      const label = search ? `Busca: ${search}` : 'Todos os vídeos';
      const queue = createQueue(videos, shuffle, label);
      saveQueue(queue);
      navigate(playWatchPath(queue.order[0]));
    } catch {
      setQueueError('Não foi possível montar a fila. Tente novamente.');
    } finally {
      setStartingQueue(false);
    }
  };

  const sections = home.data?.sections ?? [];
  const featured = sections.find((section) => section.kind === PLAY_SECTION.FEATURED);
  const rows = useMemo(
    () => sections.filter((section) => section.kind !== PLAY_SECTION.FEATURED),
    [sections]
  );

  const active = browsing ? home : results;
  const emptyLibrary = browsing && !home.loading && !home.error && sections.length === 0;

  return (
    <Box data-testid="clubinho-play-page" sx={{ px: { xs: 0, md: 1 }, pb: 4 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <PlayCircleIcon sx={{ fontSize: { xs: 34, md: 42 }, color: '#4f46e5' }} />
        <Box>
          <Typography component="h1" variant="h5" fontWeight={800}>
            Clubinho Play
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vídeos para a sua preparação e para o seu Clubinho
          </Typography>
        </Box>
      </Stack>

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por título, galeria ou categoria"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        inputProps={{ 'aria-label': 'Buscar vídeo', 'data-testid': 'play-search' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5, maxWidth: { md: 520 } }}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          disabled={startingQueue}
          onClick={() => void startQueue(false)}
          data-testid="play-all"
        >
          Tocar tudo
        </Button>
        <Button
          variant="outlined"
          startIcon={<ShuffleIcon />}
          disabled={startingQueue}
          onClick={() => void startQueue(true)}
          data-testid="play-shuffle"
        >
          Aleatório
        </Button>
        {flags[FEATURE.PLAY_SUBMISSIONS] && (
          <Button
            component={Link}
            to={PLAY_SUBMIT_ROUTE}
            variant="outlined"
            color="secondary"
            startIcon={<UploadIcon />}
            data-testid="play-submit-link"
            sx={{ ml: 'auto !important' }}
          >
            Enviar vídeo
          </Button>
        )}
      </Stack>
      {queueError && (
        <Alert severity="warning" sx={{ mb: 1.5 }} onClose={() => setQueueError('')}>
          {queueError}
        </Alert>
      )}

      {!browsing && (
        <TextField
          select
          size="small"
          label="Ordenar por"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as PlaySort);
            setPage(1);
          }}
          sx={{ mb: 2, minWidth: 180 }}
        >
          {PLAY_SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {active.loading && !active.data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {active.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={active.retry}>
              Tentar novamente
            </Button>
          }
        >
          {active.error}
        </Alert>
      )}

      {emptyLibrary && (
        <Typography
          data-testid="play-empty"
          color="text.secondary"
          sx={{ py: 6, textAlign: 'center' }}
        >
          Ainda não há vídeos no Clubinho Play.
        </Typography>
      )}

      {browsing && !home.error && home.data && (
        <>
          {featured && <PlayHero videos={featured.videos} />}
          {rows.map((section) => (
            <PlayRow key={section.id} section={section} onToggleFavorite={toggleFavorite} />
          ))}
        </>
      )}

      {!browsing && !results.error && results.data && (
        <>
          {results.data.data.length === 0 ? (
            <Typography
              data-testid="play-empty"
              color="text.secondary"
              sx={{ py: 6, textAlign: 'center' }}
            >
              Nenhum vídeo encontrado.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {results.data.total} {results.data.total === 1 ? 'vídeo' : 'vídeos'}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                    xl: 'repeat(4, 1fr)',
                  },
                }}
              >
                {results.data.data.map((video) => (
                  <PlayVideoCard key={video.id} video={video} onToggleFavorite={toggleFavorite} />
                ))}
              </Box>
              {results.data.pageCount > 1 && (
                <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                  <Pagination
                    count={results.data.pageCount}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
