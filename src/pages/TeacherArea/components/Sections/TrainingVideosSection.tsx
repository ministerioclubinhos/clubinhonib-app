import React, { useState, useMemo } from 'react';
import { getRoutePagePath } from '../../pagePaths';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';

import { selectVideoRoutes } from '@/store/selectors/routeSelectors';
import { RouteData } from '@/store/slices/route/routeSlice';

import TeacherPageCard from '../Layout/TeacherPageCard';

const ACCENT = '#4f46e5';

const TrainingVideosSection: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const videos: RouteData[] = useSelector(selectVideoRoutes);

  const filteredVideos = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(term) || video.subtitle?.toLowerCase().includes(term)
    );
  }, [videos, search]);

  const handleRedirect = (route: RouteData) => {
    navigate(getRoutePagePath(route));
  };

  return (
    <TeacherPageCard
      data-testid="teacher-area-sections-training-videos-section"
      icon={<VideoLibraryIcon sx={{ fontSize: 22 }} />}
      accent={ACCENT}
      title="Capacitação & Vídeos de Treinamento"
      subtitle="Treinamentos e orientações em vídeo para preparar sua aula com excelência"
      count={filteredVideos.length}
      actions={
        <TextField
          size="small"
          placeholder="Buscar vídeos..."
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
      {filteredVideos.length > 0 ? (
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
          {filteredVideos.map((video) => (
            <Box key={video.id} sx={{ height: '100%' }}>
              <Card
                onClick={() => handleRedirect(video)}
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
                    '& .video-thumb': { transform: 'scale(1.05)' },
                    '& .video-play': {
                      transform: 'translate(-50%, -50%) scale(1.12)',
                      bgcolor: ACCENT,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: { xs: 135, md: 150 },
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
                        transition: 'transform 0.35s ease',
                      }}
                    />
                  ) : (
                    <Box
                      className="video-thumb"
                      sx={{
                        height: '100%',
                        background: `linear-gradient(135deg, ${ACCENT} 0%, #312e81 100%)`,
                        transition: 'transform 0.35s ease',
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%)',
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
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: 'rgba(15, 23, 42, 0.65)',
                      border: '2px solid rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <VideoLibraryIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
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
                    {video.title}
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
                    {video.description}
                  </Typography>

                  <Box
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
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: '1rem' }} />
                    Ver
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          {search
            ? `Nenhum vídeo encontrado para "${search}".`
            : 'Nenhum vídeo disponível no momento.'}
        </Typography>
      )}
    </TeacherPageCard>
  );
};

export default TrainingVideosSection;
