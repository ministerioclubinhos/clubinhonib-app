import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Chip,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CoordinatorProfile } from '../types';
import CircularProgress from '@mui/material/CircularProgress';
import { fmtDate } from '@/utils/dates';

type Props = {
  open: boolean;
  loading?: boolean;
  coordinator: CoordinatorProfile | null;
  onClose: () => void;
};

export default function CoordinatorViewDialog({ open, loading, coordinator, onClose }: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const teachers = React.useMemo(() => {
    if (!coordinator?.clubs) return [];
    return coordinator.clubs.flatMap((c) => c.teachers ?? []);
  }, [coordinator]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes do Coordenador</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {loading && (
          <Box textAlign="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}
        {!!coordinator && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <strong>Nome:</strong> {coordinator.user.name ?? '—'}
            </Grid>
            <Grid item xs={12}>
              <strong>Email:</strong> {coordinator.user.email ?? '—'}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12}>
              <strong>Clubinhos</strong>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {(coordinator.clubs ?? []).map((c) => (
                  <Chip key={c.id} label={`#${c.number ?? '?'}`} />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <strong>Professores</strong>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {teachers.length === 0 ? (
                  <Chip label="—" />
                ) : (
                  teachers.map((t) => (
                    <Chip key={t.id} label={t.user?.name || t.user?.email || t.id} />
                  ))
                )}
              </Box>
            </Grid>

            {isMdUp && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <strong>Criado:</strong> {fmtDate(coordinator.createdAt)}
                </Grid>
                <Grid item xs={12} md={6}>
                  <strong>Atualizado:</strong> {fmtDate(coordinator.updatedAt)}
                </Grid>
              </>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
