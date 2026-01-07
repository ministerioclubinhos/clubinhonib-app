import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { CoordinatorProfile } from '../types';

type Props = {
  open: boolean;
  coordinator: CoordinatorProfile | null;
  linkNumber: string;
  unlinkNumber: string;
  onChangeLink: (v: string) => void;
  onChangeUnlink: (v: string) => void;
  onLink: () => void;
  onUnlink: () => void;
  loading: boolean;
  error: string;
  onClose: () => void;
};

export default function CoordinatorLinkDialog({
  open,
  coordinator,
  linkNumber,
  unlinkNumber,
  onChangeLink,
  onChangeUnlink,
  onLink,
  onUnlink,
  loading,
  error,
  onClose,
}: Props) {
  const disabledLink = loading || !linkNumber;
  const disabledUnlink = loading || !unlinkNumber;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular / Desvincular Clubinho</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!!coordinator && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>
                <strong>{coordinator.user?.name ?? coordinator.user?.email}</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Número do Clubinho para Vincular"
                type="number"
                fullWidth
                value={linkNumber}
                onChange={(e) => onChangeLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !disabledLink) onLink();
                }}
                disabled={loading}
                inputProps={{ inputMode: 'numeric', min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Número do Clubinho para Remover"
                type="number"
                fullWidth
                value={unlinkNumber}
                onChange={(e) => onChangeUnlink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !disabledUnlink) onUnlink();
                }}
                disabled={loading}
                inputProps={{ inputMode: 'numeric', min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button variant="contained" onClick={onLink} disabled={disabledLink}>
                  Vincular
                </Button>
                <Button
                  color="warning"
                  variant="outlined"
                  onClick={onUnlink}
                  disabled={disabledUnlink}
                >
                  Desvincular
                </Button>
                {loading && <CircularProgress size={20} />}
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
