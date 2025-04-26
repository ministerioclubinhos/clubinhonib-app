import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { ImagePageData } from 'store/slices/image/imageSlice';

interface Props {
  page: ImagePageData | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ page, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={!!page} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja excluir a página <strong>{page?.title || 'Sem Título'}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
