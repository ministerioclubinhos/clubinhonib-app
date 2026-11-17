import React, { useMemo, useRef, useState } from 'react';
import { Box, Chip, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { MediaTargetType } from 'store/slices/types';
import { useVisibleRoutes } from '@/features/feature-flags';
import { RouteData } from 'store/slices/route/routeSlice';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AUTOPLAY_MS = 6500;

const colorThemes = [
  { background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', textColor: '#ffffff' },
];

const InformativeBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<Slider | null>(null);

  const routes = useVisibleRoutes();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const informativeRoutes = useMemo(
    () =>
      routes.filter(
        (route) =>
          route.entityType === MediaTargetType.Informative && route.public === true
      ),
    [routes]
  );

  const isSingle = informativeRoutes.length === 1;

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: AUTOPLAY_MS,
    pauseOnHover: true,
    beforeChange: (_: number, next: number) => setActiveSlide(next),
  };

  const renderBanner = (route: RouteData, index: number) => {
    const colors = colorThemes[index % colorThemes.length];
    const isActive = isSingle || index === activeSlide;

    return (
      <Box
        sx={{
          background: colors.background,
          color: colors.textColor,
          borderRadius: 3.5,
          boxShadow: '0 8px 26px rgba(15, 23, 42, 0.14)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minHeight: { xs: 170, sm: 190, md: 220 },
          py: { xs: 3.5, md: 5 },
          px: { xs: 2.5, sm: 4, md: isSingle ? 6 : 9 },
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: { xs: 1.5, md: 2 },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.25 }}>
            <Chip
              icon={<CampaignIcon sx={{ color: '#fff !important', fontSize: '1.05rem' }} />}
              label="Aviso da Coordenação"
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.22)',
                color: '#fff',
                fontWeight: 800,
                letterSpacing: 0.4,
                fontSize: { xs: '0.78rem', md: '0.88rem' },
                height: { xs: 26, md: 30 },
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1.45rem', sm: '1.8rem', md: '2.2rem' },
                fontWeight: 800,
                lineHeight: 1.3,
              }}
            >
              {route.title}
            </Typography>
          </Box>

          {route.subtitle && (
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                opacity: 0.95,
                lineHeight: 1.55,
                maxWidth: 900,
              }}
            >
              {route.subtitle}
            </Typography>
          )}
        </Box>

        {!isSingle && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: 'rgba(255,255,255,0.2)',
              zIndex: 2,
            }}
          >
            {isActive && (
              <motion.div
                key={`progress-${activeSlide}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                style={{
                  height: '100%',
                  background: 'rgba(255,255,255,0.85)',
                }}
              />
            )}
          </Box>
        )}
      </Box>
    );
  };

  if (informativeRoutes.length === 0) return null;

  if (isSingle) {
    return (
      <Box data-testid="teacher-area-banners-informative-banner" sx={{ mb: 2.5 }}>
        {renderBanner(informativeRoutes[0], 0)}
      </Box>
    );
  }

  return (
    <Box data-testid="teacher-area-banners-informative-banner" sx={{ mb: 2.5 }}>
      <Box
        sx={{
          position: 'relative',
          '& .slick-dots': {
            bottom: 6,
            '& li button:before': {
              color: '#fff',
              opacity: 0.45,
              fontSize: 7,
            },
            '& li.slick-active button:before': {
              color: '#fff',
              opacity: 1,
            },
          },
        }}
      >
        <Slider ref={sliderRef} {...carouselSettings}>
          {informativeRoutes.map((route, index) => (
            <Box key={route.id} sx={{ px: 0 }}>
              {renderBanner(route, index)}
            </Box>
          ))}
        </Slider>

        {!isMobile && (
          <>
            <IconButton
              aria-label="Informativo anterior"
              onClick={() => sliderRef.current?.slickPrev()}
              size="small"
              sx={{
                position: 'absolute',
                top: '50%',
                left: 10,
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.22)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.38)' },
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <IconButton
              aria-label="Próximo informativo"
              onClick={() => sliderRef.current?.slickNext()}
              size="small"
              sx={{
                position: 'absolute',
                top: '50%',
                right: 10,
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.22)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.38)' },
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default InformativeBanner;
