import React, { useMemo } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { WelcomeSectionProps } from '../../types';
import { WEEKLY_VERSES, EVANGELISM_VERSE } from '../../constants';

const getWeekOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
};

interface HighlightProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  reference: string;
  color: string;
  background: string;
  testId: string;
}

const Highlight: React.FC<HighlightProps> = ({ icon, title, text, reference, color, background, testId }) => (
  <Box
    data-testid={testId}
    sx={{
      flex: 1,
      p: { xs: 1.5, md: 2 },
      borderRadius: 2,
      background,
      borderLeft: `4px solid ${color}`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ color, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#4e342e', lineHeight: 1.5 }}>
      “{text}” <b style={{ color, fontStyle: 'normal', whiteSpace: 'nowrap' }}>— {reference}</b>
    </Typography>
  </Box>
);

/**
 * Faixa única de boas-vindas: saudação + versículo da semana + motivação.
 * Substitui os três cartões separados que ocupavam muito espaço.
 */
const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName, showVerse }) => {
  const verse = useMemo(() => WEEKLY_VERSES[getWeekOfYear(new Date()) % WEEKLY_VERSES.length], []);

  return (
    <Paper
      data-testid="teacher-area-sections-welcome-section"
      elevation={3}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: { xs: 2, md: 3 },
        borderRadius: { xs: 2, md: 3 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        border: '1px solid #2196f325',
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ fontSize: { xs: '1.15rem', md: '1.4rem' }, color: 'primary.main' }}
      >
        👋 Olá, {userName || 'Professor'}!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5, fontSize: { xs: '0.9rem', md: '0.95rem' } }}>
        Materiais, ideias e recursos atualizados toda semana, alinhados ao calendário bíblico, para semear a Palavra
        no coração das crianças. ✨
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
        {showVerse && (
          <Highlight
            testId="teacher-area-sections-verse-of-week-section"
            icon={<AutoStoriesIcon sx={{ color: '#f9a825', fontSize: '1.1rem' }} />}
            title="Versículo da Semana"
            text={verse.text}
            reference={verse.reference}
            color="#f57f17"
            background="linear-gradient(135deg, #fffdf5 0%, #fff8e1 100%)"
          />
        )}
        <Highlight
          testId="teacher-area-sections-motivation-section"
          icon={<FavoriteIcon sx={{ color: '#1976d2', fontSize: '1.1rem' }} />}
          title="Motivação para Evangelizar"
          text={EVANGELISM_VERSE.text}
          reference={EVANGELISM_VERSE.reference}
          color="#1976d2"
          background="linear-gradient(135deg, #f5f9ff 0%, #e8f1fc 100%)"
        />
      </Box>
    </Paper>
  );
};

export default WelcomeSection;
