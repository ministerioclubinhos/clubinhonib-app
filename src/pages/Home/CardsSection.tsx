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
        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 50%, #f0f8ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        },
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
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
                      background:
                        'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.8) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: 4,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)',
                        border: '1px solid rgba(102, 126, 234, 0.4)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
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
                    <CardContent
                      sx={{
                        p: { xs: 2, md: 3 },
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
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
