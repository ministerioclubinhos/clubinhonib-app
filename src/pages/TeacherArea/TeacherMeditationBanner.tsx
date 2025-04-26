import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MeditationData, WeekDayLabel } from '../../store/slices/meditation/meditationSlice';
import { sharedBannerStyles } from './SharedBannerStyles';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';

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

  const getPreviewUrl = (media: MediaItem): string => {
    const originalUrl = media.url || '';

    if (media.uploadType === MediaUploadType.UPLOAD) {
      return originalUrl;
    }

    switch (media.platformType) {
      case MediaPlatform.GOOGLE_DRIVE: {
        const match = originalUrl.match(/\/d\/([^/]+)\//);
        if (match?.[1]) {
          return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
        return originalUrl;
      }

      case MediaPlatform.ONEDRIVE: {
        if (originalUrl.includes('onedrive.live.com/embed')) {
          return originalUrl;
        }
        return originalUrl;
      }

      case MediaPlatform.DROPBOX: {
        return originalUrl.includes('dropbox.com')
          ? originalUrl.replace('?dl=0', '?raw=1')
          : originalUrl;
      }

      case MediaPlatform.ANY:
      default:
        return originalUrl;
    }
  };

  const handleOpenPreview = () => {
    if (!meditation.media?.url) return;
    setOpenModal(true);
  };

  return (
    <>
      <Box
        sx={{
          ...sharedBannerStyles,
          background: 'linear-gradient(to bottom right, #E60026 0%, #dceeff 100%)',
          color: '#3e2723',
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color: '#fff',
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
            color: '#fff',
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
                color: '#fff',
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
                color: '#fff',
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
              color: '#fff',
              textShadow: '2px 2px 6px rgba(0,0,0,0.85)',
            }}
          >
            Ainda não há meditação disponível para hoje.
          </Typography>
        )}

        {meditation.media?.url && (
          <Button
            variant="outlined"
            sx={{ mt: 3, alignSelf: 'center' }}
            onClick={handleOpenPreview}
          >
            Visualizar Meditação
          </Button>
        )}
      </Box>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            m: 0,
            borderRadius: 2,
            width: isMobile ? '100%' : '90%',
            height: isMobile ? '100%' : '75%',
          },
        }}
      >
        <DialogTitle>Visualização da Meditação</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ width: '100%', height: '100%' }}>
            <iframe
              src={getPreviewUrl(meditation.media)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Documento"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
