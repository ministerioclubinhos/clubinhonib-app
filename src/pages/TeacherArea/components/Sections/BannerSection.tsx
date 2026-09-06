import React from 'react';
import { Grid } from '@mui/material';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import { BannerSectionProps } from '../../types';
import { TeacherWeekBanner, TeacherMeditationBanner, IdeasSharingBanner } from '../Banners';

const itemSx = { display: 'flex', '& > *': { width: '100%' } };

const BannerSection: React.FC<BannerSectionProps> = ({ showMeditationBanner }) => {
  const { flags } = useFeatureFlags();

  // O convite para compartilhar uma ideia só aparece enquanto o envio existe.
  const showIdeasBanner = flags[FEATURE.IDEA_SUBMISSION];

  // O banner da semana leva à lista de materiais; sem ela, ele não tem destino.
  const showWeekBanner = flags[FEATURE.WEEKLY_MATERIALS];

  /*
   * Duas perguntas diferentes: a prop diz se existe meditação nesta semana, e
   * a flag diz se o recurso está no ar. As duas precisam ser verdadeiras.
   */
  const showMeditation =
    showMeditationBanner && flags[FEATURE.WEEKLY_MEDITATION];

  return (
    <Grid data-testid="teacher-area-sections-banner-section"
      container
      spacing={{ xs: 2, md: 3 }}
      alignItems="stretch"
      sx={{ mb: { xs: 4, md: 6 }, mt: 0 }}
    >
      {showMeditation ? (
        <>
          {showIdeasBanner && (
            <Grid item xs={12} sx={itemSx}>
              <IdeasSharingBanner variant="full" />
            </Grid>
          )}
          {showWeekBanner && (
            <Grid item xs={12} md={6} sx={itemSx}>
              <TeacherWeekBanner />
            </Grid>
          )}
          <Grid item xs={12} md={6} sx={itemSx}>
            <TeacherMeditationBanner />
          </Grid>
        </>
      ) : (
        <>
          {showIdeasBanner && (
            <Grid item xs={12} md={6} sx={itemSx}>
              <IdeasSharingBanner variant="compact" />
            </Grid>
          )}
          {showWeekBanner && (
            <Grid item xs={12} md={6} sx={itemSx}>
              <TeacherWeekBanner />
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

export default BannerSection;
