import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/slices';
import banner from '../../assets/banner.jpg';
import WeekMaterialsBanner from './WeekMaterialsBanner';
import CardsSection from './CardsSection';

const Home: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #ffffff, #1e73be)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '50vh', sm: '70vh', md: '85vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={banner}
          alt="Banner Clubinho NIB"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            px: { xs: 2, sm: 4 },
            maxWidth: { xs: '90%', sm: '800px' },
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: '#FFF176',
              textShadow: '2px 2px 5px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Bem-vindo ao Clubinho NIB
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#FFFFFF',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
              fontSize: { xs: '1rem', sm: '1.5rem' },
            }}
          >
            Ministério de evangelismo que leva a palavra de Deus para as crianças que precisam
            conhecer o amor de Jesus.
          </Typography>
        </Box>
      </Box>

      {isAuthenticated && <WeekMaterialsBanner />}

      <CardsSection />
    </Box>
  );
};

export default Home;
