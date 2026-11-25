import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { extractErrorMessage } from '@/utils/apiError';
import {
  apiCreatePlayCategory,
  apiDeletePlayCategory,
  apiGetPlayStats,
  apiListPlayCategories,
  apiUpdatePlayCategory,
} from './api';
import type { PlayCategory, PlayStats } from './types';

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flex: 1, minWidth: 130 }}>
      <Typography variant="h5" fontWeight={800}>
        {value.toLocaleString('pt-BR')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

/** Administração do Clubinho Play: categorias e números de visualização. */
export default function PlayAdminPage() {
  const [stats, setStats] = useState<PlayStats | null>(null);
  const [categories, setCategories] = useState<PlayCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [loadedStats, loadedCategories] = await Promise.all([
        apiGetPlayStats(),
        apiListPlayCategories(),
      ]);
      setStats(loadedStats);
      setCategories(loadedCategories);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Não foi possível carregar o Clubinho Play.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: () => Promise<unknown>) => {
    setError('');
    try {
      await action();
      await load();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Não foi possível salvar a categoria.'));
    }
  };

  return (
    <Box data-testid="play-admin-page" sx={{ p: { xs: 1, md: 3 }, maxWidth: 960 }}>
      <Typography component="h1" variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        Clubinho Play
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Categorias e números da plataforma de vídeos. Quais vídeos aparecem é definido em cada
        página de vídeos.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {loading && !stats && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {stats && (
        <>
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1.5 }}>
            <StatTile label="Vídeos no Play" value={stats.totalVideos} />
            <StatTile label="Visualizações" value={stats.totalViews} />
            <StatTile label="Professores que assistiram" value={stats.totalViewers} />
          </Stack>

          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
            <Typography component="h2" variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
              Mais vistos
            </Typography>
            {stats.videos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum vídeo no Play ainda.
              </Typography>
            ) : (
              <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />} spacing={1}>
                {stats.videos.map((video, index) => (
                  <Stack
                    key={video.id}
                    data-testid="play-stat-row"
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ pt: index === 0 ? 0 : 1 }}
                  >
                    <Typography sx={{ width: 24, color: 'text.secondary', fontWeight: 700 }}>
                      {index + 1}
                    </Typography>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={600} noWrap>
                        {video.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {video.galleryTitle} • {video.viewers}{' '}
                        {video.viewers === 1 ? 'professor' : 'professores'} • {video.completed}{' '}
                        {video.completed === 1 ? 'concluiu' : 'concluíram'}
                      </Typography>
                    </Box>
                    <Typography fontWeight={800}>{video.views}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Typography component="h2" variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
          Categorias
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Nova categoria"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            inputProps={{ maxLength: 100, 'data-testid': 'play-category-new' }}
            fullWidth
          />
          <Button
            variant="contained"
            disabled={!newName.trim()}
            onClick={() =>
              run(async () => {
                await apiCreatePlayCategory(newName.trim());
                setNewName('');
              })
            }
          >
            Adicionar
          </Button>
        </Stack>
        {categories.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nenhuma categoria criada.
          </Typography>
        )}
        <Stack spacing={1}>
          {categories.map((category) => (
            <Stack
              key={category.id}
              data-testid="play-category-row"
              direction="row"
              spacing={1}
              alignItems="center"
            >
              {editingId === category.id ? (
                <>
                  <TextField
                    size="small"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    inputProps={{ maxLength: 100, 'aria-label': 'Nome da categoria' }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    aria-label="Salvar nome"
                    disabled={!editingName.trim()}
                    onClick={() =>
                      run(async () => {
                        await apiUpdatePlayCategory(category.id, editingName.trim());
                        setEditingId(null);
                      })
                    }
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton aria-label="Cancelar" onClick={() => setEditingId(null)}>
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.videoCount} {category.videoCount === 1 ? 'vídeo' : 'vídeos'} no Play
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label={`Renomear ${category.name}`}
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Excluir ${category.name}`}
                    color="error"
                    onClick={() => {
                      // A galeria que usava a categoria fica sem categoria.
                      if (
                        window.confirm(
                          `Excluir a categoria "${category.name}"? As galerias que a usam ficam sem categoria.`
                        )
                      ) {
                        void run(() => apiDeletePlayCategory(category.id));
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
