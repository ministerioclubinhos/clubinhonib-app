import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid2,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Close, Delete, Edit } from '@mui/icons-material';

import { MEDITATION_DAYS_COUNT, MEDITATION_WEEK_DAYS } from '../constants';
import { MeditationDayDraft, MeditationWeekDay } from '../types';
import { availableWeekDays, sortDays, weekDayLabel } from '../utils';

interface MeditationDaysEditorProps {
  days: MeditationDayDraft[];
  onChange: (days: MeditationDayDraft[]) => void;
  /** Informa ao formulário que há um dia em edição ou começado. */
  onDraftChange?: (hasDraft: boolean) => void;
}

const EMPTY_DRAFT = { verse: '', topic: '' };

/** Editor dos cinco dias da meditação. */
export default function MeditationDaysEditor({
  days,
  onChange,
  onDraftChange,
}: MeditationDaysEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedDay, setSelectedDay] = useState<MeditationWeekDay>(
    MEDITATION_WEEK_DAYS[0],
  );
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const isEditing = editingIndex !== null;
  const options = availableWeekDays(days, editingIndex);
  const isComplete = days.length === MEDITATION_DAYS_COUNT;

  const notifyDraft = (hasDraft: boolean) => onDraftChange?.(hasDraft);

  const resetDraft = () => {
    setEditingIndex(null);
    setDraft(EMPTY_DRAFT);
    setSelectedDay(options[0] ?? MEDITATION_WEEK_DAYS[0]);
    setError('');
    notifyDraft(false);
  };

  const handleSaveDay = () => {
    if (!draft.topic.trim() || !draft.verse.trim()) {
      setError('Preencha o tema e o versículo do dia.');
      return;
    }

    const entry: MeditationDayDraft = {
      ...(editingIndex !== null ? days[editingIndex] : {}),
      day: selectedDay,
      topic: draft.topic.trim(),
      verse: draft.verse.trim(),
    };

    const updated = [...days];
    if (editingIndex !== null) {
      updated[editingIndex] = entry;
    } else {
      updated.push(entry);
    }

    onChange(sortDays(updated));
    resetDraft();
  };

  const handleEdit = (index: number) => {
    const day = days[index];
    setEditingIndex(index);
    setSelectedDay(day.day);
    setDraft({ verse: day.verse, topic: day.topic });
    setError('');
    notifyDraft(true);
  };

  const confirmRemove = () => {
    if (deleteIndex === null) return;

    onChange(days.filter((_, index) => index !== deleteIndex));
    if (editingIndex === deleteIndex) {
      resetDraft();
    } else if (editingIndex !== null && deleteIndex < editingIndex) {
      // A remoção desloca a lista; sem reposicionar, salvar gravaria por cima
      // do dia vizinho.
      setEditingIndex(editingIndex - 1);
    }
    setDeleteIndex(null);
  };

  return (
    <Box data-testid="meditations-meditation-days-editor">
      {(!isComplete || isEditing) && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            borderStyle: isEditing ? 'solid' : 'dashed',
            borderColor: isEditing ? 'primary.main' : 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {isEditing ? 'Editando dia' : 'Adicionar dia'}
            </Typography>

            {isEditing && (
              <Tooltip title="Cancelar edição">
                <IconButton
                  size="small"
                  aria-label="Cancelar edição"
                  onClick={resetDraft}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel id="meditation-day">Dia</InputLabel>
                <Select
                  labelId="meditation-day"
                  label="Dia"
                  value={selectedDay}
                  onChange={(event) => {
                    setSelectedDay(event.target.value as MeditationWeekDay);
                    notifyDraft(true);
                  }}
                >
                  {options.map((day) => (
                    <MenuItem key={day} value={day}>
                      {weekDayLabel(day)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Tema do dia"
                fullWidth
                required
                value={draft.topic}
                onChange={(event) => {
                  setDraft((previous) => ({
                    ...previous,
                    topic: event.target.value,
                  }));
                  notifyDraft(true);
                }}
              />
            </Grid2>

            <Grid2 size={12}>
              <TextField
                label="Versículo"
                fullWidth
                required
                multiline
                minRows={2}
                value={draft.verse}
                onChange={(event) => {
                  setDraft((previous) => ({
                    ...previous,
                    verse: event.target.value,
                  }));
                  notifyDraft(true);
                }}
              />
            </Grid2>

            {error && (
              <Grid2 size={12}>
                <Alert severity="error">{error}</Alert>
              </Grid2>
            )}

            <Grid2 size={12}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="flex-end"
              >
                {isEditing && (
                  <Button
                    type="button"
                    variant="text"
                    onClick={resetDraft}
                    fullWidth={isMobile}
                    sx={{ minHeight: 44, textTransform: 'none' }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="contained"
                  startIcon={isEditing ? undefined : <Add />}
                  onClick={handleSaveDay}
                  fullWidth={isMobile}
                  sx={{ minHeight: 44, textTransform: 'none' }}
                >
                  {isEditing ? 'Salvar dia' : 'Adicionar dia'}
                </Button>
              </Stack>
            </Grid2>
          </Grid2>
        </Paper>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: { xs: 3, md: 4 },
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Dias da semana
        </Typography>
        <Typography
          variant="body2"
          color={isComplete ? 'success.main' : 'text.secondary'}
        >
          {days.length} de {MEDITATION_DAYS_COUNT}
        </Typography>
      </Box>

      {days.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            textAlign: 'center',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Nenhum dia adicionado ainda. A meditação precisa dos{' '}
            {MEDITATION_DAYS_COUNT} dias, de segunda a sexta.
          </Typography>
        </Paper>
      ) : (
        <Grid2 container spacing={2}>
          {days.map((day, index) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={`${day.day}-${index}`}>
              <Paper
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor:
                    editingIndex === index ? 'primary.main' : 'divider',
                }}
              >
                <Box sx={{ p: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {weekDayLabel(day.day)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {day.topic}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                  >
                    {day.verse}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderTop: 1,
                    borderColor: 'divider',
                    '& .MuiIconButton-root': { width: 44, height: 44 },
                  }}
                >
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label={`Editar ${weekDayLabel(day.day)}`}
                      onClick={() => handleEdit(index)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover">
                    <IconButton
                      color="error"
                      aria-label={`Remover ${weekDayLabel(day.day)}`}
                      onClick={() => setDeleteIndex(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      )}

      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>Remover dia</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja remover este dia da meditação?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setDeleteIndex(null)}>
            Cancelar
          </Button>
          <Button type="button" color="error" onClick={confirmRemove}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
