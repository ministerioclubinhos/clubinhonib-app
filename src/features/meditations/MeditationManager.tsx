import { useState } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';

import type { MeditationData, DayItem } from '@/store/slices/meditation/meditationSlice';
import MeditationCard from './components/MeditationCard';
import DayDetailsDialog from './components/DayDetailsDialog';
import { formatPtBrDate, useMeditationsList } from './hooks';
import BackHeader from '@/components/common/header/BackHeader';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import ImagePageToolbar from '../image-pages/components/ImagePageToolbar';

export default function MeditationManager() {
  const {
    meditations,
    loading,
    filtering,
    error,
    setError,
    search,
    setSearch,
    removeMeditation,
  } = useMeditationsList();

  const [selectedDay, setSelectedDay] = useState<DayItem | null>(null);
  const [meditationToDelete, setMeditationToDelete] = useState<MeditationData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isBusy = loading || filtering;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container sx={{ maxWidth: { xs: '100%', md: '100%' }, px: { xs: 2, md: 3 } }}>
        <BackHeader title="Lista de Meditações" />

        <ImagePageToolbar search={search} onSearchChange={setSearch} loading={filtering} />

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
          <Grid container spacing={3} alignItems="stretch">
            {meditations.map((meditation) => {
              const isExpandedMobile = expandedId === meditation.id;

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={meditation.id}
                  sx={{ display: 'flex' }}
                >
                  <MeditationCard
                    meditation={meditation}
                    onDelete={setMeditationToDelete}
                    onDayClick={setSelectedDay}
                    formatDate={formatPtBrDate}
                    isExpandedMobile={isExpandedMobile}
                    onToggleExpandMobile={() =>
                      setExpandedId((curr) => (curr === meditation.id ? null : meditation.id))
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        )}

        <DayDetailsDialog day={selectedDay} onClose={() => setSelectedDay(null)} />

        <DeleteConfirmDialog
          open={!!meditationToDelete}
          title={meditationToDelete?.topic || 'Meditação'}
          onClose={() => setMeditationToDelete(null)}
          onConfirm={async () => {
            if (!meditationToDelete) return;
            await removeMeditation(meditationToDelete);
            setMeditationToDelete(null);
          }}
        />
      </Container>
    </Box>
  );
}
