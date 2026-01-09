import React from 'react';
import { Grid } from '@mui/material';
import { BannerSectionProps } from '../../types';
import { TeacherWeekBanner, TeacherMeditationBanner, IdeasSharingBanner } from '../Banners';

const BannerSection: React.FC<BannerSectionProps> = ({ showMeditationBanner }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 6, mt: 0, pt: 0, justifyContent: 'space-between' }}>
      {showMeditationBanner ? (
        <>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <IdeasSharingBanner forceColumnLayout={showMeditationBanner} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TeacherWeekBanner />
          </Grid>
          <Grid item xs={12} md={6}>
            <TeacherMeditationBanner />
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} md={6}>
            <IdeasSharingBanner variant="compact" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TeacherWeekBanner />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default BannerSection;
