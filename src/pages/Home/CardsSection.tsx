import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card as MuiCard, CardContent, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/slices';
import { MediaTargetType } from 'store/slices/types';

const StyledCard = styled(MuiCard)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[4],
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[8],
    },
}));

const CardsSection: React.FC = () => {
    const routes = useSelector((state: RootState) => state.routes.routes);
    const [cards, setCards] = useState<any[]>([]);
  
    useEffect(() => {
      const feedImageGalleryId = process.env.REACT_APP_FEED_MINISTERIO_ID ?? '';
      const filteredCards = routes.filter(
        (card) =>
          card.public &&
          card.idToFetch !== feedImageGalleryId &&
          card.entityType !== MediaTargetType.WeekMaterialsPage &&
          card.entityType !== MediaTargetType.Document &&
          card.entityType !== MediaTargetType.Meditation
      );
      setCards(filteredCards);
    }, [routes]);
  
    if (!cards.length) return null;
  
    return (
      <Box sx={{ width: { xs: '95%', sm: '90%', md: '85%' }, py: { xs: 4, sm: 6 } }}>
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={card.id} display="flex">
              <motion.div
                style={{ width: '100%' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a
                  href={`/${card.path}`}
                  style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                >
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="200"
                      image={card.image ?? ''}
                      alt={card.title ?? 'Imagem do card'}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {card.title ?? 'Sem título'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {card.description?.length > 60
                          ? `${card.description.slice(0, 57)}...`
                          : card.description}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </a>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  

export default CardsSection;
