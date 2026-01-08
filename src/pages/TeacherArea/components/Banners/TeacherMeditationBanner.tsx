import { Fragment, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Paper,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { AppDispatch, RootState } from 'store/slices';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMeditationData,
  MeditationData,
  WeekDayLabel,
} from '@/store/slices/meditation/meditationSlice';
import { MediaType, MediaUploadType } from '@/store/slices/types';
import api from '@/config/axiosConfig';
import { motion } from 'framer-motion';
import { BANNER_HEIGHTS } from './constants';

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

  if (!meditationDay) {
    return null;
  }

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

  if (loading) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          minHeight: { xs: 280, sm: 250, md: 280 },
          maxHeight: { xs: 320, sm: 300, md: 320 },
          height: { xs: 280, sm: 250, md: 280 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #00796b 0%, #004d40 100%)',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
           height: { 
             xs: 'auto',
             sm: 'auto', 
             md: 350 
           },
           minHeight: { 
             xs: 300,
             sm: 300, 
             md: 280 
           },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
           p: { xs: '5px', sm: 3, md: '16px' },
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #00796b 0%, #004d40 50%, #00695c 100%)',
          color: '#e0f2f1',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          zIndex: 1, 
          width: '100%', 
          height: '100%',
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: { xs: 2, md: 4 },
        }}>
          
          <Box sx={{ 
            flex: '0 0 30%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            textAlign: { xs: 'center', md: 'left' }
          }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
                textShadow: '2px 2px 6px rgba(0,0,0,0.4)',
                mb: { xs: 1, md: 1.5 },
              }}
            >
              Já meditou hoje?
            </Typography>

            <Typography
              variant="h6"
              fontWeight="medium"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                mb: { xs: 1, md: 1.5 },
                opacity: 0.95,
              }}
            >
              Hoje é{' '}
              {meditationDay
                ? `${WeekDayLabel[meditationDay?.path as keyof typeof WeekDayLabel] || meditationDay?.path}.`
                : '...'}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                fontWeight: 500,
                textShadow: '2px 2px 6px rgba(0,0,0,0.4)',
                mb: 0,
              }}
            >
              O tema de hoje é:{' '}
              <span style={{ fontWeight: 'bold' }}>{meditationDay.title}</span>
            </Typography>
          </Box>

          <Box sx={{ 
            flex: '0 0 70%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%',
            position: 'relative',
            p: { xs: 0, sm: 2, md: 2 },
            m: { xs: 1, sm: 0, md: 0 },
          }}>
            <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '100%' }}>
              <Box sx={{ 
                width: '100%', 
                height: 'auto',
                mb: 0,
                p: { xs: 0, sm: 2, md: 2 },
                m: { xs: 1, sm: 0, md: 0 },
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                  opacity: 0.9,
                  fontWeight: 500,
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                Versículo de hoje:
              </Typography>

              <Typography
                variant="h4"
                fontStyle="italic"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' },
                  textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                  opacity: 0.95,
                  fontWeight: 300,
                  lineHeight: 1.3,
                  mb: 0,
                }}
              >
                "{meditationDay.subtitle}"
              </Typography>

              </Box>
            </Box>

            <Box sx={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', width: '100%', minHeight: '50px' }}>
              <Button
              variant="contained"
              onClick={handleOpenPreview}
              disabled={loading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                px: { xs: 4, md: 6 },
                py: { xs: 0.8, md: 1 },
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                mt: '5px',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                },
                transition: 'all 0.3s ease',
                minWidth: { xs: '160px', md: '180px' },
              }}
            >
              {loading ? 'Carregando...' : 'Visualizar Meditação'}
              </Button>
            </Box>
          </Box>
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