import React from 'react';
import {
  Typography,
  Paper,
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
  TeacherContent,
} from './components';
import { useTeacherArea } from './hooks';
import { CONTAINER_STYLES } from './constants';

const TeacherArea: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { loading, showWeek, showMeditation } = useTeacherArea();
  const { flags } = useFeatureFlags();

  const hasClub = Boolean(user?.teacherProfile?.club);

  return (
    <Box data-testid="teacher-area-home">
        {/* 2. Mural de Avisos da Coordenação & Chamadas Especiais */}
        {flags[FEATURE.INFORMATIVE_BANNERS] && <InformativeBanner />}
        {flags[FEATURE.SPECIAL_FAMILY_DAY] && <SpecialFamilyCallout />}

        {/* 3. Preparação da Semana: Material Atual, Meditação do Dia e Mural de Ideias */}
        <BannerSection
          showWeekBanner={showWeek}
          showMeditationBanner={showMeditation}
        />

        {/* 4. Acesso Rápido às ferramentas do Professor */}
        <FofinhoButton
          references={[
            ...(flags[FEATURE.CHILDREN_AREA] && hasClub ? ['childrenArea'] : []),
            ...(flags[FEATURE.WEEKLY_MATERIALS] ? ['materials'] : []),
            ...(flags[FEATURE.CLUB_PHOTO_UPLOAD] ? ['photos'] : []),
            ...(flags[FEATURE.IDEA_SUBMISSION] ? ['ideas'] : []),
            ...(flags[FEATURE.EVENTS_SECTION] ? ['events'] : []),
            ...(flags[FEATURE.SITE_FEEDBACK] ? ['rate'] : []),
            ...(flags[FEATURE.CONTACT_FORM] ? ['help'] : []),
          ]}
        />

        {/* 5. Roteiro Pedagógico, Biblioteca de Recursos e Comunidade */}
        {isAuthenticated ? (
          loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <TeacherContent userName={user?.name} />
          )
        ) : (
          <Paper elevation={0} sx={{ ...CONTAINER_STYLES.paper, textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="#475569" fontWeight={600} gutterBottom>
              Você precisa estar logado para acessar os materiais da Área do Professor. 🔑
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#64748b', fontStyle: 'italic', mt: 1 }}
            >
              “Pedi, e dar-se-vos-á; buscai e achareis; batei, e abrir-se-vos-á.” — Mateus 7:7
            </Typography>
          </Paper>
        )}
    </Box>
  );
};

export default TeacherArea;
