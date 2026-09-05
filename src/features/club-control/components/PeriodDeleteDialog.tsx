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
import { Delete, Warning } from '@mui/icons-material';

type Props = {
  open: boolean;
  /** Descrição do período, para a pessoa confirmar o que está apagando. */
  description: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A confirmação de exclusão de um período letivo.
 *
 * O aviso é forte de propósito: apagar um período tira do monitoramento todas
 * as semanas dele, em todos os clubinhos.
 */
export default function PeriodDeleteDialog({
  open,
  description,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Warning sx={{ color: theme.palette.error.main, fontSize: 28 }} />
        Confirmar Exclusão
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Tem certeza que deseja excluir o período <strong>{description}</strong>?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            ⚠️ Atenção: Esta ação não pode ser desfeita!
          </Typography>
          <Typography variant="caption" display="block">
            A exclusão deste período afetará <strong>TODOS os clubinhos</strong> do sistema.
            As semanas relacionadas a este período não serão mais monitoradas.
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
          {loading ? 'Excluindo...' : 'Excluir Período'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
