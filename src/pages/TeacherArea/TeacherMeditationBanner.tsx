import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { sharedBannerStyles } from './SharedBannerStyles';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { AppDispatch, RootState } from 'store/slices';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMeditationData,
  MeditationData,
  WeekDayLabel,
} from '@/store/slices/meditation/meditationSlice';
import api from '@/config/axiosConfig';

export default function TeacherMeditationBanner() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const currentMeditation = useSelector(
    (state: RootState) => state.meditation.meditationData
  );

  const routes = useSelector((state: RootState) => state.routes.routes);

  const today = new Date();
  const weekdayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  const meditationDay = routes.find(
    (route) =>
      route.entityType === 'MeditationDay' &&
      route.path.toLowerCase().includes(weekdayName.toLowerCase())
  );

  if (!meditationDay) return null;  

  const handleOpenPreview = async () => {
    if (!meditationDay) return;  

    try {
      setLoading(true);
      const response = await api.get(`/meditations/${meditationDay?.idToFetch}`);
      if (response.data?.meditation) {
        dispatch(setMeditationData(response.data.meditation as MeditationData));
        setOpenModal(true);
      }
    } catch (error) {
      console.error('Erro ao buscar meditação da semana:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 20, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          ...sharedBannerStyles,
          background: 'linear-gradient(to bottom right, #00796b 0%, #004d40 100%)',
          color: '#e0f2f1',
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            mb: 2,
            textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
          }}
        >
          Já meditou hoje?
        </Typography>

        <Typography
          variant="h6"
          fontWeight="medium"
          gutterBottom
          sx={{ textShadow: '2px 2px 6px rgba(0,0,0,0.85)' }}
        >
          Hoje é{' '}
          {meditationDay
            ? `${WeekDayLabel[meditationDay?.path as keyof typeof WeekDayLabel] || meditationDay?.path}.`
            : '...'}
        </Typography>

        {meditationDay ? (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                mt: 1,
                fontWeight: 500,
                textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
              }}
            >
              O tema de hoje é:{' '}
              <span style={{ fontWeight: 'bold' }}>{meditationDay?.title}</span>
            </Typography>

            <Typography
              variant="subtitle1"
              fontStyle="italic"
              sx={{ mt: 1, textShadow: '2px 2px 6px rgba(0,0,0,0.85)' }}
            >
              Versículo de hoje: “{meditationDay?.description}”
            </Typography>
          </>
        ) : (
          <Typography
            variant="body1"
            sx={{ textShadow: '2px 2px 6px rgba(0,0,0,0.85)' }}
          >
            Ainda não há meditação disponível para hoje.
          </Typography>
        )}

        {meditationDay?.idToFetch && (
          <Button
            variant="outlined"
            onClick={handleOpenPreview}
            sx={{
              mt: 3,
              alignSelf: 'center',
              padding: '10px 20px',
              textTransform: 'none',
              borderColor: '#e0f2f1',
              color: '#e0f2f1',
              '&:hover': {
                backgroundColor: '#004d40',
                borderColor: '#004d40',
                color: '#ffffff',
              },
            }}
          >
            Visualizar Meditação
          </Button>
        )}
      </Box>

      <MediaDocumentPreviewModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        media={currentMeditation?.media || null}
        title={currentMeditation?.topic || ''}
      />
    </>
  );
}
