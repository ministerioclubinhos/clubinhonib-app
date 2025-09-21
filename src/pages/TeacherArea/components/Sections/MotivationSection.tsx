import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { MotivationSectionProps } from '../../types';

const MotivationSection: React.FC<MotivationSectionProps> = ({ motivationText }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 3, md: 5 },
          borderRadius: { xs: 2, md: 4 },
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          border: `2px solid ${theme.palette.primary.main}20`,
          position: 'relative',
          overflow: 'hidden',
          '@media (min-width: 900px)': {
            padding: '10px',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: { xs: -20, md: -30 },
            right: { xs: -20, md: -30 },
            width: { xs: 100, md: 150 },
            height: { xs: 100, md: 150 },
            background: 'rgba(33, 150, 243, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: -15, md: -20 },
            left: { xs: -15, md: -20 },
            width: { xs: 80, md: 100 },
            height: { xs: 80, md: 100 },
            background: 'rgba(33, 150, 243, 0.03)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary.main"
                sx={{
                  fontSize: { xs: '1.2rem', md: '2rem' },
                  mb: { xs: 2, md: 3 },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                }}
              >
                ✨ Motivação para Evangelizar
              </Typography>
            </motion.div>
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box
              sx={{
                p: 0,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                border: `1px solid ${theme.palette.primary.main}15`,
                position: 'relative',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.3rem' },
                  lineHeight: { xs: 1.6, md: 1.8 },
                  color: 'text.primary',
                  textAlign: 'center',
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  letterSpacing: '0.3px',
                }}
              >
                Nesta semana, que tal dar um passo a mais e compartilhar o amor de Jesus com as crianças da sua comunidade?
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.2rem' },
                  lineHeight: { xs: 1.5, md: 1.7 },
                  color: 'primary.dark',
                  textAlign: 'center',
                  mt: { xs: 2, md: 2.5 },
                  fontStyle: 'italic',
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  letterSpacing: '0.2px',
                  '&::after': {
                    content: '"🙌"',
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    marginLeft: 1,
                  },
                }}
              >
                Lembre-se: uma palavra de fé pode transformar uma vida!
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Box
              sx={{
                mt: { xs: 2, md: 2.5 },
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                background: 'rgba(33, 150, 243, 0.1)',
                border: `1px solid ${theme.palette.primary.main}30`,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: 'primary.main',
                  fontWeight: 700,
                  lineHeight: { xs: 1.5, md: 1.6 },
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  letterSpacing: '0.2px',
                }}
              >
                🌟 Sua missão importa! Cada criança é uma oportunidade de semear o amor de Cristo.
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default MotivationSection;
