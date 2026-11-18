import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { AppDispatch, RootState } from 'store/slices';
import { useVisibleRoutes } from '@/features/feature-flags';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMeditationData,
  WeekDayLabel,
} from '@/store/slices/meditation/meditationSlice';
import { getMeditation } from '@/features/meditations';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

export default function TeacherMeditationBanner() {
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const currentMeditation = useSelector(
    (state: RootState) => state.meditation.meditationData
  );

  const routes = useVisibleRoutes();

  const today = new Date();
  const weekdayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  const meditationDay = routes.find(
    (route) =>
      route.entityType === 'MeditationDay' &&
      route.path.toLowerCase().includes(weekdayName.toLowerCase())
  );

  if (!meditationDay) {
    return null;
  }

  const weekdayLabel =
    WeekDayLabel[meditationDay.path as keyof typeof WeekDayLabel] || meditationDay.path;

  const handleOpenPreview = async () => {
    try {
      setLoading(true);
      const meditation = await getMeditation(meditationDay?.idToFetch ?? '');
      if (meditation) {
        dispatch(setMeditationData(meditation));
        setOpenModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar meditação:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      data-testid="teacher-area-banners-teacher-meditation-banner"
      sx={{ height: '100%', width: '100%' }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: { xs: 220, md: 250 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 2.5, sm: 3, md: 3.5 },
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #065f46 0%, #047857 55%, #0d9488 100%)',
          color: '#ecfdf5',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          boxShadow: '0 10px 28px rgba(4, 120, 87, 0.2)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            icon={<SelfImprovementIcon sx={{ color: '#fff !important', fontSize: '1rem' }} />}
            label={`Meditação de ${weekdayLabel}`}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              color: '#fff',
              fontWeight: 800,
              mb: 1.5,
            }}
          />

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.6rem' },
              lineHeight: 1.25,
              mb: 0.5,
            }}
          >
            {meditationDay.title || 'Já meditou na Palavra hoje?'}
          </Typography>

          {meditationDay.subtitle && (
            <Box
              sx={{
                mt: 1,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderLeft: '3px solid #6ee7b7',
              }}
            >
              <Typography
                variant="body2"
                fontStyle="italic"
                sx={{
                  fontSize: { xs: '0.88rem', md: '0.95rem' },
                  lineHeight: 1.5,
                  color: '#ecfdf5',
                }}
              >
                “{meditationDay.subtitle}”
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 2.5, position: 'relative', zIndex: 1, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="contained"
            onClick={handleOpenPreview}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} sx={{ color: 'inherit' }} />
              ) : (
                <MenuBookOutlinedIcon />
              )
            }
            sx={{
              bgcolor: '#ffffff',
              color: '#065f46',
              px: 2.5,
              py: 1.1,
              width: { xs: '100%', sm: 'auto' },
              fontWeight: 800,
              borderRadius: 2.5,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.16)',
              '&:hover': {
                bgcolor: '#ecfdf5',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
              },
            }}
          >
            {loading ? 'Carregando...' : 'Ler Meditação de Hoje'}
          </Button>
        </Box>
      </Paper>

      <MediaDocumentPreviewModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        media={currentMeditation?.media || null}
        title={currentMeditation?.topic || ''}
      />
    </Box>
  );
}
