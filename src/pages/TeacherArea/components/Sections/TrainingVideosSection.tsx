import React, { useState, Fragment, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

import { selectVideoRoutes } from '@/store/selectors/routeSelectors';
import { RouteData } from '@/store/slices/route/routeSlice';

const TrainingVideosSection: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const videos: RouteData[] = useSelector(selectVideoRoutes);

  const filteredVideos = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(term) || video.subtitle?.toLowerCase().includes(term)
    );
  }, [videos, search]);

  const visibleCount = isMobile ? 2 : 4;
  const videosToDisplay = expanded ? filteredVideos : filteredVideos.slice(0, visibleCount);

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
        borderLeft: '5px solid #7e57c2',
        backgroundColor: '#ede7f6',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VideoLibraryIcon sx={{ color: '#7e57c2', mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" color="#424242">
          Galeria de Vídeos
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Buscar vídeos..."
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

      {videosToDisplay.length > 0 ? (
        <Fragment>
          <Grid container spacing={3}>
            {videosToDisplay.map((video) => (
              <Grid item xs={12} sm={6} md={3} key={video.id}>
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
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#424242"
                        gutterBottom
                      >
                        {video.title}
                      </Typography>
                      <Typography variant="body2" color="#616161" noWrap>
                        {video.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {filteredVideos.length > visibleCount && (
            <Box textAlign="center" mt={3}>
              <Button size="small" variant="text" onClick={() => setExpanded((prev) => !prev)}>
                {expanded ? 'Ver menos' : 'Ver mais'}
              </Button>
            </Box>
          )}
        </Fragment>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhum vídeo encontrado.
        </Typography>
      )}
    </Paper>
  );
};

export default TrainingVideosSection;
