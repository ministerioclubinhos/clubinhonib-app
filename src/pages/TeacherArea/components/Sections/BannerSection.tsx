import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import { BannerSectionProps } from '../../types';
import { TeacherWeekBanner, TeacherMeditationBanner, IdeasSharingBanner } from '../Banners';

const itemSx = { display: 'flex', '& > *': { width: '100%' } };

const BannerSection: React.FC<BannerSectionProps> = ({ showMeditationBanner }) => {
  const { flags } = useFeatureFlags();

  const showIdeasBanner = flags[FEATURE.IDEA_SUBMISSION];
  const showWeekBanner = flags[FEATURE.WEEKLY_MATERIALS];
  const showMeditation = showMeditationBanner && flags[FEATURE.WEEKLY_MEDITATION];

  if (!showIdeasBanner && !showWeekBanner && !showMeditation) {
    return null;
  }

  return (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            color: '#475569',
            letterSpacing: 1,
            fontSize: '0.75rem',
          }}
        >
          📚 Preparação da Semana
        </Typography>
      </Box>

      <Grid
        data-testid="teacher-area-sections-banner-section"
        container
        spacing={{ xs: 2, md: 2.5 }}
        alignItems="stretch"
      >
        {showMeditation ? (
          <>
            {showWeekBanner && (
              <Grid item xs={12} md={6} sx={itemSx}>
                <TeacherWeekBanner />
              </Grid>
            )}
            <Grid item xs={12} md={showWeekBanner ? 6 : 12} sx={itemSx}>
              <TeacherMeditationBanner />
            </Grid>
            {showIdeasBanner && (
              <Grid item xs={12} sx={itemSx}>
                <IdeasSharingBanner variant="full" />
              </Grid>
            )}
          </>
        ) : (
          <>
            {showWeekBanner && (
              <Grid item xs={12} md={showIdeasBanner ? 6 : 12} sx={itemSx}>
                <TeacherWeekBanner />
              </Grid>
            )}
            {showIdeasBanner && (
              <Grid item xs={12} md={showWeekBanner ? 6 : 12} sx={itemSx}>
                <IdeasSharingBanner variant={showWeekBanner ? 'compact' : 'full'} />
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
};

export default BannerSection;
