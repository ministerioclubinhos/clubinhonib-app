import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: '100%', width: '100%' }}
    >
      <Box
        component="section"
        sx={{
          background: BANNER_STYLES.ideasSharing.background,
          boxShadow: BANNER_STYLES.ideasSharing.boxShadow,
          borderRadius: { xs: 2, md: 3 },
          width: '100%',
          height: '100%',
          minHeight: isCompact
            ? { xs: 240, sm: 260, md: 320 }
            : { xs: 240, sm: 220, md: 200 },
          display: 'flex',
          flexDirection: isCompact ? 'column' : { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 2, md: isCompact ? 2 : 4 },
          p: { xs: 2.5, sm: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <motion.div
          animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            flex: isCompact ? '0 0 auto' : { xs: '0 0 auto', md: 2 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: isCompact ? 'center' : { xs: 'center', md: 'flex-start' },
            textAlign: isCompact ? 'center' : { xs: 'center', md: 'left' },
            gap: { xs: 1, md: 1.5 },
            position: 'relative',
            zIndex: 1,
            maxWidth: 700,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.8,
              py: 0.5,
              borderRadius: '999px',
              bgcolor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(4px)',
              alignSelf: isCompact ? 'center' : { xs: 'center', md: 'flex-start' },
            }}
          >
            <LightbulbIcon sx={{ color: '#fff', fontSize: { xs: '1rem', md: '1.2rem' } }} />
            <Typography
              variant="overline"
              sx={{
                color: '#fff',
                fontSize: { xs: '0.7rem', md: '0.8rem' },
                fontWeight: 700,
                letterSpacing: '1.5px',
                lineHeight: 1.6,
              }}
            >
              Mural de Ideias
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: isCompact
                ? { xs: '1.15rem', sm: '1.3rem', md: '1.5rem' }
                : { xs: '1.3rem', sm: '1.6rem', md: '1.9rem' },
              lineHeight: 1.25,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            ✨ Compartilhe a Inspiração que Deus Te Deu!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: isCompact
                ? { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                : { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            💡 Criou uma brincadeira ou uma forma especial de contar uma história bíblica?
            Compartilhe com outros professores — sua ideia pode transformar vidas! 🌟
          </Typography>
        </Box>

        <Box
          sx={{
            flex: isCompact ? '0 0 auto' : { xs: '0 0 auto', md: 1 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            position: 'relative',
            zIndex: 1,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/compartilhar-ideia')}
            endIcon={<Share sx={{ fontSize: { xs: '1.1rem', md: '1.4rem' } }} />}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              px: { xs: 3, sm: 4, md: 5 },
              py: { xs: 1.2, md: 1.5 },
              fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              },
              transition: 'all 0.3s ease',
              minWidth: { xs: 200, md: 220 },
              maxWidth: '100%',
            }}
          >
            Compartilhar Ideia
          </Button>

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              fontSize: { xs: '0.7rem', md: '0.8rem' },
            }}
          >
            Clique aqui para começar!
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default IdeasSharingBanner;
