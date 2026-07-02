import React from 'react';
import { Grid } from '@mui/material';
import { BannerSectionProps } from '../../types';
import { TeacherWeekBanner, TeacherMeditationBanner, IdeasSharingBanner } from '../Banners';

const itemSx = { display: 'flex', '& > *': { width: '100%' } };

const BannerSection: React.FC<BannerSectionProps> = ({ showMeditationBanner }) => {
  return (
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      alignItems="stretch"
      sx={{ mb: { xs: 4, md: 6 }, mt: 0 }}
    >
      {showMeditationBanner ? (
        <>
          <Grid item xs={12} sx={itemSx}>
            <IdeasSharingBanner variant="full" />
          </Grid>
          <Grid item xs={12} md={6} sx={itemSx}>
            <TeacherWeekBanner />
          </Grid>
          <Grid item xs={12} md={6} sx={itemSx}>
            <TeacherMeditationBanner />
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} md={6} sx={itemSx}>
            <IdeasSharingBanner variant="compact" />
          </Grid>
          <Grid item xs={12} md={6} sx={itemSx}>
            <TeacherWeekBanner />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default BannerSection;
