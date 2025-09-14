import {
  Box,
  TextField,
  Stack,
  Divider,
  Typography,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  DayItem,
  WeekDay,
  WeekDayLabel,
} from '@/store/slices/meditation/meditationSlice';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface Props {
  days: DayItem[];
  onDaysChange: (value: DayItem[]) => void;
}

const weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function isValidWeekDay(day: string): day is WeekDay {
  return weekDays.includes(day as WeekDay);
}

export default function MeditationForm({ days, onDaysChange }: Props) {
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [verse, setVerse] = useState('');
  const [topic, setTopic] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [previewDay, setPreviewDay] = useState<DayItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const availableWeekDays = weekDays.filter(
    (day) => !days.some((d) => d.day === day) || days[editIndex || -1]?.day === day
  );

  useEffect(() => {
    if (editIndex !== null) {
      const item = days[editIndex];
      if (item) {
        setSelectedDay(item.day as WeekDay);
        setVerse(item.verse);
        setTopic(item.topic);
      }
    }
  }, [editIndex, days]);

  const handleSaveDay = () => {
    if (!verse.trim() || !topic.trim()) {
      setError('Preencha todos os campos do dia.');
      return;
    }

    const newDay: DayItem = {
      id: Date.now().toString(),
      day: selectedDay,
      verse: verse.trim(),
      topic: topic.trim(),
    };

    if (editIndex !== null) {
      const updated = [...days];
      updated[editIndex] = newDay;
      onDaysChange(updated);
    } else {
      if (days.find((d) => d.day === selectedDay)) {
        setError('Esse dia da semana já foi adicionado.');
        return;
      }
      onDaysChange([...days, newDay]);
    }

    setSelectedDay('Monday');
    setVerse('');
    setTopic('');
    setEditIndex(null);
    setError('');
  };

  return (
    <Box>
      {(days.length < 5 || editIndex !== null) && (
        <Stack spacing={3} mb={3}>
          <FormControl fullWidth>
            <InputLabel id="day-select-label">Dia da Semana</InputLabel>
            <Select
              labelId="day-select-label"
              value={selectedDay}
              label="Dia da Semana"
              onChange={(e: SelectChangeEvent<WeekDay>) =>
                setSelectedDay(e.target.value as WeekDay)
              }
            >
              {availableWeekDays.map((day) => (
                <MenuItem key={day} value={day}>
                  {WeekDayLabel[day]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Tema"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <TextField
            fullWidth
            label="Versículo"
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
          />

          <Box display="flex" gap={1}>
            <Button variant="contained" onClick={handleSaveDay}>
              {editIndex !== null ? 'Atualizar Dia' : 'Adicionar Dia'}
            </Button>
            {editIndex !== null && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setEditIndex(null);
                  setVerse('');
                  setTopic('');
                  setSelectedDay('Monday');
                  setError('');
                }}
              >
                Cancelar Edição
              </Button>
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      )}

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        {days.map((day, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: 2,
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography fontWeight="bold" mb={1}>
                  {isValidWeekDay(day.day) ? WeekDayLabel[day.day] : day.day}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {day.topic}
                </Typography>
              </Box>

              <Box display="flex" gap={1} mt={2}>
                <Tooltip title="Visualizar">
                  <IconButton onClick={() => setPreviewDay(day)}>
                    <Eye size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton onClick={() => setEditIndex(index)}>
                    <Pencil size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover">
                  <IconButton onClick={() => setDeleteConfirm(index)}>
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!previewDay} onClose={() => setPreviewDay(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {previewDay
            ? isValidWeekDay(previewDay.day)
              ? WeekDayLabel[previewDay.day]
              : previewDay.day
            : ''}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Tópico:</strong> {previewDay?.topic}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Versículo:</strong> {previewDay?.verse}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDay(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Deseja remover o dia{' '}
            <strong>
              {deleteConfirm !== null
                ? isValidWeekDay(days[deleteConfirm].day)
                  ? WeekDayLabel[days[deleteConfirm].day as WeekDay]
                  : days[deleteConfirm].day
                : ''}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (deleteConfirm !== null) {
                const updated = [...days];
                updated.splice(deleteConfirm, 1);
                onDaysChange(updated);
                setDeleteConfirm(null);
              }
            }}
            color="error"
            variant="contained"
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
