import React, { Fragment, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useSelector } from 'react-redux';
import { RootState } from 'store/slices';
import { MediaTargetType } from 'store/slices/types';

const IdeasGallerySection: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { routes, loading } = useSelector((state: RootState) => state.routes);

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const filteredIdeas = routes.filter((route) => route.entityType === MediaTargetType.IdeasPage)
    .filter((idea) =>
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.subtitle.toLowerCase().includes(search.toLowerCase())
    );

  const visibleCount = isMobile ? 2 : 4;
  const ideasToDisplay = expanded ? filteredIdeas : filteredIdeas.slice(0, visibleCount);

  const handleRedirect = (path: string) => {
    navigate(`/${path}`);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: '5px solid #ab47bc',
        backgroundColor: '#f3e5f5',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LightbulbOutlinedIcon sx={{ color: '#ab47bc', mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" color="#424242">
          Galeria de Ideias
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Buscar ideias..."
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{
          mb: 3,
          backgroundColor: '#fff',
          borderRadius: 1,
          input: { fontSize: '0.9rem' },
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredIdeas.length > 0 ? (
        <Box
          sx={{
            py: 2,
            px: { xs: 0.5, md: 1 },
            '& .slick-prev:before, & .slick-next:before': {
              color: '#ab47bc',
              fontSize: '28px',
            },
            '& .slick-prev': {
              left: { xs: -10, md: -20 },
              zIndex: 2,
            },
            '& .slick-next': {
              right: { xs: -10, md: -20 },
              zIndex: 2,
            },
            '& .slick-dots': {
              bottom: -35,
              '& li.slick-active button:before': {
                color: '#ab47bc',
              },
              '& li button:before': {
                color: '#ab47bc',
                opacity: 0.25,
              },
            },
          }}
        >
          <Slider
            dots
            infinite={filteredIdeas.length > 3}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={4000}
            pauseOnHover
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 900, settings: { slidesToShow: 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1 } },
            ]}
          >
            {filteredIdeas.map((idea) => (
              <Box key={idea.id} sx={{ p: 1.5 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: 280,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => handleRedirect(idea.path)}
                  >
                    <CardMedia
                      component="img"
                      image={idea.image || ''}
                      alt={idea.title}
                      sx={{
                        height: { xs: 140, md: 160 },
                        objectFit: 'cover',
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#424242"
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.2em',
                          height: '2.4em',
                        }}
                      >
                        {idea.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#616161"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {idea.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Slider>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhuma galeria de ideias encontrada.
        </Typography>
      )}
    </Paper>
  );
};

export default IdeasGallerySection;
