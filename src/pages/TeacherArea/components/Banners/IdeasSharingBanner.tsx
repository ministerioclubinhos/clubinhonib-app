import React from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share } from '@mui/icons-material';
import { BANNER_STYLES } from '../../constants';

interface IdeasSharingBannerProps {
  variant?: 'full' | 'compact';
  forceColumnLayout?: boolean;
}

const IdeasSharingBanner: React.FC<IdeasSharingBannerProps> = ({
  variant = 'full',
  forceColumnLayout = false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCompact = variant === 'compact';

  const shouldUseColumnLayout = isMobile || !forceColumnLayout;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        component="section"
        sx={{
          ...BANNER_STYLES.ideasSharing,
          display: 'flex',
          flexDirection: shouldUseColumnLayout ? 'column' : 'row',
          alignItems: shouldUseColumnLayout ? 'center' : 'stretch',
          justifyContent: 'space-between',
          gap: shouldUseColumnLayout ? 3 : 0,
          width: '100%',
          mx: 'auto',
          px: isCompact ? { xs: '10px', sm: 3, md: '16px' } : { xs: '10px', sm: 4, md: 4 },
          py: isCompact ? { xs: '10px', sm: 0, md: 0 } : { xs: '10px', sm: 6, md: 6 },
          mb: isCompact ? 0 : 6,
          mt: isCompact ? 0 : 4,
          position: 'relative',
          overflow: 'hidden',
          height: isMobile
            ? { xs: 'auto', sm: 'auto', md: 'auto' }
            : { xs: 'auto', sm: 'auto', md: shouldUseColumnLayout ? 350 : 200 },
          minHeight: isMobile
            ? { xs: 400, sm: 400, md: 400 }
            : {
                xs: 400,
                sm: shouldUseColumnLayout ? 300 : 200,
                md: shouldUseColumnLayout ? 280 : 200,
              },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            flex: isCompact ? 1 : 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: shouldUseColumnLayout ? 'center' : 'flex-start',
            textAlign: shouldUseColumnLayout ? 'center' : 'left',
            px: isCompact ? 0 : 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: isCompact
                ? { xs: '1rem', sm: '1.1rem', md: '1.6rem' }
                : { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 2,
            }}
          >
            {forceColumnLayout}✨ Compartilhe a Inspiração que Deus Te Deu!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: isCompact
                ? { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' }
                : { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
              maxWidth: isCompact ? '800px' : '800px',
              lineHeight: 1.4,
              fontWeight: 400,
              mb: 0,
            }}
          >
            💡 Criou uma brincadeira incrível ou descobriu uma forma especial de contar uma história
            bíblica?
            <br />
            🌟 Compartilhe sua criatividade com outros professores! Sua ideia pode transformar
            vidas! ✨
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            position: 'relative',
            zIndex: 1,
            px: isCompact ? 0 : 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/compartilhar-ideia')}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              px: isCompact ? { xs: 3, md: 4 } : { xs: 4, md: 8 },
              py: isCompact ? { xs: 1.5, md: 2 } : { xs: 2, md: 3 },
              fontSize: isCompact
                ? { xs: '0.9rem', sm: '1rem', md: '1.3rem' }
                : { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
              fontWeight: 'bold',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              },
              transition: 'all 0.3s ease',
              minWidth: isCompact ? { xs: '160px', md: '180px' } : { xs: '180px', md: '250px' },
              width: '100%',
            }}
            endIcon={
              <Share
                sx={{
                  fontSize: isCompact
                    ? { xs: '1rem', md: '1.3rem' }
                    : { xs: '1.2rem', md: '1.8rem' },
                }}
              />
            }
          >
            Compartilhar Ideia
          </Button>

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              fontSize: isCompact
                ? { xs: '0.7rem', sm: '0.75rem', md: '0.9rem' }
                : { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
              maxWidth: '200px',
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
