import React from 'react';
import { Box, Stack } from '@mui/material';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import { TeacherContentProps } from '../../types';
import { CommentsSection, TeacherGuideCarousel } from './';

// Documentos, galeria de vídeos e ideias agora são subpáginas da Área do Professor.
const TeacherContent: React.FC<TeacherContentProps> = () => {
  const { flags } = useFeatureFlags();
  return (
    <Box data-testid="teacher-area-sections-teacher-content">
      <Stack spacing={{ xs: 3, md: 3.5 }}>
        <TeacherGuideCarousel showSteps={flags[FEATURE.TEACHING_STEPS]} />
        <CommentsSection />
      </Stack>
    </Box>
  );
};

export default TeacherContent;
