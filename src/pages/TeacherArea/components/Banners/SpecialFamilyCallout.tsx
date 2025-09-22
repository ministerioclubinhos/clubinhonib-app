import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BANNER_STYLES } from '../../constants';

const SpecialFamilyCallout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        ...BANNER_STYLES.specialFamily,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
        mb: 6,
        mt: 4,
      }}
    >
      <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 2, md: 0 } }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          color="#fff"
          sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}
        >
          Dia Especial da Família
        </Typography>
        <Typography
          variant="subtitle1"
          color="rgba(255,255,255,0.9)"
          sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
        >
          Um momento único para pais e crianças aprenderem e curtirem o Clubinho juntos.
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/dia-especial-familia')}
        sx={{
          backgroundColor: '#fff',
          color: '#66BB6A',
          fontSize: { xs: '1rem', md: '1.25rem' },
          px: { xs: 3, md: 4 },
          py: { xs: 1.5, md: 2 },
          '&:hover': { backgroundColor: '#ffe0b2' },
        }}
      >
        Saiba mais
      </Button>
    </Box>
  );
};

export default SpecialFamilyCallout;
