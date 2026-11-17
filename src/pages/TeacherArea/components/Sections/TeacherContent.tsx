import React from 'react';
import { Box } from '@mui/material';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import { TeacherContentProps } from '../../types';
import { DocumentsSection, IdeasGallerySection, TrainingVideosSection, CommentsSection, TeacherGuideCarousel } from './';

const TeacherContent: React.FC<TeacherContentProps> = () => {
  const { flags } = useFeatureFlags();
  return (
    <Box data-testid="teacher-area-sections-teacher-content">
      <TeacherGuideCarousel showSteps={flags[FEATURE.TEACHING_STEPS]} />

      {flags[FEATURE.DOCUMENTS_LIBRARY] && (
        <Box mt={6}>
          <DocumentsSection />
        </Box>
      )}
      {flags[FEATURE.IDEAS_SHARING] && (
        <Box mt={6}>
          <IdeasGallerySection />
        </Box>
      )}
      {flags[FEATURE.TRAINING_VIDEOS] && (
        <Box mt={6}>
          <TrainingVideosSection />
        </Box>
      )}
      <Box mt={6}>
        <CommentsSection />
      </Box>
    </Box>
  );
};

export default TeacherContent;
