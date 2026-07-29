import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const SpecialFamilyCallout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        px: { xs: 3, md: 6 },
        py: { xs: 3, md: 4 },
        mb: 6,
        mt: 4,
        borderRadius: 4,
        backgroundColor: '#ffffff',
        border: '1px solid #cde7ce',
        borderLeft: { xs: '1px solid #cde7ce', md: '8px solid #2f7d32' },
        boxShadow: '0 12px 32px rgba(42,60,45,0.08)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'center', sm: 'flex-start' }}
        sx={{ textAlign: { xs: 'center', sm: 'left' } }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            backgroundColor: '#e8f5e9',
            color: '#2f7d32',
            display: 'grid',
            placeItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <FamilyRestroomIcon sx={{ fontSize: 34 }} />
        </Box>
        <Box>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="#263629"
            sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}
          >
            Dia Especial da Família
          </Typography>
          <Typography
            variant="subtitle1"
            color="#5a685d"
            sx={{ fontSize: { xs: '1rem', md: '1.15rem' } }}
          >
            Um momento único para pais e crianças aprenderem e curtirem o Clubinho juntos.
          </Typography>
        </Box>
      </Stack>
      <Button
        variant="contained"
        size="large"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/dia-especial-familia')}
        sx={{
          backgroundColor: '#2f7d32',
          color: '#fff',
          fontSize: { xs: '0.95rem', md: '1.05rem' },
          px: { xs: 3, md: 4 },
          py: { xs: 1.25, md: 1.5 },
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          '&:hover': { backgroundColor: '#256528' },
        }}
      >
        Ver programação
      </Button>
    </Box>
  );
};

export default SpecialFamilyCallout;
