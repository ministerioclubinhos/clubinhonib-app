import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { sharedBannerStyles } from './SharedBannerStyles';
import { MediaTargetType } from 'store/slices/types';

const TeacherWeekBanner: React.FC = () => {
  const routes = useSelector((state: RootState) => state.routes.routes);
  const currentWeekRoute = routes.find(
    (route) => route.entityType === MediaTargetType.WeekMaterialsPage && route.current === true
  );
  if (!currentWeekRoute) return null;

  if (!currentWeekRoute) {
    return (
      <Box
        sx={{
          ...sharedBannerStyles,
          background: 'linear-gradient(to bottom right, #0073E6 0%, #dceeff 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Nenhum material semanal atual encontrado.
        </Typography>
      </Box>
    );
  }

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
            color: '#fff',
            textShadow: '4px 4px 12px rgba(0, 0, 0, 0.85)',
            fontSize: { xs: '2rem', md: '3rem' },
            my: 2,
          }}
        >
          {currentWeekRoute.title}
        </Typography>

        {currentWeekRoute.subtitle && (
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
              {currentWeekRoute.subtitle}
            </Typography>
          </>
        )}

        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={Link}
          to={`/${currentWeekRoute.path}`}
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