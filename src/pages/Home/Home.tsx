import React from 'react';
import { Box } from '@mui/material';
import { HeroSection, FeaturesSection, TestimonialsSection, CTASection } from './components';
import WeekMaterialsBanner from './WeekMaterialsBanner';
import CardsSection from './CardsSection';
import { FEATURES } from './constants';
import { useComments, useAuth } from './hooks';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureEnabled } from '@/hooks';
import type { CommentData } from '@/store/slices/comment/commentsSlice';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const comments = useComments();
  // O `id` é opcional em `CommentData`; o depoimento precisa dele para a
  // chave da lista. O filtro com guarda diz isso ao compilador.
  const depoimentos = (comments ?? []).filter(
    (comentario): comentario is CommentData & { id: string } =>
      Boolean(comentario.id),
  );
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

      {showTestimonials && depoimentos.length > 0 && (
        <TestimonialsSection testimonials={depoimentos} />
      )}
      
      <CTASection isAuthenticated={isAuthenticated} />
    </Box>
  );
};

export default Home;

;