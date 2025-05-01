import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MeditationData, WeekDayLabel } from '../../store/slices/meditation/meditationSlice';
import { sharedBannerStyles } from './SharedBannerStyles';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';

interface TeacherMeditationBannerProps {
  meditation: MeditationData;
}

export default function TeacherMeditationBanner({ meditation }: TeacherMeditationBannerProps) {
  const today = new Date();
  const weekdayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todayData = meditation.days.find((d) => d.day === weekdayName);

  const [openModal, setOpenModal] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenPreview = () => {
    if (!meditation.media?.url) return;
    setOpenModal(true);
  };

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
            color: '#e0f2f1',
            textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
            mb: 2,
          }}
        >
          Já meditou hoje?
        </Typography>

        <Typography
          variant="h6"
          fontWeight="medium"
          gutterBottom
          sx={{
            color: '#e0f2f1',
            textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
          }}
        >
          Hoje é{' '}
          {todayData
            ? `${WeekDayLabel[todayData.day as keyof typeof WeekDayLabel] || todayData.day}.`
            : '...'}
        </Typography>

        {todayData ? (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#e0f2f1',
                textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
                mt: 1,
                fontWeight: 500,
              }}
            >
              O tema de hoje é: <span style={{ fontWeight: 'bold' }}>{todayData.topic}</span>
            </Typography>

            <Typography
              variant="subtitle1"
              fontStyle="italic"
              sx={{
                color: '#e0f2f1',
                textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
                mt: 1,
              }}
            >
              Versículo de hoje: “{todayData.verse}”
            </Typography>
          </>
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: '#e0f2f1',
              textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
            }}
          >
            Ainda não há meditação disponível para hoje.
          </Typography>
        )}

        {meditation.media?.url && (
          <Button
            variant="outlined"
            sx={{
              mt: 3,
              alignSelf: 'center',
              borderColor: '#e0f2f1',
              color: '#e0f2f1',
              '&:hover': {
                backgroundColor: '#004d40',
                borderColor: '#004d40',
                color: '#ffffff',
              },
              padding: '10px 20px',
              textTransform: 'none',
            }}
            onClick={handleOpenPreview}
          >
            Visualizar Meditação
          </Button>
        )}
      </Box>

      <MediaDocumentPreviewModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        media={meditation.media}
        title={meditation.topic}
      />
    </>
  );
}
