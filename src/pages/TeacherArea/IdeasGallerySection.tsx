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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import api from '../../config/axiosConfig';

interface IdeasGalleryRoute {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  path: string;
}

const IdeasGallerySection: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<IdeasGalleryRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIdeasPages() {
      try {
        const response = await api.get('/ideas-pages');
        const pages = response.data as any[];

        const mapped: IdeasGalleryRoute[] = pages
          .filter((page) => page.route?.path)
          .map((page) => ({
            id: page.id,
            title: page.title,
            subtitle: page.subtitle,
            description: page.description,
            image: page.route?.image,
            path: `/${page.route.path}`,
          }));

        setIdeas(mapped);
      } catch (error) {
        console.error('Erro ao buscar ideias:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIdeasPages();
  }, []);

  const handleRedirect = (path: string) => {
    navigate(path);
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LightbulbOutlinedIcon sx={{ color: '#ab47bc', mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" color="#424242">
          Galeria de Ideias
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : ideas.length > 0 ? (
        <Grid container spacing={3}>
          {ideas.map((idea) => (
            <Grid item xs={12} sm={6} md={4} key={idea.id}>
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
                    image={idea.image}
                    alt={idea.title}
                    sx={{
                      height: { xs: 140, md: 160 },
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" color="#424242" gutterBottom>
                      {idea.title}
                    </Typography>
                    <Typography variant="body2" color="#616161" noWrap>
                      {idea.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhuma galeria de ideias disponível no momento.
        </Typography>
      )}
    </Paper>
  );
};

export default IdeasGallerySection;
