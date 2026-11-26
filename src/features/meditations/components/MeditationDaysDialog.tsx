import CloseIcon from '@mui/icons-material/Close';
import EditOutlined from '@mui/icons-material/EditOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

import { MEDITATION_WEEK_DAYS } from '../constants';
import type { MeditationDayResponse, MeditationResponse } from '../types';
import { formatPtBrDate, weekDayLabel } from '../utils';

interface Props {
  /** `null` mantém o diálogo fechado. */
  meditation: MeditationResponse | null;
  onSelectDay: (day: MeditationDayResponse) => void;
  /** Abre a edição desta meditação. */
  onEdit: (meditation: MeditationResponse) => void;
  onClose: () => void;
}

/** Dias da meditação, de segunda a sexta. */
export default function MeditationDaysDialog({
  meditation,
  onSelectDay,
  onEdit,
  onClose,
}: Props) {
  // A API não garante a ordem dos dias; a semana é lida de segunda a sexta.
  const days = [...(meditation?.days ?? [])].sort(
    (a, b) =>
      MEDITATION_WEEK_DAYS.indexOf(a.day) - MEDITATION_WEEK_DAYS.indexOf(b.day),
  );

  return (
    <Dialog data-testid="meditations-meditation-days-dialog" open={Boolean(meditation)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          fontWeight: 700,
        }}
      >
        {meditation?.topic}
        <IconButton
          onClick={onClose}
          aria-label="Fechar"
          sx={{ minWidth: { xs: 44, sm: 'auto' }, minHeight: { xs: 44, sm: 'auto' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {meditation
            ? `${formatPtBrDate(meditation.startDate)} — ${formatPtBrDate(meditation.endDate)}`
            : ''}
        </Typography>

        {days.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Esta meditação ainda não tem dias cadastrados.
          </Typography>
        ) : (
          <List disablePadding>
            {days.map((day) => (
              <ListItemButton
                key={day.id}
                onClick={() => onSelectDay(day)}
                sx={{ borderRadius: 2, minHeight: 56 }}
              >
                <ListItemText
                  primary={weekDayLabel(day.day)}
                  secondary={day.topic}
                  slotProps={{ primary: { fontWeight: 600 } }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button type="button" onClick={onClose} sx={{ minHeight: 44 }}>
          Fechar
        </Button>
        <Button
          data-testid="meditation-days-dialog-edit"
          type="button"
          variant="contained"
          startIcon={<EditOutlined />}
          disabled={!meditation}
          onClick={() => meditation && onEdit(meditation)}
          sx={{ minHeight: 44 }}
        >
          Editar meditação
        </Button>
      </DialogActions>
    </Dialog>
  );
}
