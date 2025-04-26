import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { sharedBannerStyles } from './SharedBannerStyles';

interface TeacherWeekBannerProps {
  title: string;
  subtitle?: string;
  linkTo: string;
}

const TeacherWeekBanner: React.FC<TeacherWeekBannerProps> = ({ title, subtitle, linkTo }) => {
  return (
    <Box
      sx={{
        ...sharedBannerStyles,
        background: 'linear-gradient(to bottom right, #0073E6 0%, #dceeff 100%)',
        color: '#fff',
      }}
    >
      <Box sx={{ maxWidth: 800 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
            fontSize: { xs: '1.2rem', md: '1.5rem' },
          }}
        >
          Olá Professor, estamos na:
        </Typography>

        <Typography
          variant="h2"
          fontWeight="bold"
          gutterBottom
          sx={{
            color: '#fff', // <- Aqui define a cor da fonte
            textShadow: '4px 4px 12px rgba(0, 0, 0, 0.85)',
            fontSize: { xs: '2rem', md: '3rem' },
            my: 2,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
              }}
            >
              Com o tema:
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '1rem', md: '1.25rem' },
                textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
              }}
            >
              {subtitle}
            </Typography>
          </>
        )}

        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={Link}
          to={linkTo}
          sx={{
            mt: 5,
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            fontSize: { xs: '0.9rem', md: '1rem' },
            boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          Saber mais
        </Button>
      </Box>
    </Box>
  );
};

export default TeacherWeekBanner;
