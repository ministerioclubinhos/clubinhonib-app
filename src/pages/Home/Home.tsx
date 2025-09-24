import React from 'react';
import { Box } from '@mui/material';
import { HeroSection, FeaturesSection, TestimonialsSection, CTASection } from './components';
import WeekMaterialsBanner from './WeekMaterialsBanner';
import CardsSection from './CardsSection';
import { FEATURES } from './constants';
import { useComments, useAuth } from './hooks';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const comments = useComments();

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

      {comments && comments.length > 0 && (
        <TestimonialsSection testimonials={comments} />
      )}
      
      <CTASection isAuthenticated={isAuthenticated} />
    </Box>
  );
};

export default Home;


;