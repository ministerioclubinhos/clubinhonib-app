import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import Slider from 'react-slick';
import { motion, Variants } from 'framer-motion';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { MediaTargetType } from 'store/slices/types';
import { RouteData } from 'store/slices/route/routeSlice';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RootState } from '@/store/slices';

const AUTOPLAY_MS = 6000;

const colorThemes = [
  { background: 'linear-gradient(135deg, #FF512F, #DD2476)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #FC466B, #3F5EFB)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #F7971E, #FFD200)', textColor: '#3e2723' },
  { background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #2193b0, #6dd5ed)', textColor: '#ffffff' },
];

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.45, ease: 'easeOut' },
  }),
};

const InformativeBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<Slider | null>(null);

  const routes = useSelector((state: RootState) => state.routes.routes) as RouteData[];
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
    speed: 700,
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
          borderRadius: '16px',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: { xs: 220, sm: 240, md: 280 },
          py: { xs: 4, md: 5 },
          px: { xs: 2.5, sm: 5, md: 8 },
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <motion.div
          animate={{ y: [0, -14, 0], x: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -60,
            right: -40,
            width: 190,
            height: 190,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.13)',
          }}
        />
        <motion.div
          animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: -50,
            left: -35,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 850, width: '100%' }}>
          <motion.div
            custom={0.05}
            variants={contentVariants}
            initial="hidden"
            animate={isActive ? 'visible' : 'hidden'}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.8,
                py: 0.5,
                mb: { xs: 1.5, md: 2 },
                borderRadius: '999px',
                bgcolor: colors.textColor === '#ffffff' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <CampaignIcon sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />
              <Typography
                variant="overline"
                sx={{
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  lineHeight: 1.6,
                }}
              >
                Informação Importante
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            custom={0.15}
            variants={contentVariants}
            initial="hidden"
            animate={isActive ? 'visible' : 'hidden'}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.6rem', md: '2rem' },
                fontWeight: 800,
                lineHeight: 1.25,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                mb: route.subtitle ? { xs: 1, md: 1.5 } : 0,
              }}
            >
              {route.title}
            </Typography>
          </motion.div>

          {route.subtitle && (
            <motion.div
              custom={0.3}
              variants={contentVariants}
              initial="hidden"
              animate={isActive ? 'visible' : 'hidden'}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: { xs: '0.9rem', sm: '1.05rem', md: '1.2rem' },
                  fontWeight: 400,
                  lineHeight: 1.5,
                  opacity: 0.95,
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.35)',
                  maxWidth: 700,
                  mx: 'auto',
                }}
              >
                {route.subtitle}
              </Typography>
            </motion.div>
          )}
        </Box>

        {!isSingle && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: 'rgba(255,255,255,0.25)',
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
                  background:
                    colors.textColor === '#ffffff'
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(62,39,35,0.6)',
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 2 }}>{renderBanner(informativeRoutes[0], 0)}</Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          position: 'relative',
          mb: 2,
          '& .slick-dots': {
            bottom: 12,
            '& li button:before': {
              color: '#fff',
              opacity: 0.45,
              fontSize: 9,
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
              sx={{
                position: 'absolute',
                top: '50%',
                left: 12,
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' },
              }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Próximo informativo"
              onClick={() => sliderRef.current?.slickNext()}
              sx={{
                position: 'absolute',
                top: '50%',
                right: 12,
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' },
              }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </motion.div>
  );
};

export default InformativeBanner;
