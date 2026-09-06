import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from '@mui/material';
import { Delete, Info, Warning } from '@mui/icons-material';

type Props = {
  open: boolean;
  /** Descrição da exceção, para a pessoa confirmar o que está apagando. */
  description: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A confirmação de exclusão de uma exceção de calendário.
 *
 * O aviso explica a consequência: a data volta a ser dia normal, e as pagelas
 * dela voltam a ser cobradas em todos os clubinhos daquele dia da semana.
 */
export default function ExceptionDeleteDialog({
  open,
  description,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const theme = useTheme();

  return (
    <Dialog data-testid="club-control-exception-delete-dialog" open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Warning sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
        Confirmar Exclusão
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Tem certeza que deseja excluir a exceção <strong>{description}</strong>?
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }} icon={<Info />}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            ℹ️ O que acontece após a exclusão:
          </Typography>
          <Typography variant="caption" display="block">
            A data voltará a ser considerada como <strong>dia normal de funcionamento</strong> para
            <strong> TODOS os clubinhos</strong> que funcionam neste dia da semana.
            As pagelas desta data voltarão a ser cobradas normalmente.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
        >
          {loading ? 'Excluindo...' : 'Excluir Exceção'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
