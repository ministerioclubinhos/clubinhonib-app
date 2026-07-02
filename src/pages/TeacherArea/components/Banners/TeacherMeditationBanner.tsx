import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { AppDispatch, RootState } from 'store/slices';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMeditationData,
  MeditationData,
  WeekDayLabel,
} from '@/store/slices/meditation/meditationSlice';
import api from '@/config/axiosConfig';
import { motion } from 'framer-motion';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';

export default function TeacherMeditationBanner() {
  const dispatch = useDispatch<AppDispatch>();

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

  if (!meditationDay) {
    return null;
  }

  const weekdayLabel =
    WeekDayLabel[meditationDay.path as keyof typeof WeekDayLabel] || meditationDay.path;

  const handleOpenPreview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/meditations/${meditationDay?.idToFetch}`);
      if (response.data?.meditation) {
        dispatch(setMeditationData(response.data.meditation as MeditationData));
        setOpenModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar meditação:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: '100%', width: '100%' }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: { xs: 240, sm: 260, md: 320 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: { xs: 1.5, md: 2 },
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #00796b 0%, #004d40 50%, #00695c 100%)',
          color: '#e0f2f1',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <motion.div
          animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 1.5, md: 2 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.8,
                py: 0.5,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <SelfImprovementIcon sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />
              <Typography
                variant="overline"
                sx={{
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  lineHeight: 1.6,
                }}
              >
                Meditação de {weekdayLabel}
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
                lineHeight: 1.25,
                textShadow: '2px 2px 4px rgba(0,0,0,0.35)',
              }}
            >
              Já meditou hoje?
            </Typography>

            {meditationDay.title && (
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 0.5,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  opacity: 0.95,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                O tema de hoje é <strong>{meditationDay.title}</strong>
              </Typography>
            )}
          </motion.div>

          {meditationDay.subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.45 }}
              style={{ width: '100%' }}
            >
              <Box
                sx={{
                  width: '100%',
                  px: { xs: 1.5, md: 2.5 },
                  py: { xs: 1.2, md: 1.8 },
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant="body1"
                  fontStyle="italic"
                  sx={{
                    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                    fontWeight: 300,
                    lineHeight: 1.45,
                    textShadow: '1px 1px 4px rgba(0,0,0,0.4)',
                  }}
                >
                  “{meditationDay.subtitle}”
                </Typography>
              </Box>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <Button
              variant="contained"
              onClick={handleOpenPreview}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : undefined
              }
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                px: { xs: 3, sm: 4, md: 5 },
                py: { xs: 1, md: 1.2 },
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                },
                transition: 'all 0.3s ease',
                minWidth: { xs: 180, md: 200 },
              }}
            >
              {loading ? 'Carregando...' : 'Visualizar Meditação'}
            </Button>
          </motion.div>
        </Box>
      </Paper>

      <MediaDocumentPreviewModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        media={currentMeditation?.media || null}
        title={currentMeditation?.topic || ''}
      />
    </motion.div>
  );
}
