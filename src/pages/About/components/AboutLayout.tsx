import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';

interface AboutLayoutProps {
  children: React.ReactNode;
}

const AboutLayout: React.FC<AboutLayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        minHeight: 'calc(100vh - 128px)',
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 50%, #f0f8ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 2, sm: 3, md: 6 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 3, sm: 4, md: 6 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '2.8rem', lg: '3rem' },
              fontWeight: 800,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontFamily: "'Poppins', sans-serif",
              mb: { xs: 1.5, sm: 2 },
              lineHeight: 1.2,
            }}
          >
            Sobre o Clubinho NIB
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#5a6c7d',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
              fontWeight: 400,
              maxWidth: { xs: '100%', sm: 500, md: 600 },
              mx: 'auto',
              lineHeight: 1.5,
              px: { xs: 1, sm: 0 },
            }}
          >
            Conhecendo nossa missão de levar o amor de Cristo às crianças
          </Typography>
        </Box>

        {/* Content Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr',
              md: 'repeat(auto-fit, minmax(300px, 1fr))',
            },
            gap: { xs: 2, sm: 3, md: 4 },
            alignItems: 'start',
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default AboutLayout;
