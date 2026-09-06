import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Divider,
  Box,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { useFeatureFlags } from '@/hooks';
import { FEATURE } from '@/features/feature-flags';
import {
  InformativeBanner,
  FofinhoButton,
  SpecialFamilyCallout,
  BannerSection,
  MotivationSection,
  TeacherContent,
  VerseOfWeekSection,
} from './components';
import { useTeacherArea } from './hooks';
import { MOTIVATION_TEXT, CONTAINER_STYLES } from './constants';

const TeacherArea: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { loading, showWeek, showMeditation } = useTeacherArea();
  const { flags } = useFeatureFlags();

  return (
    <Container data-testid="teacher-area" maxWidth={false} sx={CONTAINER_STYLES.main}>

      {flags[FEATURE.INFORMATIVE_BANNERS] && <InformativeBanner />}

      <BannerSection
        showWeekBanner={showWeek}
        showMeditationBanner={showMeditation}
      />

      {flags[FEATURE.SPECIAL_FAMILY_DAY] && <SpecialFamilyCallout />}

      <FofinhoButton
        references={[
          ...(flags[FEATURE.CHILDREN_AREA] ? ['childrenArea'] : []),
          // Cada atalho some junto com o recurso que ele abre: sem isso o
          // professor clicaria e cairia num redirecionamento.
          ...(flags[FEATURE.CLUB_PHOTO_UPLOAD] ? ['photos'] : []),
          ...(flags[FEATURE.SITE_FEEDBACK] ? ['rate'] : []),
          ...(flags[FEATURE.EVENTS_SECTION] ? ['events'] : []),
          ...(flags[FEATURE.CONTACT_FORM] ? ['help'] : []),
        ]}
      />

      {flags[FEATURE.VERSE_OF_WEEK] && <VerseOfWeekSection />}

      <MotivationSection motivationText={MOTIVATION_TEXT} />

      <Paper elevation={4} sx={CONTAINER_STYLES.paper}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#424242"
          gutterBottom
          sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }}
        >
          Área do Professor
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#757575',
            fontStyle: 'italic',
            fontSize: { xs: '0.85rem', md: '0.95rem' },
          }}
        >
          “Apascenta os meus cordeiros.” — João 21:15
        </Typography>

        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

        {isAuthenticated ? (
          loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TeacherContent userName={user?.name} />
          )
        ) : (
          <Box textAlign="center" py={2}>
            <Typography variant="body1" color="#757575" gutterBottom>
              Você precisa estar logado para acessar esta área. 🔑
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#9e9e9e', fontStyle: 'italic', mt: 1 }}
            >
              “Pedi, e dar-se-vos-á; buscai e achareis; batei, e abrir-se-vos-á.” — Mateus 7:7
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TeacherArea;
