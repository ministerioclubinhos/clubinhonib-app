import React, { useMemo } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { WEEKLY_VERSES } from '../../constants';

const getWeekOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
};

const VerseOfWeekSection: React.FC = () => {
  const verse = useMemo(() => {
    const week = getWeekOfYear(new Date());
    return WEEKLY_VERSES[week % WEEKLY_VERSES.length];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 3, md: 5 },
          borderRadius: { xs: 2, md: 4 },
          background: 'linear-gradient(135deg, #fffdf5 0%, #fff8e1 100%)',
          border: '2px solid #f9a82520',
          borderLeft: '6px solid #f9a825',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -25,
            right: -25,
            width: 120,
            height: 120,
            background: 'rgba(249, 168, 37, 0.08)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mb: { xs: 1.5, md: 2 },
            }}
          >
            <AutoStoriesIcon sx={{ color: '#f9a825', fontSize: { xs: '1.4rem', md: '1.8rem' } }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                color: '#795548',
                letterSpacing: '0.5px',
              }}
            >
              Versículo da Semana
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              fontSize: { xs: '1.05rem', md: '1.35rem' },
              lineHeight: { xs: 1.6, md: 1.7 },
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#4e342e',
            }}
          >
            “{verse.text}”
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mt: { xs: 1.5, md: 2 },
              fontWeight: 700,
              color: '#f57f17',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
            }}
          >
            — {verse.reference}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: { xs: 1.5, md: 2 },
              color: '#8d6e63',
              fontSize: { xs: '0.85rem', md: '0.95rem' },
            }}
          >
            💡 Dica didática: memorize este versículo com as crianças usando gestos, música ou repetição divertida!
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default VerseOfWeekSection;
