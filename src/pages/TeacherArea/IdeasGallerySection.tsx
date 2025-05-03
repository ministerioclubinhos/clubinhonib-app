import React, { useEffect, useState } from 'react';
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
        <>
          <Grid container spacing={3}>
            {ideasToDisplay.map((idea) => (
              <Grid item xs={12} sm={6} md={3} key={idea.id}>
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
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#424242"
                        gutterBottom
                      >
                        {idea.title}
                      </Typography>
                      <Typography variant="body2" color="#616161" noWrap>
                        {idea.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {filteredIdeas.length > visibleCount && (
            <Box textAlign="center" mt={3}>
              <Button
                size="small"
                variant="text"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? 'Ver menos' : 'Ver mais'}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhuma galeria de ideias encontrada.
        </Typography>
      )}
    </Paper>
  );
};

export default IdeasGallerySection;
