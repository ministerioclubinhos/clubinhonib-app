
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { MediaTargetType } from 'store/slices/types';
import { CardsSectionProps } from './types';

const CardsSection: React.FC = () => {
  const routes = useSelector((state: RootState) => state.routes.routes);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const feedImageGalleryId = import.meta.env.VITE_FEED_MINISTERIO_ID;
    const filteredCards = routes.filter(
      (card) =>
        card.public &&
        card.idToFetch !== feedImageGalleryId &&
        card.entityType !== MediaTargetType.WeekMaterialsPage &&
        card.entityType !== MediaTargetType.Document &&
        card.entityType !== MediaTargetType.Informative &&
        card.entityType !== MediaTargetType.Meditation
    );
    setCards(filteredCards);
  }, [routes]);

  if (!cards.length) return null;

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: '#f9f9f9',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              color: '#2c3e50',
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Explore Nossos Recursos
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 3, md: 4 }}>
        {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <a
                href={`/${card.path}`}
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                  <Card
                    sx={{
                      height: '100%',
                      background: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 4,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #81d742',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: '#81d742',
                      },
                    }}
                  >
                  <CardMedia
                    component="img"
                    height="200"
                    image={card.image ?? ''}
                    alt={card.title ?? 'Imagem do card'}
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#2c3e50',
                          mb: 1.5,
                          fontSize: { xs: '1.1rem', md: '1.2rem' },
                          fontFamily: "'Poppins', sans-serif",
                          flex: 1,
                        }}
                      >
                      {card.title ?? 'Sem título'}
                    </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#5a6c7d',
                          lineHeight: 1.5,
                          fontSize: { xs: '0.9rem', md: '1rem' },
                        }}
                      >
                        {card.description?.length > 80
                          ? `${card.description.slice(0, 77)}...`
                        : card.description}
                    </Typography>
                  </CardContent>
                  </Card>
              </a>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      </Container>
    </Box>
  );
};

export default CardsSection;