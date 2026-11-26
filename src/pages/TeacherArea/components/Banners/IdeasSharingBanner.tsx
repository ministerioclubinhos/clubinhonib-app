import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Share } from '@mui/icons-material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { BANNER_STYLES } from '../../constants';

interface IdeasSharingBannerProps {
  variant?: 'full' | 'compact';
  forceColumnLayout?: boolean;
}

const IdeasSharingBanner: React.FC<IdeasSharingBannerProps> = ({ variant = 'full' }) => {
  const navigate = useNavigate();
  const isCompact = variant === 'compact';

  return (
    <Box
      data-testid="teacher-area-banners-ideas-sharing-banner"
      component="section"
      sx={{
        background: BANNER_STYLES.ideasSharing.background,
        boxShadow: BANNER_STYLES.ideasSharing.boxShadow,
        borderRadius: 3.5,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isCompact ? 'column' : { xs: 'column', md: 'row' },
        alignItems: isCompact ? 'flex-start' : { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 2, md: 3 },
        p: { xs: 2.5, sm: 3, md: 3.5 },
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        color: '#ffffff',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 170,
          height: 170,
          background: 'rgba(255,255,255,0.09)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
        <Chip
          icon={<LightbulbIcon sx={{ color: '#fde047 !important', fontSize: '1rem' }} />}
          label="Comunidade de Professores"
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.18)',
            color: '#fff',
            fontWeight: 800,
            mb: 1.25,
          }}
        />

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            color: 'white',
            fontSize: isCompact
              ? { xs: '1.15rem', md: '1.35rem' }
              : { xs: '1.2rem', md: '1.45rem' },
            lineHeight: 1.25,
            mb: 0.75,
          }}
        >
          Criou uma dinâmica ou visual que funcionou no seu Clubinho?
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: { xs: '0.85rem', md: '0.92rem' },
            lineHeight: 1.5,
          }}
        >
          Compartilhe fotos, vídeos ou PDFs da sua ideia para inspirar outros professores nos Clubinhos.
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          width: isCompact ? '100%' : { xs: '100%', md: 'auto' },
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate('/compartilhar-ideia')}
          endIcon={<Share sx={{ fontSize: '1.1rem' }} />}
          sx={{
            bgcolor: '#ffffff',
            color: '#4f46e5',
            px: 2.75,
            py: 1.15,
            width: isCompact ? '100%' : { xs: '100%', md: 'auto' },
            fontSize: '0.95rem',
            fontWeight: 800,
            textTransform: 'none',
            borderRadius: 2.5,
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            '&:hover': {
              bgcolor: '#f5f3ff',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Compartilhar Ideia
        </Button>
      </Box>
    </Box>
  );
};

export default IdeasSharingBanner;
