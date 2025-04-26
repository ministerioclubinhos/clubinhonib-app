import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface BannerProps {
  title: string;
  subtitle?: string;
  linkTo: string;
}

const WeekBanner: React.FC<BannerProps> = ({ title, subtitle, linkTo }) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: { xs: '60vh', sm: '65vh', md: '50vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        background: 'linear-gradient(135deg, #e8ffe8 0%, #00bf3f 100%)',
        px: 2,
        py: { xs: 6, md: 8 },
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ maxWidth: 800 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            textShadow: '3px 3px 8px rgba(0, 0, 0, 0.7)',
            fontSize: { xs: '1.2rem', md: '1.5rem' },
          }}
        >
          Olá Clubinho, estamos na semana:
        </Typography>

        <Typography
          variant="h2"
          fontWeight="bold"
          gutterBottom
          sx={{
            textShadow: '4px 4px 12px rgba(0, 0, 0, 0.8)',
            fontSize: { xs: '2.2rem', md: '3.2rem' },
            color: '#ffffff',
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
                mt: 2,
                fontSize: { xs: '1rem', md: '1.25rem' },
                textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)',
              }}
            >
              Com o tema:
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '1rem', md: '1.3rem' },
                textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)',
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

export default WeekBanner;
