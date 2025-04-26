import React from 'react';
import { Box, Typography, useTheme, Paper } from '@mui/material';

const About: React.FC = () => {
  const theme = useTheme();

  const Section: React.FC<{
    title: string;
    content: string;
  }> = ({ title, content }) => (
    <Box component="article" sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{
          color: theme.palette.secondary.main,
          fontFamily: "'Poppins', sans-serif",
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: '1rem', sm: '1.1rem' },
          lineHeight: 1.8,
          color: theme.palette.text.primary,
        }}
      >
        {content}
      </Typography>
    </Box>
  );

  return (
    <Box
      component="main"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 128px)"
      px={{ xs: 2, sm: 3, md: 4 }}
      mt={{ xs: 7, md: 5 }}
      mb={0}
      sx={{
        background: 'linear-gradient(135deg, white 0%, #007bff 100%)',
        fontFamily: "'Roboto', sans-serif",
        width: '100%',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 4, md: 6 },
          mb: { xs: 2, md: 4 },
          width: '100%',
          maxWidth: { xs: '100%', sm: 900 },
          borderRadius: 3,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
          minHeight: '70%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
        role="region"
        aria-label="Sobre o Clubinhos NIB"
      >
        <Typography
          variant="h3"
          component="h1"
          fontWeight={700}
          gutterBottom
          textAlign="center"
          sx={{
            fontFamily: "'Poppins', sans-serif",
            color: theme.palette.primary.main,
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          Quem Somos
        </Typography>

        <Typography
          variant="body1"
          paragraph
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem' },
            lineHeight: 1.8,
            color: theme.palette.text.primary,
            textAlign: { xs: 'justify', sm: 'left' },
          }}
        >
          O Clubinhos NIB é uma plataforma dedicada ao evangelismo e à edificação espiritual,
          baseada nos princípios da fé cristã batista.
        </Typography>

        <Section
          title="Nossa História"
          content="Com mais de 20 anos de trajetória, temos alcançado milhares de vidas através de cultos, encontros e atividades transformadoras."
        />

        <Section
          title="Missão e Visão"
          content="Nossa missão é compartilhar o evangelho com amor e clareza, enquanto nossa visão é construir uma comunidade sólida e comprometida com os ensinamentos de Cristo."
        />
      </Paper>
    </Box>
  );
};

export default About;
