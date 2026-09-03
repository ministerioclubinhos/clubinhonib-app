import React from 'react';
import { Box } from '@mui/material';
import { HeroSection, FeaturesSection, TestimonialsSection, CTASection } from './components';
import WeekMaterialsBanner from './WeekMaterialsBanner';
import CardsSection from './CardsSection';
import { FEATURES } from './constants';
import { useComments, useAuth } from './hooks';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureEnabled } from '@/hooks';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const comments = useComments();
  const showTestimonials = useFeatureEnabled(FEATURE.HOME_COMMENTS);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <HeroSection isAuthenticated={isAuthenticated} />

      {isAuthenticated && <WeekMaterialsBanner />}
      
      <CardsSection />

      <FeaturesSection features={FEATURES} />

      {showTestimonials && comments && comments.filter(c => c.id).length > 0 && (
        <TestimonialsSection testimonials={comments.filter(c => c.id) as any} />
      )}
      
      <CTASection isAuthenticated={isAuthenticated} />
    </Box>
  );
};

export default Home;

;