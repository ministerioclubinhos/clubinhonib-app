import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
import { MeditationData } from '../../../store/slices/meditation/meditationSlice';

interface Props {
  meditation: MeditationData | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ meditation, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={!!meditation} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja excluir a meditação <strong>{meditation?.topic}</strong>?
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
