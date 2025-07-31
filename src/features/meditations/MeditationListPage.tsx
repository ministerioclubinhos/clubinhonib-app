import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import type { MeditationData, DayItem } from '@/store/slices/meditation/meditationSlice';
import MeditationCard from './components/MeditationCard';
import DayDetailsDialog from './components/DayDetailsDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import { formatPtBrDate, useMeditationsList } from './hooks';
import BackHeader from '@/components/common/header/BackHeader';

export default function MeditationListPage() {
  const { meditations, loading, filtering, error, setError, search, setSearch, removeMeditation } =
    useMeditationsList();

  const [selectedDay, setSelectedDay] = useState<DayItem | null>(null);
  const [meditationToDelete, setMeditationToDelete] = useState<MeditationData | null>(null);

  const isBusy = loading || filtering;

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <BackHeader title="Lista de Meditações" />


      <Box maxWidth={500} mx="auto" mb={5}>
        <TextField
          fullWidth
          placeholder="Buscar por tema..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {isBusy ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      ) : meditations.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="info">Nenhuma meditação encontrada.</Alert>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {meditations.map((meditation) => (
            <Grid
              item
              key={meditation.id}
              sx={{
                flexBasis: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
                maxWidth: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
                minWidth: 280,
                display: 'flex',
              }}
            >
              <MeditationCard
                meditation={meditation}
                onDelete={setMeditationToDelete}
                onDayClick={setSelectedDay}
                formatDate={formatPtBrDate}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <DayDetailsDialog day={selectedDay} onClose={() => setSelectedDay(null)} />

      <DeleteConfirmDialog
        meditation={meditationToDelete}
        onCancel={() => setMeditationToDelete(null)}
        onConfirm={async () => {
          if (!meditationToDelete) return;
          await removeMeditation(meditationToDelete);
          setMeditationToDelete(null);
        }}
      />
    </Box>
  );
}
