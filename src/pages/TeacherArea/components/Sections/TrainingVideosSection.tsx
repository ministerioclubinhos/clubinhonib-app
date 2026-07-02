import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { selectVideoRoutes } from '@/store/selectors/routeSelectors';
import { RouteData } from '@/store/slices/route/routeSlice';

const ACCENT = '#7e57c2';

const TrainingVideosSection: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const videos: RouteData[] = useSelector(selectVideoRoutes);

  const filteredVideos = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(term) ||
        video.subtitle?.toLowerCase().includes(term)
    );
  }, [videos, search]);

  const handleRedirect = (path: string) => {
    const absolutePath = `/${path.replace(/^\/+/, '')}`;
    navigate(absolutePath);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: `5px solid ${ACCENT}`,
        backgroundColor: '#ede7f6',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideoLibraryIcon sx={{ color: ACCENT }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#424242"
            sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Galeria de Vídeos
          </Typography>
          <Chip
            size="small"
            label={filteredVideos.length}
            sx={{ bgcolor: `${ACCENT}20`, color: ACCENT, fontWeight: 700 }}
          />
        </Box>

        <TextField
          size="small"
          placeholder="Buscar vídeos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'white',
              borderRadius: 2,
              minWidth: { sm: 250 },
            },
          }}
        />
      </Box>

      <Typography
        variant="body2"
        color="#616161"
        sx={{ mb: 2, fontSize: { xs: '0.85rem', md: '0.95rem' } }}
      >
        🎬 Treinamentos e conteúdos em vídeo para você se preparar e ensinar cada vez melhor!
      </Typography>

      {filteredVideos.length > 0 ? (
        <Box
          sx={{
            py: 2,
            px: { xs: 0.5, md: 1 },
            '& .slick-track': { display: 'flex !important' },
            '& .slick-slide': {
              height: 'inherit',
              '& > div': { height: '100%' },
            },
            '& .slick-prev:before, & .slick-next:before': {
              color: ACCENT,
              fontSize: '28px',
            },
            '& .slick-prev': { left: { xs: -10, md: -20 }, zIndex: 2 },
            '& .slick-next': { right: { xs: -10, md: -20 }, zIndex: 2 },
            '& .slick-dots': {
              bottom: -35,
              '& li.slick-active button:before': { color: ACCENT },
              '& li button:before': { color: ACCENT, opacity: 0.25 },
            },
          }}
        >
          <Slider
            dots
            infinite={filteredVideos.length > 4}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={5000}
            pauseOnHover
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3, infinite: filteredVideos.length > 3 } },
              { breakpoint: 900, settings: { slidesToShow: 2, infinite: filteredVideos.length > 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1, infinite: filteredVideos.length > 1 } },
            ]}
          >
            {filteredVideos.map((video) => (
              <Box key={video.id} sx={{ p: 1.5, height: '100%' }}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    onClick={() => handleRedirect(video.path)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 10px 24px ${ACCENT}30`,
                        transform: 'translateY(-4px)',
                        '& .video-thumb': { transform: 'scale(1.08)' },
                        '& .video-play': {
                          transform: 'translate(-50%, -50%) scale(1.15)',
                          bgcolor: ACCENT,
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        height: { xs: 140, md: 160 },
                        flexShrink: 0,
                      }}
                    >
                      {video.image ? (
                        <CardMedia
                          component="img"
                          className="video-thumb"
                          image={video.image}
                          alt={video.title}
                          sx={{
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                        />
                      ) : (
                        <Box
                          className="video-thumb"
                          sx={{
                            height: '100%',
                            background: `linear-gradient(135deg, ${ACCENT} 0%, #4527a0 100%)`,
                            transition: 'transform 0.4s ease',
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
                          pointerEvents: 'none',
                        }}
                      />

                      <Box
                        className="video-play"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: 'rgba(0,0,0,0.55)',
                          border: '2px solid rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        <PlayArrowIcon sx={{ color: 'white', fontSize: 30 }} />
                      </Box>
                    </Box>

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 1.5, md: 2 },
                        '&:last-child': { pb: { xs: 1.5, md: 2 } },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#424242"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.25em',
                          minHeight: '2.5em',
                          mb: 0.5,
                        }}
                      >
                        {video.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#616161"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flexGrow: 1,
                        }}
                      >
                        {video.description}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 1.5,
                          color: ACCENT,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: '1rem' }} />
                        Assistir
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Slider>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          {search
            ? `Nenhum vídeo encontrado para "${search}".`
            : 'Nenhum vídeo disponível no momento.'}
        </Typography>
      )}
    </Paper>
  );
};

export default TrainingVideosSection;
