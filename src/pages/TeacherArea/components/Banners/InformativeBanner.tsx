import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { MediaTargetType } from 'store/slices/types';
import { RouteData } from 'store/slices/route/routeSlice';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RootState } from '@/store/slices';

const colorThemes = [
  { background: 'linear-gradient(135deg, #FF512F, #DD2476)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #FC466B, #3F5EFB)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #F7971E, #FFD200)', textColor: '#000000' },
  { background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', textColor: '#ffffff' },
  { background: 'linear-gradient(135deg, #00C9FF, #92FE9D)', textColor: '#000000' },
];

const InformativeBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [maxHeight, setMaxHeight] = useState({ mobile: 260, desktop: 300 });

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

  useEffect(() => {
    if (informativeRoutes.length === 0) return;

    const heights = informativeRoutes.map((route) => {
      const content = (route.title || '') + (route.subtitle || '');
      const charCount = content.length;

      const mobileHeight = Math.min(260 + charCount * 0.5, 400);
      const desktopHeight = Math.min(300 + charCount * 0.3, 300);

      return { mobile: mobileHeight, desktop: desktopHeight };
    });

    const maxMobileHeight = Math.max(...heights.map((h) => h.mobile), 260);
    const maxDesktopHeight = Math.max(...heights.map((h) => h.desktop), 300);

    setMaxHeight({ mobile: maxMobileHeight, desktop: maxDesktopHeight });
  }, [informativeRoutes]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    beforeChange: (_: number, next: number) => setActiveSlide(next),
    appendDots: (dots: React.ReactNode) => (
      <Box sx={{ mt: { xs: 1, md: 2 } }}>
        <ul style={{ margin: 0, padding: 0 }}>{dots}</ul>
      </Box>
    ),
  };

  const renderBanner = (route: RouteData, index: number) => {
    const theme = colorThemes[index % colorThemes.length];

    return (
      <motion.div
        key={`${route.id}-${activeSlide}`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          height: isMobile ? `${maxHeight.mobile}px` : `${maxHeight.desktop}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            background: theme.background,
            color: theme.textColor,
            padding: { xs: '0px', md: 0 },
            borderRadius: '12px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%', 
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ maxWidth: { xs: '95%', md: '90%' }, width: '100%' }}>
            <motion.div
              key={`info-${activeSlide}`}
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: { xs: '1rem', md: '2.2rem' },
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: 1,
                  display: 'block',
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)',
                }}
              >
                INFORMAÇÃO IMPORTANTE!
              </Typography>
            </motion.div>

            <motion.div
              key={`text-${activeSlide}`}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontSize: { xs: '.9rem', md: '1.7rem' },
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                {route.title}
              </Typography>

              {route.subtitle && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: { xs: '0.9rem', md: '1.2rem' },
                    fontWeight: 400,
                    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {route.subtitle}
                </Typography>
              )}
            </motion.div>
          </Box>
        </Box>
      </motion.div>
    );
  };

  if (informativeRoutes.length === 0) return null;

  if (informativeRoutes.length === 1) {
    return (
      <Box
        sx={{
          height: isMobile ? `${maxHeight.mobile}px` : `${maxHeight.desktop}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderBanner(informativeRoutes[0], 0)}
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: { xs: 260, md: 300 } }}>
      <Slider {...carouselSettings}>
        {informativeRoutes.map((route, index) => (
          <div key={route.id}>{renderBanner(route, index)}</div>
        ))}
      </Slider>
    </Box>
  );
};

export default InformativeBanner;