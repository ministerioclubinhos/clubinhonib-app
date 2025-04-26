import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, TextField } from '@mui/material';
import api from '../../../config/axiosConfig';
import { MeditationData, DayItem } from '../../../store/slices/meditation/meditationSlice';
import MeditationCard from './MeditationCard';
import DayDetailsDialog from './DayDetailsDialog';
import MediaPreviewDialog from './MediaPreviewDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function MeditationListPage() {
  const [allMeditations, setAllMeditations] = useState<MeditationData[]>([]);
  const [meditations, setMeditations] = useState<MeditationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayItem | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [meditationToDelete, setMeditationToDelete] = useState<MeditationData | null>(null);

  useEffect(() => {
    loadMeditations();
  }, []);

  const loadMeditations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/meditations');
      const list: MeditationData[] = res.data.map((item: any) => ({
        ...item.meditation,
        media: {
          ...item.meditation.media,
          mediaType: item.meditation.media.mediaType,
          uploadType: item.meditation.media.uploadType,
          platformType: item.meditation.media.platformType,
        },
      }));
      setAllMeditations(list);
      setMeditations(list);
    } catch (err) {
      setError('Erro ao buscar meditações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const lower = searchTerm.toLowerCase();
      const filtered = allMeditations.filter((m) => m.topic.toLowerCase().includes(lower));
      setMeditations(filtered);
      setIsFiltering(false);
    }, 300);

    setIsFiltering(true);
    return () => clearTimeout(timer);
  }, [searchTerm, allMeditations]);

  const handleDelete = async () => {
    if (!meditationToDelete) return;
    setMeditationToDelete(null);
    setLoading(true);
    try {
      await api.delete(`/meditations/${meditationToDelete.id}`);
      await loadMeditations();
    } catch (err) {
      setError('Erro ao deletar meditação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1, md: 3 },
        py: { xs: 1, md: 2 },
        mt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: { xs: 4, md: 3 } }}>
        Meditações Semanais
      </Typography>

      <Box maxWidth={500} mx="auto" mb={5}>
        <TextField
          fullWidth
          placeholder="Buscar por tema..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {loading || isFiltering ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error">{error}</Alert>
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
              />
            </Grid>
          ))}
        </Grid>
      )}

      <DayDetailsDialog day={selectedDay} onClose={() => setSelectedDay(null)} />
      <MediaPreviewDialog mediaUrl={mediaUrl} onClose={() => setMediaUrl(null)} />
      <DeleteConfirmDialog
        meditation={meditationToDelete}
        onCancel={() => setMeditationToDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
