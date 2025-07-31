import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Stack, Box, Button,
} from '@mui/material';
import { DayItem, WeekDay, WeekDayLabel } from '@/store/slices/meditation/meditationSlice';

interface Props {
  day: DayItem | null;
  onClose: () => void;
}

export default function DayDetailsDialog({ day, onClose }: Props) {
  return (
    <Dialog
      open={!!day}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
    >
      <DialogTitle textAlign="center" fontWeight="bold">
        {day ? WeekDayLabel[day.day as WeekDay] : ''}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Tema do Dia</Typography>
            <Typography variant="body1" fontWeight="medium">{day?.topic}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Versículo</Typography>
            <Typography variant="body1" fontStyle="italic">{day?.verse}</Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
