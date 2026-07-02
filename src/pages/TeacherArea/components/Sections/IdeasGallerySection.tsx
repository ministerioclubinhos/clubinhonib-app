import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useSelector } from 'react-redux';
import { RootState } from 'store/slices';
import { MediaTargetType } from 'store/slices/types';

const ACCENT = '#ab47bc';

const IdeasGallerySection: React.FC = () => {
  const navigate = useNavigate();
  const { routes, loading } = useSelector((state: RootState) => state.routes);

  const [search, setSearch] = useState('');

  const filteredIdeas = useMemo(() => {
    const term = search.toLowerCase().trim();
    return routes
      .filter((route) => route.entityType === MediaTargetType.IdeasPage)
      .filter(
        (idea) =>
          !term ||
          idea.title.toLowerCase().includes(term) ||
          idea.subtitle.toLowerCase().includes(term)
      );
  }, [routes, search]);

  const handleRedirect = (path: string) => {
    navigate(`/${path}`);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: `5px solid ${ACCENT}`,
        backgroundColor: '#f3e5f5',
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
          <LightbulbOutlinedIcon sx={{ color: ACCENT }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#424242"
            sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Galeria de Ideias
          </Typography>
          {!loading && (
            <Chip
              size="small"
              label={filteredIdeas.length}
              sx={{ bgcolor: `${ACCENT}20`, color: ACCENT, fontWeight: 700 }}
            />
          )}
        </Box>

        <TextField
          size="small"
          placeholder="Buscar ideias..."
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
        💡 Atividades e brincadeiras criadas por professores como você — inspire-se e abençoe sua turma!
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      ) : filteredIdeas.length > 0 ? (
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
            infinite={filteredIdeas.length > 4}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={5000}
            pauseOnHover
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3, infinite: filteredIdeas.length > 3 } },
              { breakpoint: 900, settings: { slidesToShow: 2, infinite: filteredIdeas.length > 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1, infinite: filteredIdeas.length > 1 } },
            ]}
          >
            {filteredIdeas.map((idea) => (
              <Box key={idea.id} sx={{ p: 1.5, height: '100%' }}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    onClick={() => handleRedirect(idea.path)}
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
                        '& .idea-thumb': { transform: 'scale(1.08)' },
                        '& .idea-cta': { gap: 1 },
                      },
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', height: { xs: 140, md: 160 }, flexShrink: 0 }}>
                      {idea.image ? (
                        <CardMedia
                          component="img"
                          className="idea-thumb"
                          image={idea.image}
                          alt={idea.title}
                          sx={{
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                        />
                      ) : (
                        <Box
                          className="idea-thumb"
                          sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${ACCENT} 0%, #7b1fa2 100%)`,
                            transition: 'transform 0.4s ease',
                          }}
                        >
                          <LightbulbOutlinedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.85)' }} />
                        </Box>
                      )}
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
                          flexGrow: 1,
                        }}
                      >
                        {idea.description}
                      </Typography>

                      <Box
                        className="idea-cta"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 1.5,
                          color: ACCENT,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          transition: 'gap 0.2s ease',
                        }}
                      >
                        Ver ideia
                        <ArrowForwardIcon sx={{ fontSize: '0.95rem' }} />
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
            ? `Nenhuma ideia encontrada para "${search}".`
            : 'Nenhuma galeria de ideias disponível no momento.'}
        </Typography>
      )}
    </Paper>
  );
};

export default IdeasGallerySection;
