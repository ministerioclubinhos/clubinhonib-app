import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const SpecialFamilyCallout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      data-testid="teacher-area-banners-special-family-callout"
      component="section"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2.5,
        px: { xs: 2.5, md: 4 },
        py: { xs: 2.25, md: 2.75 },
        mb: 3,
        borderRadius: 3,
        backgroundColor: '#ffffff',
        border: '1px solid #bbf7d0',
        borderLeft: { xs: '4px solid #16a34a', md: '6px solid #16a34a' },
        boxShadow: '0 4px 18px rgba(22, 163, 74, 0.08)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'center', sm: 'center' }}
        sx={{ textAlign: { xs: 'center', sm: 'left' } }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: '#dcfce7',
            color: '#15803d',
            display: 'grid',
            placeItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <FamilyRestroomIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
            color="#14532d"
            sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, lineHeight: 1.25 }}
          >
            Dia Especial da Família no Clubinho
          </Typography>
          <Typography
            variant="body2"
            color="#3f6212"
            sx={{ fontSize: { xs: '0.88rem', md: '0.95rem' }, mt: 0.25 }}
          >
            Confira o roteiro especial para receber pais e responsáveis junto com as crianças.
          </Typography>
        </Box>
      </Stack>
      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/dia-especial-familia')}
        sx={{
          backgroundColor: '#16a34a',
          color: '#fff',
          fontSize: '0.9rem',
          px: 2.75,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          '&:hover': { backgroundColor: '#15803d' },
        }}
      >
        Ver programação
      </Button>
    </Box>
  );
};

export default SpecialFamilyCallout;
