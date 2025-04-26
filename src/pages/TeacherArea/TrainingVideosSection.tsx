import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { RootState } from '../../store/slices';
import { RouteData } from 'store/slices/route/routeSlice';

const TrainingVideosSection: React.FC = () => {
  const navigate = useNavigate();

  const videos: RouteData[] = useSelector((state: RootState) =>
    state.routes.routes.filter((route) => route.entityType === 'VideosPage')
  );

  const handleRedirect = (path: string) => {
    // Garante que o path seja absoluto
    const absolutePath = `/${path.replace(/^\/+/, '')}`;
    navigate(absolutePath);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        mt: 5,
        borderLeft: '5px solid #7e57c2',
        backgroundColor: '#ede7f6',
        borderRadius: 2,
      }}
    >
      {/* Título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <VideoLibraryIcon sx={{ color: '#7e57c2', mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" color="#424242">
          Vídeos de Capacitação
        </Typography>
      </Box>

      {/* Grid de Cards */}
      {videos.length > 0 ? (
        <Grid container spacing={3}>
          {videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => handleRedirect(video.path)}
                >
                  <CardMedia
                    component="img"
                    image={video.image || 'https://via.placeholder.com/300x140?text=Vídeo'}
                    alt={video.title}
                    sx={{
                      height: { xs: 140, md: 160 },
                      objectFit: 'cover',
                    }}
                  />

                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" color="#424242" gutterBottom>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="#616161" noWrap>
                      {video.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhum vídeo disponível no momento.
        </Typography>
      )}
    </Paper>
  );
};

export default TrainingVideosSection;
