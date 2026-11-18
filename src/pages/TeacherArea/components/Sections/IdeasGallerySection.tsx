import React, { useMemo, useState } from 'react';
import type { RouteData } from 'store/slices/route/routeSlice';
import { getRoutePagePath } from '../../pagePaths';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSelector } from 'react-redux';
import { RootState } from 'store/slices';
import { MediaTargetType } from 'store/slices/types';

import TeacherPageCard from '../Layout/TeacherPageCard';

const ACCENT = '#9333ea';

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

  const handleRedirect = (route: RouteData) => {
    navigate(getRoutePagePath(route));
  };

  return (
    <TeacherPageCard
      testId="teacher-area-sections-ideas-gallery-section"
      icon={<LightbulbOutlinedIcon sx={{ fontSize: 22 }} />}
      accent={ACCENT}
      title="Banco de Ideias & Dinâmicas"
      subtitle="Brincadeiras, recursos visuais e atividades criativas compartilhadas por professores"
      count={filteredIdeas.length}
      actions={
        <TextField
          size="small"
          placeholder="Buscar ideias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: '#f8fafc',
              borderRadius: 2,
              minWidth: { sm: 240 },
            },
          }}
        />
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      ) : filteredIdeas.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 1.5, md: 2 },
            pt: 0.5,
          }}
        >
          {filteredIdeas.map((idea) => (
            <Box key={idea.id} sx={{ height: '100%' }}>
              <Card
                onClick={() => handleRedirect(idea)}
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    bgcolor: '#ffffff',
                    borderColor: ACCENT,
                    boxShadow: `0 8px 20px ${ACCENT}1f`,
                    transform: 'translateY(-3px)',
                    '& .idea-thumb': { transform: 'scale(1.05)' },
                    '& .idea-cta': { gap: 1 },
                  },
                }}
              >
                <Box sx={{ overflow: 'hidden', height: { xs: 135, md: 150 }, flexShrink: 0 }}>
                  {idea.image ? (
                    <CardMedia
                      component="img"
                      className="idea-thumb"
                      image={idea.image}
                      alt={idea.title}
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
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
                        background: `linear-gradient(135deg, ${ACCENT} 0%, #6b21a8 100%)`,
                        transition: 'transform 0.35s ease',
                      }}
                    >
                      <LightbulbOutlinedIcon
                        sx={{ fontSize: 44, color: 'rgba(255,255,255,0.85)' }}
                      />
                    </Box>
                  )}
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    '&:last-child': { pb: 2 },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color="#0f172a"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                      minHeight: '2.6em',
                      mb: 0.5,
                    }}
                  >
                    {idea.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#475569"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flexGrow: 1,
                      fontSize: '0.84rem',
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
                      pt: 1,
                      borderTop: '1px solid #e2e8f0',
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
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          {search
            ? `Nenhuma ideia encontrada para "${search}".`
            : 'Nenhuma galeria de ideias disponível no momento.'}
        </Typography>
      )}
    </TeacherPageCard>
  );
};

export default IdeasGallerySection;
